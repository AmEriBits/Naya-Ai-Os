"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";

export default function ResetPasswordScreen({
  busy,
  error,
  onSubmit,
}: {
  busy: boolean;
  error: string;
  onSubmit: (password: string) => void;
}) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setValidationError("Your passwords do not match.");
      return;
    }
    setValidationError("");
    onSubmit(password);
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
          <span className="eyebrow">ACCOUNT SECURITY</span>
          <h1>
            A fresh start,
            <br />
            securely.
          </h1>
          <p>Choose a new password to get back to your Naya workspace.</p>
        </div>
      </div>
      <div className="auth-main">
        <div className="auth-form-wrap">
          <span className="eyebrow">RESET PASSWORD</span>
          <h2>Choose a new password.</h2>
          <p>Use at least 8 characters.</p>
          {(error || validationError) && (
            <div className="notice notice-error">
              {validationError || error}
            </div>
          )}
          <form onSubmit={submit}>
            <label className="field-label" htmlFor="reset-password">
              New password
            </label>
            <input
              className="text-input"
              id="reset-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <label className="field-label" htmlFor="reset-password-confirm">
              Confirm new password
            </label>
            <input
              className="text-input"
              id="reset-password-confirm"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <button
              className="button button-primary auth-submit"
              type="submit"
              disabled={busy}
            >
              {busy ? <LoaderCircle className="spin" size={16} /> : null}
              Update password <ArrowRight size={16} />
            </button>
          </form>
          <div className="auth-security">
            <ShieldCheck size={15} /> Your password is stored securely by
            Supabase.
          </div>
        </div>
      </div>
    </div>
  );
}
