import type { AdminData } from "@/app/types/admin";

export const adminDemoData: AdminData = {
  counts: { pendingVendors: 2, activeOrders: 3, openDisputes: 1 },
  vendors: [
    {
      agent_id: "demo-vendor-001",
      business_name: "Sample Market Collective",
      agent_type: "market_vendor",
      service_area: "Wuse · Abuja",
      verification_status: "pending",
      created_at: "2026-11-18T10:00:00.000Z",
      profiles: { full_name: "Sample owner A", phone: null },
    },
    {
      agent_id: "demo-vendor-002",
      business_name: "Example Fresh Foods",
      agent_type: "market_vendor",
      service_area: "Gwarinpa · Abuja",
      verification_status: "pending",
      created_at: "2026-11-17T10:00:00.000Z",
      profiles: { full_name: "Sample owner B", phone: null },
    },
    {
      agent_id: "demo-vendor-003",
      business_name: "Illustration Pantry",
      agent_type: "market_vendor",
      service_area: "Ikeja · Lagos",
      verification_status: "verified",
      created_at: "2026-11-12T10:00:00.000Z",
      profiles: { full_name: "Sample owner C", phone: null },
    },
  ],
  orders: [
    {
      order_id: "demo-order-001",
      status: "out_for_delivery",
      total_amount: 42500,
      currency: "NGN",
      created_at: "2026-11-19T10:00:00.000Z",
      households: { name: "Sample household 01" },
      quotes: { agent_profiles: { business_name: "Sample Market Collective" } },
    },
    {
      order_id: "demo-order-002",
      status: "shopping",
      total_amount: 18200,
      currency: "NGN",
      created_at: "2026-11-18T10:00:00.000Z",
      households: { name: "Sample household 02" },
      quotes: { agent_profiles: { business_name: "Example Fresh Foods" } },
    },
    {
      order_id: "demo-order-003",
      status: "awaiting_payment",
      total_amount: 67900,
      currency: "NGN",
      created_at: "2026-11-17T10:00:00.000Z",
      households: { name: "Sample household 03" },
      quotes: { agent_profiles: { business_name: "Illustration Pantry" } },
    },
  ],
  disputes: [
    {
      dispute_id: "demo-dispute-001",
      order_id: "demo-order-002",
      reason: "delivery_issue",
      description: "Sample dispute record for the admin dashboard preview.",
      status: "open",
      created_at: "2026-11-18T12:00:00.000Z",
      refund_amount: null,
    },
  ],
};
