import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { ChangeEvent, FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";
import { isConfigured, supabase } from "@/app/lib/supabase";
import type { Quote, ShoppingRequest } from "@/app/lib/supabase";
import {
  localPreviewKey,
  localSession,
  readLocalStore,
  writeLocalStore,
} from "@/app/types";
import type { BasketChange, BasketItem, ParsedItem, Role } from "@/app/types";
import type { SignupDraft } from "@/app/types/onboarding";

export default function useNayaApp() {
  const router = useRouter();
  const pathname = usePathname();
  const [localMode, setLocalMode] = useState(
    () => localStorage.getItem(localPreviewKey) === "true",
  );
  const [session, setSession] = useState<Session | null>(() =>
    localStorage.getItem(localPreviewKey) === "true" ? localSession : null,
  );
  const [role, setRole] = useState<Role>("household");
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [tab, setTab] = useState("Overview");
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<ShoppingRequest[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [vendorName, setVendorName] = useState("");
  const [setupState, setSetupState] = useState<
    "ready" | "no-household" | "no-vendor" | "pending-vendor" | "admin-denied"
  >("ready");
  const [orders, setOrders] = useState<Record<string, any>[]>([]);
  const [adminVendors, setAdminVendors] = useState<Record<string, any>[]>([]);
  const [adminDisputes, setAdminDisputes] = useState<Record<string, any>[]>([]);
  const [isAdmin, setIsAdmin] = useState(
    () => localStorage.getItem(localPreviewKey) === "true",
  );
  const [hasHousehold, setHasHousehold] = useState(false);
  const [hasVendorProfile, setHasVendorProfile] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [listText, setListText] = useState("");
  const [parsedItems, setParsedItems] = useState<ParsedItem[]>([]);
  const [aiMessage, setAiMessage] = useState("");
  const [budget, setBudget] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<ShoppingRequest | null>(null);
  const [quoteLinePrices, setQuoteLinePrices] = useState<
    Record<string, string>
  >({});
  const [quoteUnavailable, setQuoteUnavailable] = useState<
    Record<string, boolean>
  >({});
  const [quoteEta, setQuoteEta] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [signupNotice, setSignupNotice] = useState("");
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [businessName, setBusinessName] = useState("");
  const [vendorContactName, setVendorContactName] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorCategory, setVendorCategory] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [activeHouseholdName, setActiveHouseholdName] = useState("");
  const [householdName, setHouseholdName] = useState("");
  const [address, setAddress] = useState("");
  const [householdServiceArea, setHouseholdServiceArea] = useState("");
  const [familySize, setFamilySize] = useState("4");
  const listUploadRef = useRef<HTMLInputElement>(null);
  const appliedSignupDraft = useRef<string | null>(null);

  function goTo(path: string) {
    router.push(path);
  }

  function switchWorkspace(nextRole: Role) {
    const canSwitch =
      localMode ||
      (nextRole === "household" &&
        (hasHousehold ||
          (!hasVendorProfile && !isAdmin && role !== "vendor"))) ||
      (nextRole === "vendor" &&
        (hasVendorProfile || (!hasVendorProfile && !isAdmin))) ||
      (nextRole === "admin" && isAdmin);
    if (!canSwitch) {
      setSwitcherOpen(false);
      setError("This account does not have access to that workspace.");
      return;
    }
    setRole(nextRole);
    setTab("Overview");
    setSwitcherOpen(false);
    goTo(
      nextRole === "household"
        ? "/app/household"
        : nextRole === "vendor"
          ? "/app/vendor"
          : "/app/admin",
    );
  }

  function enterLocalPreview() {
    localStorage.setItem(localPreviewKey, "true");
    setLocalMode(true);
    setIsAdmin(true);
    setSession(localSession);
    setRole("household");
    setSetupState("no-household");
    goTo("/app/household");
  }

  useEffect(() => {
    if (pathname.endsWith("/vendor")) setRole("vendor");
    else if (pathname.endsWith("/admin")) setRole("admin");
    else if (pathname.includes("/app/") || pathname === "/")
      setRole("household");
  }, [pathname]);

  const loadWorkspace = useCallback(
    async (activeSession: Session) => {
      if (!supabase) {
        if (!localMode) return;
        setLoading(true);
        setError("");
        const db = readLocalStore();
        setHasHousehold(Boolean(db.household));
        setActiveHouseholdName(db.household?.name ?? "");
        const localVendor = db.vendors.find(
          (item) => item.user_id === activeSession.user.id,
        );
        setHasVendorProfile(Boolean(localVendor));
        if (role === "household") {
          setSetupState(db.household ? "ready" : "no-household");
          setRequests(db.requests);
          setQuotes(db.quotes.filter((quote) => quote.status === "submitted"));
          setOrders(db.orders);
        } else if (role === "vendor") {
          const vendor = localVendor;
          setVendorName(vendor?.business_name ?? "");
          if (!vendor) setSetupState("no-vendor");
          else if (vendor.verification_status !== "verified")
            setSetupState("pending-vendor");
          else {
            setSetupState("ready");
            setRequests(
              db.requests.filter((request) =>
                ["published", "quoted"].includes(request.status),
              ),
            );
            setQuotes([]);
            setOrders(
              db.orders.filter((order) => order.agent_id === vendor.agent_id),
            );
          }
        } else {
          setIsAdmin(true);
          setSetupState("ready");
          setOrders(db.orders);
          setAdminVendors(db.vendors);
          setAdminDisputes(
            db.disputes.filter((item) =>
              ["open", "under_review"].includes(item.status),
            ),
          );
        }
        setLoading(false);
        return;
      }
      setLoading(true);
      setError("");
      const { data: memberships, error: membershipError } = await supabase
        .from("household_members")
        .select("household_id, households(name, delivery_address, family_size)")
        .eq("user_id", activeSession.user.id)
        .limit(1);
      if (membershipError) {
        setError(membershipError.message);
        setLoading(false);
        return;
      }
      const household = memberships?.[0]?.households as {
        name?: string;
      } | null;
      setActiveHouseholdName(household?.name ?? "");
      const { data: agent, error: agentError } = await supabase
        .from("agent_profiles")
        .select("agent_id, business_name, verification_status, service_area")
        .eq("user_id", activeSession.user.id)
        .maybeSingle();
      if (agentError) {
        setError(agentError.message);
        setLoading(false);
        return;
      }
      setHasHousehold(Boolean(household));
      setHasVendorProfile(Boolean(agent));
      setVendorName(agent?.business_name ?? "");
      if (appliedSignupDraft.current !== activeSession.user.id) {
        const draft = activeSession.user.user_metadata?.onboarding;
        if (draft && typeof draft === "object") {
          setHouseholdName(
            typeof draft.householdName === "string" ? draft.householdName : "",
          );
          setHouseholdServiceArea(
            typeof draft.serviceArea === "string" && draft.role === "household"
              ? draft.serviceArea
              : "",
          );
          setFamilySize(
            typeof draft.familySize === "string" ? draft.familySize : "4",
          );
          setBusinessName(
            typeof draft.businessName === "string" ? draft.businessName : "",
          );
          setVendorContactName(
            typeof draft.contactName === "string" ? draft.contactName : "",
          );
          setVendorPhone(typeof draft.phone === "string" ? draft.phone : "");
          setVendorCategory(
            typeof draft.category === "string" ? draft.category : "",
          );
          setServiceArea(
            typeof draft.serviceArea === "string" && draft.role === "vendor"
              ? draft.serviceArea
              : "",
          );
        }
        appliedSignupDraft.current = activeSession.user.id;
      }
      const { data: adminFlag } = await supabase.rpc("is_current_user_admin");
      setIsAdmin(Boolean(adminFlag));
      if (pathname === "/login" || pathname === "/signup") {
        const metadataRole = activeSession.user.user_metadata?.onboarding?.role;
        const nextRole: Role = adminFlag
          ? "admin"
          : household
            ? "household"
            : agent
              ? "vendor"
              : metadataRole === "vendor"
                ? "vendor"
                : "household";
        setRole(nextRole);
        goTo(`/app/${nextRole}`);
        setLoading(false);
        return;
      }
      if (
        role === "household" &&
        pathname.endsWith("/household") &&
        !household &&
        (agent || adminFlag)
      ) {
        const nextRole: Role = adminFlag ? "admin" : "vendor";
        setRole(nextRole);
        goTo(`/app/${nextRole}`);
        setLoading(false);
        return;
      }
      if (role === "admin") {
        if (!adminFlag) {
          setSetupState("admin-denied");
          setOrders([]);
          setAdminVendors([]);
          setAdminDisputes([]);
          setLoading(false);
          return;
        }
        setOrders([]);
        setAdminVendors([]);
        setAdminDisputes([]);
        setSetupState("ready");
        setLoading(false);
        return;
      }
      if (role === "household") {
        setSetupState(household ? "ready" : "no-household");
      } else if (!agent) {
        setSetupState("no-vendor");
      } else if (agent.verification_status !== "verified") {
        setSetupState("pending-vendor");
      } else {
        setSetupState("ready");
      }
      if (role === "household") {
        if (!household) {
          setRequests([]);
          setQuotes([]);
          setLoading(false);
          return;
        }
        const { data, error: reqError } = await supabase
          .from("shopping_requests")
          .select(
            "request_id,title,status,budget_limit,created_at,request_items(request_item_id,item_name,quantity,unit,preferred_brand)",
          )
          .order("created_at", { ascending: false })
          .limit(30);
        if (reqError) setError(reqError.message);
        setRequests((data ?? []) as ShoppingRequest[]);
        const ids = (data ?? []).map((r) => r.request_id);
        if (ids.length) {
          const { data: quoteRows, error: quoteError } = await supabase
            .from("quotes")
            .select(
              "quote_id,request_id,total_amount,currency,delivery_estimate,expires_at,status,agent_profiles(agent_id,business_name,rating_average,service_area),shopping_requests(title),quote_items(item_name,quantity,unit,unit_price,availability,proposed_substitution)",
            )
            .in("request_id", ids)
            .eq("status", "submitted")
            .order("created_at", { ascending: false });
          if (quoteError) setError(quoteError.message);
          setQuotes((quoteRows ?? []) as unknown as Quote[]);
        } else setQuotes([]);
        const { data: householdOrders, error: householdOrderError } =
          await supabase
            .from("orders")
            .select(
              "order_id,status,total_amount,currency,created_at,quotes(agent_profiles(business_name)),order_events(event_type,note,occurred_at),order_basket_changes(change_id,previous_total,proposed_total,currency,items_snapshot,reason,status,created_at,decided_at)",
            )
            .in("status", [
              "awaiting_payment",
              "confirmed",
              "shopping",
              "awaiting_customer_approval",
              "ready_for_handoff",
              "out_for_delivery",
              "delivered",
              "completed",
              "disputed",
            ])
            .order("created_at", { ascending: false })
            .limit(30);
        if (householdOrderError) setError(householdOrderError.message);
        setOrders(
          (householdOrders ?? []).map((order) => ({
            ...order,
            order_basket_changes: [...(order.order_basket_changes ?? [])].sort(
              (a, b) => a.created_at.localeCompare(b.created_at),
            ),
          })) as unknown as Record<string, any>[],
        );
      } else if (agent?.verification_status === "verified") {
        const { data, error: reqError } = await supabase
          .from("shopping_requests")
          .select(
            "request_id,title,status,budget_limit,created_at,request_items(request_item_id,item_name,quantity,unit,preferred_brand)",
          )
          .in("status", ["published", "quoted"])
          .order("created_at", { ascending: true })
          .limit(30);
        if (reqError) setError(reqError.message);
        setRequests((data ?? []) as ShoppingRequest[]);
        setQuotes([]);
        const { data: orderRows, error: orderError } = await supabase
          .from("orders")
          .select(
            "order_id,status,total_amount,currency,created_at,items_snapshot,households(name),quotes(agent_id,agent_profiles(business_name)),order_events(event_type,note,occurred_at),order_basket_changes(change_id,previous_total,proposed_total,currency,items_snapshot,reason,status,created_at,decided_at)",
          )
          .in("status", [
            "awaiting_payment",
            "confirmed",
            "shopping",
            "awaiting_customer_approval",
            "ready_for_handoff",
            "out_for_delivery",
            "delivered",
            "disputed",
          ])
          .order("created_at", { ascending: false })
          .limit(30);
        if (orderError) setError(orderError.message);
        setOrders(
          (orderRows ?? []).map((order) => ({
            ...order,
            order_basket_changes: [...(order.order_basket_changes ?? [])].sort(
              (a, b) => a.created_at.localeCompare(b.created_at),
            ),
          })) as unknown as Record<string, any>[],
        );
      } else {
        setRequests([]);
        setQuotes([]);
      }
      setLoading(false);
    },
    [role, localMode, pathname],
  );

  useEffect(() => {
    if (!supabase) {
      if (localMode) {
        setSession(localSession);
        void loadWorkspace(localSession);
      } else setLoading(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) void loadWorkspace(data.session);
      else setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (event === "PASSWORD_RECOVERY") setPasswordRecovery(true);
        setSession(nextSession);
        if (nextSession) void loadWorkspace(nextSession);
        else {
          setRequests([]);
          setQuotes([]);
          setOrders([]);
          setHasHousehold(false);
          setHasVendorProfile(false);
          setIsAdmin(false);
          setLoading(false);
        }
      },
    );
    return () => listener.subscription.unsubscribe();
  }, [loadWorkspace, localMode]);

  useEffect(() => {
    if (session && (supabase || localMode)) void loadWorkspace(session);
  }, [role, session, loadWorkspace, localMode]);

  useEffect(() => {
    if (!session || !supabase) return;
    const channel = supabase
      .channel(`naya-marketplace-${session.user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shopping_requests" },
        () => {
          void loadWorkspace(session);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "quotes" },
        () => {
          void loadWorkspace(session);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void loadWorkspace(session);
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "order_events" },
        () => {
          void loadWorkspace(session);
        },
      )
      .subscribe();
    return () => {
      void supabase?.removeChannel(channel);
    };
  }, [session, loadWorkspace]);

  const liveStatus = useMemo(
    () =>
      localMode
        ? "Local browser preview"
        : session
          ? "Connected securely"
          : "Sign in to continue",
    [localMode, session],
  );
  const availableWorkspaces: Role[] = localMode
    ? ["household", "vendor", "admin"]
    : [
        hasHousehold || (!hasVendorProfile && !isAdmin && role !== "vendor")
          ? "household"
          : null,
        hasVendorProfile || role === "vendor" ? "vendor" : null,
        isAdmin ? "admin" : null,
      ].filter((workspace): workspace is Role => workspace !== null);
  const canApplyAsVendor =
    !localMode && !hasVendorProfile && !isAdmin && role !== "vendor";
  const outstandingQuotes = quotes.length;
  const quoteTotal = (selectedRequest?.request_items ?? []).reduce(
    (sum, item) =>
      sum +
      (quoteUnavailable[item.request_item_id]
        ? 0
        : Number(quoteLinePrices[item.request_item_id] || 0) * item.quantity),
    0,
  );
  const openMarketRequest = () => {
    if (localMode && !readLocalStore().household) {
      setSetupState("no-household");
      return;
    }
    setComposerOpen(true);
    setParsedItems([]);
    setAiMessage("");
  };

  async function handleListUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setListText(text);
    setAiMessage(
      `Loaded ${file.name}. Review the list, then ask Naya to organize it.`,
    );
    setParsedItems([]);
    setComposerOpen(true);
    event.target.value = "";
  }

  function startVoiceNote() {
    setComposerOpen(true);
    setParsedItems([]);
    setAiMessage("Allow microphone access and speak your shopping list.");
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAiMessage(
        "Voice input is not available in this browser. Type your list instead.",
      );
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-NG";
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      setListText(
        (current) =>
          `${current}${current ? "\n" : ""}${event.results[0][0].transcript}`,
      );
      setAiMessage(
        "Voice note transcribed on this device. Review before sending.",
      );
    };
    recognition.onerror = () =>
      setAiMessage(
        "Voice capture did not complete. You can type your list instead.",
      );
    recognition.start();
  }

  async function handleAuth(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setBusy(true);
    setError("");
    const result = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword,
    });
    if (result.error) {
      setBusy(false);
      setError(result.error.message);
      return;
    }
    if (!result.data.session) {
      setBusy(false);
      setError("Sign in succeeded but no active session was returned.");
      return;
    }
    const activeSession = result.data.session;
    const metadata = activeSession.user.user_metadata ?? {};
    const onboarding = metadata.onboarding;
    if (
      typeof metadata.full_name === "string" ||
      typeof metadata.phone === "string"
    ) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          ...(typeof metadata.full_name === "string"
            ? { full_name: metadata.full_name }
            : {}),
          ...(typeof metadata.phone === "string"
            ? { phone: metadata.phone }
            : {}),
        })
        .eq("user_id", activeSession.user.id);
      if (profileError) {
        setBusy(false);
        setError(profileError.message);
        return;
      }
    }
    const [memberships, agent, admin] = await Promise.all([
      supabase
        .from("household_members")
        .select("household_id")
        .eq("user_id", activeSession.user.id)
        .limit(1),
      supabase
        .from("agent_profiles")
        .select("agent_id")
        .eq("user_id", activeSession.user.id)
        .maybeSingle(),
      supabase.rpc("is_current_user_admin"),
    ]);
    const routingError = memberships.error || agent.error || admin.error;
    if (routingError) {
      setBusy(false);
      setError(routingError.message);
      return;
    }
    const nextRole: Role = admin.data
      ? "admin"
      : memberships.data?.length
        ? "household"
        : agent.data
          ? "vendor"
          : onboarding?.role === "vendor"
            ? "vendor"
            : "household";
    setRole(nextRole);
    setSignupNotice("");
    setBusy(false);
    goTo(`/app/${nextRole}`);
  }

  async function handleGoogleAuth() {
    if (!supabase) {
      setError("Configure Supabase before signing in.");
      return;
    }
    setBusy(true);
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/login`,
      },
    });
    if (oauthError) {
      setBusy(false);
      setError(oauthError.message);
    }
  }

  async function sendPasswordReset() {
    if (!supabase) return;
    if (!authEmail.trim()) {
      setError("Enter your email address first, then request a reset link.");
      return;
    }
    setBusy(true);
    setError("");
    setSignupNotice("");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      authEmail,
      { redirectTo: `${window.location.origin}/login` },
    );
    setBusy(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSignupNotice(
      "If an account exists for that address, a password reset link is on its way.",
    );
  }

  async function completePasswordReset(password: string) {
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setPasswordRecovery(false);
    setSignupNotice("Password updated. You’re signed in.");
  }

  async function createAccount(draft: SignupDraft) {
    if (!supabase) {
      setError("Configure Supabase before creating an account.");
      return;
    }
    setBusy(true);
    setError("");
    setSignupNotice("");
    const fullName =
      draft.role === "vendor" ? draft.contactName : draft.householdName;
    const phone = draft.role === "vendor" ? draft.phone : undefined;
    const onboarding =
      draft.role === "household"
        ? {
            role: draft.role,
            householdName: draft.householdName,
            serviceArea: draft.serviceArea,
            familySize: draft.familySize,
          }
        : {
            role: draft.role,
            contactName: draft.contactName,
            phone: draft.phone,
            businessName: draft.businessName,
            serviceArea: draft.serviceArea,
            category: draft.category,
          };
    const { data, error: signupError } = await supabase.auth.signUp({
      email: draft.email,
      password: draft.password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          full_name: fullName,
          ...(phone ? { phone } : {}),
          onboarding,
        },
      },
    });
    if (signupError) {
      setBusy(false);
      setError(signupError.message);
      return;
    }
    if (data.user?.identities?.length === 0) {
      setBusy(false);
      setSignupNotice(
        "If this email is already registered, check your inbox or sign in.",
      );
      goTo("/login");
      return;
    }
    if (data.session) {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setBusy(false);
        setError(signOutError.message);
        return;
      }
    }
    setBusy(false);
    setSignupNotice(
      data.session
        ? "Your account is ready. Sign in to continue."
        : "Account created. Check your email to verify your address, then sign in.",
    );
    goTo("/login");
  }

  async function createHousehold(e: FormEvent) {
    e.preventDefault();
    if (!supabase && localMode) {
      const db = readLocalStore();
      db.household = {
        name: householdName,
        address,
        serviceArea: householdServiceArea,
        familySize: Number(familySize),
      };
      writeLocalStore(db);
      setSetupState("ready");
      setLoading(false);
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: createError } = await supabase.rpc("create_household", {
      p_name: householdName,
      p_address: address,
      p_service_area: householdServiceArea,
      p_family_size: Number(familySize),
    });
    setBusy(false);
    if (createError) setError(createError.message);
    else if (session) {
      setSetupState("ready");
      await loadWorkspace(session);
    }
  }

  async function registerVendor(e: FormEvent) {
    e.preventDefault();
    if (!session) return;
    if (!supabase && localMode) {
      const db = readLocalStore();
      db.vendors.push({
        agent_id: crypto.randomUUID(),
        user_id: session.user.id,
        business_name: businessName,
        agent_type: vendorCategory,
        service_area: serviceArea,
        verification_status: "pending",
        created_at: new Date().toISOString(),
      });
      writeLocalStore(db);
      setSetupState("pending-vendor");
      setVendorName(businessName);
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: vendorContactName, phone: vendorPhone })
      .eq("user_id", session.user.id);
    if (profileError) {
      setBusy(false);
      setError(profileError.message);
      return;
    }
    const { error: insertError } = await supabase
      .from("agent_profiles")
      .insert({
        user_id: session.user.id,
        business_name: businessName,
        agent_type: vendorCategory,
        service_area: serviceArea,
        verification_status: "pending",
      });
    setBusy(false);
    if (insertError) setError(insertError.message);
    else {
      setSetupState("pending-vendor");
      await loadWorkspace(session);
    }
  }

  async function interpretList() {
    if (!supabase && localMode) {
      const lines = listText
        .split(/[\n,]+/)
        .map((line) => line.trim())
        .filter(Boolean);
      const items = lines.map((line) => {
        const match = line.match(/^(.*?)\s+(\d+(?:\.\d+)?)\s*([\p{L}]+)?$/u);
        return {
          item_name: (match?.[1] || line).trim(),
          quantity: Number(match?.[2] || 1),
          unit: match?.[3] || "item",
          substitution_allowed: false,
        };
      });
      setParsedItems(items);
      setAiMessage(
        "Local preview: list split into editable items. AI interpretation needs the connected backend.",
      );
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setAiMessage("");
    const { data, error: invokeError } = await supabase.functions.invoke(
      "interpret-shopping-list",
      { body: { text: listText } },
    );
    setBusy(false);
    if (invokeError) {
      setAiMessage(
        `AI could not interpret this list: ${invokeError.message}. You can still add items manually.`,
      );
      return;
    }
    const items = (data?.items ?? []) as ParsedItem[];
    setParsedItems(items);
    setAiMessage(data?.note ?? "Review each item before sending your request.");
  }

  async function submitRequest(e: FormEvent) {
    e.preventDefault();
    if (!session || parsedItems.length === 0) return;
    if (!supabase && localMode) {
      const db = readLocalStore();
      if (!db.household) {
        setError("Set up your household before creating a request.");
        return;
      }
      const requestId = crypto.randomUUID();
      const request: ShoppingRequest = {
        request_id: requestId,
        title:
          parsedItems
            .slice(0, 3)
            .map((item) => item.item_name)
            .join(", ") +
          (parsedItems.length > 3 ? ` +${parsedItems.length - 3} items` : ""),
        status: "published",
        budget_limit: budget ? Number(budget) : null,
        created_at: new Date().toISOString(),
        request_items: parsedItems.map((item) => ({
          ...item,
          request_item_id: crypto.randomUUID(),
          preferred_brand: item.preferred_brand ?? null,
        })),
      };
      db.requests.unshift(request);
      writeLocalStore(db);
      setComposerOpen(false);
      setListText("");
      setParsedItems([]);
      setBudget("");
      await loadWorkspace(session);
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: requestError } = await supabase.rpc(
      "create_shopping_request",
      {
        p_title:
          parsedItems
            .slice(0, 3)
            .map((i) => i.item_name)
            .join(", ") +
          (parsedItems.length > 3 ? ` +${parsedItems.length - 3} items` : ""),
        p_budget_limit: budget ? Number(budget) : null,
        p_raw_input: listText,
        p_ai_parse_note: aiMessage,
        p_items: parsedItems.map((item) => ({
          item_name: item.item_name,
          quantity: item.quantity,
          unit: item.unit,
          preferred_brand: item.preferred_brand ?? null,
          substitution_allowed: item.substitution_allowed ?? false,
        })),
      },
    );
    if (requestError) {
      setBusy(false);
      setError(requestError.message);
      return;
    }
    setComposerOpen(false);
    setListText("");
    setParsedItems([]);
    setBudget("");
    setBusy(false);
    await loadWorkspace(session);
  }

  async function submitQuote(e: FormEvent) {
    e.preventDefault();
    if (!session || !selectedRequest) return;
    if (!supabase && localMode) {
      const db = readLocalStore();
      const vendor = db.vendors.find(
        (item) => item.user_id === session.user.id,
      );
      if (!vendor) {
        setError("Register this local vendor first.");
        return;
      }
      const quoteItems = (selectedRequest.request_items ?? []).map((item) => ({
        item_name: item.item_name,
        quantity: item.quantity,
        unit: item.unit,
        unit_price: Number(quoteLinePrices[item.request_item_id] || 0),
        availability: quoteUnavailable[item.request_item_id]
          ? "unavailable"
          : "available",
        proposed_substitution: null,
      }));
      const total = quoteItems.reduce(
        (sum, item) => sum + item.unit_price * item.quantity,
        0,
      );
      if (total <= 0) {
        setError("Enter at least one available item with a price.");
        return;
      }
      const quote = {
        quote_id: crypto.randomUUID(),
        request_id: selectedRequest.request_id,
        total_amount: total,
        currency: "NGN",
        delivery_estimate: new Date(
          Date.now() + Number(quoteEta || 45) * 60000,
        ).toISOString(),
        expires_at: new Date(Date.now() + 30 * 60000).toISOString(),
        status: "submitted",
        agent_profiles: {
          business_name: vendor.business_name,
          rating_average: null,
          service_area: vendor.service_area,
        },
        shopping_requests: { title: selectedRequest.title },
        quote_items: quoteItems,
      } as Quote;
      db.quotes = db.quotes.filter(
        (item) => item.request_id !== selectedRequest.request_id,
      );
      db.quotes.unshift(quote);
      db.requests = db.requests.map((request) =>
        request.request_id === selectedRequest.request_id
          ? { ...request, status: "quoted" }
          : request,
      );
      writeLocalStore(db);
      setSelectedRequest(null);
      setQuoteLinePrices({});
      setQuoteUnavailable({});
      setQuoteEta("");
      setQuoteMessage("");
      await loadWorkspace(session);
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: quoteError } = await supabase.rpc("submit_quote", {
      p_request_id: selectedRequest.request_id,
      p_items: (selectedRequest.request_items ?? []).map((item) => ({
        request_item_id: item.request_item_id,
        unit_price: Number(quoteLinePrices[item.request_item_id] || 0),
        availability: quoteUnavailable[item.request_item_id]
          ? "unavailable"
          : "available",
      })),
      p_eta_minutes: Number(quoteEta),
      p_note: quoteMessage.trim() || null,
    });
    setBusy(false);
    if (quoteError) setError(quoteError.message);
    else {
      setSelectedRequest(null);
      setQuoteLinePrices({});
      setQuoteUnavailable({});
      setQuoteEta("");
      setQuoteMessage("");
      await loadWorkspace(session);
    }
  }

  async function acceptQuote(quoteId: string) {
    if (!supabase && localMode) {
      const db = readLocalStore();
      const quote = db.quotes.find((item) => item.quote_id === quoteId);
      if (!quote) {
        setError("Quote not found.");
        return;
      }
      const expiryTime = quote.expires_at
        ? Date.parse(quote.expires_at)
        : Number.NaN;
      if (
        quote.status !== "submitted" ||
        !Number.isFinite(expiryTime) ||
        expiryTime <= Date.now()
      ) {
        setError("This quote is no longer available.");
        return;
      }
      const request = db.requests.find(
        (item) => item.request_id === quote.request_id,
      );
      if (!request) {
        setError("Request not found.");
        return;
      }
      if (!["published", "quoted"].includes(request.status)) {
        setError("This request is no longer open.");
        return;
      }
      const order = {
        order_id: crypto.randomUUID(),
        status: "awaiting_payment",
        total_amount: quote.total_amount,
        currency: quote.currency,
        created_at: new Date().toISOString(),
        items_snapshot: quote.quote_items ?? [],
        agent_id: db.vendors.find(
          (item) => item.business_name === quote.agent_profiles?.business_name,
        )?.agent_id,
        events: [
          {
            event_type: "order_accepted",
            occurred_at: new Date().toISOString(),
            note: "Quote accepted; awaiting payment confirmation",
          },
        ],
      };
      db.orders.unshift(order);
      db.quotes = db.quotes.map((item) =>
        item.request_id === request.request_id
          ? {
              ...item,
              status: item.quote_id === quoteId ? "accepted" : "rejected",
            }
          : item,
      );
      db.requests = db.requests.map((item) =>
        item.request_id === request.request_id
          ? { ...item, status: "accepted" }
          : item,
      );
      writeLocalStore(db);
      await loadWorkspace(localSession);
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: acceptError } = await supabase.rpc("accept_quote", {
      p_quote_id: quoteId,
    });
    setBusy(false);
    if (acceptError) setError(acceptError.message);
    else if (session) await loadWorkspace(session);
  }

  async function updateOrderStatus(orderId: string, nextStatus: string) {
    if (!supabase && localMode) {
      const db = readLocalStore();
      const order = db.orders.find((item) => item.order_id === orderId);
      if (!order) return;
      order.status = nextStatus;
      order.events = [
        ...(order.events ?? []),
        {
          event_type: nextStatus,
          occurred_at: new Date().toISOString(),
          note:
            order.status === "shopping"
              ? "Local preview workflow only; no payment was collected."
              : "",
        },
      ];
      writeLocalStore(db);
      await loadWorkspace(localSession);
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: updateError } = await supabase.rpc("vendor_update_order", {
      p_order_id: orderId,
      p_status: nextStatus,
      p_note: null,
    });
    setBusy(false);
    if (updateError) setError(updateError.message);
    else if (session) await loadWorkspace(session);
  }

  async function requestBasketChange(
    orderId: string,
    items: BasketItem[],
    reason: string,
  ) {
    if (!session) return;
    if (!supabase && localMode) {
      const db = readLocalStore();
      const order = db.orders.find((item) => item.order_id === orderId);
      if (
        !order ||
        !["shopping", "awaiting_customer_approval"].includes(order.status)
      ) {
        setError("This order is not accepting basket changes.");
        return;
      }
      if (
        order.order_basket_changes?.some(
          (change: BasketChange) => change.status === "pending",
        )
      ) {
        setError("A basket change is already waiting for household approval.");
        return;
      }
      const total = items.reduce(
        (sum, item) =>
          sum +
          (item.availability === "unavailable"
            ? 0
            : item.quantity * item.unit_price),
        0,
      );
      if (!items.length || total <= 0 || reason.trim().length < 5) {
        setError("Keep at least one priced item and explain the change.");
        return;
      }
      const change: BasketChange = {
        change_id: crypto.randomUUID(),
        order_id: orderId,
        previous_total: Number(order.total_amount),
        proposed_total: total,
        currency: order.currency ?? "NGN",
        items_snapshot: items,
        reason: reason.trim(),
        status: "pending",
        created_at: new Date().toISOString(),
      };
      order.order_basket_changes = [
        ...(order.order_basket_changes ?? []),
        change,
      ];
      order.status = "awaiting_customer_approval";
      order.events = [
        ...(order.events ?? []),
        {
          event_type: "basket_change_requested",
          occurred_at: change.created_at,
          note: reason.trim(),
        },
      ];
      writeLocalStore(db);
      await loadWorkspace(localSession);
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: changeError } = await supabase.rpc(
      "vendor_request_basket_change",
      {
        p_order_id: orderId,
        p_items: items,
        p_reason: reason.trim(),
      },
    );
    setBusy(false);
    if (changeError) setError(changeError.message);
    else await loadWorkspace(session);
  }

  async function decideBasketChange(changeId: string, approve: boolean) {
    if (!session) return;
    if (!supabase && localMode) {
      const db = readLocalStore();
      const order = db.orders.find((item) =>
        item.order_basket_changes?.some(
          (change: BasketChange) => change.change_id === changeId,
        ),
      );
      const change = order?.order_basket_changes?.find(
        (item: BasketChange) => item.change_id === changeId,
      ) as BasketChange | undefined;
      if (
        !order ||
        !change ||
        order.status !== "awaiting_customer_approval" ||
        change.status !== "pending"
      ) {
        setError("This basket change is no longer waiting for approval.");
        return;
      }
      change.status = approve ? "approved" : "declined";
      change.decided_at = new Date().toISOString();
      order.events = [
        ...(order.events ?? []),
        {
          event_type: approve
            ? "basket_change_approved"
            : "basket_change_declined",
          occurred_at: change.decided_at,
          note: approve
            ? "Household approved the revised basket and total"
            : "Household declined; vendor must revise and resubmit",
        },
      ];
      if (approve) {
        order.items_snapshot = change.items_snapshot;
        order.total_amount = change.proposed_total;
        order.status = "shopping";
      }
      writeLocalStore(db);
      await loadWorkspace(localSession);
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: decisionError } = await supabase.rpc(
      "household_decide_basket_change",
      {
        p_change_id: changeId,
        p_approve: approve,
      },
    );
    setBusy(false);
    if (decisionError) setError(decisionError.message);
    else await loadWorkspace(session);
  }

  async function confirmDelivery(orderId: string, issue?: string) {
    if (!supabase && localMode) {
      const db = readLocalStore();
      const order = db.orders.find((item) => item.order_id === orderId);
      if (!order) return;
      if (issue) {
        order.status = "disputed";
        const dispute = {
          dispute_id: crypto.randomUUID(),
          order_id: orderId,
          reason: "delivery_issue",
          description: issue,
          status: "open",
          created_at: new Date().toISOString(),
        };
        db.disputes.unshift(dispute);
        order.events = [
          ...(order.events ?? []),
          {
            event_type: "dispute_opened",
            occurred_at: new Date().toISOString(),
            note: "Household reported a delivery issue",
          },
        ];
      } else {
        order.status = "completed";
        order.events = [
          ...(order.events ?? []),
          {
            event_type: "customer_confirmed",
            occurred_at: new Date().toISOString(),
            note: "Delivery confirmed by household",
          },
        ];
      }
      writeLocalStore(db);
      await loadWorkspace(localSession);
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: confirmError } = await supabase.rpc(
      "household_confirm_delivery",
      { p_order_id: orderId, p_issue: issue ?? null },
    );
    setBusy(false);
    if (confirmError) setError(confirmError.message);
    else if (session) await loadWorkspace(session);
  }

  async function verifyVendor(agentId: string, nextStatus: string) {
    if (!supabase && localMode) {
      const db = readLocalStore();
      db.vendors = db.vendors.map((vendor) =>
        vendor.agent_id === agentId
          ? { ...vendor, verification_status: nextStatus }
          : vendor,
      );
      writeLocalStore(db);
      await loadWorkspace(localSession);
      return;
    }
    if (!supabase) return;
    setBusy(true);
    setError("");
    const { error: verifyError } = await supabase.rpc("admin_verify_vendor", {
      p_agent_id: agentId,
      p_status: nextStatus,
    });
    setBusy(false);
    if (verifyError) setError(verifyError.message);
    else if (session) await loadWorkspace(session);
  }

  async function resolveDispute(disputeId: string) {
    if (!supabase && localMode) {
      const resolution = window.prompt("Resolution note for the local preview");
      if (!resolution?.trim()) return;
      const db = readLocalStore();
      const dispute = db.disputes.find((item) => item.dispute_id === disputeId);
      if (dispute) {
        dispute.status = "resolved";
        dispute.resolution = resolution.trim();
        const order = db.orders.find(
          (item) => item.order_id === dispute.order_id,
        );
        if (order) order.status = "resolved";
      }
      writeLocalStore(db);
      await loadWorkspace(localSession);
      return;
    }
    if (!supabase) return;
    const resolution = window.prompt("Resolution note for the audit trail");
    if (!resolution?.trim()) return;
    setBusy(true);
    setError("");
    const { error: resolveError } = await supabase.rpc(
      "admin_resolve_dispute",
      { p_dispute_id: disputeId, p_resolution: resolution.trim() },
    );
    setBusy(false);
    if (resolveError) setError(resolveError.message);
    else if (session) await loadWorkspace(session);
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    else if (localMode) {
      localStorage.removeItem(localPreviewKey);
      setLocalMode(false);
      setIsAdmin(false);
      setSession(null);
    }
  }

  return {
    isConfigured,
    localMode,
    session,
    pathname,
    role,
    setRole,
    switcherOpen,
    setSwitcherOpen,
    tab,
    setTab,
    loading,
    requests,
    quotes,
    vendorName,
    setupState,
    setSetupState,
    orders,
    adminVendors,
    adminDisputes,
    isAdmin,
    hasHousehold,
    hasVendorProfile,
    availableWorkspaces,
    canApplyAsVendor,
    error,
    setError,
    busy,
    composerOpen,
    setComposerOpen,
    listText,
    setListText,
    parsedItems,
    aiMessage,
    budget,
    setBudget,
    selectedRequest,
    setSelectedRequest,
    quoteLinePrices,
    setQuoteLinePrices,
    quoteUnavailable,
    setQuoteUnavailable,
    quoteEta,
    setQuoteEta,
    quoteMessage,
    setQuoteMessage,
    authEmail,
    setAuthEmail,
    authPassword,
    setAuthPassword,
    signupNotice,
    passwordRecovery,
    businessName,
    setBusinessName,
    vendorContactName,
    setVendorContactName,
    vendorPhone,
    setVendorPhone,
    vendorCategory,
    setVendorCategory,
    serviceArea,
    setServiceArea,
    activeHouseholdName,
    householdName,
    setHouseholdName,
    address,
    setAddress,
    householdServiceArea,
    setHouseholdServiceArea,
    familySize,
    setFamilySize,
    listUploadRef,
    liveStatus,
    outstandingQuotes,
    quoteTotal,
    goTo,
    switchWorkspace,
    enterLocalPreview,
    handleAuth,
    handleGoogleAuth,
    sendPasswordReset,
    completePasswordReset,
    createAccount,
    createHousehold,
    registerVendor,
    handleListUpload,
    startVoiceNote,
    interpretList,
    submitRequest,
    submitQuote,
    acceptQuote,
    updateOrderStatus,
    requestBasketChange,
    decideBasketChange,
    confirmDelivery,
    verifyVendor,
    resolveDispute,
    signOut,
    openMarketRequest,
  };
}
