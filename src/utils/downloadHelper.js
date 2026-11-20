import JSZip from 'jszip';
import { extractDriveId, getDriveDownloadUrl, getDrivePreviewUrl, getDriveThumbnailUrl } from './googleDrive.js';

/**
 * Creates a clean, human-readable filename for an image.
 * e.g., "Jithu-Stephy-Save-The-Date-SEV05159.jpg"
 */
export function getMeaningfulFilename(image) {
  if (!image) return 'Jithu-Stephy-Wedding-Photo.jpg';

  // Extract raw filename & extension
  const rawFile = image.filename || image.title || 'photo.jpg';
  let ext = 'jpg';
  let baseName = rawFile;

  const dotIndex = rawFile.lastIndexOf('.');
  if (dotIndex !== -1) {
    baseName = rawFile.substring(0, dotIndex);
    ext = rawFile.substring(dotIndex + 1).toLowerCase();
  }

  // Determine category descriptor
  let categoryTag = 'Wedding';
  const cat = image.category || '';
  if (cat === 'save_the_date') categoryTag = 'Save-The-Date';
  else if (cat === 'engagement') categoryTag = 'Engagement';
  else if (cat === 'wedding_day') categoryTag = 'Wedding-Day';
  else if (cat === 'groom') categoryTag = 'Groom-And-Family';
  else if (cat === 'ceremony') categoryTag = 'Ceremony';
  else if (cat === 'couple') categoryTag = 'Portraits';
  else if (cat === 'celebration') categoryTag = 'Celebration';

  // Clean the baseName of any URL encoding or special characters
  const cleanBase = decodeURIComponent(baseName)
    .replace(/[^\w-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `Jithu-Stephy-${categoryTag}-${cleanBase || 'Photo'}.${ext}`;
}

/**
 * Downloads a single image directly with graceful fallback for Google Drive CORS.
 * Strategy:
 * 1. Attempt blob fetch -> clean background download with meaningful filename.
 * 2. If CORS restricts fetch, trigger native browser download using Google Drive's download endpoint.
 * 3. If direct download is restricted, open Google Drive preview in a new tab.
 */
export async function downloadImage(image) {
  if (!image) return { success: false, error: 'No image provided' };

  const filename = getMeaningfulFilename(image);
  const fileId = extractDriveId(image);

  // If local image
  if (!fileId && (image.src?.startsWith('/') || image.url?.startsWith('/'))) {
    const src = image.src || image.url;
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      return { success: true, method: 'blob' };
    } catch (err) {
      console.warn('Local blob download failed, falling back to link click:', err);
      const a = document.createElement('a');
      a.href = src;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return { success: true, method: 'direct' };
    }
  }

  // Google Drive Image
  const downloadEndpoint = fileId
    ? getDriveDownloadUrl(fileId)
    : (image.downloadUrl || image.url || image.src);
  const previewEndpoint = fileId
    ? getDrivePreviewUrl(fileId)
    : (image.previewUrl || image.url || image.src);

  // Attempt 1: Fetch through high-res CDN or direct download endpoint
  try {
    // Try fetching with CORS
    const fetchUrl = `https://lh3.googleusercontent.com/d/${fileId}=s0`;
    const response = await fetch(fetchUrl, { mode: 'cors' });
    if (response.ok) {
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      return { success: true, method: 'blob' };
    }
  } catch (error) {
    // CORS or network error on fetch - proceed to Attempt 2
    console.info('Direct blob download blocked by CORS, switching to native Drive download:', error.message);
  }

  // Attempt 2: Trigger Google Drive native download endpoint in browser
  try {
    const a = document.createElement('a');
    a.href = downloadEndpoint;
    a.download = filename;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return { success: true, method: 'drive-download' };
  } catch (directErr) {
    console.warn('Native download link failed, falling back to Drive viewer tab:', directErr);
  }

  // Attempt 3: Open in new tab so user can view and save directly from Google Drive
  window.open(previewEndpoint, '_blank', 'noopener,noreferrer');
  return { success: true, method: 'preview-tab' };
}

/**
 * Downloads multiple images packaged into a ZIP archive using JSZip.
 * Supports progress callback and cancellation via AbortSignal.
 */
export async function downloadImagesAsZip({ images, albumTitle = 'Photos', onProgress, signal }) {
  if (!images || images.length === 0) return { success: false, error: 'No images to download' };

  const zip = new JSZip();
  const total = images.length;
  let completed = 0;
  const usedFilenames = new Set();

  // Concurrency limit to prevent overwhelming device memory
  const CONCURRENCY = 4;
  const queue = [...images];

  async function worker() {
    while (queue.length > 0) {
      if (signal?.aborted) throw new Error('Download cancelled');

      const image = queue.shift();
      if (!image) break;

      let filename = getMeaningfulFilename(image);
      if (usedFilenames.has(filename)) {
        const dotIndex = filename.lastIndexOf('.');
        const base = filename.substring(0, dotIndex);
        const ext = filename.substring(dotIndex);
        filename = `${base}-${completed + 1}${ext}`;
      }
      usedFilenames.add(filename);

      // Preferred fetch source: lh3 CDN preview URL or local src
      const fileId = extractDriveId(image);
      const fetchUrl = fileId
        ? getDriveThumbnailUrl(fileId, 1600)
        : (image.src || image.url);

      try {
        const res = await fetch(fetchUrl, { signal });
        if (res.ok) {
          const blob = await res.blob();
          zip.file(filename, blob);
        }
      } catch (err) {
        if (signal?.aborted) throw err;
        console.warn(`Failed to fetch image for ZIP: ${fetchUrl}`, err);
      }

      completed++;
      if (onProgress) {
        onProgress({
          completed,
          total,
          percent: Math.round((completed / total) * 85),
          phase: 'downloading',
          currentFile: filename,
        });
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY, images.length) }, () => worker());
  await Promise.all(workers);

  if (signal?.aborted) throw new Error('Download cancelled');

  if (onProgress) {
    onProgress({
      completed: total,
      total,
      percent: 90,
      phase: 'compressing',
      currentFile: 'Packaging ZIP archive...',
    });
  }

  // Generate ZIP file
  const zipBlob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      if (onProgress) {
        const zipPercent = 85 + Math.round((metadata.percent / 100) * 15);
        onProgress({
          completed: total,
          total,
          percent: Math.min(zipPercent, 100),
          phase: 'compressing',
          currentFile: `Creating ZIP: ${Math.round(metadata.percent)}%`,
        });
      }
    }
  );

  const cleanTitle = albumTitle.replace(/[^\w-]/g, '-');
  const zipFilename = `Jithu-Stephy-${cleanTitle}-Photos.zip`;

  const zipUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = zipUrl;
  a.download = zipFilename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(zipUrl), 2000);

  return { success: true, count: completed };
}
