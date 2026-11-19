import { Clock3, MapPin } from "lucide-react";

import type { Quote } from "@/app/lib/supabase";

import { money } from "@/app/lib/format";

export default function QuoteCard({
  quote,
  busy,
  onAccept,
}: {
  quote: Quote;
  busy: boolean;
  onAccept: (id: string) => void;
}) {
  const vendor = quote.agent_profiles;
  return (
    <article className="quote-row" key={quote.quote_id}>
      <div className="vendor-monogram">{vendor?.business_name?.[0] ?? "V"}</div>
      <div className="quote-vendor">
        <strong>{vendor?.business_name ?? "Verified local vendor"}</strong>
        <span>
          <MapPin size={12} />
          {vendor?.service_area ?? "Nearby"}{" "}
          <span className="quote-sep">·</span> <Clock3 size={12} />{" "}
          {quote.delivery_estimate
            ? new Date(quote.delivery_estimate).toLocaleTimeString("en-NG", {
                hour: "numeric",
                minute: "2-digit",
              })
            : "ETA shared"}
        </span>
        <strong className="quote-price">
          {money(quote.total_amount, quote.currency)}
        </strong>
        <div className="quote-breakdown">
          {quote.quote_items?.slice(0, 4).map((item, index) => (
            <div key={`${quote.quote_id}-${index}`}>
              <span>
                {item.item_name} · {item.quantity} {item.unit}
              </span>
              <strong>
                {item.availability === "unavailable"
                  ? "Unavailable"
                  : money(
                      Number(item.unit_price) * Number(item.quantity),
                      quote.currency,
                    )}
              </strong>
            </div>
          ))}
          {(quote.quote_items?.length ?? 0) > 4 && (
            <small>+{quote.quote_items!.length - 4} more items</small>
          )}
        </div>
        <div className="quote-request-label">
          For: {quote.shopping_requests?.title ?? "Your shopping request"}
        </div>
        <button
          className="button button-accept"
          disabled={busy}
          onClick={() => onAccept(quote.quote_id)}
        >
          Choose this vendor
        </button>
      </div>
    </article>
  );
}
