"use client";

import Link from "next/link";
import { ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import useAcceptInvite from "@/app/hooks/useAcceptInvite";

export default function AcceptInviteScreen() {
  const invite = useAcceptInvite();

  return (
    <div className="auth-screen">
      <div className="auth-side">
        <Link href="/" className="brand">
          <span className="brand-mark">n</span>
          <span>
            naya<span className="brand-period">.</span>
            <small>HOUSEHOLD OS</small>
          </span>
        </Link>
        <div className="auth-message">
          <span className="eyebrow">A PRIVATE INVITATION</span>
          <h1>
            Your home,
            <br />
            in a little more rhythm.
          </h1>
          <p>Set a password to finish joining your invited Naya workspace.</p>
        </div>
        <div className="auth-side-caption">
          Thoughtfully made for the way we live.
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-form-wrap">
          <span className="eyebrow">INVITATION SETUP</span>
          <h2>Choose your password.</h2>
          {invite.email && <p>{invite.email}</p>}

          {invite.status === "checking" && (
            <p role="status">Checking your invitation…</p>
          )}

          {invite.error && (
            <div className="notice notice-error" role="alert">
              {invite.error}
            </div>
          )}

          {invite.status === "invalid" ? (
            <Link className="button button-primary" href="/login">
              Back to sign in <ArrowRight size={16} />
            </Link>
          ) : (
            <form onSubmit={invite.setInvitePassword}>
              <label className="field-label" htmlFor="invite-password">
                New password
              </label>
              <input
                className="text-input"
                id="invite-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={invite.password}
                onChange={(event) => invite.setPassword(event.target.value)}
                required
                disabled={invite.status !== "ready"}
              />
              <label className="field-label" htmlFor="invite-confirm-password">
                Confirm password
              </label>
              <input
                className="text-input"
                id="invite-confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                value={invite.confirmPassword}
                onChange={(event) =>
                  invite.setConfirmPassword(event.target.value)
                }
                required
                disabled={invite.status !== "ready"}
              />
              <button
                className="button button-primary auth-submit"
                type="submit"
                disabled={invite.status !== "ready"}
              >
                {invite.status === "saving" ? (
                  <LoaderCircle className="spin" size={16} />
                ) : null}
                Set password <ArrowRight size={16} />
              </button>
            </form>
          )}

          <div className="auth-security">
            <ShieldCheck size={15} /> Invitations are required to join Naya.
          </div>
        </div>
      </div>
    </div>
  );
}
