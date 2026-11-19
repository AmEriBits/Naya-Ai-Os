import type { Session } from "@supabase/supabase-js";
import type { Quote, ShoppingRequest } from "@/app/lib/supabase";

export type Role = "household" | "vendor" | "admin";
export type ParsedItem = {
  item_name: string;
  quantity: number;
  unit: string;
  preferred_brand?: string | null;
  substitution_allowed?: boolean;
};
export type BasketItem = {
  item_name: string;
  quantity: number;
  unit: string;
  unit_price: number;
  availability: "available" | "unavailable" | "substitution";
  preferred_brand?: string | null;
  proposed_substitution?: string | null;
};
export type BasketChange = {
  change_id: string;
  order_id: string;
  previous_total: number;
  proposed_total: number;
  currency: string;
  items_snapshot: BasketItem[];
  reason: string;
  status: "pending" | "approved" | "declined";
  created_at: string;
  decided_at?: string | null;
};
export type LocalStore = {
  household: {
    name: string;
    address: string;
    serviceArea: string;
    familySize: number;
  } | null;
  vendors: Record<string, any>[];
  requests: ShoppingRequest[];
  quotes: Quote[];
  orders: Record<string, any>[];
  disputes: Record<string, any>[];
};

export const localStoreKey = "naya-local-workspace-v1";
export const localPreviewKey = "naya-local-preview";
export const localSession = {
  user: { id: "naya-local-preview", email: "preview@naya.local" },
} as Session;

export const emptyLocalStore = (): LocalStore => ({
  household: null,
  vendors: [],
  requests: [],
  quotes: [],
  orders: [],
  disputes: [],
});

export function readLocalStore(): LocalStore {
  try {
    const saved = localStorage.getItem(localStoreKey);
    return saved
      ? { ...emptyLocalStore(), ...JSON.parse(saved) }
      : emptyLocalStore();
  } catch {
    return emptyLocalStore();
  }
}

export function writeLocalStore(value: LocalStore) {
  localStorage.setItem(localStoreKey, JSON.stringify(value));
}
