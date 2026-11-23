import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import siteData from '../data/site';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: i * 0.15, ease: [0.4, 0, 0.2, 1] },
  }),
};

const sectionFade = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
  },
};

const navCards = [
  {
    title: 'Our Story',
    desc: 'How it all began',
    to: '/story',
    image: 'https://lh3.googleusercontent.com/d/1kY33oxcJjUO__-V97DL40Qj2xTd9G09U=w800',
    fallbackImage: '/images/IMG_4252.JPEG',
  },
  {
    title: 'Gallery',
    desc: 'Captured moments',
    to: '/gallery',
    image: 'https://lh3.googleusercontent.com/d/15Q1_I1xzfoNUQ1s43qel-yPGp7QVXD5V=w800',
    fallbackImage: '/images/IMG_4244.JPEG',
  },
  {
    title: 'Wishes',
    desc: 'Love and blessings',
    to: '/wishes',
    image: 'https://lh3.googleusercontent.com/d/1XOP7dUB0T2M30Oh03HxvHQIPVqMGswK9=w800',
    fallbackImage: '/images/IMG_4255.JPEG',
  },
];

export default function Home() {
  return (
    <PageTransition>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src={siteData.heroImage}
            alt="Wedding hero"
            fetchPriority="high"
            onError={(e) => {
              if (siteData.heroImageFallback && e.currentTarget.src !== siteData.heroImageFallback) {
                e.currentTarget.src = siteData.heroImageFallback;
              }
            }}
          />
        </div>
        <div className="hero-overlay" />

        <div className="hero-content">
          <motion.p
            className="hero-pretext"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            The Wedding of
          </motion.p>

          <motion.h1
            className="hero-names"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            {siteData.groom.name}
            <span className="amp">&amp;</span>
            {siteData.bride.name}
          </motion.h1>

          <motion.div
            className="hero-divider"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          />

          <motion.p
            className="hero-date"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
          >
            {siteData.wedding.date}
          </motion.p>

          <motion.p
            className="hero-tagline"
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
          >
            {siteData.wedding.tagline}
          </motion.p>
        </div>

        <motion.div
          className="scroll-indicator"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
        >
          <span>Scroll</span>
          <ChevronDown size={18} />
        </motion.div>
      </section>

      {/* Welcome */}
      <section className="welcome-section">
        <div className="container">
          <motion.div
            className="welcome-grid"
            variants={sectionFade}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="welcome-image">
              <img
                src={siteData.welcomeImage}
                alt="Couple portrait"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  if (siteData.welcomeImageFallback && e.currentTarget.src !== siteData.welcomeImageFallback) {
                    e.currentTarget.src = siteData.welcomeImageFallback;
                  }
                }}
              />
            </div>
            <div className="welcome-text">
              <span className="section-label">Welcome</span>
              <h2 className="section-title">Our Love Story</h2>
              <div className="gold-divider-left" />
              <p>{siteData.story.introduction}</p>
              <p style={{ marginTop: 16 }}>
                We are overjoyed to share this special chapter of our lives with
                those who mean the most to us. This website is our way of
                preserving these precious memories forever.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Quote */}
      <section className="featured-quote-section">
        <div className="container">
          <motion.div
            variants={sectionFade}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
          >
            <div className="floral-ornament">&#10045; &#10045; &#10045;</div>
            <p className="featured-quote">
              &ldquo;In all the world, there is no heart for me like yours. In
              all the world, there is no love for you like mine.&rdquo;
            </p>
            <p className="featured-quote-author">Maya Angelou</p>
            <div className="floral-ornament">&#10045; &#10045; &#10045;</div>
          </motion.div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="nav-cards-section">
        <div className="container">
          <motion.div
            className="text-center"
            style={{ marginBottom: 48 }}
            variants={sectionFade}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
          >
            <span className="section-label">Explore</span>
            <h2 className="section-title">Discover Our Journey</h2>
            <div className="gold-divider" />
          </motion.div>

          <div className="nav-cards-grid">
            {navCards.map((card, i) => (
              <motion.div
                key={card.to}
                variants={sectionFade}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.12 }}
              >
                <Link to={card.to} className="nav-card">
                  <img
                    src={card.image}
                    alt={card.title}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (card.fallbackImage && e.currentTarget.src !== card.fallbackImage) {
                        e.currentTarget.src = card.fallbackImage;
                      }
                    }}
                  />
                  <div className="nav-card-overlay">
                    <h3 className="nav-card-title">{card.title}</h3>
                    <p className="nav-card-desc">{card.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
