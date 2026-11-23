/**
 * Google Drive URL Utilities
 * Handles parsing, validating, transforming, and building Google Drive image URLs.
 */

// Regex to extract Google Drive file ID from various URL patterns
const DRIVE_ID_REGEX = /(?:id=|\/d\/|googleusercontent\.com\/d\/)([a-zA-Z0-9_-]{25,})/;

/**
 * Extracts a Google Drive File ID from a URL, ID string, or object.
 * @param {string|object} input 
 * @returns {string|null} The file ID or null if not found
 */
export function extractDriveId(input) {
  if (!input) return null;

  if (typeof input === 'object') {
    if (input.fileId) return input.fileId;
    if (input.FileID) return input.FileID;
    if (input.ID) return input.ID;
    input = input.url || input.src || input.DirectURL || '';
  }

  if (typeof input !== 'string') return null;
  const trimmed = input.trim();

  // If it's already a raw Drive File ID (alphanumeric with dashes/underscores, 25-55 chars, no slashes or dots)
  if (/^[a-zA-Z0-9_-]{25,55}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(DRIVE_ID_REGEX);
  return match ? match[1] : null;
}

/**
 * Checks if a given URL or image refers to a Google Drive resource.
 * @param {string|object} input
 * @returns {boolean}
 */
export function isGoogleDriveUrl(input) {
  if (!input) return false;
  if (typeof input === 'object') {
    if (input.fileId || input.FileID || input.ID) return true;
    input = input.url || input.src || '';
  }
  return typeof input === 'string' && (input.includes('drive.google.com') || input.includes('googleusercontent.com') || /^[a-zA-Z0-9_-]{25,55}$/.test(input.trim()));
}

/**
 * Generates an optimized Google Drive thumbnail URL.
 * Uses Google's high-speed CDN edge (lh3.googleusercontent.com) which avoids
 * virus scan warnings and cookie redirects for large photos.
 * @param {string|object} input - File ID, URL, or image object
 * @param {number} width - Target width in pixels (e.g. 400, 800, 1200)
 * @returns {string} Optimized thumbnail URL
 */
export function getDriveThumbnailUrl(input, width = 800) {
  const fileId = extractDriveId(input);
  if (!fileId) {
    if (typeof input === 'string') return input;
    return input?.thumbnailUrl || input?.src || input?.url || '';
  }
  return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
}

/**
 * Generates a secondary thumbnail fallback using Drive's direct view endpoint.
 * @param {string|object} input 
 * @param {number} width 
 * @returns {string}
 */
export function getDriveFallbackThumbnailUrl(input, width = 800) {
  const fileId = extractDriveId(input);
  if (!fileId) return typeof input === 'string' ? input : input?.src || '';
  return `https://drive.usercontent.google.com/download?id=${fileId}&export=view`;
}

/**
 * Generates a high-resolution display URL for lightbox viewing.
 * @param {string|object} input 
 * @param {number} width - default 2560px for crisp display on Retina/4K screens
 * @returns {string} Display URL
 */
export function getDriveDisplayUrl(input, width = 2560) {
  const fileId = extractDriveId(input);
  if (!fileId) {
    if (typeof input === 'string') return input;
    return input?.src || input?.url || '';
  }
  return `https://lh3.googleusercontent.com/d/${fileId}=w${width}`;
}

/**
 * Generates the original full-quality Google Drive image URL.
 * @param {string|object} input 
 * @returns {string} Original image URL
 */
export function getDriveOriginalUrl(input) {
  const fileId = extractDriveId(input);
  if (!fileId) return typeof input === 'string' ? input : input?.src || '';
  return `https://lh3.googleusercontent.com/d/${fileId}=s0`;
}

/**
 * Generates a direct download URL for Google Drive files.
 * @param {string|object} input 
 * @returns {string} Direct download URL
 */
export function getDriveDownloadUrl(input) {
  const fileId = extractDriveId(input);
  if (!fileId) {
    if (typeof input === 'string') return input;
    return input?.downloadUrl || input?.src || input?.url || '';
  }
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

/**
 * Generates the Google Drive web preview URL (opens in Drive viewer).
 * @param {string|object} input 
 * @returns {string} Drive preview URL
 */
export function getDrivePreviewUrl(input) {
  const fileId = extractDriveId(input);
  if (!fileId) {
    if (typeof input === 'string') return input;
    return input?.previewUrl || input?.src || input?.url || '';
  }
  return `https://drive.google.com/file/d/${fileId}/view`;
}
