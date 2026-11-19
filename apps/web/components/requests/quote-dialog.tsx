import type { FormEvent } from "react";

import { ArrowRight, X } from "lucide-react";

import type { ShoppingRequest } from "@/app/lib/supabase";

import { money } from "@/app/lib/format";

export default function QuoteDialog({
  request,
  onClose,
  busy,
  quoteUnavailable,
  setQuoteUnavailable,
  quoteLinePrices,
  setQuoteLinePrices,
  quoteEta,
  setQuoteEta,
  quoteMessage,
  setQuoteMessage,
  quoteTotal,
  onSubmit,
}: {
  request: ShoppingRequest | null;
  onClose: () => void;
  busy: boolean;
  quoteUnavailable: Record<string, boolean>;
  setQuoteUnavailable: (
    update: (current: Record<string, boolean>) => Record<string, boolean>,
  ) => void;
  quoteLinePrices: Record<string, string>;
  setQuoteLinePrices: (
    update: (current: Record<string, string>) => Record<string, string>,
  ) => void;
  quoteEta: string;
  setQuoteEta: (value: string) => void;
  quoteMessage: string;
  setQuoteMessage: (value: string) => void;
  quoteTotal: number;
  onSubmit: (event: FormEvent) => void;
}) {
  if (!request) return null;
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="modal-card quote-modal">
        <div className="modal-top">
          <div>
            <span className="eyebrow">QUOTE REQUEST</span>
            <h2>Build your quote</h2>
            <p>Price each item. Only quote what you can source.</p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={19} />
          </button>
        </div>
        <div className="quote-line-list">
          {request.request_items?.map((item) => (
            <div
              className={`quote-line ${quoteUnavailable[item.request_item_id] ? "unavailable" : ""}`}
              key={item.request_item_id}
            >
              <div className="quote-line-copy">
                <strong>{item.item_name}</strong>
                <span>
                  {item.quantity} {item.unit}
                  {item.preferred_brand ? ` · ${item.preferred_brand}` : ""}
                </span>
              </div>
              {quoteUnavailable[item.request_item_id] ? (
                <span className="unavailable-label">Unavailable</span>
              ) : (
                <div className="unit-price">
                  <span>₦</span>
                  <input
                    aria-label={`Unit price for ${item.item_name}`}
                    type="number"
                    min="1"
                    value={quoteLinePrices[item.request_item_id] ?? ""}
                    onChange={(event) =>
                      setQuoteLinePrices((current) => ({
                        ...current,
                        [item.request_item_id]: event.target.value,
                      }))
                    }
                    placeholder="Unit price"
                  />{" "}
                  <small>/{item.unit}</small>
                </div>
              )}
              <button
                type="button"
                className="availability-toggle"
                onClick={() =>
                  setQuoteUnavailable((current) => ({
                    ...current,
                    [item.request_item_id]: !current[item.request_item_id],
                  }))
                }
              >
                {quoteUnavailable[item.request_item_id]
                  ? "Mark available"
                  : "Unavailable"}
              </button>
            </div>
          ))}
        </div>
        <div className="quote-total-row">
          <span>
            Basket total <small>calculated from your unit prices</small>
          </span>
          <strong>{money(quoteTotal)}</strong>
        </div>
        <form onSubmit={onSubmit}>
          <label className="field-label" htmlFor="quote-eta">
            Estimated delivery time
          </label>
          <div className="money-input eta-input">
            <input
              id="quote-eta"
              value={quoteEta}
              onChange={(event) => setQuoteEta(event.target.value)}
              type="number"
              min="5"
              required
              placeholder="45"
            />
            <span>minutes</span>
          </div>
          <label className="field-label" htmlFor="quote-note">
            Note to household <span>Optional</span>
          </label>
          <textarea
            className="note-input"
            id="quote-note"
            value={quoteMessage}
            onChange={(event) => setQuoteMessage(event.target.value)}
            placeholder="Let them know about freshness or market availability."
          />
          <div className="modal-footer">
            <button
              type="button"
              className="button button-light"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="button button-primary"
              disabled={
                busy ||
                quoteTotal <= 0 ||
                (request.request_items ?? []).some(
                  (item) =>
                    !quoteUnavailable[item.request_item_id] &&
                    Number(quoteLinePrices[item.request_item_id] || 0) <= 0,
                )
              }
              type="submit"
            >
              Submit quote <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
