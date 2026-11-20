import { useMemo } from 'react';
import { MasonryPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/masonry.css';
import { Sparkles } from 'lucide-react';
import GalleryImage from './GalleryImage';
import { extractDriveId, getDriveThumbnailUrl } from '../../utils/googleDrive';

export default function GalleryGrid({
  images = [],
  totalCount = 0,
  onPhotoClick,
  onDownload,
  downloadingId = null,
  downloadedId = null,
  hasMore = false,
  onLoadMore,
  sentinelRef,
}) {
  // Format photos for react-photo-album
  const albumPhotos = useMemo(() => {
    return images.map((img) => {
      const fileId = extractDriveId(img);
      const thumb = fileId
        ? getDriveThumbnailUrl(fileId, 800)
        : (img.thumbnailUrl || img.src || img.url);

      const isPortrait = img.orientation === 'portrait';

      return {
        key: String(img.id),
        src: thumb,
        width: img.width || (isPortrait ? 800 : 1200),
        height: img.height || (isPortrait ? 1200 : 800),
        alt: img.alt || img.title || 'Wedding photograph',
        title: img.title,
        original: img,
      };
    });
  }, [images]);

  return (
    <div className="gallery-grid-container">
      {images.length > 0 ? (
        <div className="gallery-masonry-wrapper">
          <MasonryPhotoAlbum
            photos={albumPhotos}
            columns={(containerWidth) => {
              if (containerWidth < 600) return 1;
              if (containerWidth < 960) return 2;
              return 3;
            }}
            spacing={20}
            onClick={({ index }) => onPhotoClick?.(index)}
            render={{
              photo: (_props, { photo, index }) => {
                const item = photo.original || photo;
                return (
                  <GalleryImage
                    key={item.id || index}
                    image={item}
                    index={index}
                    onClick={() => onPhotoClick?.(index)}
                    onDownload={onDownload}
                    isDownloading={downloadingId === item.id}
                    isDownloaded={downloadedId === item.id}
                  />
                );
              },
            }}
          />
        </div>
      ) : (
        <div className="gallery-empty-state">
          <p>No photographs found in this collection.</p>
        </div>
      )}

      {/* Sentinel element for infinite scroll */}
      <div ref={sentinelRef} className="gallery-sentinel" />

      {/* Load More Button */}
      {hasMore && (
        <div className="gallery-load-more-section">
          <button className="gallery-load-more-btn" onClick={onLoadMore}>
            <Sparkles size={16} />
            <span>
              Load More Photos ({images.length} of {totalCount})
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
