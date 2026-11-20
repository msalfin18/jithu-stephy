import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import quotes from '../data/quotes';
import WishesFromLovedOnes from '../components/WishesFromLovedOnes';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function Quotes() {
  return (
    <PageTransition>
      <div className="page-content">
        {/* Predefined Bible Verses and Quotes (Kept separate from visitor wishes) */}
        <section className="quotes-hero">
          <div className="container">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <span className="section-label">Words of Love</span>
              <h1 className="section-title">Romantic Quotes &amp; Scripture</h1>
              <div className="gold-divider" />
              <p className="section-subtitle centered">
                Timeless scriptures and words of wisdom that remind us of the divine
                beauty, grace, and commitment of marriage.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="predefined-quotes-section">
          <div className="quotes-grid">
            {quotes.map((quote, index) => (
              <motion.div
                key={quote.id}
                className="quote-card"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: index * 0.05 }}
              >
                <p className="quote-text">{quote.text}</p>
                <div className="gold-divider" />
                <p className="quote-author">{quote.author}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Public Visitor-Submitted Wishes Section */}
        <WishesFromLovedOnes />
      </div>
    </PageTransition>
  );
}
