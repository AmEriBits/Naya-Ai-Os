export const money = (amount: number, currency = "NGN") =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const statusLabel: Record<string, string> = {
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  shopping: "Shopping",
  awaiting_customer_approval: "Needs approval",
  ready_for_handoff: "Ready for handoff",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  completed: "Completed",
  disputed: "Disputed",
  resolved: "Resolved",
  cancelled: "Cancelled",
};
