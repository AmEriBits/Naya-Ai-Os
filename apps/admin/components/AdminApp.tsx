import {
  AlertCircle,
  ArrowRight,
  Check,
  CircleDollarSign,
  LogOut,
  RefreshCw,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { money, statusLabel } from "@/app/lib/format";
import { supabase } from "@/app/lib/supabase";
import useAdminConsole from "@/app/hooks/useAdminConsole";

export default function AdminApp() {
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
    pendingVendors,
    activeOrders,
  } = useAdminConsole();

  return (
    <main className="admin-app">
      <header className="admin-header">
        <a className="admin-brand" href="/">
          <span>n</span>
          <strong>
            naya<em>.</em>
            <small>OPERATIONS</small>
          </strong>
        </a>
        {session && (
          <div className="admin-identity">
            <span>{session.user.email}</span>
            <button onClick={() => void signOut()} aria-label="Sign out">
              <LogOut size={16} />
            </button>
          </div>
        )}
      </header>
      {!supabase ? (
        <section className="admin-message">
          <ShieldCheck size={24} />
          <h1>Connect the staging backend</h1>
          <p>
            Set the public Supabase URL and anon key in the local environment to
            load the restricted admin console.
          </p>
        </section>
      ) : !session ? (
        <section className="admin-auth">
          <span className="admin-eyebrow">RESTRICTED OPERATOR ACCESS</span>
          <h1>Sign in to Naya operations.</h1>
          <p>
            Admin access is assigned by an authorized operator. It cannot be
            self-granted.
          </p>
          {error && (
            <div className="admin-error">
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
        </section>
      ) : !authorized && !loading ? (
        <section className="admin-message">
          <ShieldCheck size={24} />
          <h1>Admin access is not assigned</h1>
          <p>
            Ask an authorized Naya operator to grant admin membership. This
            account cannot grant itself access.
          </p>
          {error && (
            <div className="admin-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <button onClick={() => void signOut()}>Sign out</button>
        </section>
      ) : (
        <div className="admin-content">
          <div className="admin-title-row">
            <div>
              <span className="admin-eyebrow">PLATFORM OPERATIONS</span>
              <h1>Trust, fulfilment, and money movement.</h1>
              <p>
                Review vendor onboarding, monitor orders, and resolve delivery
                issues.
              </p>
            </div>
            <button
              className="admin-refresh"
              onClick={() => void loadAdmin()}
              disabled={loading}
            >
              <RefreshCw size={15} /> Refresh
            </button>
          </div>
          {error && (
            <div className="admin-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <section className="admin-stats">
            <article>
              <span>
                <Store size={17} />
              </span>
              <small>Pending vendors</small>
              <strong>{loading ? "—" : pendingVendors.length}</strong>
              <em>Manual review required</em>
            </article>
            <article>
              <span>
                <Truck size={17} />
              </span>
              <small>Active orders</small>
              <strong>{loading ? "—" : activeOrders.length}</strong>
              <em>Across households</em>
            </article>
            <article>
              <span>
                <ShieldCheck size={17} />
              </span>
              <small>Open disputes</small>
              <strong>{loading ? "—" : data.disputes.length}</strong>
              <em>Needs operator review</em>
            </article>
            <article>
              <span>
                <CircleDollarSign size={17} />
              </span>
              <small>Payments</small>
              <strong>Not connected</strong>
              <em>No funds held or paid by app</em>
            </article>
          </section>
          <section className="admin-panel">
            <header>
              <div>
                <h2>Vendor applications</h2>
                <p>Only a verified seller can quote on household requests.</p>
              </div>
              <span>{pendingVendors.length}</span>
            </header>
            {loading ? (
              <p className="admin-empty">Loading applications…</p>
            ) : pendingVendors.length === 0 ? (
              <p className="admin-empty">No pending vendor applications.</p>
            ) : (
              pendingVendors.map((vendor) => (
                <article className="admin-row" key={vendor.agent_id}>
                  <div>
                    <strong>{vendor.business_name}</strong>
                    <small>
                      {vendor.service_area} · Applied{" "}
                      {new Date(vendor.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </small>
                  </div>
                  <div className="admin-actions">
                    <button
                      className="admin-primary"
                      disabled={busy}
                      onClick={() =>
                        void verifyVendor(vendor.agent_id, "verified")
                      }
                    >
                      <Check size={14} /> Verify
                    </button>
                    <button
                      className="admin-secondary"
                      disabled={busy}
                      onClick={() =>
                        void verifyVendor(vendor.agent_id, "rejected")
                      }
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>
          <section className="admin-panel">
            <header>
              <div>
                <h2>Open delivery disputes</h2>
                <p>
                  Resolution notes are recorded; refunds require a connected
                  payment provider.
                </p>
              </div>
              <span>{data.disputes.length}</span>
            </header>
            {loading ? (
              <p className="admin-empty">Loading disputes…</p>
            ) : data.disputes.length === 0 ? (
              <p className="admin-empty">No open disputes.</p>
            ) : (
              data.disputes.map((dispute) => (
                <article className="admin-row" key={dispute.dispute_id}>
                  <div>
                    <strong>
                      Order {dispute.order_id.slice(0, 8)} · {dispute.reason}
                    </strong>
                    <small>{dispute.description}</small>
                  </div>
                  <button
                    className="admin-primary"
                    disabled={busy}
                    onClick={() => void resolveDispute(dispute.dispute_id)}
                  >
                    Resolve with note <ArrowRight size={14} />
                  </button>
                </article>
              ))
            )}
          </section>
          <section className="admin-panel">
            <header>
              <div>
                <h2>Order control tower</h2>
                <p>
                  Payment rows are authoritative only when populated by a
                  provider webhook.
                </p>
              </div>
            </header>
            {loading ? (
              <p className="admin-empty">Loading orders…</p>
            ) : data.orders.length === 0 ? (
              <p className="admin-empty">No order records yet.</p>
            ) : (
              data.orders.map((order) => (
                <article className="admin-row" key={order.order_id}>
                  <div>
                    <strong>
                      {order.households?.name || "Household"} ·{" "}
                      {order.quotes?.agent_profiles?.business_name || "Vendor"}
                    </strong>
                    <small>
                      {order.order_id} ·{" "}
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </small>
                  </div>
                  <div className="admin-order-state">
                    <span className={`admin-status status-${order.status}`}>
                      {statusLabel[order.status] || order.status}
                    </span>
                    <strong>
                      {money(Number(order.total_amount), order.currency)}
                    </strong>
                    <small>Funds are not represented as held</small>
                  </div>
                </article>
              ))
            )}
          </section>
          <aside className="admin-notice">
            <ShieldCheck size={18} />
            <div>
              <strong>Escrow readiness</strong>
              <p>
                This console does not initiate or claim a money movement.
                Connect and verify a compliant payment partner before showing
                funding, release, refund, or payout states.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
