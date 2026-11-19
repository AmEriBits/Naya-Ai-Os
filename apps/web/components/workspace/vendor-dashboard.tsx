import {
  Activity,
  ArrowRight,
  FileText,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  Wallet,
} from "lucide-react";

import type { ShoppingRequest } from "@/app/lib/supabase";

import { money, statusLabel } from "@/app/lib/format";

import type { BasketChange, BasketItem } from "@/app/types";

import EmptyState from "@/components/ui/empty-state";

import LoadingRows from "@/components/ui/loading-rows";

import StatCard from "@/components/ui/stat-card";

import BasketChangeEditor from "@/components/workspace/basket-change-editor";

export default function VendorDashboard({
  loading,
  requests,
  orders,
  business,
  busy,
  localPreview,
  onQuote,
  onStatus,
  onBasketChange,
}: {
  loading: boolean;
  requests: ShoppingRequest[];
  orders: Record<string, any>[];
  business: string;
  busy: boolean;
  localPreview: boolean;
  onQuote: (request: ShoppingRequest) => void;
  onStatus: (id: string, status: string) => void;
  onBasketChange: (id: string, items: BasketItem[], reason: string) => void;
}) {
  const active = orders.filter(
    (order) => !["completed", "cancelled", "disputed"].includes(order.status),
  );
  const nextStep: Record<string, string> = {
    ...(localPreview ? { awaiting_payment: "shopping" } : {}),
    confirmed: "shopping",
    shopping: "ready_for_handoff",
    ready_for_handoff: "out_for_delivery",
    out_for_delivery: "delivered",
  };
  const nextLabel: Record<string, string> = {
    shopping: "Start shopping",
    ready_for_handoff: "Mark items ready",
    out_for_delivery: "Hand to delivery",
    delivered: "Confirm delivery",
  };
  return (
    <>
      <section className="vendor-welcome">
        <div>
          <span className="eyebrow">
            VENDOR WORKSPACE ·{" "}
            {localPreview ? "LOCAL PREVIEW" : "VERIFIED NETWORK"}
          </span>
          <h2>
            {business ? `Welcome back, ${business}.` : "Welcome to your shop."}
          </h2>
          <p>Clear requests, honest quotes, and work you can plan around.</p>
        </div>
        <div className="availability">
          <span className="live-dot" />
          <span>Available for requests</span>
        </div>
      </section>
      <div className="stat-grid vendor-stats">
        <StatCard
          icon={Package}
          label="Open requests"
          value={loading ? "—" : String(requests.length)}
          note="In your service area"
          tone="green"
        />
        <StatCard
          icon={FileText}
          label="Quotes sent"
          value="Live records"
          note="See selected work below"
          tone="lavender"
        />
        <StatCard
          icon={Truck}
          label="Active orders"
          value={loading ? "—" : String(active.length)}
          note="Accepted by households"
          tone="peach"
        />
        <StatCard
          icon={Wallet}
          label="Earnings"
          value="Unavailable"
          note="Holding partner not connected"
          tone="blue"
        />
      </div>
      {localPreview && (
        <div className="preview-notice">
          <ShieldCheck size={15} /> Local preview: you can advance through
          fulfilment without collecting money. No vendor or customer sees this
          data outside this browser.
        </div>
      )}
      <div className="vendor-queue panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">MATCHED TO YOUR AREA</span>
            <h3>Requests you can quote</h3>
            <p>Household addresses stay hidden until a quote is chosen.</p>
          </div>
          <span className="text-button">
            <Activity size={14} /> Updates in real time
          </span>
        </div>
        {loading ? (
          <LoadingRows />
        ) : requests.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No open requests right now"
            body="New requests from households in your service area will appear here. Stay online and we’ll notify you when there’s a match."
            action="Refresh request list"
            onAction={() => window.location.reload()}
          />
        ) : (
          <div className="vendor-request-grid">
            {requests.map((request) => {
              const items = request.request_items ?? [];
              return (
                <article
                  className="vendor-request-card"
                  key={request.request_id}
                >
                  <div className="vendor-card-top">
                    <span className="new-request-pill">
                      <i /> New request
                    </span>
                    <span className="request-age">
                      {new Date(request.created_at).toLocaleDateString(
                        "en-NG",
                        { day: "numeric", month: "short" },
                      )}
                    </span>
                  </div>
                  <h4>{request.title}</h4>
                  <div className="vendor-card-meta">
                    <span>
                      <Package size={14} />
                      {items.length} items
                    </span>
                    <span>
                      <MapPin size={14} />
                      Area shared after selection
                    </span>
                  </div>
                  {request.budget_limit && (
                    <div className="request-budget">
                      <span>Household budget limit</span>
                      <strong>{money(request.budget_limit)}</strong>
                    </div>
                  )}
                  <div className="vendor-item-tags">
                    {items.slice(0, 4).map((item) => (
                      <span key={item.request_item_id}>
                        {item.item_name}{" "}
                        <b>
                          {item.quantity}
                          {item.unit}
                        </b>
                      </span>
                    ))}
                    {items.length > 4 && <span>+{items.length - 4} more</span>}
                  </div>
                  <button
                    className="button button-primary quote-cta"
                    onClick={() => onQuote(request)}
                  >
                    Build a quote <ArrowRight size={15} />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
      <div className="vendor-queue panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">SELECTED ORDERS</span>
            <h3>Fulfilment and delivery</h3>
            <p>
              Move accepted orders through fulfilment. Any basket or price
              change must be approved by the household first.
            </p>
          </div>
        </div>
        {loading ? (
          <LoadingRows />
        ) : orders.length === 0 ? (
          <p className="ops-empty">
            Accepted orders will appear here. Requests only become orders after
            a household chooses your quote.
          </p>
        ) : (
          <div className="vendor-order-list">
            {orders.map((order) => {
              const items = Array.isArray(order.items_snapshot)
                ? order.items_snapshot
                : [];
              const action = nextStep[order.status];
              const latestChange = (order.order_basket_changes ?? []).at(-1) as
                BasketChange | undefined;
              return (
                <div className="vendor-order-stack" key={order.order_id}>
                  <article className="ops-row">
                    <div className="ops-main">
                      <strong>
                        {order.households?.name || "Household order"}
                      </strong>
                      <span>
                        {items.length} items ·{" "}
                        {new Date(order.created_at).toLocaleDateString(
                          "en-NG",
                          { day: "numeric", month: "short" },
                        )}
                      </span>
                      <div className="vendor-item-tags">
                        {items.slice(0, 4).map((item: any, index: number) => (
                          <span key={index}>
                            {item.item_name}{" "}
                            <b>
                              {item.quantity} {item.unit}
                            </b>
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ops-aside">
                      <span className={`status-pill status-${order.status}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                      <strong>
                        {money(Number(order.total_amount), order.currency)}
                      </strong>
                      {action && (
                        <button
                          className="button button-light"
                          disabled={busy}
                          onClick={() => onStatus(order.order_id, action)}
                        >
                          {localPreview && order.status === "awaiting_payment"
                            ? "Continue preview (no payment)"
                            : nextLabel[action]}{" "}
                          <ArrowRight size={14} />
                        </button>
                      )}
                      {order.status === "awaiting_payment" && (
                        <small>
                          {localPreview
                            ? "Preview only — no funds are collected or credited."
                            : "Waiting for verified payment confirmation"}
                        </small>
                      )}
                    </div>
                  </article>
                  {["shopping", "awaiting_customer_approval"].includes(
                    order.status,
                  ) && (
                    <BasketChangeEditor
                      key={`${order.order_id}:${latestChange?.change_id ?? ""}`}
                      order={order}
                      latestChange={latestChange}
                      busy={busy}
                      onSubmit={onBasketChange}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="vendor-footnote">
        <ShieldCheck size={15} /> A changed basket pauses shopping until the
        household approves it. No payment is collected or implied by this
        preview.
      </div>
    </>
  );
}
