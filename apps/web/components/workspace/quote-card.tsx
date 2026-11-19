import { Clock3, MapPin } from "lucide-react";

import type { Quote } from "@/app/lib/supabase";

import { money } from "@/app/lib/format";

function formatNigeriaTime(value: string, includeDate = false) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toLocaleString("en-NG", {
    timeZone: "Africa/Lagos",
    ...(includeDate ? { day: "numeric", month: "short" } : {}),
    hour: "numeric",
    minute: "2-digit",
  });
}

function availabilityLabel(availability: string) {
  switch (availability) {
    case "available":
      return "Available";
    case "unavailable":
      return "Unavailable";
    case "partial":
      return "Partially available";
    case "substitution":
      return "Substitution proposed";
    default:
      return "Availability unclear";
  }
}

function availabilityClass(availability: string) {
  switch (availability) {
    case "available":
    case "unavailable":
    case "partial":
    case "substitution":
      return `quote-item-${availability}`;
    default:
      return "quote-item-unknown";
  }
}

export default function QuoteCard({
  quote,
  now,
  busy,
  onAccept,
}: {
  quote: Quote;
  now: number | null;
  busy: boolean;
  onAccept: (id: string) => void;
}) {
  const vendor = quote.agent_profiles;
  const expiryTimestamp = quote.expires_at
    ? new Date(quote.expires_at).getTime()
    : Number.NaN;
  const hasExpiry = Number.isFinite(expiryTimestamp);
  const isExpired = hasExpiry && now !== null && expiryTimestamp <= now;
  const expiryTime =
    quote.expires_at && hasExpiry
      ? formatNigeriaTime(quote.expires_at)
      : null;
  const expiryLabel = !expiryTime
    ? "Expiry not available"
    : now === null
      ? "Checking expiry…"
      : isExpired
        ? `Expired at ${expiryTime}`
        : `Expires in ${Math.max(1, Math.ceil((expiryTimestamp - now) / 60_000))} min · ${expiryTime}`;
  const deliveryEstimate = quote.delivery_estimate
    ? formatNigeriaTime(quote.delivery_estimate, true)
    : null;
  const items = quote.quote_items ?? [];

  return (
    <article
      className={`quote-comparison-card${isExpired ? " is-expired" : ""}`}
    >
      <header className="quote-comparison-vendor">
        <div className="vendor-monogram" aria-hidden="true">
          {vendor?.business_name?.[0] ?? "V"}
        </div>
        <div className="quote-comparison-vendor-details">
          <strong>
            {vendor?.business_name ?? "Vendor details unavailable"}
          </strong>
          <span>
            <MapPin size={13} />
            {vendor?.service_area ?? "Service area not provided"}
          </span>
        </div>
      </header>

      <div className="quote-comparison-timing">
        <div>
          <span>Estimated delivery</span>
          <strong>
            <Clock3 size={14} />
            {deliveryEstimate ?? "Not provided"}
          </strong>
        </div>
        <div
          className={`quote-comparison-expiry${isExpired ? " is-expired" : ""}`}
          role="status"
        >
          <span>Quote expiry</span>
          <strong>{expiryLabel}</strong>
        </div>
      </div>

      <div className="quote-comparison-total">
        <span>Quoted item total</span>
        <strong>{money(quote.total_amount, quote.currency)}</strong>
      </div>

      <div className="quote-comparison-items">
        <div className="quote-comparison-items-heading">
          <strong>Items</strong>
          <span>Availability and price</span>
        </div>
        {items.length === 0 ? (
          <p className="quote-comparison-no-items">
            Itemized prices are not available.
          </p>
        ) : (
          items.map((item, index) => {
            const unavailable = item.availability === "unavailable";
            const quantity = Number(item.quantity);
            const unitPrice = Number(item.unit_price);
            const lineTotal = quantity * unitPrice;

            return (
              <div
                className="quote-comparison-item"
                key={`${quote.quote_id}-${item.item_name}-${index}`}
              >
                <div className="quote-comparison-item-copy">
                  <strong>{item.item_name}</strong>
                  <span>
                    {item.quantity} {item.unit}
                    {!unavailable && Number.isFinite(unitPrice)
                      ? ` · ${money(unitPrice, quote.currency)}/${item.unit}`
                      : ""}
                  </span>
                  {item.proposed_substitution ? (
                    <small>
                      Proposed substitute: {item.proposed_substitution}
                    </small>
                  ) : null}
                </div>
                <div className="quote-comparison-item-value">
                  <strong>
                    {!unavailable && Number.isFinite(lineTotal)
                      ? money(lineTotal, quote.currency)
                      : "—"}
                  </strong>
                  <span
                    className={`quote-item-availability ${availabilityClass(item.availability)}`}
                  >
                    {availabilityLabel(item.availability)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button
        className="button quote-choice-button"
        disabled={busy || !hasExpiry || now === null || isExpired}
        onClick={() => onAccept(quote.quote_id)}
      >
        {isExpired
          ? "Quote expired"
          : hasExpiry
            ? "Choose this vendor"
            : "Expiry unavailable"}
      </button>
    </article>
  );
}
