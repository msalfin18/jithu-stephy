import { useMemo, useCallback } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import Download from 'yet-another-react-lightbox/plugins/download';
import Counter from 'yet-another-react-lightbox/plugins/counter';

import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import 'yet-another-react-lightbox/plugins/captions.css';
import 'yet-another-react-lightbox/plugins/counter.css';

import { extractDriveId, getDriveDisplayUrl, getDriveThumbnailUrl } from '../../utils/googleDrive';
import { downloadImage, getMeaningfulFilename } from '../../utils/downloadHelper';

export default function GalleryLightbox({
  images = [],
  currentIndex = 0,
  isOpen = false,
  onClose,
  onIndexChange,
}) {
  // Convert images to slides for yet-another-react-lightbox
  const slides = useMemo(() => {
    return images.map((img) => {
      const fileId = extractDriveId(img);
      // High-resolution display URL for crisp lightbox viewing
      const displaySrc = fileId
        ? getDriveDisplayUrl(fileId, 2560)
        : (img.src || img.url);

      const thumbSrc = fileId
        ? getDriveThumbnailUrl(fileId, 240)
        : (img.thumbnailUrl || img.src || img.url);

      const filename = getMeaningfulFilename(img);

      return {
        src: displaySrc,
        thumbnail: thumbSrc,
        title: img.title || img.alt || 'Wedding Photograph',
        description: img.categoryLabel || img.description || '',
        download: {
          url: img.downloadUrl || displaySrc,
          filename,
        },
        image: img,
      };
    });
  }, [images]);

  // Custom download handler triggered by the Lightbox Download plugin
  const handleDownload = useCallback(async ({ slide }) => {
    if (!slide) return;
    const targetImage = slide.image || {
      src: slide.src,
      url: slide.src,
      title: slide.title,
      downloadUrl: slide.download?.url,
    };
    try {
      await downloadImage(targetImage);
    } catch (err) {
      console.error('Lightbox download failed:', err);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <Lightbox
      open={isOpen}
      close={onClose}
      index={currentIndex}
      slides={slides}
      on={{
        view: ({ index }) => onIndexChange?.(index),
      }}
      plugins={[Zoom, Thumbnails, Fullscreen, Captions, Download, Counter]}
      animation={{ fade: 250, swipe: 300 }}
      carousel={{
        finite: false,
        preload: 2,
        padding: '16px',
        spacing: '30px',
      }}
      controller={{
        closeOnBackdropClick: true,
      }}
      zoom={{
        maxZoomPixelRatio: 3,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        keyboardMoveDistance: 50,
        wheelZoomDistanceFactor: 100,
      }}
      thumbnails={{
        position: 'bottom',
        width: 100,
        height: 68,
        border: 2,
        borderRadius: 6,
        padding: 4,
        gap: 12,
        showToggle: true,
      }}
      captions={{
        showToggle: true,
        descriptionTextAlign: 'center',
        descriptionMaxLines: 2,
      }}
      download={{
        download: handleDownload,
      }}
      styles={{
        root: {
          '--yarl__color_backdrop': 'rgba(18, 14, 10, 0.94)',
          '--yarl__color_button': '#DFCBA5',
          '--yarl__color_button_active': '#D4AF37',
          '--yarl__thumbnails_thumbnail_border': '#8C734B',
          '--yarl__thumbnails_thumbnail_active_border': '#D4AF37',
          '--yarl__thumbnails_thumbnail_background': '#241D17',
          '--yarl__slide_title_color': '#FAF7F2',
          '--yarl__slide_description_color': '#DFCBA5',
        },
      }}
    />
  );
}
