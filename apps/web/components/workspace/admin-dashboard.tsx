import { ShieldCheck, Store, Truck, Wallet } from "lucide-react";

import { money, statusLabel } from "@/app/lib/format";

import LoadingRows from "@/components/ui/loading-rows";

import StatCard from "@/components/ui/stat-card";

export default function AdminDashboard({
  loading,
  orders,
  vendors,
  disputes,
  busy,
  onVerify,
  onResolve,
}: {
  loading: boolean;
  orders: Record<string, any>[];
  vendors: Record<string, any>[];
  disputes: Record<string, any>[];
  busy: boolean;
  onVerify: (id: string, status: string) => void;
  onResolve: (id: string) => void;
}) {
  const pending = vendors.filter(
    (vendor) => vendor.verification_status === "pending",
  );
  const active = orders.filter(
    (order) => !["completed", "resolved", "cancelled"].includes(order.status),
  );
  return (
    <>
      <section className="vendor-welcome admin-welcome">
        <div>
          <span className="eyebrow">ADMIN CONSOLE · LIVE PLATFORM RECORDS</span>
          <h2>Trust, fulfilment, and money movement.</h2>
          <p>
            Review vendor onboarding, monitor orders, and resolve delivery
            issues with an audit trail.
          </p>
        </div>
        <div className="availability">
          <ShieldCheck size={15} />
          <span>Restricted operator access</span>
        </div>
      </section>
      <div className="stat-grid vendor-stats">
        <StatCard
          icon={Store}
          label="Pending vendors"
          value={loading ? "—" : String(pending.length)}
          note="Manual review required"
          tone="green"
        />
        <StatCard
          icon={Truck}
          label="Active orders"
          value={loading ? "—" : String(active.length)}
          note="Across all households"
          tone="peach"
        />
        <StatCard
          icon={ShieldCheck}
          label="Open disputes"
          value={loading ? "—" : String(disputes.length)}
          note="Needs operator review"
          tone="lavender"
        />
        <StatCard
          icon={Wallet}
          label="Payments"
          value="Not connected"
          note="No funds held or paid by app"
          tone="blue"
        />
      </div>
      <div className="admin-grid">
        <section className="vendor-queue panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">VENDOR TRUST</span>
              <h3>Applications for review</h3>
              <p>Only a verified seller can quote on household requests.</p>
            </div>
          </div>
          {loading ? (
            <LoadingRows />
          ) : pending.length === 0 ? (
            <p className="ops-empty">No pending vendor applications.</p>
          ) : (
            <div className="ops-list">
              {pending.map((vendor) => (
                <article className="ops-row" key={vendor.agent_id}>
                  <div className="ops-main">
                    <strong>{vendor.business_name}</strong>
                    <span>
                      {vendor.profiles?.full_name || "Contact not provided"}
                      {vendor.profiles?.phone
                        ? ` · ${vendor.profiles.phone}`
                        : ""}
                      {" · "}
                      {vendor.agent_type} · {vendor.service_area} · Applied{" "}
                      {new Date(vendor.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                  <div className="ops-actions">
                    <button
                      className="button button-primary"
                      disabled={busy}
                      onClick={() => onVerify(vendor.agent_id, "verified")}
                    >
                      Verify
                    </button>
                    <button
                      className="button button-light"
                      disabled={busy}
                      onClick={() => onVerify(vendor.agent_id, "rejected")}
                    >
                      Reject
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <section className="vendor-queue panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">CUSTOMER CARE</span>
              <h3>Open delivery disputes</h3>
              <p>
                Resolution is recorded; any refund still needs a connected
                payment provider.
              </p>
            </div>
          </div>
          {loading ? (
            <LoadingRows />
          ) : disputes.length === 0 ? (
            <p className="ops-empty">No open disputes.</p>
          ) : (
            <div className="ops-list">
              {disputes.map((dispute) => (
                <article className="ops-row" key={dispute.dispute_id}>
                  <div className="ops-main">
                    <strong>
                      Order {dispute.order_id.slice(0, 8)} · {dispute.reason}
                    </strong>
                    <span>{dispute.description}</span>
                  </div>
                  <div className="ops-actions">
                    <button
                      className="button button-primary"
                      disabled={busy}
                      onClick={() => onResolve(dispute.dispute_id)}
                    >
                      Resolve with note
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
      <section className="vendor-queue panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">ORDER CONTROL TOWER</span>
            <h3>Live order and payment status</h3>
            <p>
              The admin can inspect the workflow. Payment rows are only
              authoritative when populated by a provider webhook.
            </p>
          </div>
        </div>
        {loading ? (
          <LoadingRows />
        ) : orders.length === 0 ? (
          <p className="ops-empty">No order records yet.</p>
        ) : (
          <div className="ops-list">
            {orders.map((order) => (
              <article className="ops-row" key={order.order_id}>
                <div className="ops-main">
                  <strong>
                    {order.households?.name || "Household"} ·{" "}
                    {order.quotes?.agent_profiles?.business_name || "Vendor"}
                  </strong>
                  <span>
                    {order.order_id} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="ops-aside">
                  <span className={`status-pill status-${order.status}`}>
                    {statusLabel[order.status] || order.status}
                  </span>
                  <strong>
                    {money(Number(order.total_amount), order.currency)}
                  </strong>
                  <small>Funds are not represented as held</small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <div className="admin-escrow-note">
        <ShieldCheck size={17} />
        <div>
          <strong>Escrow readiness</strong>
          <p>
            When a compliant holding partner is connected, this console should
            show funding confirmation, release eligibility, refund state, payout
            reference, and reconciliation. The current workspace will not
            initiate or claim a money movement.
          </p>
        </div>
      </div>
    </>
  );
}
