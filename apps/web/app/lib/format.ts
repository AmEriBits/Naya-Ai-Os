export const money = (amount: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const statusLabel: Record<string, string> = {
  draft: "Draft",
  published: "Finding a vendor",
  quoted: "Quotes received",
  accepted: "Vendor selected",
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  shopping: "Shopping in progress",
  awaiting_customer_approval: "Needs your approval",
  ready_for_handoff: "Ready for handoff",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  completed: "Completed",
  disputed: "Under review",
  resolved: "Dispute resolved",
};
