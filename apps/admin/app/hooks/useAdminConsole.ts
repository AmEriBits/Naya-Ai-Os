import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/app/lib/supabase";
import type { AdminData } from "@/app/types/admin";

const emptyData: AdminData = {
  orders: [],
  vendors: [],
  disputes: [],
  counts: { pendingVendors: 0, activeOrders: 0, openDisputes: 0 },
};

export default function useAdminConsole() {
  const [session, setSession] = useState<Session | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<AdminData>(emptyData);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function loadAdmin() {
    if (!supabase) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    const { data: isAdmin, error: roleError } = await supabase.rpc(
      "is_current_user_admin",
    );
    if (roleError) {
      setAuthorized(false);
      setData(emptyData);
      setError(roleError.message);
      setLoading(false);
      return;
    }
    if (!isAdmin) {
      setAuthorized(false);
      setData(emptyData);
      setLoading(false);
      return;
    }
    setAuthorized(true);
    const [orders, vendors, disputes] = await Promise.all([
      supabase
        .from("orders")
        .select(
          "order_id,status,total_amount,currency,created_at,households(name),quotes(agent_profiles(business_name))",
          { count: "exact" },
        )
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("agent_profiles")
        .select(
          "agent_id,business_name,agent_type,service_area,verification_status,created_at,profiles(full_name,phone)",
        )
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("disputes")
        .select(
          "dispute_id,order_id,reason,description,status,created_at,refund_amount",
          { count: "exact" },
        )
        .in("status", ["open", "under_review"])
        .order("created_at", { ascending: true })
        .limit(30),
    ]);
    const [pendingVendorCount, activeOrderCount] = await Promise.all([
      supabase
        .from("agent_profiles")
        .select("agent_id", { count: "exact", head: true })
        .eq("verification_status", "pending"),
      supabase
        .from("orders")
        .select("order_id", { count: "exact", head: true })
        .not("status", "in", '("completed","resolved","cancelled")'),
    ]);
    const queryError =
      orders.error ||
      vendors.error ||
      disputes.error ||
      pendingVendorCount.error ||
      activeOrderCount.error;
    if (queryError) setError(queryError.message);
    setData({
      orders: orders.data ?? [],
      vendors: vendors.data ?? [],
      disputes: disputes.data ?? [],
      counts: {
        pendingVendors: pendingVendorCount.count ?? 0,
        activeOrders: activeOrderCount.count ?? 0,
        openDisputes: disputes.count ?? 0,
      },
    });
    setLoading(false);
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data: result, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setSession(result.session);
      if (result.session) void loadAdmin();
      else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setAuthorized(false);
        if (nextSession) void loadAdmin();
        else {
          setData(emptyData);
          setLoading(false);
        }
      },
    );
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { data: result, error: signInError } =
      await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    setSession(result.session);
    if (result.session) await loadAdmin();
  }

  async function signOut() {
    if (!supabase) return;
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
  }

  async function verifyVendor(
    agentId: string,
    status: "verified" | "rejected",
  ) {
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: actionError } = await supabase.rpc("admin_verify_vendor", {
      p_agent_id: agentId,
      p_status: status,
    });
    setBusy(false);
    if (actionError) setError(actionError.message);
    else await loadAdmin();
  }

  async function resolveDispute(disputeId: string) {
    if (!supabase) return;
    const resolution = window.prompt("Resolution note for the audit trail");
    if (!resolution?.trim()) return;
    setBusy(true);
    setError("");
    const { error: actionError } = await supabase.rpc("admin_resolve_dispute", {
      p_dispute_id: disputeId,
      p_resolution: resolution.trim(),
    });
    setBusy(false);
    if (actionError) setError(actionError.message);
    else await loadAdmin();
  }

  const pendingVendors = data.vendors.filter(
    (vendor) => vendor.verification_status === "pending",
  );
  const activeOrders = data.orders.filter(
    (order) => !["completed", "resolved", "cancelled"].includes(order.status),
  );

  return {
    session,
    authorized,
    loading,
    busy,
    error,
    clearError: () => setError(""),
    data,
    email,
    setEmail,
    password,
    setPassword,
    signIn,
    signOut,
    verifyVendor,
    resolveDispute,
    loadAdmin,
    pendingVendors,
    activeOrders,
  };
}
