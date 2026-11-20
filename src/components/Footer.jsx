import siteData from '../data/site';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-names">
          {siteData.groom.name} & {siteData.bride.name}
        </p>
        <p className="footer-date">{siteData.wedding.date}</p>
        <div className="footer-divider" />
        <p className="footer-message">
          &ldquo;{siteData.wedding.tagline}&rdquo;
        </p>
        <p className="footer-credit">
          Made with love &hearts;
        </p>
      </div>
    </footer>
  );
}
