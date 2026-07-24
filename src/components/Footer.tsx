import { ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-credit">
          <span>Built for</span>
          <a
            href="https://digitalheroesco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Digital Heroes Training Task
          </a>
          <ExternalLink size={14} style={{ color: '#3b82f6' }} />
        </p>
      </div>
    </footer>
  );
}
