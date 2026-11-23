import { useState } from 'react';
import { Download, Check, Loader2, ImageOff, ExternalLink } from 'lucide-react';
import {
  extractDriveId,
  getDriveThumbnailUrl,
  getDriveFallbackThumbnailUrl,
  getDrivePreviewUrl,
} from '../../utils/googleDrive';

export default function GalleryImage({
  image,
  index,
  onClick,
  onDownload,
  isDownloading = false,
  isDownloaded = false,
  wrapperStyle,
}) {
  const [loadState, setLoadState] = useState('loading'); // 'loading' | 'loaded' | 'fallback' | 'error'
  const fileId = extractDriveId(image);

  // Compute thumbnail URL
  const primarySrc = fileId
    ? getDriveThumbnailUrl(fileId, 800)
    : (image.thumbnailUrl || image.src || image.url);

  const fallbackSrc = fileId
    ? (image.fallbackUrl || getDriveFallbackThumbnailUrl(fileId, 800))
    : (image.src || image.url);

  const [currentSrc, setCurrentSrc] = useState(primarySrc);

  const handleImageLoad = () => {
    setLoadState('loaded');
  };

  const handleImageError = () => {
    if (currentSrc === primarySrc && fallbackSrc !== primarySrc) {
      setCurrentSrc(fallbackSrc);
      setLoadState('fallback');
    } else if (image.fallbackUrl && currentSrc !== image.fallbackUrl) {
      setCurrentSrc(image.fallbackUrl);
      setLoadState('fallback');
    } else if (currentSrc === fallbackSrc && image.url && image.url !== fallbackSrc) {
      setCurrentSrc(image.url);
      setLoadState('fallback');
    } else {
      setLoadState('error');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(index);
    }
  };

  const handleDownloadClick = (e) => {
    e.stopPropagation();
    onDownload?.(e, image);
  };

  const drivePreviewLink = fileId ? getDrivePreviewUrl(fileId) : image.url;

  return (
    <div
      className="gallery-item"
      style={wrapperStyle}
      onClick={() => onClick?.(index)}
      role="button"
      tabIndex={0}
      aria-label={`View photo ${image.title || image.alt || ''}`}
      onKeyDown={handleKeyDown}
    >
      <div className={`gallery-item-image-wrapper ${loadState}`}>
        {/* Shimmer skeleton placeholder while loading */}
        {loadState === 'loading' && <div className="gallery-shimmer-skeleton" />}

        {loadState !== 'error' ? (
          <img
            src={currentSrc}
            alt={image.alt || image.title || 'Wedding photograph'}
            loading="lazy"
            decoding="async"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`gallery-img ${loadState === 'loaded' ? 'is-loaded' : ''}`}
          />
        ) : (
          <div className="gallery-item-error-fallback">
            <ImageOff size={28} className="fallback-icon" />
            <span className="fallback-text">Photo preview unavailable</span>
            {drivePreviewLink && (
              <a
                href={drivePreviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="fallback-drive-link"
                onClick={(e) => e.stopPropagation()}
              >
                <span>Open in Drive</span>
                <ExternalLink size={12} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div className="gallery-item-overlay">
        <div className="gallery-item-content">
          <p className="gallery-item-text">{image.title || image.alt}</p>
          {image.categoryLabel && (
            <span className="gallery-item-tag">{image.categoryLabel}</span>
          )}
        </div>

        <button
          className={`gallery-item-download-btn ${isDownloaded ? 'downloaded' : ''}`}
          onClick={handleDownloadClick}
          disabled={isDownloading}
          title="Download photograph"
          aria-label="Download photograph"
        >
          {isDownloading ? (
            <Loader2 size={16} className="spin-icon" />
          ) : isDownloaded ? (
            <Check size={16} className="gold-icon" />
          ) : (
            <Download size={16} />
          )}
        </button>
      </div>
    </div>
  );
}
