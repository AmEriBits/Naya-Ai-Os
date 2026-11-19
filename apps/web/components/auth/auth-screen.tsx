import type { FormEvent } from "react";

import { ArrowRight, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react";

export default function AuthScreen({
  email,
  setEmail,
  password,
  setPassword,
  onSubmit,
  busy,
  error,
  notice,
}: {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  onSubmit: (e: FormEvent) => void;
  busy: boolean;
  error: string;
  notice: string;
}) {
  return (
    <div className="auth-screen">
      <div className="auth-side">
        <a href="#top" className="brand">
          <span className="brand-mark">n</span>
          <span>
            naya<span className="brand-period">.</span>
            <small>HOUSEHOLD OS</small>
          </span>
        </a>
        <div className="auth-message">
          <span className="eyebrow">A LITTLE MORE ROOM TO BREATHE</span>
          <h1>
            Home life,
            <br />
            held together.
          </h1>
          <p>
            Your trusted people, everyday requests, and the details that make a
            household work — in one calm place.
          </p>
          <div className="auth-note">
            <span className="auth-note-icon">
              <Sparkles size={16} />
            </span>
            <span>
              AI helps you make sense of a list.
              <br />
              <strong>You make the decisions.</strong>
            </span>
          </div>
        </div>
        <div className="auth-side-caption">
          Thoughtfully made for the way we live.
        </div>
      </div>
      <div className="auth-main">
        <div className="auth-form-wrap">
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Good to see you.</h2>
          <p>Sign in to your Naya workspace.</p>
          {notice && <div className="notice notice-success">{notice}</div>}
          {error && <div className="notice notice-error">{error}</div>}
          <form onSubmit={onSubmit}>
            <label className="field-label" htmlFor="auth-email">
              Email address
            </label>
            <input
              className="text-input"
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <label className="field-label" htmlFor="auth-password">
              Password
            </label>
            <input
              className="text-input"
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="current-password"
              minLength={8}
              required
            />
            <button
              className="button button-primary auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? <LoaderCircle className="spin" size={16} /> : null}
              Sign in securely <ArrowRight size={16} />
            </button>
          </form>
          <p className="auth-invite-note">
            New to Naya? <a href="/signup">Create an account</a>
          </p>
          <div className="auth-security">
            <ShieldCheck size={15} /> Secured by your private Naya workspace
          </div>
        </div>
      </div>
    </div>
  );
}
