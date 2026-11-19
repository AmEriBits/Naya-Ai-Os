import { ArrowRight } from "lucide-react";

export default function LandingFooter({ onStart }: { onStart: () => void }) {
  return (
    <footer className="landing-site-footer">
      <div className="landing-site-footer-inner">
        <div className="landing-site-footer-main">
          <div className="landing-site-footer-about">
            <a href="/" className="brand">
              <span className="brand-mark">n</span>
              <span>
                naya<span className="brand-period">.</span>
                <small>HOUSEHOLD OS</small>
              </span>
            </a>
            <p>
              Thoughtful coordination for the everyday rhythms of home —
              starting with a better way to shop.
            </p>
            <button
              type="button"
              className="landing-site-footer-cta"
              onClick={onStart}
            >
              Explore Naya <ArrowRight size={15} />
            </button>
          </div>
          <nav
            className="landing-site-footer-links"
            aria-label="Footer navigation"
          >
            <div>
              <h3>Discover</h3>
              <a href="#capabilities">Capabilities</a>
              <a href="#how-it-works">How it works</a>
              <a href="#naya-ai">Naya AI</a>
            </div>
            <div>
              <h3>For everyone</h3>
              <a href="#for-everyone">Households & vendors</a>
              <a href="#pricing">Pricing</a>
              <a href="#capabilities">Product vision</a>
            </div>
            <div>
              <h3>Get started</h3>
              <button type="button" onClick={onStart}>
                Open the app <ArrowRight size={13} />
              </button>
              <a href="#how-it-works">Our process</a>
              <a href="#naya-ai">Your household concierge</a>
            </div>
          </nav>
        </div>
        <div className="landing-site-footer-bottom">
          <span>
            © {new Date().getFullYear()} Naya. Made for the everyday rhythms of
            home.
          </span>
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
