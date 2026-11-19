export type AdminData = {
  orders: Record<string, any>[];
  vendors: Record<string, any>[];
  disputes: Record<string, any>[];
  counts: {
    pendingVendors: number;
    activeOrders: number;
    openDisputes: number;
  };
};
