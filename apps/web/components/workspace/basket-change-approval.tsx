import { ArrowRight, Check } from "lucide-react";

import { money } from "@/app/lib/format";

import type { BasketChange } from "@/app/types";

export default function BasketChangeApproval({
  change,
  busy,
  onDecide,
}: {
  change: BasketChange;
  busy: boolean;
  onDecide: (id: string, approve: boolean) => void;
}) {
  return (
    <section className="basket-change-approval panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">HOUSEHOLD APPROVAL NEEDED</span>
          <h3>Your vendor proposed a basket change</h3>
          <p>{change.reason}</p>
        </div>
        <span className="status-pill status-awaiting_customer_approval">
          Shopping paused
        </span>
      </div>
      <div className="basket-change-totals">
        <div>
          <span>Current total</span>
          <strong>{money(change.previous_total, change.currency)}</strong>
        </div>
        <ArrowRight size={16} />
        <div>
          <span>Proposed total</span>
          <strong>{money(change.proposed_total, change.currency)}</strong>
        </div>
      </div>
      <div className="basket-change-items">
        {change.items_snapshot.map((item, index) => (
          <div
            className="basket-change-item"
            key={`${item.item_name}-${index}`}
          >
            <span>
              <strong>
                {item.proposed_substitution
                  ? `${item.item_name} → ${item.proposed_substitution}`
                  : item.item_name}
              </strong>
              <small>
                {item.quantity} {item.unit}
                {item.availability === "unavailable" ? " · unavailable" : ""}
              </small>
            </span>
            <strong>
              {item.availability === "unavailable"
                ? "Removed"
                : money(item.quantity * item.unit_price, change.currency)}
            </strong>
          </div>
        ))}
      </div>
      <div className="basket-change-actions">
        <button
          className="button button-light"
          disabled={busy}
          onClick={() => onDecide(change.change_id, false)}
        >
          Decline and ask for revision
        </button>
        <button
          className="button button-primary"
          disabled={busy}
          onClick={() => onDecide(change.change_id, true)}
        >
          Approve revised basket <Check size={15} />
        </button>
      </div>
      <p className="basket-change-footnote">
        Declining pauses the order. The vendor must revise the basket and send
        it back for your approval.
      </p>
    </section>
  );
}
