import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isConfigured = Boolean(url && anonKey);
export const supabase = isConfigured
  ? createClient(url!, anonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export type ShoppingRequest = {
  request_id: string;
  title: string;
  status: string;
  budget_limit: number | null;
  created_at: string;
  request_items?: {
    request_item_id: string;
    item_name: string;
    quantity: number;
    unit: string;
    preferred_brand: string | null;
  }[];
};

export type Quote = {
  quote_id: string;
  request_id: string;
  total_amount: number;
  currency: string;
  delivery_estimate: string | null;
  expires_at: string | null;
  status: string;
  agent_profiles?: {
    agent_id?: string;
    business_name: string;
    rating_average: number | null;
    service_area: string | null;
  };
  shopping_requests?: { title: string };
  quote_items?: {
    item_name: string;
    quantity: number;
    unit: string;
    unit_price: number;
    availability: string;
    proposed_substitution: string | null;
  }[];
};
