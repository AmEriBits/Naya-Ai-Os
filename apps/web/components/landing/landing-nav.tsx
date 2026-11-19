"use client";

import { useEffect, useState } from "react";

import { ArrowRight } from "lucide-react";

export default function LandingNav({
  onLogin,
  onStart,
  startLabel,
  isPricing = false,
}: {
  onLogin: () => void;
  onStart: () => void;
  startLabel: string;
  isPricing?: boolean;
}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const sectionHref = (section: string) =>
    isPricing ? `/#${section}` : `#${section}`;

  useEffect(() => {
    const updateHeader = () => setIsScrolled(window.scrollY > 24);
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
    return () => window.removeEventListener("scroll", updateHeader);
  }, []);

  return (
    <header className={`landing-nav${isScrolled ? " is-scrolled" : ""}`}>
      <a href="/" className="brand">
        <span className="brand-mark">n</span>
        <span>
          naya<span className="brand-period">.</span>
          <small>HOUSEHOLD OS</small>
        </span>
      </a>
      <nav aria-label="Main navigation">
        <a href={sectionHref("how-it-works")}>How it works</a>
        <a href={sectionHref("capabilities")}>Capabilities</a>
        <a href={sectionHref("naya-ai")}>Naya AI</a>
        <a href={sectionHref("for-everyone")}>For households & vendors</a>
        <a href="/pricing" aria-current={isPricing ? "page" : undefined}>
          Pricing
        </a>
      </nav>
      <div>
        <a
          className="landing-mobile-pricing"
          href="/pricing"
          aria-current={isPricing ? "page" : undefined}
        >
          Pricing
        </a>
        <button className="landing-login" onClick={onLogin}>
          Sign in
        </button>
        <button className="button button-primary" onClick={onStart}>
          {startLabel} <ArrowRight size={15} />
        </button>
      </div>
    </header>
  );
}
