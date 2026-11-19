import { useState } from "react";

import { ArrowRight, Clock3, X } from "lucide-react";

import { money } from "@/app/lib/format";

import type { BasketChange, BasketItem } from "@/app/types";

export default function BasketChangeEditor({
  order,
  latestChange,
  busy,
  onSubmit,
}: {
  order: Record<string, any>;
  latestChange?: BasketChange;
  busy: boolean;
  onSubmit: (id: string, items: BasketItem[], reason: string) => void;
}) {
  const pending = latestChange?.status === "pending";
  const seed =
    latestChange?.status === "declined"
      ? latestChange.items_snapshot
      : order.items_snapshot;
  const [items, setItems] = useState<BasketItem[]>(() =>
    Array.isArray(seed) ? seed.map((item: BasketItem) => ({ ...item })) : [],
  );
  const [reason, setReason] = useState("");
  const total = items.reduce(
    (sum, item) =>
      sum +
      (item.availability === "unavailable"
        ? 0
        : item.quantity * item.unit_price),
    0,
  );
  const reasonId = `basket-change-reason-${order.order_id}`;
  if (pending)
    return (
      <div className="basket-change-pending">
        <Clock3 size={15} />
        <span>
          Shopping is paused while the household reviews this basket change.
        </span>
      </div>
    );
  return (
    <form
      className="basket-change-editor"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(order.order_id, items, reason);
      }}
    >
      <div className="basket-change-editor-heading">
        <div>
          <span className="eyebrow">
            {latestChange?.status === "declined"
              ? "REVISE AND RESUBMIT"
              : "PRICE OR ITEM CHANGE"}
          </span>
          <strong>
            {latestChange?.status === "declined"
              ? "Update the proposal for household review"
              : "Need to change the approved basket?"}
          </strong>
        </div>
        <span>{money(total, order.currency)}</span>
      </div>
      {items.map((item, index) => (
        <div
          className="basket-change-edit-item"
          key={`${item.item_name}-${index}`}
        >
          <div className="basket-change-edit-row">
            <div>
              <strong>{item.item_name}</strong>
              <small>
                {item.quantity} {item.unit}
              </small>
            </div>
            <select
              aria-label={`Availability for ${item.item_name}`}
              value={item.availability}
              onChange={(event) =>
                setItems((current) =>
                  current.map((row, rowIndex) =>
                    rowIndex === index
                      ? {
                          ...row,
                          availability: event.target
                            .value as BasketItem["availability"],
                          unit_price:
                            event.target.value === "unavailable"
                              ? 0
                              : row.unit_price || 1,
                        }
                      : row,
                  ),
                )
              }
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
              <option value="substitution">Substitution</option>
            </select>
            <label className="basket-unit-price">
              <span>₦</span>
              <input
                aria-label={`Unit price for ${item.item_name}`}
                type="number"
                min={item.availability === "unavailable" ? "0" : "1"}
                step="0.01"
                value={item.unit_price}
                disabled={item.availability === "unavailable"}
                onChange={(event) =>
                  setItems((current) =>
                    current.map((row, rowIndex) =>
                      rowIndex === index
                        ? { ...row, unit_price: Number(event.target.value) }
                        : row,
                    ),
                  )
                }
              />
              <small>/{item.unit}</small>
            </label>
            <button
              type="button"
              className="icon-button"
              aria-label={`Remove ${item.item_name}`}
              onClick={() =>
                setItems((current) =>
                  current.filter((_, rowIndex) => rowIndex !== index),
                )
              }
            >
              <X size={15} />
            </button>
          </div>
          {item.availability === "substitution" && (
            <input
              className="text-input basket-substitution-input"
              aria-label={`Proposed substitute for ${item.item_name}`}
              placeholder="Name the proposed substitute"
              minLength={2}
              maxLength={120}
              required
              value={item.proposed_substitution ?? ""}
              onChange={(event) =>
                setItems((current) =>
                  current.map((row, rowIndex) =>
                    rowIndex === index
                      ? { ...row, proposed_substitution: event.target.value }
                      : row,
                  ),
                )
              }
            />
          )}
        </div>
      ))}
      <label className="field-label" htmlFor={reasonId}>
        Explain what changed
      </label>
      <textarea
        className="note-input"
        id={reasonId}
        minLength={5}
        maxLength={500}
        required
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="For example: market price increased, so the new total is higher."
      />
      <div className="basket-change-editor-footer">
        <span>Household approval is required before shopping continues.</span>
        <button
          className="button button-primary"
          disabled={busy || items.length === 0 || total <= 0}
          type="submit"
        >
          {busy ? "Sending…" : "Send for approval"} <ArrowRight size={14} />
        </button>
      </div>
    </form>
  );
}
