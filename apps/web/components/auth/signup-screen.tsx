import { useState } from "react";
import type { FormEvent } from "react";

import {
  ArrowRight,
  Home,
  LoaderCircle,
  ShieldCheck,
  Store,
} from "lucide-react";

import type { SignupDraft } from "@/app/types/onboarding";

export default function SignupScreen({
  busy,
  error,
  onSubmit,
}: {
  busy: boolean;
  error: string;
  onSubmit: (draft: SignupDraft) => void;
}) {
  const [role, setRole] = useState<SignupDraft["role"]>("household");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [familySize, setFamilySize] = useState("4");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (role === "household") {
      onSubmit({
        role,
        email,
        password,
        householdName,
        serviceArea,
        familySize,
      });
      return;
    }
    onSubmit({
      role,
      email,
      password,
      contactName,
      phone,
      businessName,
      serviceArea,
      category,
    });
  }

  return (
    <div className="auth-screen">
      <div className="auth-side">
        <a href="/" className="brand">
          <span className="brand-mark">n</span>
          <span>
            naya<span className="brand-period">.</span>
            <small>HOUSEHOLD OS</small>
          </span>
        </a>
        <div className="auth-message">
          <span className="eyebrow">A THOUGHTFUL PLACE TO BEGIN</span>
          <h1>
            Good things
            <br />
            start at home.
          </h1>
          <p>
            Create a household workspace or apply to serve local households.
            Vendor applications are reviewed before access to requests.
          </p>
        </div>
        <div className="auth-side-caption">
          Thoughtfully made for the way we live.
        </div>
      </div>
      <div className="auth-main">
        <div className="auth-form-wrap signup-form-wrap">
          <span className="eyebrow">CREATE YOUR ACCOUNT</span>
          <h2>Let’s get started.</h2>
          <p>
            Choose how you’ll use Naya. You can sign in after creating an
            account.
          </p>
          <div
            className="signup-role-options"
            role="group"
            aria-label="Account type"
          >
            <button
              type="button"
              className={`signup-role-option${role === "household" ? " is-selected" : ""}`}
              aria-pressed={role === "household"}
              onClick={() => setRole("household")}
            >
              <Home size={17} /> Household
            </button>
            <button
              type="button"
              className={`signup-role-option${role === "vendor" ? " is-selected" : ""}`}
              aria-pressed={role === "vendor"}
              onClick={() => setRole("vendor")}
            >
              <Store size={17} /> Vendor
            </button>
          </div>
          {error && <div className="notice notice-error">{error}</div>}
          <form onSubmit={submit}>
            {role === "household" ? (
              <>
                <label className="field-label" htmlFor="signup-household-name">
                  Household name
                </label>
                <input
                  className="text-input"
                  id="signup-household-name"
                  value={householdName}
                  onChange={(event) => setHouseholdName(event.target.value)}
                  placeholder="e.g. The Adeyemi Home"
                  autoComplete="organization"
                  required
                />
                <label className="field-label" htmlFor="signup-household-area">
                  Neighbourhood or market area
                </label>
                <input
                  className="text-input"
                  id="signup-household-area"
                  value={serviceArea}
                  onChange={(event) => setServiceArea(event.target.value)}
                  placeholder="e.g. Wuse 2, Abuja"
                  autoComplete="address-level2"
                  required
                />
                <label className="field-label" htmlFor="signup-family-size">
                  People at home
                </label>
                <input
                  className="text-input"
                  id="signup-family-size"
                  type="number"
                  min="1"
                  max="30"
                  value={familySize}
                  onChange={(event) => setFamilySize(event.target.value)}
                  required
                />
              </>
            ) : (
              <>
                <label className="field-label" htmlFor="signup-contact-name">
                  Contact name
                </label>
                <input
                  className="text-input"
                  id="signup-contact-name"
                  value={contactName}
                  onChange={(event) => setContactName(event.target.value)}
                  autoComplete="name"
                  required
                />
                <label className="field-label" htmlFor="signup-business-name">
                  Business name
                </label>
                <input
                  className="text-input"
                  id="signup-business-name"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  autoComplete="organization"
                  required
                />
                <label className="field-label" htmlFor="signup-phone">
                  Contact phone
                </label>
                <input
                  className="text-input"
                  id="signup-phone"
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  autoComplete="tel"
                  required
                />
                <label className="field-label" htmlFor="signup-category">
                  Business category
                </label>
                <input
                  className="text-input"
                  id="signup-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  placeholder="e.g. Fresh produce"
                  required
                />
                <label className="field-label" htmlFor="signup-vendor-area">
                  Market and service area
                </label>
                <input
                  className="text-input"
                  id="signup-vendor-area"
                  value={serviceArea}
                  onChange={(event) => setServiceArea(event.target.value)}
                  placeholder="e.g. Wuse Market, Abuja"
                  required
                />
                <div className="privacy-hint">
                  Vendor applications are reviewed before vendors can quote.
                </div>
              </>
            )}
            <label className="field-label" htmlFor="signup-email">
              Email address
            </label>
            <input
              className="text-input"
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <label className="field-label" htmlFor="signup-password">
              Password
            </label>
            <input
              className="text-input"
              id="signup-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <button
              className="button button-primary auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? <LoaderCircle className="spin" size={16} /> : null}
              Create account <ArrowRight size={16} />
            </button>
          </form>
          <p className="auth-invite-note">
            Already have an account? <a href="/login">Sign in</a>
          </p>
          <div className="auth-security">
            <ShieldCheck size={15} /> Household addresses are collected after
            sign-in.
          </div>
        </div>
      </div>
    </div>
  );
}
