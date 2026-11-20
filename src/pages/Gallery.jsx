import { useState, useMemo, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import GalleryCategories from '../components/gallery/GalleryCategories';
import GalleryGrid from '../components/gallery/GalleryGrid';
import GalleryLightbox from '../components/gallery/GalleryLightbox';
import GalleryDownload from '../components/gallery/GalleryDownload';
import galleryData from '../data/gallery.json';
import { downloadImage, downloadImagesAsZip } from '../utils/downloadHelper';

const fadeUp = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
};

const BATCH_SIZE = 36;
const categories = galleryData.categories || [];
const allImages = galleryData.images || [];

// Calculate image counts per category once
const initialCategoryCounts = { all: allImages.length };
allImages.forEach((img) => {
  initialCategoryCounts[img.category] = (initialCategoryCounts[img.category] || 0) + 1;
});

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadedId, setDownloadedId] = useState(null);

  // ZIP Download Modal State
  const [zipModalOpen, setZipModalOpen] = useState(false);
  const [zipProgress, setZipProgress] = useState(null);
  const [zipStatus, setZipStatus] = useState('idle'); // 'idle' | 'downloading' | 'complete' | 'error'
  const [zipError, setZipError] = useState(null);
  const abortControllerRef = useRef(null);
  const sentinelRef = useRef(null);

  // Filtered images based on active category
  const filteredImages = useMemo(() => {
    if (selectedCategory === 'all') return allImages;
    return allImages.filter((img) => img.category === selectedCategory);
  }, [selectedCategory]);

  // Active category metadata
  const currentCategory = useMemo(() => {
    return (
      categories.find((cat) => cat.key === selectedCategory) || {
        key: selectedCategory,
        label: 'Photos',
        description: '',
      }
    );
  }, [selectedCategory]);

  // Paginated visible slice
  const visibleImages = useMemo(() => {
    return filteredImages.slice(0, visibleCount);
  }, [filteredImages, visibleCount]);

  // Reset pagination when category changes
  const handleSelectCategory = (catKey) => {
    if (catKey === selectedCategory) return;
    setSelectedCategory(catKey);
    setVisibleCount(BATCH_SIZE);
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && visibleCount < filteredImages.length) {
          setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredImages.length));
        }
      },
      { rootMargin: '350px 0px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [visibleCount, filteredImages.length]);

  // Lightbox handlers
  const handleOpenLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleCloseLightbox = () => {
    setLightboxOpen(false);
  };

  const handleLightboxIndexChange = (index) => {
    setLightboxIndex(index);
  };

  // Quick download individual photo
  const handleQuickDownload = async (e, image) => {
    e.stopPropagation();
    if (downloadingId === image.id) return;
    setDownloadingId(image.id);

    try {
      await downloadImage(image);
      setDownloadedId(image.id);
      setTimeout(() => setDownloadedId(null), 2500);
    } catch (err) {
      console.error('Failed to download image:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  // ZIP Modal handlers
  const handleOpenZipModal = () => {
    setZipError(null);
    setZipStatus('idle');
    setZipProgress(null);
    setZipModalOpen(true);
  };

  const handleCloseZipModal = () => {
    if (zipStatus === 'downloading' && abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setZipModalOpen(false);
    setZipStatus('idle');
    setZipProgress(null);
    setZipError(null);
  };

  const handleStartZipDownload = async (downloadTargetImages, albumLabel) => {
    setZipStatus('downloading');
    setZipError(null);
    abortControllerRef.current = new AbortController();

    try {
      await downloadImagesAsZip({
        images: downloadTargetImages,
        albumTitle: albumLabel,
        onProgress: (p) => setZipProgress(p),
        signal: abortControllerRef.current.signal,
      });

      setZipStatus('complete');
      setTimeout(() => {
        handleCloseZipModal();
      }, 2500);
    } catch (err) {
      if (err.name === 'AbortError' || err.message === 'Download cancelled') {
        setZipStatus('idle');
      } else {
        console.error('ZIP generation failed:', err);
        setZipStatus('error');
        setZipError(err.message || 'Failed to create ZIP package. Please try again.');
      }
    }
  };

  return (
    <PageTransition>
      <div className="page-content">
        {/* Hero Section */}
        <section className="gallery-hero">
          <div className="container">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <span className="section-label">Captured Moments</span>
              <h1 className="section-title">Our Gallery</h1>
              <div className="gold-divider" />
              <p className="section-subtitle centered">
                Every photograph tells a story. These are the moments we will treasure forever.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Dynamic Category Tabs & Header Toolbar */}
        <GalleryCategories
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          categoryCounts={initialCategoryCounts}
          onOpenZipModal={handleOpenZipModal}
        />

        {/* Dynamic Masonry Photo Grid */}
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <GalleryGrid
            images={visibleImages}
            totalCount={filteredImages.length}
            onPhotoClick={handleOpenLightbox}
            onDownload={handleQuickDownload}
            downloadingId={downloadingId}
            downloadedId={downloadedId}
            hasMore={visibleCount < filteredImages.length}
            onLoadMore={() =>
              setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, filteredImages.length))
            }
            sentinelRef={sentinelRef}
          />
        </motion.div>

        {/* Lightbox / Preview */}
        <GalleryLightbox
          images={filteredImages}
          currentIndex={lightboxIndex}
          isOpen={lightboxOpen}
          onClose={handleCloseLightbox}
          onIndexChange={handleLightboxIndexChange}
        />

        {/* ZIP Album Download Modal */}
        <GalleryDownload
          isOpen={zipModalOpen}
          onClose={handleCloseZipModal}
          currentCategory={currentCategory}
          filteredImages={filteredImages}
          visibleImages={visibleImages}
          zipStatus={zipStatus}
          zipProgress={zipProgress}
          zipError={zipError}
          onStartZipDownload={handleStartZipDownload}
          onResetStatus={() => setZipStatus('idle')}
        />
      </div>
    </PageTransition>
  );
}
