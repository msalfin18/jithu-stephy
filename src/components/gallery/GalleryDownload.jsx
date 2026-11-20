import { motion, AnimatePresence } from 'framer-motion';
import { FolderArchive, Download, X, Check, AlertCircle } from 'lucide-react';

const MAX_ZIP_BATCH = 40;

export default function GalleryDownload({
  isOpen,
  onClose,
  currentCategory,
  filteredImages = [],
  visibleImages = [],
  zipStatus = 'idle', // 'idle' | 'downloading' | 'complete' | 'error'
  zipProgress = null,
  zipError = null,
  onStartZipDownload,
  onResetStatus,
}) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="zip-modal-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="zip-modal-dialog"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="zip-modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={20} />
          </button>

          <div className="zip-modal-header">
            <div className="zip-modal-icon-badge">
              <FolderArchive size={26} />
            </div>
            <h3 className="zip-modal-title">Download {currentCategory?.label || 'Album'}</h3>
            <p className="zip-modal-subtitle">
              Save high-resolution wedding photographs in a ZIP archive.
            </p>
          </div>

          <div className="zip-modal-body">
            {zipStatus === 'idle' && (
              <>
                {filteredImages.length <= MAX_ZIP_BATCH ? (
                  <div className="zip-modal-info-box">
                    <p>
                      Ready to package all <strong>{filteredImages.length}</strong> photographs from{' '}
                      <strong>{currentCategory?.label}</strong> into a ZIP archive.
                    </p>
                    <div className="zip-modal-actions">
                      <button
                        className="btn-gold-primary"
                        onClick={() =>
                          onStartZipDownload(filteredImages, `${currentCategory?.label || 'Album'}-All`)
                        }
                      >
                        <Download size={18} />
                        <span>Download All ({filteredImages.length} Photos)</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="zip-modal-info-box">
                    <p className="zip-modal-notice">
                      This collection contains <strong>{filteredImages.length}</strong>{' '}
                      photographs. To keep downloads fast and ensure stability on all mobile and
                      desktop browsers, downloads are packaged in curated batches:
                    </p>
                    <div className="zip-batch-options">
                      <button
                        className="btn-gold-primary"
                        onClick={() =>
                          onStartZipDownload(
                            filteredImages.slice(0, MAX_ZIP_BATCH),
                            `${currentCategory?.label || 'Album'}-Batch-1`
                          )
                        }
                      >
                        <Download size={18} />
                        <span>
                          Download First {Math.min(MAX_ZIP_BATCH, filteredImages.length)} Photos
                        </span>
                      </button>

                      {visibleImages.length > MAX_ZIP_BATCH && (
                        <button
                          className="btn-gold-outline"
                          onClick={() =>
                            onStartZipDownload(
                              visibleImages,
                              `${currentCategory?.label || 'Album'}-Loaded-View`
                            )
                          }
                        >
                          <Download size={18} />
                          <span>Download Current View ({visibleImages.length} Photos)</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {zipStatus === 'downloading' && (
              <div className="zip-progress-wrapper">
                <div className="zip-progress-bar-track">
                  <div
                    className="zip-progress-bar-fill"
                    style={{ width: `${zipProgress?.percent || 5}%` }}
                  />
                </div>
                <div className="zip-progress-meta">
                  <span className="zip-progress-text">
                    {zipProgress?.phase === 'compressing'
                      ? zipProgress.currentFile
                      : `Downloading photo ${zipProgress?.completed || 0} of ${zipProgress?.total || 0}...`}
                  </span>
                  <span className="zip-progress-percent">{zipProgress?.percent || 0}%</span>
                </div>
                <button className="zip-modal-cancel-btn" onClick={onClose}>
                  Cancel Download
                </button>
              </div>
            )}

            {zipStatus === 'complete' && (
              <div className="zip-modal-success">
                <div className="zip-success-icon">
                  <Check size={32} />
                </div>
                <h4>Download Started!</h4>
                <p>Your ZIP archive has been created and will save to your downloads folder.</p>
              </div>
            )}

            {zipStatus === 'error' && (
              <div className="zip-modal-error">
                <AlertCircle size={28} className="error-icon" />
                <p>{zipError || 'Download encountered an issue.'}</p>
                <button className="btn-gold-outline" onClick={onResetStatus}>
                  Try Again
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
