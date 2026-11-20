import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import wishes from '../data/wishes';
import WishesFromLovedOnes from '../components/WishesFromLovedOnes';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function Wishes() {
  return (
    <PageTransition>
      <div className="page-content">
        {/* Predefined Family & Wedding Party Wishes */}
        <section className="wishes-hero">
          <div className="container">
            <motion.div variants={fadeUp} initial="hidden" animate="visible">
              <span className="section-label">Love &amp; Blessings</span>
              <h1 className="section-title">Wedding Wishes</h1>
              <div className="gold-divider" />
              <p className="section-subtitle centered">
                Heartfelt messages and warm blessings from our beloved family and
                bridal party.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="predefined-wishes-section">
          <div className="wishes-grid">
            {wishes.map((wish, index) => (
              <motion.div
                key={wish.id}
                className="wish-card"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.06 }}
              >
                <h3 className="wish-name">{wish.name}</h3>
                <p className="wish-relation">{wish.relation}</p>
                <p className="wish-message">&ldquo;{wish.message}&rdquo;</p>
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
