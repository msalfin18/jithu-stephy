// Centralized gallery dataset
// Re-exports structured data from gallery.json for seamless compatibility

import galleryData from './gallery.json';

export const galleryCategories = galleryData.categories;
export const galleryImages = galleryData.images;

export default galleryData.images;
