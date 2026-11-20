import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Look for service account in project root
const saPath = path.resolve(__dirname, '..', 'service-account.json');

if (!fs.existsSync(saPath)) {
  console.error('Error: service-account.json not found in project root.');
  console.error('Please ensure your Firebase Admin service account JSON is present at: ' + saPath);
  process.exit(1);
}

const sa = JSON.parse(fs.readFileSync(saPath, 'utf8'));

function base64Url(data) {
  const buf = typeof data === 'string' ? Buffer.from(data) : data;
  return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/datastore https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedClaims = base64Url(JSON.stringify(claims));
  const signInput = `${encodedHeader}.${encodedClaims}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signInput);
  const signature = signer.sign(sa.private_key);
  const jwt = `${signInput}.${base64Url(signature)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to authenticate with service account: ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

const baseUrl = `https://firestore.googleapis.com/v1/projects/${sa.project_id}/databases/(default)/documents/wishes`;

function parseDoc(doc) {
  const id = doc.name.split('/').pop();
  const fields = doc.fields || {};
  return {
    id,
    name: fields.name?.stringValue || fields.title?.stringValue || 'Anonymous',
    relation: fields.relation?.stringValue || '',
    message: fields.message?.stringValue || '',
    status:  'approved',
    createdAt: fields.createdAt?.timestampValue || doc.createTime,
  };
}

async function listWishes() {
  const token = await getAccessToken();
  const res = await fetch(baseUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch wishes: ${text}`);
  }

  const data = await res.json();
  const docs = (data.documents || []).map(parseDoc);

  console.log(`\n=== WISHES IN FIRESTORE (${docs.length} total) ===\n`);
  if (docs.length === 0) {
    console.log('No wishes found in collection.');
    return;
  }

  docs.forEach((w, i) => {
    const statusTag =
      w.status === 'approved'
        ? '\x1b[32m[APPROVED]\x1b[0m'
        : w.status === 'pending'
          ? '\x1b[33m[PENDING]\x1b[0m'
          : '\x1b[31m[REJECTED]\x1b[0m';

    console.log(`${i + 1}. ${statusTag} ID: ${w.id}`);
    console.log(`   From: ${w.name}${w.relation ? ` (${w.relation})` : ''}`);
    console.log(`   Message: "${w.message}"`);
    console.log(`   Date: ${w.createdAt}\n`);
  });
}

async function deleteWish(docId) {
  const token = await getAccessToken();
  const url = `${baseUrl}/${docId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to delete wish: ${text}`);
  }

  console.log(`\nWish "${docId}" has been deleted.`);
}

const [, , command, targetId] = process.argv;

async function main() {
  switch (command) {
    case 'list':
      await listWishes();
      break;
    case 'delete':
      if (!targetId) {
        console.error('Usage: node scripts/moderate-wishes.js delete <wish-id>');
        process.exit(1);
      }
      await deleteWish(targetId);
      break;
    default:
      console.log(`
Wedding Wishes Management CLI
------------------------------
Usage:
  node scripts/moderate-wishes.js list               List all wishes in Firestore
  node scripts/moderate-wishes.js delete <wish-id>   Permanently delete a wish
`);
  }
}

main().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});

