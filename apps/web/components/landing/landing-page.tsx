import { useEffect, useRef } from "react";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  Clock3,
  Home,
  Leaf,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Store,
} from "lucide-react";

import LandingCapabilities from "@/components/landing/landing-capabilities";

import LandingFooter from "@/components/landing/landing-footer";

import LandingHouseholdStories from "@/components/landing/landing-household-stories";

import LandingNav from "@/components/landing/landing-nav";

import LandingWalkthrough from "@/components/landing/landing-walkthrough";

export default function LandingPage({
  onLogin,
  onStart,
  startLabel,
}: {
  onLogin: () => void;
  onStart: () => void;
  startLabel: string;
}) {
  const landingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = landingRef.current;
    if (!root || !("IntersectionObserver" in window)) return;
    const sections = root.querySelectorAll<HTMLElement>("main > section");
    root.classList.add("landing-reveal-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -35px 0px" },
    );
    sections.forEach((section) => {
      section.classList.add("landing-reveal");
      observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={landingRef} className="landing-page">
      <LandingNav
        onLogin={onLogin}
        onStart={onStart}
        startLabel={startLabel}
      />
      <main>
        <section className="landing-hero">
          <div className="landing-hero-copy">
            <span className="landing-kicker">
              <span /> A calmer way to run a home
            </span>
            <h1>
              Home life,
              <br />
              <em>held together.</em>
            </h1>
            <p>
              One thoughtful place to coordinate your market runs, trusted local
              vendors, and the details that keep a household moving.
            </p>
            <div className="landing-actions">
              <button className="button button-primary" onClick={onStart}>
                {startLabel} <ArrowRight size={16} />
              </button>
              <button
                className="landing-login landing-secondary"
                onClick={onLogin}
              >
                I already have an account
              </button>
            </div>
            <div className="landing-proof">
              <ShieldCheck size={16} />
              <span>Your household stays in control at every step.</span>
            </div>
          </div>
          <div className="landing-visual">
            <div className="landing-orbit landing-orbit-a" />
            <div className="landing-orbit landing-orbit-b" />
            <div className="landing-home-card">
              <span className="landing-card-kicker">
                YOUR HOUSEHOLD, IN RHYTHM
              </span>
              <h3>What do you need today?</h3>
              <div className="landing-task">
                <span className="landing-task-icon">
                  <ShoppingBasket size={17} />
                </span>
                <div>
                  <strong>Market list</strong>
                  <small>Organize what home needs</small>
                </div>
                <ArrowRight size={15} />
              </div>
              <div className="landing-task">
                <span className="landing-task-icon warm">
                  <Sparkles size={17} />
                </span>
                <div>
                  <strong>A little help planning?</strong>
                  <small>Start with a budget or a simple note</small>
                </div>
                <ArrowRight size={15} />
              </div>
              <div className="landing-home-footer">
                <span className="landing-face">n</span>
                <span>Thoughtful coordination, made for your home.</span>
              </div>
            </div>
            <span className="landing-sticker sticker-one">
              <Leaf size={17} />
            </span>
            <span className="landing-sticker sticker-two">✳</span>
            <span className="landing-caption">Made for the way we live.</span>
          </div>
        </section>
        <section className="landing-how" id="how-it-works">
          <div>
            <span className="eyebrow">A SIMPLE PLACE TO BEGIN</span>
            <h2>
              From your list
              <br />
              to a clear quote.
            </h2>
            <p>
              The current pilot supports grocery requests and vendor quotes.
              Accepting a quote creates an awaiting-payment record only.
            </p>
          </div>
          <div className="landing-steps">
            <article>
              <span>01</span>
              <h3>Tell Naya what you need</h3>
              <p>
                Type a list, upload a text list, or use your device’s voice
                input.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Review real vendor offers</h3>
              <p>
                Compare itemized quotes from vendors approved for the network.
              </p>
            </article>
            <article>
              <span>03</span>
              <h3>Accept a quote</h3>
              <p>
                Accepting a quote records your choice. Payment and fulfilment
                are not connected in the pilot.
              </p>
            </article>
          </div>
        </section>
        <section className="landing-workflow">
          <div className="landing-section-intro">
            <span className="eyebrow">THE NAYA WORKFLOW</span>
            <h2>A clear path to an informed choice.</h2>
            <p>
              The pilot stops after quote acceptance. No payment is collected
              and vendors do not begin fulfilment.
            </p>
          </div>
          <div className="landing-workflow-grid">
            <article>
              <span>01 / REQUEST</span>
              <ShoppingBasket size={20} />
              <h3>Make one useful request</h3>
              <p>
                Share items in a list, then check quantities and preferences
                before sending it.
              </p>
            </article>
            <article>
              <span>02 / MATCH</span>
              <Store size={20} />
              <h3>Reach verified local shops</h3>
              <p>
                Requests are matched to active vendors by their service area and
                availability.
              </p>
            </article>
            <article>
              <span>03 / CHOOSE</span>
              <BadgeCheck size={20} />
              <h3>Compare itemized quotes</h3>
              <p>
                See vendor prices and delivery estimates, then select the offer
                that works for you.
              </p>
            </article>
            <article>
              <span>04 / PILOT BOUNDARY</span>
              <Clock3 size={20} />
              <h3>Awaiting payment setup</h3>
              <p>
                The accepted quote remains awaiting_payment. Payment and
                fulfilment are not available yet.
              </p>
            </article>
          </div>
        </section>
        <LandingWalkthrough />
        <LandingCapabilities />
        <section className="landing-trust-add">
          <div>
            <span className="eyebrow">PRIVATE BETA SCOPE</span>
            <h2>
              Quotes first.
              <br />
              No payment yet.
            </h2>
            <p>
              Naya is preparing an invite-only grocery request-to-quote pilot.
              Accepting a quote creates an awaiting_payment order record; no
              money is collected or held, and shopping does not start.
            </p>
            <ul>
              <li>
                <Check size={15} /> Create a grocery request
              </li>
              <li>
                <Check size={15} /> Compare itemized vendor quotes
              </li>
              <li>
                <Check size={15} /> Accept a quote to create an order record
              </li>
              <li>
                <Clock3 size={15} /> Stop at awaiting_payment
              </li>
            </ul>
          </div>
          <article>
            <header>
              <span>
                <ShieldCheck size={13} /> Pilot order status
              </span>
              <small>QUOTE-ONLY</small>
            </header>
            <ol>
              <li className="active">
                <i />
                <div>
                  <b>Grocery request submitted</b>
                </div>
              </li>
              <li className="active">
                <i />
                <div>
                  <b>Vendor quote reviewed</b>
                </div>
              </li>
              <li className="active">
                <i />
                <div>
                  <b>Quote accepted</b>
                  <small>Order record created</small>
                </div>
              </li>
              <li>
                <i />
                <div>
                  <b>Awaiting payment integration</b>
                  <small>No payment collected; no shopping starts</small>
                </div>
              </li>
            </ol>
            <footer>
              <div>
                <small>ORDER STATUS</small>
                <b>awaiting_payment</b>
              </div>
              <Clock3 size={24} />
            </footer>
          </article>
        </section>
        <section className="landing-ai" id="naya-ai">
          <div className="landing-ai-copy">
            <span className="eyebrow">YOUR HOUSEHOLD CONCIERGE</span>
            <h2>AI that helps you organize. You make the call.</h2>
            <p>
              Where the pilot’s AI service is configured, the list assistant can
              suggest item names and quantities for you to review. It won’t send
              the list until you approve it.
            </p>
            <ul>
              <li>
                <Check size={15} /> Keep the original list in view
              </li>
              <li>
                <Check size={15} /> Edit each item before sharing
              </li>
              <li>
                <Check size={15} /> Ask for vendor quotes only when ready
              </li>
            </ul>
            <button className="button button-primary" onClick={onStart}>
              Start with a list <ArrowRight size={15} />
            </button>
          </div>
          <div className="landing-ai-visual">
            <div className="ai-window-top">
              <span /> <span /> <span /> <small>NAYA CONCIERGE</small>
            </div>
            <div className="ai-message user-message">
              Your request appears here after you start a list.
            </div>
            <div className="ai-message assistant-message">
              <span>
                <Sparkles size={14} /> List assistant
              </span>
              <p>
                Naya organizes the items you provide so you can review them
                before sending a request to vendors.
              </p>
              <button disabled>
                Review your list <ArrowRight size={12} />
              </button>
            </div>
            <small className="ai-visual-note">
              Product preview · no sample orders or prices
            </small>
          </div>
        </section>
        <section className="landing-audience" id="for-everyone">
          <div>
            <span className="eyebrow">ONE NETWORK, DISTINCT WORKSPACES</span>
            <h2>
              Built for the household
              <br />
              and the people who serve it.
            </h2>
          </div>
          <div className="landing-audience-grid">
            <article>
              <Home size={20} />
              <h3>Households</h3>
              <p>
                Invited households can create grocery requests and review vendor
                quotes.
              </p>
            </article>
            <article>
              <Store size={20} />
              <h3>Local vendors</h3>
              <p>
                Invited, verified vendors can review eligible requests and send
                itemized quotes.
              </p>
            </article>
            <article>
              <ShieldCheck size={20} />
              <h3>Platform operators</h3>
              <p>
                Authorized operators can review vendor applications and
                marketplace records in a restricted console.
              </p>
            </article>
          </div>
        </section>
        <LandingHouseholdStories />
        <section className="landing-commitments">
          <div>
            <span className="eyebrow">WHAT NAYA IS BUILT TO PROTECT</span>
            <h2>
              Clear choices.
              <br />
              Honest status.
            </h2>
          </div>
          <div className="commitment-list">
            <article>
              <span>01</span>
              <div>
                <h3>Your list stays yours</h3>
                <p>
                  Review and edit item interpretation before you send any
                  request to vendors.
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Vendors see only what they need</h3>
                <p>
                  Household addresses stay private until an offer is selected.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Payment status is explicit</h3>
                <p>
                  Quote acceptance creates an awaiting_payment record. No
                  payment partner is connected and no funds are collected.
                </p>
              </div>
            </article>
            <article>
              <span>04</span>
              <div>
                <h3>Operators have a separate console</h3>
                <p>
                  Admin actions require assigned access and are recorded against
                  platform records.
                </p>
              </div>
            </article>
          </div>
        </section>
        <section className="landing-faq">
          <div>
            <span className="eyebrow">COMMON QUESTIONS</span>
            <h2>Good to know before you start.</h2>
          </div>
          <div className="faq-list">
            <details open>
              <summary>What can I do in the pilot?</summary>
              <p>
                Invited households can submit grocery requests and review
                itemized vendor quotes. Accepting a quote creates an
                awaiting_payment order record only.
              </p>
            </details>
            <details>
              <summary>What happens when I accept a quote?</summary>
              <p>
                The order is recorded as awaiting_payment. Payment is not
                connected, no funds are collected or held, and the vendor does
                not begin shopping or fulfilment.
              </p>
            </details>
            <details>
              <summary>Who can join?</summary>
              <p>
                The pilot is invite-only. Staging and account-level checks must
                be completed before invitations are sent.
              </p>
            </details>
            <details>
              <summary>Are other Naya capabilities available?</summary>
              <p>
                The capability cards are product concepts, not services
                available in this pilot.
              </p>
            </details>
            <details>
              <summary>How do I get help?</summary>
              <p>
                Contact the Naya operator who invited you. No 24/7 support or
                refund/replacement process is being promised for this pilot.
              </p>
            </details>
          </div>
        </section>
        <section className="landing-final">
          <h2>
            A clearer grocery request,
            <br />
            <em>one step at a time.</em>
          </h2>
          <p>
            The planned invite-only pilot is limited to grocery requests and
            quotes. Staging checks are not complete; no payment or fulfilment is
            available yet.
          </p>
          <div>
            <button className="button button-primary" onClick={onStart}>
              Sign in <ArrowRight size={15} />
            </button>
            <button className="landing-login" onClick={onLogin}>
              Vendor sign in
            </button>
          </div>
          <ul>
            <li>
              <ShieldCheck size={13} /> Invite-only pilot
            </li>
            <li>
              <Clock3 size={13} /> No payment connected
            </li>
          </ul>
        </section>
      </main>
      <LandingFooter onStart={onStart} />
    </div>
  );
}
