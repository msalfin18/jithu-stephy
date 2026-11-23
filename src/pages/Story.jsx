import { motion } from 'framer-motion';
import PageTransition from '../components/PageTransition';
import siteData from '../data/site';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
};

export default function Story() {
  return (
    <PageTransition>
      <div className="page-content">
        {/* Hero */}
        <section className="story-hero">
          <div className="container">
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
            >
              <span className="section-label">Our Journey</span>
              <h1 className="section-title">Our Love Story</h1>
              <div className="gold-divider" />
              <p className="section-subtitle centered">
                {siteData.story.introduction}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Timeline */}
        <section className="timeline">
          <div className="container">
            {siteData.story.timeline.map((item, index) => (
              <motion.div
                key={item.year}
                className="timeline-item"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
              >
                <div className="timeline-dot" />
                <div className="timeline-item-content">
                  <span className="timeline-year">{item.year}</span>
                  <h3 className="timeline-title">{item.title}</h3>
                  <p className="timeline-desc">{item.description}</p>
                </div>
                <div className="timeline-image">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        if (item.fallbackImage && e.currentTarget.src !== item.fallbackImage) {
                          e.currentTarget.src = item.fallbackImage;
                        }
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </PageTransition>
  );
}
