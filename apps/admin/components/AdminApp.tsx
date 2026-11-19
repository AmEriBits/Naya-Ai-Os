"use client";

import { useState } from "react";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
import { supabase } from "@/app/lib/supabase";
import { adminDemoData } from "@/app/lib/demo-data";
import useAdminConsole from "@/app/hooks/useAdminConsole";
import AdminDashboard from "@/components/admin-dashboard";

function AdminBrand() {
  return (
    <a className="admin-brand" href="/">
      <span className="admin-brand-mark">n</span>
      <strong>
        naya<em>.</em>
        <small>OPERATIONS</small>
      </strong>
    </a>
  );
}

export default function AdminApp() {
  const [demoMode, setDemoMode] = useState(false);
  const {
    session,
    authorized,
    loading,
    busy,
    error,
    data,
    email,
    setEmail,
    password,
    setPassword,
    signIn,
    signOut,
    verifyVendor,
    resolveDispute,
    loadAdmin,
    clearError,
  } = useAdminConsole();

  if (demoMode) {
    return (
      <div className="admin-app">
        <AdminDashboard
          email="Demo operator"
          data={adminDemoData}
          counts={adminDemoData.counts}
          loading={false}
          busy={false}
          error=""
          demoMode
          onClearError={() => {}}
          onExitDemo={() => setDemoMode(false)}
          onSignOut={() => setDemoMode(false)}
          onRefresh={() => {}}
          onVerify={() => {}}
          onResolve={() => {}}
        />
      </div>
    );
  }

  if (!supabase) {
    return (
      <main className="admin-app">
        <header className="auth-header">
          <AdminBrand />
        </header>
        <section className="admin-message">
          <ShieldCheck size={24} />
          <h1>Connect the staging backend</h1>
          <p>
            Set the public Supabase URL and anon key in the local environment to
            load the restricted admin console.
          </p>
          <button className="preview-entry" onClick={() => setDemoMode(true)}>
            Explore dashboard demo
          </button>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="admin-app">
        <header className="auth-header">
          <AdminBrand />
        </header>
        <section className="admin-auth">
          <span className="admin-eyebrow">RESTRICTED OPERATOR ACCESS</span>
          <h1>Sign in to Naya operations.</h1>
          <p>
            Admin access is assigned by an authorized operator. It cannot be
            self-granted.
          </p>
          {error && (
            <div className="admin-error" role="alert">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <form onSubmit={signIn}>
            <label htmlFor="admin-email">Email address</label>
            <input
              id="admin-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button className="admin-primary" type="submit" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"} <ArrowRight size={16} />
            </button>
          </form>
          <small>
            Access is checked against the server-side admin membership.
          </small>
          <button className="preview-entry" onClick={() => setDemoMode(true)}>
            Explore dashboard demo
          </button>
        </section>
      </main>
    );
  }

  if (!authorized && !loading) {
    return (
      <main className="admin-app">
        <header className="auth-header">
          <AdminBrand />
        </header>
        <section className="admin-message">
          <ShieldCheck size={24} />
          <h1>Admin access is not assigned</h1>
          <p>
            Ask an authorized Naya operator to grant admin membership. This
            account cannot grant itself access.
          </p>
          {error && (
            <div className="admin-error" role="alert">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <button onClick={() => void signOut()}>Sign out</button>
          <button className="preview-entry" onClick={() => setDemoMode(true)}>
            Explore dashboard demo
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-app">
      <AdminDashboard
        email={session.user.email ?? ""}
        data={data}
        counts={data.counts}
        loading={loading}
        busy={busy}
        error={error}
        onClearError={clearError}
        onSignOut={() => void signOut()}
        onRefresh={() => void loadAdmin()}
        onVerify={(id, status) => void verifyVendor(id, status)}
        onResolve={(id) => void resolveDispute(id)}
      />
    </main>
  );
}
