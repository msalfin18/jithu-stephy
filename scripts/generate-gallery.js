import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

function readJsonFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  const buf = fs.readFileSync(filePath);
  let str;
  if (buf[0] === 0xff && buf[1] === 0xfe) {
    str = buf.toString('utf16le');
  } else if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
    str = buf.slice(3).toString('utf8');
  } else {
    str = buf.toString('utf8');
  }
  return JSON.parse(str.trim());
}

// 1. Initial 15 curated wedding photographs
const curatedImages = [
  {
    id: 1,
    url: '/images/main.JPEG',
    filename: 'main.JPEG',
    title: 'Wedding Stage Celebration',
    description: 'Couple at the wedding stage with beautiful floral decorations',
    alt: 'Couple at the wedding stage with beautiful floral decorations',
    orientation: 'landscape',
    width: 1200,
    height: 800,
    category: 'ceremony',
    categoryLabel: 'Ceremony',
  },
  {
    id: 2,
    url: '/images/bride.JPG',
    filename: 'bride.JPG',
    title: 'Radiant Bride',
    description: 'Beautiful bride portrait in pink saree',
    alt: 'Beautiful bride portrait in pink saree',
    orientation: 'portrait',
    width: 800,
    height: 1200,
    category: 'couple',
    categoryLabel: 'Portraits',
  },
  {
    id: 3,
    url: '/images/groom.JPEG',
    filename: 'groom.JPEG',
    title: 'Handsome Groom',
    description: 'Handsome groom arriving in style',
    alt: 'Handsome groom arriving in style',
    orientation: 'portrait',
    width: 800,
    height: 1200,
    category: 'couple',
    categoryLabel: 'Portraits',
  },
  {
    id: 4,
    url: '/images/IMG_4240.JPEG',
    filename: 'IMG_4240.JPEG',
    title: 'Church Ceremony Moments',
    description: 'Couple during the church ceremony with bridal bouquet',
    alt: 'Couple during the church ceremony with bridal bouquet',
    orientation: 'portrait',
    width: 800,
    height: 1200,
    category: 'ceremony',
    categoryLabel: 'Ceremony',
  },
  {
    id: 5,
    url: '/images/IMG_4241.JPEG',
    filename: 'IMG_4241.JPEG',
    title: 'Holding Hands in Love',
    description: 'Holding hands – a tender ceremony moment',
    alt: 'Holding hands – a tender ceremony moment',
    orientation: 'landscape',
    width: 1200,
    height: 800,
    category: 'ceremony',
    categoryLabel: 'Ceremony',
  },
  {
    id: 6,
    url: '/images/IMG_4242.JPEG',
    filename: 'IMG_4242.JPEG',
    title: 'Tying the Sacred Thali',
    description: 'Groom tying the wedding thali',
    alt: 'Groom tying the wedding thali',
    orientation: 'landscape',
    width: 1200,
    height: 800,
    category: 'ceremony',
    categoryLabel: 'Ceremony',
  },
  {
    id: 7,
    url: '/images/IMG_4243.JPEG',
    filename: 'IMG_4243.JPEG',
    title: 'Sacred Vows',
    description: 'Sacred wedding ceremony moment',
    alt: 'Sacred wedding ceremony moment',
    orientation: 'portrait',
    width: 800,
    height: 1200,
    category: 'ceremony',
    categoryLabel: 'Ceremony',
  },
  {
    id: 8,
    url: '/images/IMG_4244.JPEG',
    filename: 'IMG_4244.JPEG',
    title: 'Exchange of Rings',
    description: 'Ring exchange – a promise of forever',
    alt: 'Ring exchange – a promise of forever',
    orientation: 'landscape',
    width: 1200,
    height: 800,
    category: 'ceremony',
    categoryLabel: 'Ceremony',
  },
  {
    id: 9,
    url: '/images/IMG_4246.JPEG',
    filename: 'IMG_4246.JPEG',
    title: 'Just Married at the Arch',
    description: 'Newlyweds at the church entrance with floral arch',
    alt: 'Newlyweds at the church entrance with floral arch',
    orientation: 'portrait',
    width: 800,
    height: 1200,
    category: 'couple',
    categoryLabel: 'Portraits',
  },
  {
    id: 10,
    url: '/images/IMG_4249.JPEG',
    filename: 'IMG_4249.JPEG',
    title: 'Romantic Garden Stroll',
    description: 'Romantic couple portrait in nature',
    alt: 'Romantic couple portrait in nature',
    orientation: 'portrait',
    width: 800,
    height: 1200,
    category: 'couple',
    categoryLabel: 'Portraits',
  },
  {
    id: 11,
    url: '/images/IMG_4250.JPEG',
    filename: 'IMG_4250.JPEG',
    title: 'Lush Greenery Portrait',
    description: 'Couple portrait with lush greenery',
    alt: 'Couple portrait with lush greenery',
    orientation: 'portrait',
    width: 800,
    height: 1200,
    category: 'couple',
    categoryLabel: 'Portraits',
  },
  {
    id: 12,
    url: '/images/IMG_4252.JPEG',
    filename: 'IMG_4252.JPEG',
    title: 'Hand in Hand Walk',
    description: 'Couple walking together in the park',
    alt: 'Couple walking together in the park',
    orientation: 'portrait',
    width: 800,
    height: 1200,
    category: 'couple',
    categoryLabel: 'Portraits',
  },
  {
    id: 13,
    url: '/images/IMG_4253.JPEG',
    filename: 'IMG_4253.JPEG',
    title: 'Intimate Couple Portrait',
    description: 'Intimate couple close-up portrait',
    alt: 'Intimate couple close-up portrait',
    orientation: 'portrait',
    width: 800,
    height: 1200,
    category: 'couple',
    categoryLabel: 'Portraits',
  },
  {
    id: 14,
    url: '/images/IMG_4254.JPEG',
    filename: 'IMG_4254.JPEG',
    title: 'Embrace in Dramatic Light',
    description: 'Couple embracing in dramatic lighting',
    alt: 'Couple embracing in dramatic lighting',
    orientation: 'portrait',
    width: 800,
    height: 1200,
    category: 'couple',
    categoryLabel: 'Portraits',
  },
  {
    id: 15,
    url: '/images/IMG_4255.JPEG',
    filename: 'IMG_4255.JPEG',
    title: 'Sparkler Grand Entrance',
    description: 'Grand wedding entrance with sparklers and guests',
    alt: 'Grand wedding entrance with sparklers and guests',
    orientation: 'landscape',
    width: 1200,
    height: 800,
    category: 'celebration',
    categoryLabel: 'Celebration',
  },
];

// Category definitions
export const galleryCategories = [
  { key: 'all', label: 'All Photos', description: 'Every cherished memory from our wedding journey' },
  { key: 'save_the_date', label: 'Save the Date', description: 'Pre-wedding moments announcing our special day' },
  { key: 'engagement', label: 'Engagement', description: 'Special moments celebrating our engagement' },
  { key: 'wedding_day', label: 'Wedding Day', description: 'The grand celebrations and ceremonies of our wedding day' },
  { key: 'groom', label: 'Groom & His Family', description: 'Cherished memories of the groom, family, and loved ones' },
  { key: 'ceremony', label: 'Ceremony', description: 'Sacred moments and holy matrimony at church' },
  { key: 'couple', label: 'Portraits', description: 'Romantic couple portraits and intimate moments' },
  { key: 'celebration', label: 'Celebration', description: 'Joyous celebrations with family and friends' },
];

function generate() {
  const imagesBaseDir = path.join(rootDir, 'public', 'images');
  const allImages = [];
  let currentId = 1;

  // Load Drive metadata for curated images (drive_images_6.json & main_image.json)
  const driveImages6Path = path.join(imagesBaseDir, 'drive_images_6.json');
  const driveImages6List = readJsonFile(driveImages6Path);
  const mainImagePath = path.join(imagesBaseDir, 'main_image.json');
  const mainJsonPath = path.join(imagesBaseDir, 'main.json');
  const mainImageList = fs.existsSync(mainImagePath)
    ? readJsonFile(mainImagePath)
    : (fs.existsSync(mainJsonPath) ? readJsonFile(mainJsonPath) : []);
  const combinedList = [...driveImages6List, ...mainImageList];
  console.log(`Processing Drive Images: ${combinedList.length} metadata entries`);
  const driveImagesMap = new Map();
  combinedList.forEach((item) => {
    const filename = item.FileName || item.Name || item.Path;
    const fileId = item.FileID || item.ID;
    if (filename && fileId) {
      driveImagesMap.set(filename.toLowerCase(), {
        fileId,
        directUrl: item.DirectURL || `https://drive.google.com/uc?export=view&id=${fileId}`,
        previewUrl: item.PreviewURL || `https://drive.google.com/file/d/${fileId}/view`,
        thumbnailUrl: `https://lh3.googleusercontent.com/d/${fileId}=w800`,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      });
    }
  });

  // Add 15 curated images with Google Drive URLs (from drive_images_6.json) and fallback URLs
  for (const img of curatedImages) {
    const driveInfo = driveImagesMap.get(img.filename.toLowerCase());
    if (driveInfo) {
      allImages.push({
        ...img,
        id: currentId++,
        fileId: driveInfo.fileId,
        src: driveInfo.directUrl,
        url: driveInfo.directUrl,
        thumbnailUrl: driveInfo.thumbnailUrl,
        downloadUrl: driveInfo.downloadUrl,
        previewUrl: driveInfo.previewUrl,
        fallbackUrl: img.url,
      });
    } else {
      allImages.push({
        ...img,
        id: currentId++,
        src: img.url,
        thumbnailUrl: img.url,
        downloadUrl: img.url,
        previewUrl: img.url,
        fileId: null,
        fallbackUrl: img.url,
      });
    }
  }

  // 1. Process Save The Date
  const savethedatePath = path.join(imagesBaseDir, 'savethedate.json');
  const savethedateList = readJsonFile(savethedatePath);
  console.log(`Processing Save The Date: ${savethedateList.length} images`);

  savethedateList.forEach((item) => {
    const fileId = item.FileID;
    const filename = item.FileName || `${fileId}.jpg`;
    const cleanName = path.parse(filename).name;
    const directUrl = item.DirectURL || `https://drive.google.com/uc?export=view&id=${fileId}`;
    const previewUrl = item.PreviewURL || `https://drive.google.com/file/d/${fileId}/view`;
    const thumbnailUrl = `https://lh3.googleusercontent.com/d/${fileId}=w800`;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    allImages.push({
      id: currentId++,
      fileId,
      filename,
      src: directUrl,
      url: directUrl,
      thumbnailUrl,
      downloadUrl,
      previewUrl,
      title: `Save the Date – Jithu & Stephy`,
      description: `Save the Date photograph (${cleanName})`,
      alt: `Save the Date – Jithu & Stephy (${cleanName})`,
      category: 'save_the_date',
      categoryLabel: 'Save the Date',
      width: 1200,
      height: 800,
    });
  });

  // 2. Process Engagement
  const engagementPath = path.join(imagesBaseDir, 'engagement_images.json');
  const engagementList = readJsonFile(engagementPath);
  console.log(`Processing Engagement: ${engagementList.length} images`);

  engagementList.forEach((item) => {
    const fileId = item.ID;
    const filename = item.Name || `${fileId}.jpg`;
    const cleanName = path.parse(filename).name;
    const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
    const previewUrl = `https://drive.google.com/file/d/${fileId}/view`;
    const thumbnailUrl = `https://lh3.googleusercontent.com/d/${fileId}=w800`;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    allImages.push({
      id: currentId++,
      fileId,
      filename,
      src: directUrl,
      url: directUrl,
      thumbnailUrl,
      downloadUrl,
      previewUrl,
      title: `Engagement – Jithu & Stephy`,
      description: `Engagement ceremony photograph (${cleanName})`,
      alt: `Engagement – Jithu & Stephy (${cleanName})`,
      category: 'engagement',
      categoryLabel: 'Engagement',
      width: 1200,
      height: 800,
    });
  });

  // 3. Process Wedding Photos (Wedding Day & Groom & His Family)
  const weddingPath = path.join(imagesBaseDir, 'wedding_photos.json');
  const weddingList = readJsonFile(weddingPath);
  console.log(`Processing Wedding Photos: ${weddingList.length} images`);

  // Load groom filenames list
  const groomJsonPath = path.join(rootDir, 'src', 'data', 'groom_filenames.json');
  const groomFilenames = readJsonFile(groomJsonPath);
  const groomFilenameSet = new Set(groomFilenames.map((f) => f.toUpperCase()));
  console.log(`Loaded ${groomFilenameSet.size} groom filenames from groom_filenames.json`);

  weddingList.forEach((item) => {
    const fileId = item.FileID;
    const filename = item.FileName || `${fileId}.jpg`;
    const cleanName = path.parse(filename).name;
    const directUrl = item.DirectURL || `https://drive.google.com/uc?export=view&id=${fileId}`;
    const previewUrl = item.PreviewURL || `https://drive.google.com/file/d/${fileId}/view`;
    const thumbnailUrl = `https://lh3.googleusercontent.com/d/${fileId}=w800`;
    const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

    const isGroom = groomFilenameSet.has(filename.toUpperCase());
    const category = isGroom ? 'groom' : 'wedding_day';
    const categoryLabel = isGroom ? 'Groom & His Family' : 'Wedding Day';

    allImages.push({
      id: currentId++,
      fileId,
      filename,
      src: directUrl,
      url: directUrl,
      thumbnailUrl,
      downloadUrl,
      previewUrl,
      title: `${categoryLabel} – Jithu & Stephy`,
      description: `${categoryLabel} photograph (${cleanName})`,
      alt: `${categoryLabel} – Jithu & Stephy (${cleanName})`,
      category,
      categoryLabel,
      width: 1200,
      height: 800,
    });
  });

  console.log(`Total assembled gallery images: ${allImages.length}`);

  const galleryData = {
    categories: galleryCategories,
    images: allImages,
  };

  // Write src/data/gallery.json
  const jsonOutputPath = path.join(rootDir, 'src', 'data', 'gallery.json');
  fs.writeFileSync(jsonOutputPath, JSON.stringify(galleryData, null, 2), 'utf-8');
  console.log(`Successfully generated JSON: ${jsonOutputPath} (${allImages.length} images)`);

  // Maintain src/data/gallery.js for backwards compatibility
  const jsOutputPath = path.join(rootDir, 'src', 'data', 'gallery.js');
  const jsContent = `// Centralized gallery dataset
// Re-exports structured data from gallery.json for seamless compatibility

import galleryData from './gallery.json';

export const galleryCategories = galleryData.categories;
export const galleryImages = galleryData.images;

export default galleryData.images;
`;

  fs.writeFileSync(jsOutputPath, jsContent, 'utf-8');
  console.log(`Successfully updated JS: ${jsOutputPath}`);
}

generate();
