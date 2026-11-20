import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, Sparkles, X, MessageSquareHeart, CheckCircle2, AlertCircle } from 'lucide-react';
import {
  subscribeToApprovedWishes,
  submitWish,
  isFirebaseConfigured,
} from '../services/wishesService';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.4, 0, 0.2, 1] },
  }),
};

/**
 * Formats ISO date string into readable date (e.g. "February 2, 2026")
 */
function formatWishDate(dateString) {
  if (!dateString) return null;
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export default function WishesFromLovedOnes() {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    message: '',
  });

  // Real-time subscription to approved wishes
  useEffect(() => {
    const unsubscribe = subscribeToApprovedWishes(
      (approvedList) => {
        setWishes(approvedList);
        setLoading(false);
      },
      (error) => {
        console.error('Error receiving approved wishes:', error);
        setLoading(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.message.trim()) {
      setSubmitFeedback({
        type: 'error',
        text: 'Please enter your name and a heartfelt message.',
      });
      return;
    }

    setSubmitting(true);
    setSubmitFeedback(null);

    try {
      const result = await submitWish({
        name: formData.name,
        relation: formData.relation,
        message: formData.message,
      });

      setSubmitFeedback({
        type: 'success',
        text: result.message,
        isLocalOnly: result.isLocalOnly,
      });

      setFormData({ name: '', relation: '', message: '' });
    } catch (err) {
      setSubmitFeedback({
        type: 'error',
        text: err.message || 'Failed to submit wish. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSubmitFeedback(null);
  };

  const isConnected = isFirebaseConfigured();

  return (
    <section className="visitor-wishes-section" id="wishes-from-loved-ones">
      <div className="container">
        {/* Section Header */}
        <div className="visitor-wishes-header text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            <span className="section-label">Love & Blessings</span>
            <h2 className="section-title">Wishes from Loved Ones</h2>
            <div className="gold-divider" />
            <p className="section-subtitle centered">
              Heartfelt messages, prayers, and warm blessings shared by our
              cherished guests, friends, and family.
            </p>

            <div className="visitor-wishes-action-bar">
              <button
                type="button"
                className="btn-gold-outline"
                onClick={() => setIsModalOpen(true)}
              >
                <Sparkles size={16} className="btn-icon" />
                <span>Leave a Wish</span>
              </button>
            </div>

            {!isConnected && (
              <div className="dev-mode-pill" title="Firebase credentials not set in .env">
                <span className="dev-mode-dot" />
                Development Mode (Placeholder Data)
              </div>
            )}
          </motion.div>
        </div>

        {/* Wishes List / Loading / Empty State */}
        {loading ? (
          <div className="wishes-loading-state">
            <div className="gold-spinner" />
            <p>Loading blessings...</p>
          </div>
        ) : wishes.length === 0 ? (
          /* Subtle Empty State */
          <motion.div
            className="wishes-empty-state"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <div className="empty-state-icon">
              <Heart size={32} strokeWidth={1.5} />
            </div>
            <h3 className="empty-state-title">No Wishes Shared Yet</h3>
            <p className="empty-state-desc">
              Be the first to share your warm thoughts and prayers with Jithu and Stephy.
            </p>
            <button
              type="button"
              className="btn-gold-primary"
              onClick={() => setIsModalOpen(true)}
            >
              Write the First Wish
            </button>
          </motion.div>
        ) : (
          /* Responsive Quote Cards Grid (Newest first, Approved only) */
          <div className="visitor-wishes-grid">
            {wishes.map((wish, index) => {
              const formattedDate = formatWishDate(wish.createdAt);
              return (
                <motion.div
                  key={wish.id || index}
                  className="visitor-quote-card"
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-40px' }}
                  custom={index % 6}
                >
                  <div className="card-ornament">&#10045;</div>
                  <p className="visitor-quote-message">&ldquo;{wish.message}&rdquo;</p>
                  <div className="gold-divider-mini" />
                  <div className="visitor-quote-footer">
                    <p className="visitor-quote-name">{wish.name}</p>
                    <div className="visitor-quote-meta">
                      {wish.relation && (
                        <span className="visitor-quote-relation">{wish.relation}</span>
                      )}
                      {wish.relation && formattedDate && <span className="meta-sep">&bull;</span>}
                      {formattedDate && (
                        <span className="visitor-quote-date">{formattedDate}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submission Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-backdrop" onClick={closeModal}>
            <motion.div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <button
                type="button"
                className="modal-close-btn"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div className="modal-header text-center">
                <span className="section-label">Your Blessing</span>
                <h3 className="modal-title">Send Your Warm Wishes</h3>
                <div className="gold-divider" />
                <p className="modal-subtitle">
                  Share a loving message, marriage advice, or prayer for Jithu &amp; Stephy.
                </p>
              </div>

              {submitFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`submit-feedback ${submitFeedback.type}`}
                >
                  {submitFeedback.type === 'success' ? (
                    <CheckCircle2 size={18} className="feedback-icon" />
                  ) : (
                    <AlertCircle size={18} className="feedback-icon" />
                  )}
                  <div>
                    <p className="feedback-text">{submitFeedback.text}</p>
                    {submitFeedback.isLocalOnly && (
                      <p className="feedback-subtext">
                        (Notice: Firebase is not yet connected. Submissions are stored in local
                        memory for development and will be saved permanently once Firebase is configured.)
                      </p>
                    )}
                  </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="wish-form">
                <div className="form-group">
                  <label htmlFor="visitor-name" className="form-label">
                    Your Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="visitor-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. John Doe, The Thomas Family"
                    className="form-input"
                    required
                    maxLength={100}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="visitor-relation" className="form-label">
                    Your Relation <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="visitor-relation"
                    name="relation"
                    value={formData.relation}
                    onChange={handleInputChange}
                    placeholder="e.g. Friend, Cousin, Colleague"
                    className="form-input"
                    maxLength={60}
                    disabled={submitting}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="visitor-message" className="form-label">
                    Your Message or Prayer <span className="required">*</span>
                  </label>
                  <textarea
                    id="visitor-message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Write your wishes and blessings for the couple..."
                    className="form-textarea"
                    rows={4}
                    required
                    maxLength={1000}
                    disabled={submitting}
                  />
                </div>

                <div className="form-info-note">
                  <MessageSquareHeart size={15} />
                  <span>Your warm wish will appear immediately on the website.</span>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-text"
                    onClick={closeModal}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-gold-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>Submitting...</>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send Blessing</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
