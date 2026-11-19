import { useEffect, useState } from "react";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  FileText,
  MessageCircle,
  Mic,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBasket,
  Sparkles,
  Truck,
} from "lucide-react";

import type { Quote, ShoppingRequest } from "@/app/lib/supabase";

import { money, statusLabel } from "@/app/lib/format";

import type { BasketChange } from "@/app/types";

import BasketChangeApproval from "@/components/workspace/basket-change-approval";

import EmptyState from "@/components/ui/empty-state";

import LoadingRows from "@/components/ui/loading-rows";

import QuoteCard from "@/components/workspace/quote-card";

import StatCard from "@/components/ui/stat-card";

export default function HouseholdDashboard({
  loading,
  requests,
  quotes,
  orders,
  openComposer,
  onUpload,
  onVoice,
  onAccept,
  onConfirm,
  onBasketDecision,
  busy,
  householdName,
}: {
  loading: boolean;
  requests: ShoppingRequest[];
  quotes: Quote[];
  orders: Record<string, any>[];
  openComposer: () => void;
  onUpload: () => void;
  onVoice: () => void;
  onAccept: (id: string) => void;
  onConfirm: (id: string, issue?: string) => void;
  onBasketDecision: (id: string, approve: boolean) => void;
  busy: boolean;
  householdName: string;
}) {
  const [quoteClock, setQuoteClock] = useState<number | null>(null);
  useEffect(() => {
    if (quotes.length === 0) {
      setQuoteClock(null);
      return;
    }
    const updateClock = () => setQuoteClock(Date.now());
    updateClock();
    const interval = window.setInterval(updateClock, 15_000);
    return () => window.clearInterval(interval);
  }, [quotes.length]);

  const newlyActive = requests.filter((r) =>
    ["published", "quoted", "accepted"].includes(r.status),
  );
  const activeOrders = orders.filter(
    (order) =>
      !["completed", "cancelled", "resolved", "disputed"].includes(
        order.status,
      ),
  );
  const shoppers = [
    ...new Map(
      quotes.flatMap((quote) => {
        const vendor = quote.agent_profiles;
        return vendor
          ? [
              [
                vendor.agent_id ?? vendor.business_name,
                vendor.business_name,
              ] as const,
            ]
          : [];
      }),
    ).values(),
  ];
  const quotesByRequest = new Map<string, Quote[]>();
  quotes.forEach((quote) =>
    quotesByRequest.set(quote.request_id, [
      ...(quotesByRequest.get(quote.request_id) ?? []),
      quote,
    ]),
  );
  const quoteComparisons = requests.flatMap((request) => {
    if (!["published", "quoted"].includes(request.status)) return [];
    const requestQuotes = quotesByRequest.get(request.request_id);
    return requestQuotes?.length ? [{ request, quotes: requestQuotes }] : [];
  });
  const comparisonQuoteCount = quoteComparisons.reduce(
    (count, comparison) => count + comparison.quotes.length,
    0,
  );
  const deliveryCount = orders.filter((order) =>
    ["out_for_delivery", "delivered", "completed"].includes(order.status),
  ).length;
  const pendingBasketChanges = orders.flatMap((order) =>
    (order.order_basket_changes ?? [])
      .filter((change: BasketChange) => change.status === "pending")
      .map((change: BasketChange) => ({ change })),
  );
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return (
    <>
      {pendingBasketChanges.map(({ change }) => (
        <BasketChangeApproval
          key={change.change_id}
          change={change}
          busy={busy}
          onDecide={onBasketDecision}
        />
      ))}
      <section className="welcome-card">
        <div className="welcome-copy">
          <div className="welcome-sun">☼</div>
          <div>
            <span className="welcome-kicker">WELCOME TO NAYA</span>
            <h2>
              {greeting}, {householdName || "your household"}.
            </h2>
            <p>
              Start with a shopping list. Naya helps organize it, and your
              trusted local vendors take it from there.
            </p>
            <button className="button button-welcome" onClick={openComposer}>
              <Plus size={16} /> Start a market request <ArrowRight size={15} />
            </button>
          </div>
        </div>
        <div className="welcome-art">
          <div className="art-circle art-circle-one" />
          <div className="art-circle art-circle-two" />
          <div className="art-card">
            <div className="art-card-icon">
              <ShoppingBasket size={17} />
            </div>
            <div>
              <strong>One less thing to carry</strong>
              <span>Market runs, sorted</span>
            </div>
            <Check size={16} />
          </div>
          <div className="art-sparkle sparkle-a">✳</div>
          <div className="art-sparkle sparkle-b">✦</div>
          <div className="art-leaf">❧</div>
        </div>
      </section>
      <section className="quick-actions">
        <div>
          <span className="eyebrow">START WITH WHAT YOU HAVE</span>
          <h3>What do you need today?</h3>
        </div>
        <div className="quick-action-buttons">
          <button onClick={onUpload}>
            <FileText size={17} />
            <span>
              <strong>Upload list</strong>
              <small>Text file</small>
            </span>
            <ArrowRight size={14} />
          </button>
          <button onClick={onVoice}>
            <Mic size={17} />
            <span>
              <strong>Voice note</strong>
              <small>Use device speech</small>
            </span>
            <ArrowRight size={14} />
          </button>
          <button onClick={openComposer}>
            <MessageCircle size={17} />
            <span>
              <strong>Type items</strong>
              <small>Start with a blank list</small>
            </span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">YOUR HOUSEHOLD PULSE</span>
          <h2>Shopping at a glance</h2>
        </div>
      </div>
      <div className="stat-grid">
        <StatCard
          icon={ShoppingBasket}
          label="Active shopping requests"
          value={loading ? "—" : String(newlyActive.length)}
          note="Requests still in progress"
          tone="green"
        />
        <StatCard
          icon={MessageCircle}
          label="Vendor quotes to compare"
          value={loading ? "—" : String(comparisonQuoteCount)}
          note="Check each offer’s expiry"
          tone="lavender"
        />
        <StatCard
          icon={Package}
          label="Orders in progress"
          value={loading ? "—" : String(activeOrders.length)}
          note="Selected vendor or fulfilment stage"
          tone="peach"
        />
        <StatCard
          icon={Truck}
          label="Deliveries tracked"
          value={loading ? "—" : String(deliveryCount)}
          note="Out for delivery, delivered, or completed"
          tone="blue"
        />
      </div>
      <section className="household-analytics panel" id="household-analytics">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">HOUSEHOLD ANALYTICS</span>
            <h3>Insights are not available yet</h3>
            <p>
              Spending and delivery analytics require completed orders. In this
              pilot, accepted quotes remain awaiting_payment and do not progress
              to fulfilment.
            </p>
          </div>
        </div>
      </section>
      <section className="shoppers-glance panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">YOUR REQUEST NETWORK</span>
            <h3>Active shoppers at a glance</h3>
            <p>
              Naya-approved vendors who have responded to your open requests.
            </p>
          </div>
          <span className="small-counter">
            {loading ? "—" : String(shoppers.length)}
          </span>
        </div>
        {loading ? (
          <LoadingRows />
        ) : shoppers.length === 0 ? (
          <p className="ops-empty">
            Vendor responses will appear here when shoppers quote on your
            requests.
          </p>
        ) : (
          <div className="shopper-chips">
            {shoppers.map((name) => (
              <span key={name}>
                <span className="shopper-avatar">
                  {name?.[0]?.toUpperCase()}
                </span>
                <strong>{name}</strong>
              </span>
            ))}
          </div>
        )}
      </section>
      <div className="dashboard-columns">
        <section className="panel request-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">IN MOTION</span>
              <h3>Active shopping requests</h3>
            </div>
            <span className="small-counter">{newlyActive.length}</span>
          </div>
          {loading ? (
            <LoadingRows />
          ) : newlyActive.length === 0 ? (
            <EmptyState
              icon={ShoppingBasket}
              title="Your first request starts here"
              body="Add what you need in your own words. Naya will help organize it before it reaches a vendor."
              action="Create a request"
              onAction={openComposer}
            />
          ) : (
            <div className="request-list">
              {newlyActive.slice(0, 6).map((request) => {
                const items = request.request_items ?? [];
                return (
                  <div className="request-row" key={request.request_id}>
                    <div className="request-symbol">
                      <ShoppingBasket size={17} />
                    </div>
                    <div className="request-main">
                      <strong>{request.title}</strong>
                      <span>
                        {items.length} items ·{" "}
                        {new Date(request.created_at).toLocaleDateString(
                          "en-NG",
                          { day: "numeric", month: "short" },
                        )}
                      </span>
                    </div>
                    <div className="request-trailing">
                      <span className={`status-pill status-${request.status}`}>
                        {statusLabel[request.status] ?? request.status}
                      </span>
                      {request.budget_limit && (
                        <strong>{money(request.budget_limit)}</strong>
                      )}
                    </div>
                    <ChevronRight className="row-arrow" size={16} />
                  </div>
                );
              })}
            </div>
          )}
        </section>
        <aside className="right-column">
          <section className="insight-card">
            <div className="insight-top">
              <span className="insight-icon">
                <Sparkles size={16} />
              </span>
              <span>FROM NAYA AI</span>
              <span className="insight-live">READY</span>
            </div>
            <h3>Shopping, with a little more thought.</h3>
            <p>
              Share a list or describe your budget. Naya helps organize the
              request for your review before it reaches vendors.
            </p>
            <button onClick={openComposer}>
              Ask Naya to help <ArrowRight size={14} />
            </button>
            <div className="insight-decoration">✳</div>
          </section>
        </aside>
      </div>
      <section
        className="panel quote-comparison"
        aria-labelledby="quote-comparison-title"
      >
        <div className="panel-heading">
          <div>
            <span className="eyebrow">YOUR CHOICES</span>
            <h3 id="quote-comparison-title">Compare vendor quotes</h3>
            <p>Review every submitted offer for each open request.</p>
          </div>
          <span className="small-counter">
            {loading ? "—" : String(comparisonQuoteCount)}
          </span>
        </div>
        <p className="quote-comparison-disclaimer">
          Quoted totals are item-price sums. Delivery fees are not listed
          separately in this beta, so a quote may not be an all-in price.
        </p>
        {loading ? (
          <LoadingRows />
        ) : quoteComparisons.length === 0 ? (
          <div className="mini-empty">
            <div className="mini-empty-icon">
              <MessageCircle size={17} />
            </div>
            <strong>No vendor quotes to compare yet</strong>
            <p>
              Quotes will appear here as Naya-approved vendors respond to your
              open requests.
            </p>
          </div>
        ) : (
          <div className="quote-comparison-groups">
            {quoteComparisons.map(({ request, quotes: requestQuotes }) => (
              <section
                className="quote-comparison-request"
                key={request.request_id}
                aria-label={`Quotes for ${request.title}`}
              >
                <div className="quote-comparison-request-heading">
                  <div>
                    <h4>{request.title}</h4>
                    {request.budget_limit ? (
                      <span>Optional budget: {money(request.budget_limit)}</span>
                    ) : null}
                  </div>
                  <span className="quote-comparison-count">
                    {requestQuotes.length}{" "}
                    {requestQuotes.length === 1 ? "quote" : "quotes"}
                  </span>
                </div>
                <div className="quote-comparison-grid">
                  {requestQuotes.map((quote) => (
                    <QuoteCard
                      quote={quote}
                      now={quoteClock}
                      busy={busy}
                      onAccept={onAccept}
                      key={quote.quote_id}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
        <p className="quote-comparison-footer">
          Choosing a quote creates an order that waits for payment. Payment
          collection and vendor payouts are not connected yet.
        </p>
      </section>
      <section className="vendor-queue panel household-orders">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">LIVE ORDER STATUS</span>
            <h3>Shopping progress at a glance</h3>
            <p>
              Follow each selected vendor from accepted quote through delivery
              confirmation.
            </p>
          </div>
          <span className="small-counter">
            {loading ? "—" : String(activeOrders.length)}
          </span>
        </div>
        {loading ? (
          <LoadingRows />
        ) : orders.length === 0 ? (
          <p className="ops-empty">
            When you choose a vendor quote, your order progress will appear
            here.
          </p>
        ) : (
          <div className="ops-list">
            {orders.map((order) => {
              const progress: Record<string, number> = {
                awaiting_payment: -1,
                confirmed: 0,
                shopping: 1,
                awaiting_customer_approval: 1,
                ready_for_handoff: 2,
                out_for_delivery: 2,
                delivered: 3,
                completed: 3,
                disputed: 1,
                resolved: 3,
              };
              const stage = progress[order.status] ?? -1;
              return (
                <article
                  className="ops-row household-order"
                  key={order.order_id}
                >
                  <div className="ops-main">
                    <strong>
                      {order.quotes?.agent_profiles?.business_name ||
                        "Selected vendor"}
                    </strong>
                    <span>
                      {order.order_id.slice(0, 8)} ·{" "}
                      {new Date(order.created_at).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                    <div className="order-progress-steps">
                      {["Accepted", "Shopping", "On the way", "Delivered"].map(
                        (label, index) => (
                          <span
                            className={index <= stage ? "step-complete" : ""}
                            key={label}
                          >
                            <i />
                            {label}
                          </span>
                        ),
                      )}
                    </div>
                    <div className="order-timeline">
                      {(order.order_events ?? order.events ?? []).map(
                        (event: any, index: number) => (
                          <span key={`${event.event_type}-${index}`}>
                            <i />
                            {event.event_type.replaceAll("_", " ")} ·{" "}
                            {new Date(event.occurred_at).toLocaleDateString(
                              "en-NG",
                              { day: "numeric", month: "short" },
                            )}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                  <div className="ops-aside">
                    <span className={`status-pill status-${order.status}`}>
                      {statusLabel[order.status] || order.status}
                    </span>
                    <strong>
                      {money(Number(order.total_amount), order.currency)}
                    </strong>
                    {order.status === "awaiting_payment" && (
                      <small>
                        Quote acceptance only. Payment is unavailable; the
                        vendor has not started shopping.
                      </small>
                    )}
                    {order.status === "delivered" && (
                      <>
                        <button
                          className="button button-primary"
                          disabled={busy}
                          onClick={() => onConfirm(order.order_id)}
                        >
                          Confirm delivery
                        </button>
                        <button
                          className="button button-light"
                          disabled={busy}
                          onClick={() => {
                            const issue = window.prompt(
                              "Describe the delivery issue for Naya support",
                            );
                            if (issue?.trim())
                              onConfirm(order.order_id, issue.trim());
                          }}
                        >
                          Report a problem
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
      <div className="bottom-note">
        <ShieldCheck size={15} />
        <span>
          Your household details stay private. Vendors see your delivery address
          only after you select their quote.
        </span>
        <button>
          How privacy works <ArrowUpRight size={13} />
        </button>
      </div>
    </>
  );
}
