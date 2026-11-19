"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BrainCircuit,
  Check,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PackageCheck,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Store,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { money, statusLabel } from "@/app/lib/format";
import type { AdminData } from "@/app/types/admin";

type DemoSection =
  | "Sales"
  | "Analytics"
  | "Marketing"
  | "CRM"
  | "SaaS plans"
  | "AI usage"
  | "Logistics";
type Section =
  "Overview" | "Vendor review" | "Orders" | "Disputes" | DemoSection;

const navigation: {
  group: string;
  items: { label: Section; icon: LucideIcon; live?: boolean }[];
}[] = [
  {
    group: "Workspace",
    items: [{ label: "Overview", icon: LayoutDashboard, live: true }],
  },
  {
    group: "Marketplace",
    items: [
      { label: "Vendor review", icon: Store, live: true },
      { label: "Orders", icon: PackageCheck, live: true },
      { label: "Disputes", icon: ShieldAlert, live: true },
    ],
  },
  {
    group: "Insights",
    items: [
      { label: "Sales", icon: CircleDollarSign },
      { label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    group: "Growth",
    items: [
      { label: "Marketing", icon: Megaphone },
      { label: "CRM", icon: Users },
      { label: "SaaS plans", icon: Wallet },
    ],
  },
  {
    group: "Operations",
    items: [
      { label: "AI usage", icon: BrainCircuit },
      { label: "Logistics", icon: Truck },
    ],
  },
];

const demoPages: Record<
  DemoSection,
  {
    subtitle: string;
    notice: string;
    metrics: {
      label: string;
      value: string;
      change: string;
      icon: LucideIcon;
    }[];
    chartTitle: string;
    chartValues: number[];
    chartLabels: string[];
    tableTitle: string;
    columns: string[];
    rows: string[][];
  }
> = {
  Sales: {
    subtitle: "A concept for sales reporting once payment data is connected.",
    notice:
      "All figures below are sample values. Order totals are not the same as captured payments; payment-provider reporting is not connected.",
    metrics: [
      {
        label: "Sample order value",
        value: "₦18.4m",
        change: "Illustrative",
        icon: CircleDollarSign,
      },
      {
        label: "Sample completed orders",
        value: "428",
        change: "Illustrative",
        icon: PackageCheck,
      },
      {
        label: "Sample average basket",
        value: "₦43k",
        change: "Illustrative",
        icon: Wallet,
      },
      {
        label: "Collections",
        value: "Not connected",
        change: "Provider needed",
        icon: ShieldCheck,
      },
    ],
    chartTitle: "Example order value",
    chartValues: [45, 59, 49, 78, 64, 71, 55, 87, 67, 82, 74, 94],
    chartLabels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    tableTitle: "Example sales activity",
    columns: ["Reference", "Household", "Order total", "Status"],
    rows: [
      ["DEMO-1042", "Sample household 01", "₦42,500", "Completed"],
      ["DEMO-1038", "Sample household 02", "₦18,200", "Delivered"],
      ["DEMO-1031", "Sample household 03", "₦67,900", "In progress"],
    ],
  },
  Analytics: {
    subtitle:
      "A marketplace health view, designed around Naya's real workflow.",
    notice:
      "Illustrative analytics only. The live version should calculate these from requests, quotes, and orders over a selected date range.",
    metrics: [
      {
        label: "Sample requests",
        value: "1,284",
        change: "Illustrative",
        icon: Activity,
      },
      {
        label: "Sample quote rate",
        value: "72%",
        change: "Illustrative",
        icon: BarChart3,
      },
      {
        label: "Sample order completion",
        value: "64%",
        change: "Illustrative",
        icon: Check,
      },
      {
        label: "Sample repeat households",
        value: "38%",
        change: "Illustrative",
        icon: Users,
      },
    ],
    chartTitle: "Example marketplace activity",
    chartValues: [36, 44, 41, 58, 49, 66, 60, 74, 69, 82, 76, 91],
    chartLabels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    tableTitle: "Example conversion funnel",
    columns: ["Marketplace step", "Sample volume", "Conversion"],
    rows: [
      ["Requests published", "1,284", "100%"],
      ["At least one quote", "925", "72%"],
      ["Quote accepted", "593", "46%"],
    ],
  },
  Marketing: {
    subtitle:
      "Campaign concepts for household retention and vendor activation.",
    notice:
      "Campaign records and performance are sample data. Naya does not currently have a campaign delivery or attribution system connected.",
    metrics: [
      {
        label: "Sample campaigns",
        value: "6",
        change: "Illustrative",
        icon: Megaphone,
      },
      {
        label: "Sample households reached",
        value: "4,820",
        change: "Illustrative",
        icon: Users,
      },
      {
        label: "Sample return rate",
        value: "18.6%",
        change: "Illustrative",
        icon: Activity,
      },
      {
        label: "Campaign delivery",
        value: "Not connected",
        change: "Future module",
        icon: ShieldCheck,
      },
    ],
    chartTitle: "Example campaign engagement",
    chartValues: [28, 38, 35, 54, 45, 61, 58, 68, 63, 76, 72, 86],
    chartLabels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    tableTitle: "Example campaign list",
    columns: ["Campaign", "Audience", "Channel", "Status"],
    rows: [
      ["Repeat basket reminder", "Returning households", "Email", "Draft"],
      ["Vendor activation", "Verified vendors", "In-app", "Sample"],
      ["Market day guide", "Abuja households", "Email", "Draft"],
    ],
  },
  CRM: {
    subtitle: "A future view of household and vendor relationships.",
    notice:
      "All records shown are synthetic. Live CRM should respect household privacy and expose delivery details only where operationally necessary.",
    metrics: [
      {
        label: "Sample households",
        value: "2,430",
        change: "Illustrative",
        icon: Users,
      },
      {
        label: "Sample active vendors",
        value: "186",
        change: "Illustrative",
        icon: Store,
      },
      {
        label: "Sample repeat shoppers",
        value: "38%",
        change: "Illustrative",
        icon: Activity,
      },
      {
        label: "Follow-ups due",
        value: "24",
        change: "Illustrative",
        icon: Clock3,
      },
    ],
    chartTitle: "Example household activity",
    chartValues: [33, 41, 39, 57, 48, 62, 58, 73, 68, 79, 74, 90],
    chartLabels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    tableTitle: "Example relationship queue",
    columns: ["Record", "Relationship", "Last activity", "Next step"],
    rows: [
      ["Sample household 01", "Household", "Today", "Check-in"],
      ["Sample vendor 04", "Vendor", "Yesterday", "Profile review"],
      ["Sample household 09", "Household", "3 days ago", "Support follow-up"],
    ],
  },
  "SaaS plans": {
    subtitle: "A concept only; Naya does not currently manage subscriptions.",
    notice:
      "Plan and subscription metrics are fictional in this preview. No household plans, recurring billing, or subscription revenue are connected.",
    metrics: [
      {
        label: "Sample plans",
        value: "3",
        change: "Illustrative",
        icon: Wallet,
      },
      {
        label: "Sample subscribers",
        value: "1,920",
        change: "Illustrative",
        icon: Users,
      },
      {
        label: "Sample monthly revenue",
        value: "₦2.8m",
        change: "Illustrative",
        icon: CircleDollarSign,
      },
      {
        label: "Recurring billing",
        value: "Not connected",
        change: "Future module",
        icon: ShieldCheck,
      },
    ],
    chartTitle: "Example subscription trend",
    chartValues: [24, 31, 35, 43, 41, 54, 59, 63, 70, 72, 81, 88],
    chartLabels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    tableTitle: "Example plan mix",
    columns: ["Plan", "Sample subscribers", "Sample monthly price"],
    rows: [
      ["Home Essentials", "1,204", "₦1,500"],
      ["Family Plus", "592", "₦3,500"],
      ["Concierge", "124", "₦8,000"],
    ],
  },
  "AI usage": {
    subtitle: "A future view of Naya AI activity and service health.",
    notice:
      "These are sample values, not model-provider telemetry. Naya currently tracks request counts; per-provider tokens and costs are not connected.",
    metrics: [
      {
        label: "Sample list parses",
        value: "8,420",
        change: "Illustrative",
        icon: BrainCircuit,
      },
      {
        label: "Sample active users",
        value: "2,180",
        change: "Illustrative",
        icon: Users,
      },
      {
        label: "Provider costs",
        value: "Not connected",
        change: "Telemetry needed",
        icon: CircleDollarSign,
      },
      {
        label: "Service status",
        value: "Preview",
        change: "Illustrative",
        icon: Activity,
      },
    ],
    chartTitle: "Example AI request volume",
    chartValues: [36, 45, 41, 53, 62, 57, 69, 74, 67, 81, 86, 93],
    chartLabels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    tableTitle: "Example usage by capability",
    columns: ["Capability", "Sample requests", "Telemetry"],
    rows: [
      ["Shopping list parsing", "5,420", "Sample only"],
      ["Request suggestions", "2,180", "Sample only"],
      ["Voice transcription", "820", "Sample only"],
    ],
  },
  Logistics: {
    subtitle: "A future fulfilment view based on Naya order status history.",
    notice:
      "Shipment rows are illustrative. Naya has order events, but no live courier GPS, fleet, or route integration.",
    metrics: [
      {
        label: "Sample active deliveries",
        value: "128",
        change: "Illustrative",
        icon: Truck,
      },
      {
        label: "Sample delivered",
        value: "1,042",
        change: "Illustrative",
        icon: PackageCheck,
      },
      {
        label: "Sample on-time rate",
        value: "91.4%",
        change: "Illustrative",
        icon: Clock3,
      },
      {
        label: "Live tracking",
        value: "Not connected",
        change: "Integration needed",
        icon: ShieldCheck,
      },
    ],
    chartTitle: "Example fulfilment volume",
    chartValues: [32, 44, 39, 51, 56, 61, 57, 72, 66, 78, 84, 92],
    chartLabels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    tableTitle: "Example delivery queue",
    columns: ["Reference", "Service area", "Progress", "Status"],
    rows: [
      ["DEMO-2081", "Wuse · Abuja", "3 of 4 steps", "In transit"],
      ["DEMO-2074", "Gwarinpa · Abuja", "4 of 4 steps", "Delivered"],
      ["DEMO-2062", "Ikeja · Lagos", "1 of 4 steps", "Processing"],
    ],
  },
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function StatCard({
  icon: Icon,
  label,
  value,
  note,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  note: string;
  tone: "blue" | "green" | "peach" | "lavender";
}) {
  return (
    <article className="dashboard-stat">
      <span className={`dashboard-stat-icon tone-${tone}`}>
        <Icon size={18} />
      </span>
      <small>{label}</small>
      <strong>{value}</strong>
      <em>{note}</em>
    </article>
  );
}

function SampleChart({
  title,
  values,
  labels,
}: {
  title: string;
  values: number[];
  labels: string[];
}) {
  return (
    <section className="dashboard-panel chart-panel">
      <header className="panel-title-row">
        <div>
          <span className="panel-kicker">SAMPLE DATA</span>
          <h2>{title}</h2>
        </div>
        <span className="demo-chip">Preview</span>
      </header>
      <div
        className="bar-chart"
        role="img"
        aria-label={`${title}, sample values`}
      >
        {values.map((value, index) => (
          <div className="bar-column" key={labels[index]}>
            <div className="bar-track">
              <span style={{ height: `${value}%` }} />
            </div>
            <small>{labels[index]}</small>
          </div>
        ))}
      </div>
    </section>
  );
}

function LiveTable({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="dashboard-panel table-panel">
      <header className="panel-title-row">
        <div>
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export default function AdminDashboard({
  email,
  data,
  loading,
  busy,
  error,
  counts,
  demoMode = false,
  onClearError,
  onExitDemo,
  onSignOut,
  onRefresh,
  onVerify,
  onResolve,
}: {
  email: string;
  data: AdminData;
  loading: boolean;
  busy: boolean;
  error: string;
  counts: AdminData["counts"];
  demoMode?: boolean;
  onClearError: () => void;
  onExitDemo?: () => void;
  onSignOut: () => void;
  onRefresh: () => void;
  onVerify: (id: string, status: "verified" | "rejected") => void;
  onResolve: (id: string) => void;
}) {
  const [section, setSection] = useState<Section>("Overview");
  const [navSearch, setNavSearch] = useState("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("pending");
  const [orderSearch, setOrderSearch] = useState("");

  const filteredNavigation = useMemo(
    () =>
      navigation
        .map((group) => ({
          ...group,
          items: group.items.filter((item) =>
            item.label.toLowerCase().includes(navSearch.toLowerCase()),
          ),
        }))
        .filter((group) => group.items.length > 0),
    [navSearch],
  );
  const filteredVendors = useMemo(
    () =>
      data.vendors.filter((vendor) => {
        const matchesStatus =
          vendorFilter === "all" || vendor.verification_status === vendorFilter;
        const haystack = [
          vendor.business_name,
          vendor.agent_type,
          vendor.service_area,
          vendor.profiles?.full_name,
          vendor.profiles?.phone,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return matchesStatus && haystack.includes(vendorSearch.toLowerCase());
      }),
    [data.vendors, vendorFilter, vendorSearch],
  );
  const filteredOrders = useMemo(
    () =>
      data.orders.filter((order) =>
        [
          order.order_id,
          order.status,
          order.households?.name,
          order.quotes?.agent_profiles?.business_name,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(orderSearch.toLowerCase()),
      ),
    [data.orders, orderSearch],
  );

  const pageDescription: Record<Section, string> = {
    Overview: demoMode
      ? "A guided preview of Naya's operations workspace."
      : "A live view of marketplace trust and operations.",
    "Vendor review": "Review applications before sellers can quote.",
    Orders: "Monitor recent orders and their fulfilment status.",
    Disputes: "Resolve reported delivery issues with an operator note.",
    Sales: demoPages.Sales.subtitle,
    Analytics: demoPages.Analytics.subtitle,
    Marketing: demoPages.Marketing.subtitle,
    CRM: demoPages.CRM.subtitle,
    "SaaS plans": demoPages["SaaS plans"].subtitle,
    "AI usage": demoPages["AI usage"].subtitle,
    Logistics: demoPages.Logistics.subtitle,
  };

  function renderOverview() {
    const activeOrders = data.orders.slice(0, 5);
    const pending = data.vendors
      .filter((vendor) => vendor.verification_status === "pending")
      .slice(0, 4);
    return (
      <>
        <div className="dashboard-stats">
          <StatCard
            icon={Store}
            label="Pending vendors"
            value={loading ? "—" : String(counts.pendingVendors)}
            note={demoMode ? "Synthetic sample records" : "Live applications"}
            tone="green"
          />
          <StatCard
            icon={Truck}
            label="Active orders"
            value={loading ? "—" : String(counts.activeOrders)}
            note={
              demoMode ? "Synthetic sample records" : "Live marketplace orders"
            }
            tone="peach"
          />
          <StatCard
            icon={ShieldAlert}
            label="Open disputes"
            value={loading ? "—" : String(counts.openDisputes)}
            note={
              demoMode ? "Synthetic sample records" : "Needs operator review"
            }
            tone="lavender"
          />
          <StatCard
            icon={Wallet}
            label="Payment processing"
            value="Not connected"
            note="No funds moved by Naya"
            tone="blue"
          />
        </div>
        <div className="overview-grid">
          <SampleChart
            title="Marketplace activity"
            values={demoPages.Analytics.chartValues}
            labels={demoPages.Analytics.chartLabels}
          />
          <section className="dashboard-panel ops-summary">
            <header className="panel-title-row">
              <div>
                <span className="panel-kicker">
                  {demoMode ? "SAMPLE WORK QUEUE" : "LIVE WORK QUEUE"}
                </span>
                <h2>Needs attention</h2>
              </div>
              <ShieldCheck size={18} />
            </header>
            <button
              className="queue-link"
              onClick={() => setSection("Vendor review")}
            >
              <span className="queue-icon queue-vendor">
                <Store size={16} />
              </span>
              <span>
                <strong>Vendor applications</strong>
                <small>Manual trust review</small>
              </span>
              <b>{counts.pendingVendors}</b>
            </button>
            <button
              className="queue-link"
              onClick={() => setSection("Disputes")}
            >
              <span className="queue-icon queue-dispute">
                <ShieldAlert size={16} />
              </span>
              <span>
                <strong>Open disputes</strong>
                <small>Resolution required</small>
              </span>
              <b>{counts.openDisputes}</b>
            </button>
            <button className="queue-link" onClick={() => setSection("Orders")}>
              <span className="queue-icon queue-order">
                <Truck size={16} />
              </span>
              <span>
                <strong>Active orders</strong>
                <small>Fulfilment in progress</small>
              </span>
              <b>{counts.activeOrders}</b>
            </button>
            <p className="demo-footnote">
              {demoMode
                ? "The chart and queue counts are synthetic sample data."
                : "The chart is illustrative. Queue counts come from live records."}
            </p>
          </section>
        </div>
        <div className="dashboard-columns">
          <LiveTable
            title="Vendor applications"
            description={
              demoMode
                ? "Synthetic sample records · no verification actions enabled"
                : "Live records · newest applications first"
            }
            action={
              <button
                className="text-action"
                onClick={() => setSection("Vendor review")}
              >
                Review all
              </button>
            }
          >
            {loading ? (
              <div className="table-empty">Loading vendor applications…</div>
            ) : pending.length === 0 ? (
              <div className="table-empty">
                No pending applications in the latest list.
              </div>
            ) : (
              <div className="compact-list">
                {pending.map((vendor) => (
                  <article className="compact-row" key={vendor.agent_id}>
                    <span className="compact-avatar">
                      {(vendor.business_name?.[0] ?? "V").toUpperCase()}
                    </span>
                    <span className="compact-copy">
                      <strong>{vendor.business_name}</strong>
                      <small>{vendor.service_area}</small>
                    </span>
                    <span className="status-pill status-pending">Pending</span>
                  </article>
                ))}
              </div>
            )}
          </LiveTable>
          <LiveTable
            title="Recent orders"
            description={
              demoMode
                ? "Synthetic sample orders"
                : "Latest 30 live order records"
            }
            action={
              <button
                className="text-action"
                onClick={() => setSection("Orders")}
              >
                View all
              </button>
            }
          >
            {loading ? (
              <div className="table-empty">Loading recent orders…</div>
            ) : activeOrders.length === 0 ? (
              <div className="table-empty">No recent orders yet.</div>
            ) : (
              <div className="compact-list">
                {activeOrders.map((order) => (
                  <article className="compact-row" key={order.order_id}>
                    <span className="compact-avatar compact-order">
                      <PackageCheck size={16} />
                    </span>
                    <span className="compact-copy">
                      <strong>{order.households?.name || "Household"}</strong>
                      <small>
                        {order.quotes?.agent_profiles?.business_name ||
                          "Vendor"}
                      </small>
                    </span>
                    <strong className="compact-amount">
                      {money(Number(order.total_amount), order.currency)}
                    </strong>
                  </article>
                ))}
              </div>
            )}
          </LiveTable>
        </div>
      </>
    );
  }

  function renderVendors() {
    return (
      <>
        <div className="dashboard-stats dashboard-stats-small">
          <StatCard
            icon={Store}
            label="Pending review"
            value={String(counts.pendingVendors)}
            note={demoMode ? "Synthetic sample records" : "Live count"}
            tone="green"
          />
          <StatCard
            icon={Check}
            label="Verified sellers"
            value={String(
              data.vendors.filter(
                (vendor) => vendor.verification_status === "verified",
              ).length,
            )}
            note={
              demoMode ? "Synthetic sample records" : "In latest 50 profiles"
            }
            tone="blue"
          />
          <StatCard
            icon={ShieldAlert}
            label="Rejected or suspended"
            value={String(
              data.vendors.filter((vendor) =>
                ["rejected", "suspended"].includes(vendor.verification_status),
              ).length,
            )}
            note={
              demoMode ? "Synthetic sample records" : "In latest 50 profiles"
            }
            tone="peach"
          />
        </div>
        <LiveTable
          title="Vendor applications"
          description="Review seller details and verification status."
          action={
            <div className="table-controls">
              <label className="search-field">
                <Search size={15} />
                <input
                  aria-label="Search vendors"
                  placeholder="Search vendors"
                  value={vendorSearch}
                  onChange={(event) => setVendorSearch(event.target.value)}
                />
              </label>
              <label className="select-field">
                <select
                  aria-label="Filter vendors by verification status"
                  value={vendorFilter}
                  onChange={(event) => setVendorFilter(event.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                  <option value="suspended">Suspended</option>
                  <option value="all">All statuses</option>
                </select>
                <ChevronDown size={14} />
              </label>
            </div>
          }
        >
          {loading ? (
            <div className="table-empty">Loading vendor applications…</div>
          ) : filteredVendors.length === 0 ? (
            <div className="table-empty">No vendors match these filters.</div>
          ) : (
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    <th>Business</th>
                    <th>Contact</th>
                    <th>Service area</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr key={vendor.agent_id}>
                      <td>
                        <strong>{vendor.business_name}</strong>
                        <small>{vendor.agent_type}</small>
                      </td>
                      <td>
                        {vendor.profiles?.full_name || "Not provided"}
                        <small>{vendor.profiles?.phone || "No phone"}</small>
                      </td>
                      <td>{vendor.service_area}</td>
                      <td>{formatDate(vendor.created_at)}</td>
                      <td>
                        <span
                          className={`status-pill status-${vendor.verification_status}`}
                        >
                          {vendor.verification_status}
                        </span>
                      </td>
                      <td>
                        {demoMode ? (
                          <span className="muted-cell">Preview only</span>
                        ) : vendor.verification_status === "pending" ? (
                          <div className="row-actions">
                            <button
                              className="small-primary"
                              disabled={busy}
                              onClick={() =>
                                onVerify(vendor.agent_id, "verified")
                              }
                            >
                              <Check size={13} /> Verify
                            </button>
                            <button
                              className="small-secondary"
                              disabled={busy}
                              onClick={() =>
                                onVerify(vendor.agent_id, "rejected")
                              }
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="muted-cell">No action</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </LiveTable>
        <p className="data-limit-note">
          {demoMode
            ? "All vendor records shown here are synthetic preview data."
            : "Showing the latest 50 vendor profiles. Review actions are live."}
        </p>
      </>
    );
  }

  function renderOrders() {
    return (
      <LiveTable
        title="Order control"
        description={
          demoMode
            ? "Synthetic sample orders · no payment activity is implied"
            : "Live orders · showing the latest 30 records"
        }
        action={
          <label className="search-field">
            <Search size={15} />
            <input
              aria-label="Search orders"
              placeholder="Search orders"
              value={orderSearch}
              onChange={(event) => setOrderSearch(event.target.value)}
            />
          </label>
        }
      >
        {loading ? (
          <div className="table-empty">Loading orders…</div>
        ) : filteredOrders.length === 0 ? (
          <div className="table-empty">No orders match your search.</div>
        ) : (
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Household</th>
                  <th>Vendor</th>
                  <th>Order total</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.order_id}>
                    <td>
                      <strong>
                        {order.order_id.slice(0, 8).toUpperCase()}
                      </strong>
                      <small>Order reference</small>
                    </td>
                    <td>{order.households?.name || "Household"}</td>
                    <td>
                      {order.quotes?.agent_profiles?.business_name || "Vendor"}
                    </td>
                    <td>{money(Number(order.total_amount), order.currency)}</td>
                    <td>
                      <span className={`status-pill status-${order.status}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="table-footnote">
          {demoMode
            ? "These rows are synthetic and do not represent actual Naya orders."
            : "Order totals show accepted quote values; they do not confirm payment collection."}
        </p>
      </LiveTable>
    );
  }

  function renderDisputes() {
    return (
      <LiveTable
        title="Open delivery disputes"
        description={
          demoMode
            ? "Sample disputes only · resolution actions are disabled"
            : "Resolution notes are recorded to the order timeline."
        }
      >
        {loading ? (
          <div className="table-empty">Loading disputes…</div>
        ) : data.disputes.length === 0 ? (
          <div className="table-empty">No open disputes.</div>
        ) : (
          <div className="dispute-list">
            {data.disputes.map((dispute) => (
              <article className="dispute-row" key={dispute.dispute_id}>
                <span className="dispute-symbol">
                  <ShieldAlert size={18} />
                </span>
                <div className="dispute-copy">
                  <strong>
                    Order {dispute.order_id.slice(0, 8).toUpperCase()} ·{" "}
                    {dispute.reason}
                  </strong>
                  <p>{dispute.description}</p>
                  <small>Opened {formatDate(dispute.created_at)}</small>
                </div>
                {!demoMode && (
                  <button
                    className="small-primary"
                    disabled={busy}
                    onClick={() => onResolve(dispute.dispute_id)}
                  >
                    Resolve with note
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </LiveTable>
    );
  }

  function renderDemoModule(module: DemoSection) {
    const page = demoPages[module];
    return (
      <>
        <div className="demo-notice">
          <span className="demo-notice-icon">
            <Activity size={17} />
          </span>
          <div>
            <strong>Demo preview — not live Naya data</strong>
            <p>{page.notice}</p>
          </div>
        </div>
        <div className="dashboard-stats">
          {page.metrics.map((metric, index) => (
            <StatCard
              key={metric.label}
              icon={metric.icon}
              label={metric.label}
              value={metric.value}
              note={metric.change}
              tone={(["blue", "green", "peach", "lavender"] as const)[index]}
            />
          ))}
        </div>
        <div className="dashboard-columns">
          <SampleChart
            title={page.chartTitle}
            values={page.chartValues}
            labels={page.chartLabels}
          />
          <LiveTable
            title={page.tableTitle}
            description="Synthetic sample rows for the dashboard preview."
          >
            <div className="responsive-table">
              <table>
                <thead>
                  <tr>
                    {page.columns.map((column) => (
                      <th key={column}>{column}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {page.rows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, index) => (
                        <td key={`${row[0]}-${index}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </LiveTable>
        </div>
      </>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a className="admin-brand" href="/">
          <span className="admin-brand-mark">n</span>
          <strong>
            naya<em>.</em>
            <small>OPERATIONS</small>
          </strong>
        </a>
        <label className="nav-search">
          <Search size={15} />
          <input
            aria-label="Search dashboard sections"
            placeholder="Find a section"
            value={navSearch}
            onChange={(event) => setNavSearch(event.target.value)}
          />
          <kbd>⌘ K</kbd>
        </label>
        <nav className="admin-nav" aria-label="Admin sections">
          {filteredNavigation.length === 0 ? (
            <p className="nav-empty">No matching sections.</p>
          ) : (
            filteredNavigation.map((group) => (
              <section className="nav-group" key={group.group}>
                <span className="nav-group-title">{group.group}</span>
                {group.items.map(({ label, icon: Icon, live }) => (
                  <button
                    key={label}
                    className={`admin-nav-item ${section === label ? "is-active" : ""}`}
                    onClick={() => setSection(label)}
                    aria-current={section === label ? "page" : undefined}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                    <span>{label}</span>
                    {demoMode ? (
                      <small>Preview</small>
                    ) : live ? (
                      <i
                        className="live-indicator"
                        title="Connected to live records"
                      />
                    ) : (
                      <small>Demo</small>
                    )}
                  </button>
                ))}
              </section>
            ))
          )}
        </nav>
        <div className="sidebar-footer">
          <ShieldCheck size={16} />
          <span>
            <strong>Restricted access</strong>
            <small>Operator workspace</small>
          </span>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-crumb">
            <span>Operations</span>
            <span>/</span>
            <strong>{section}</strong>
          </div>
          <div className="topbar-actions">
            <span
              className={`preview-status ${demoMode ? "preview-only" : ""}`}
            >
              <i /> {demoMode ? "Sample data only" : "Live data + demo preview"}
            </span>
            <button
              className="topbar-button"
              onClick={onRefresh}
              disabled={loading || demoMode}
              aria-label={
                demoMode ? "Refresh unavailable in demo" : "Refresh admin data"
              }
            >
              <RefreshCw size={16} className={loading ? "spin" : ""} />
              <span>Refresh</span>
            </button>
            <span className="operator-avatar">
              {(email[0] ?? "N").toUpperCase()}
            </span>
            <span className="operator-email">{email}</span>
            <button
              className="topbar-button topbar-signout"
              onClick={demoMode ? onExitDemo : onSignOut}
              aria-label={demoMode ? "Exit demo preview" : "Sign out"}
            >
              {demoMode ? <ArrowRight size={16} /> : <LogOut size={16} />}
            </button>
          </div>
        </header>
        <div className="admin-content">
          <div className="page-heading">
            <div>
              <span className="admin-eyebrow">NAYA PLATFORM OPERATIONS</span>
              <h1>
                {section === "Overview"
                  ? "Trust, fulfilment, and growth."
                  : section}
              </h1>
              <p>{pageDescription[section]}</p>
            </div>
            {section !== "Overview" &&
              section !== "Vendor review" &&
              section !== "Orders" &&
              section !== "Disputes" && (
                <span className="demo-chip page-demo-chip">DEMO MODULE</span>
              )}
          </div>
          {error && (
            <div className="admin-error" role="alert">
              <ShieldAlert size={16} />
              <span>{error}</span>
              <button onClick={onClearError} aria-label="Dismiss error">
                ×
              </button>
            </div>
          )}
          {section === "Overview" && renderOverview()}
          {section === "Vendor review" && renderVendors()}
          {section === "Orders" && renderOrders()}
          {section === "Disputes" && renderDisputes()}
          {[
            "Sales",
            "Analytics",
            "Marketing",
            "CRM",
            "SaaS plans",
            "AI usage",
            "Logistics",
          ].includes(section) && renderDemoModule(section as DemoSection)}
          <footer className="admin-footer">
            <span>Naya Operations</span>
            <span>
              {demoMode
                ? "Synthetic preview only · no operational actions are enabled."
                : "Live operational records are separated from sample preview data."}
            </span>
          </footer>
        </div>
      </main>
    </div>
  );
}
