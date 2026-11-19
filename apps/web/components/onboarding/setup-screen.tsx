import {
  ArrowRight,
  Check,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
} from "lucide-react";

export default function SetupScreen({
  onLocalPreview,
  onBack,
}: {
  onLocalPreview: () => void;
  onBack: () => void;
}) {
  return (
    <div className="setup-screen">
      <button className="setup-back" onClick={onBack}>
        ← Back to Naya
      </button>
      <div className="setup-panel">
        <a href="/" className="brand setup-brand">
          <span className="brand-mark">n</span>
          <span>
            naya<span className="brand-period">.</span>
            <small>HOUSEHOLD OS</small>
          </span>
        </a>
        <div className="setup-illustration">
          <div className="setup-glow" />
          <div className="setup-orbit orbit-one" />
          <div className="setup-orbit orbit-two" />
          <div className="setup-center">
            <Sparkles size={34} />
          </div>
          <div className="float-card float-one">
            <ShoppingBasket size={17} />
            <span>Your home, in rhythm</span>
          </div>
          <div className="float-card float-two">
            <ShieldCheck size={16} />
            <span>Built on trust</span>
          </div>
        </div>
        <span className="eyebrow">ONE CALMER HOME</span>
        <h1>
          More breathing room
          <br />
          starts here.
        </h1>
        <p>
          Naya brings your household requests, trusted local vendors, and
          everyday coordination into one thoughtful space.
        </p>
        <div className="setup-steps">
          <div>
            <span>01</span> Connect your private database
          </div>
          <div>
            <span>02</span> Invite a household or register a shop
          </div>
          <div>
            <span>03</span> Start with one real market request
          </div>
        </div>
        <div className="setup-callout">
          <ShieldCheck size={17} />
          <span>
            Connect Supabase for live shared accounts and real vendor activity.
            This workspace starts empty.
          </span>
        </div>
      </div>
      <div className="setup-side">
        <div className="setup-side-card">
          <span className="eyebrow">GETTING STARTED</span>
          <h2>Connect Naya to its backend</h2>
          <p>
            Add your Supabase project URL and public anon key to the local{" "}
            <code>.env.local</code> file to enable sign-in and live data.
          </p>
          <div className="code-card">
            <div>
              <i />
              <i />
              <i />
              <span>.env.local</span>
            </div>
            <code>
              NEXT_PUBLIC_SUPABASE_URL=https://…supabase.co
              <br />
              NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ…
            </code>
          </div>
          <div className="setup-checklist">
            <div>
              <Check size={15} />
              <span>Private household data protected by RLS</span>
            </div>
            <div>
              <Check size={15} />
              <span>Server-verified vendor quotes</span>
            </div>
            <div>
              <Check size={15} />
              <span>AI list interpretation with human review</span>
            </div>
          </div>
          <button
            className="button button-primary local-preview-cta"
            onClick={onLocalPreview}
          >
            Explore the working preview <ArrowRight size={15} />
          </button>
          <p className="local-preview-copy">
            Empty local workspace, saved only in this browser. No shared vendor
            network, AI service, or payment flow is connected.
          </p>
          <p className="setup-foot">
            See <strong>README.md</strong> for database setup and the first
            vendor verification steps.
          </p>
        </div>
        <div className="setup-side-footer">
          Naya is designed around trust, clarity, and the people who make a
          home.
        </div>
      </div>
    </div>
  );
}
