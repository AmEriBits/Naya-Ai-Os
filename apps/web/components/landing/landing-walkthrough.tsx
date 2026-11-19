import { useEffect, useState } from "react";

import {
  ArrowRight,
  Check,
  Clock3,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  ShoppingBasket,
  Store,
  X,
} from "lucide-react";

const walkthroughSteps = [
  {
    label: "01 / YOUR LIST",
    title: "Start with what home needs.",
    body: "Share a quick list, a voice note, or a budget. Naya helps organize it for your review.",
    icon: ShoppingBasket,
    status: "Grocery request draft",
    items: ["Rice · 5kg", "Fresh tomatoes · 1 basket", "Eggs · 1 crate"],
  },
  {
    label: "02 / REAL OFFERS",
    title: "Review a vendor quote.",
    body: "Compare an itemized quote before deciding whether to accept it.",
    icon: Store,
    status: "Quote ready to review",
    items: [
      "Itemized prices and availability",
      "Vendor estimate",
      "Your choice",
    ],
  },
  {
    label: "03 / YOUR APPROVAL",
    title: "Accepting creates a record.",
    body: "The accepted quote is recorded as awaiting_payment. No payment is collected and shopping does not start.",
    icon: ShieldCheck,
    status: "awaiting_payment",
    items: [
      "Your quote choice is recorded",
      "No funds are collected or held",
      "Vendor fulfilment does not start",
    ],
  },
  {
    label: "04 / PAYMENT NOT CONNECTED",
    title: "The pilot stops here.",
    body: "Payment and fulfilment are not connected in the current pilot.",
    icon: Clock3,
    status: "Awaiting payment setup",
    items: [
      "No payment is collected",
      "No escrow or funds held",
      "No shopping or delivery starts",
    ],
  },
];

export default function LandingWalkthrough() {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);
  const currentStep = walkthroughSteps[step];
  const StepIcon = currentStep.icon;

  useEffect(() => {
    if (!open || !playing) return;
    const timer = window.setInterval(() => {
      setStep((current) => (current + 1) % walkthroughSteps.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [open, playing]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPlaying(false);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  function startWalkthrough() {
    setStep(0);
    setPlaying(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    setOpen(true);
  }

  function closeWalkthrough() {
    setPlaying(false);
    setOpen(false);
  }

  return (
    <>
      <section className="landing-walkthrough">
        <div className="landing-walkthrough-inner">
          <div className="landing-walkthrough-copy">
            <span className="eyebrow">A QUICK LOOK AROUND</span>
            <h2>
              One list.
              <br />
              <em>A lot more breathing room.</em>
            </h2>
            <p>
              See the intended path from a grocery request to a vendor quote.
              The current pilot stops at awaiting_payment.
            </p>
            <button
              className="landing-walkthrough-play"
              type="button"
              onClick={startWalkthrough}
            >
              <span>
                <Play size={16} fill="currentColor" />
              </span>{" "}
              Play the Naya walkthrough <ArrowRight size={16} />
            </button>
            <small>
              Illustrative product preview · no payment or fulfilment
            </small>
          </div>
          <button
            className="landing-walkthrough-preview"
            type="button"
            onClick={startWalkthrough}
            aria-label="Play the Naya product walkthrough"
          >
            <div className="walkthrough-preview-top">
              <span />
              <span />
              <span />
              <b>NAYA · HOUSEHOLD OVERVIEW</b>
            </div>
            <div className="walkthrough-preview-body">
              <div className="walkthrough-preview-heading">
                <span>YOUR WEEK, IN RHYTHM</span>
                <strong>Market run, sorted.</strong>
              </div>
              <div className="walkthrough-preview-order">
                <span className="walkthrough-preview-icon">
                  <ShoppingBasket size={19} />
                </span>
                <div>
                  <strong>Saturday market basket</strong>
                  <small>3 items · Vendor quotes ready</small>
                </div>
                <span className="walkthrough-preview-check">
                  <Check size={14} />
                </span>
              </div>
              <div className="walkthrough-preview-progress">
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="walkthrough-preview-labels">
                <span>List</span>
                <span>Choose</span>
                <span>Approve</span>
                <span>Awaiting payment</span>
              </div>
            </div>
            <span className="walkthrough-preview-play">
              <Play size={22} fill="currentColor" />
            </span>
            <span className="walkthrough-preview-caption">
              A little more ease, from start to finish
            </span>
          </button>
        </div>
      </section>
      {open && (
        <div
          className="walkthrough-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeWalkthrough();
          }}
        >
          <section
            className="walkthrough-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="walkthrough-title"
          >
            <header className="walkthrough-modal-header">
              <div>
                <span className="eyebrow">NAYA PRODUCT WALKTHROUGH</span>
                <h2 id="walkthrough-title">A calmer way to run a home.</h2>
              </div>
              <button
                type="button"
                className="walkthrough-close"
                onClick={closeWalkthrough}
                aria-label="Close walkthrough"
              >
                <X size={19} />
              </button>
            </header>
            <div className="walkthrough-screen" aria-live="polite">
              <div className="walkthrough-screen-bar">
                <span>HOUSEHOLD / OVERVIEW</span>
                <span>ILLUSTRATIVE PREVIEW</span>
              </div>
              <div className="walkthrough-screen-content">
                <div className="walkthrough-screen-copy">
                  <span className="walkthrough-step-label">
                    {currentStep.label}
                  </span>
                  <div className="walkthrough-step-icon">
                    <StepIcon size={20} />
                  </div>
                  <h3>{currentStep.title}</h3>
                  <p>{currentStep.body}</p>
                </div>
                <div className="walkthrough-screen-card">
                  <span>YOUR NAYA UPDATE</span>
                  <strong>{currentStep.status}</strong>
                  <ul>
                    {currentStep.items.map((item) => (
                      <li key={item}>
                        <i />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div>
                    <ShieldCheck size={14} /> You stay in control
                  </div>
                </div>
              </div>
            </div>
            <div className="walkthrough-controls">
              <div
                className="walkthrough-progress"
                aria-label={`Step ${step + 1} of ${walkthroughSteps.length}`}
              >
                {walkthroughSteps.map((item, index) => (
                  <button
                    key={item.label}
                    type="button"
                    className={
                      index === step ? "active" : index < step ? "complete" : ""
                    }
                    onClick={() => setStep(index)}
                    aria-label={`Go to ${item.label.toLowerCase()}`}
                    aria-current={index === step ? "step" : undefined}
                  />
                ))}
              </div>
              <div className="walkthrough-control-buttons">
                <span>
                  {step + 1} / {walkthroughSteps.length}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(0);
                    setPlaying(false);
                  }}
                  aria-label="Restart walkthrough"
                >
                  <RotateCcw size={15} />
                </button>
                <button
                  type="button"
                  className="walkthrough-toggle"
                  onClick={() => setPlaying((current) => !current)}
                >
                  {playing ? (
                    <Pause size={15} fill="currentColor" />
                  ) : (
                    <Play size={15} fill="currentColor" />
                  )}
                  {playing ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  className="walkthrough-next"
                  onClick={() =>
                    setStep(
                      (current) => (current + 1) % walkthroughSteps.length,
                    )
                  }
                >
                  Next <ChevronRight size={15} />
                </button>
              </div>
            </div>
            <p className="walkthrough-disclaimer">
              Illustrative animated preview · this is not a live order.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
