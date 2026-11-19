import type { ReactNode } from "react";

import {
  Activity,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CreditCard,
  FileText,
  Home,
  Leaf,
  LogOut,
  MessageCircle,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBasket,
  Settings2,
  Store,
  Truck,
  Wallet,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

import type { Role } from "@/app/types";

type NavItem = { label: string; mobileLabel: string; icon: LucideIcon };

export default function WorkspaceFrame({
  role,
  vendorName,
  localMode,
  liveStatus,
  sessionEmail,
  hasVendorProfile,
  availableWorkspaces,
  canApplyAsVendor,
  tab,
  setTab,
  switcherOpen,
  setSwitcherOpen,
  switchWorkspace,
  onSignOut,
  error,
  clearError,
  onNewRequest,
  pageTitle,
  pageDescription,
  outstandingQuotes,
  children,
}: {
  role: Role;
  vendorName: string;
  localMode: boolean;
  liveStatus: string;
  sessionEmail: string;
  hasVendorProfile: boolean;
  availableWorkspaces: Role[];
  canApplyAsVendor: boolean;
  tab: string;
  setTab: (value: string) => void;
  switcherOpen: boolean;
  setSwitcherOpen: (value: boolean | ((current: boolean) => boolean)) => void;
  switchWorkspace: (role: Role) => void;
  onSignOut: () => void;
  error: string;
  clearError: () => void;
  onNewRequest: () => void;
  pageTitle: string;
  pageDescription: string;
  outstandingQuotes: number;
  children: ReactNode;
}) {
  const nav: NavItem[] =
    role === "household"
      ? [
          { label: "Overview", mobileLabel: "Home", icon: Home },
          { label: "Analytics", mobileLabel: "Insights", icon: Activity },
          {
            label: "Shopping requests",
            mobileLabel: "Requests",
            icon: ShoppingBasket,
          },
          {
            label: "Household budget",
            mobileLabel: "Budget",
            icon: Wallet,
          },
          {
            label: "Family calendar",
            mobileLabel: "Calendar",
            icon: CalendarDays,
          },
        ]
      : role === "vendor"
        ? [
            { label: "Overview", mobileLabel: "Home", icon: Home },
            { label: "Open requests", mobileLabel: "Requests", icon: Package },
            { label: "Orders", mobileLabel: "Orders", icon: Truck },
            { label: "Earnings", mobileLabel: "Earnings", icon: Wallet },
          ]
        : [
            { label: "Overview", mobileLabel: "Home", icon: Home },
            {
              label: "Orders & payments",
              mobileLabel: "Orders",
              icon: CreditCard,
            },
            { label: "Vendor review", mobileLabel: "Vendors", icon: Store },
            { label: "Disputes", mobileLabel: "Disputes", icon: ShieldCheck },
          ];
  const pageEyebrow =
    role === "admin"
      ? "PLATFORM OPERATIONS"
      : role === "vendor"
        ? "VENDOR WORKSPACE"
        : "YOUR HOME, IN GOOD HANDS";
  const canSwitchWorkspaces =
    availableWorkspaces.length > 1 || canApplyAsVendor;
  const workspaceName =
    role === "household"
      ? "My household"
      : role === "vendor"
        ? vendorName ||
          (hasVendorProfile ? "Vendor workspace" : "Vendor application")
        : "Naya operations";
  const workspaceSubtitle =
    role === "household"
      ? "Household workspace"
      : role === "vendor"
        ? hasVendorProfile || localMode
          ? "Vendor workspace"
          : "Vendor application"
        : "Admin console";
  const identity = (
    <>
      <div className="workspace-avatar">
        {role === "household" ? "H" : role === "vendor" ? "V" : "A"}
      </div>
      <div>
        <strong>{workspaceName}</strong>
        <small>{workspaceSubtitle}</small>
      </div>
      {canSwitchWorkspaces && <ChevronDown size={15} />}
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a href="/" className="brand">
          <span className="brand-mark">n</span>
          <span>
            naya<span className="brand-period">.</span>
            <small>HOUSEHOLD OS</small>
          </span>
        </a>
        <div className="workspace-control">
          {canSwitchWorkspaces ? (
            <button
              className="workspace-switch"
              onClick={() => setSwitcherOpen((open) => !open)}
              aria-expanded={switcherOpen}
              aria-label={`Switch workspace. Current: ${workspaceName}`}
              title={workspaceName}
            >
              {identity}
            </button>
          ) : (
            <div className="workspace-switch workspace-switch-static">
              {identity}
            </div>
          )}
          {switcherOpen && canSwitchWorkspaces && (
            <div className="workspace-menu">
              {availableWorkspaces.map((workspace) => {
                const Icon =
                  workspace === "household"
                    ? Home
                    : workspace === "vendor"
                      ? Store
                      : ShieldCheck;
                const label =
                  workspace === "household"
                    ? "Household"
                    : workspace === "vendor"
                      ? hasVendorProfile || localMode
                        ? "Vendor workspace"
                        : "Vendor application"
                      : "Admin console";
                return (
                  <button
                    key={workspace}
                    className={
                      role === workspace ? "workspace-menu-selected" : ""
                    }
                    onClick={() => switchWorkspace(workspace)}
                  >
                    <Icon size={16} />
                    <span className="workspace-menu-label">{label}</span>
                    {role === workspace && (
                      <span className="workspace-menu-current">Current</span>
                    )}
                  </button>
                );
              })}
              {canApplyAsVendor && (
                <button
                  className="workspace-menu-apply"
                  onClick={() => switchWorkspace("vendor")}
                >
                  <Store size={16} />
                  <span className="workspace-menu-label">
                    Apply as a vendor
                  </span>
                  <span className="workspace-menu-current">Join Naya</span>
                </button>
              )}
            </div>
          )}
        </div>
        <div className="nav-label">WORKSPACE</div>
        <nav className="side-nav">
          {nav.map(({ label, mobileLabel, icon: Icon }) => (
            <button
              key={label}
              className={`nav-item ${tab === label ? "active" : ""}`}
              onClick={() => setTab(label)}
              aria-label={label}
              title={label}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span className="nav-item-label" data-mobile-label={mobileLabel}>
                {label}
              </span>
              {label === "Shopping requests" && outstandingQuotes > 0 && (
                <b className="nav-count">{outstandingQuotes}</b>
              )}
            </button>
          ))}
        </nav>
        {role === "household" && (
          <>
            <div className="nav-label nav-label-spaced">YOUR HOME</div>
            <nav className="side-nav">
              <button
                className="nav-item"
                onClick={() => setTab("Meal plans")}
                aria-label="Meal plans"
                title="Meal plans"
              >
                <Leaf size={18} />
                <span>Meal plans</span>
                <span className="soon-dot" />
              </button>
              <button
                className="nav-item"
                onClick={() => setTab("Bills & utilities")}
                aria-label="Bills & utilities"
                title="Bills & utilities"
              >
                <CreditCard size={18} />
                <span>Bills & utilities</span>
              </button>
              <button
                className="nav-item"
                onClick={() => setTab("Documents")}
                aria-label="Documents"
                title="Documents"
              >
                <FileText size={18} />
                <span>Documents</span>
              </button>
            </nav>
          </>
        )}
        <div className="sidebar-bottom">
          <div className="support-card">
            <div className="support-icon">
              <MessageCircle size={17} />
            </div>
            <strong>Need a hand?</strong>
            <p>Your Naya concierge is one message away.</p>
            <button onClick={() => setTab("Support")}>
              Talk to Naya <ArrowUpRight size={14} />
            </button>
          </div>
          <button
            className="nav-item settings-item"
            onClick={() => setTab("Settings")}
            aria-label="Settings"
            title="Settings"
          >
            <Settings2 size={18} />
            <span>Settings</span>
          </button>
          <div className="profile-row">
            <div className="profile-avatar">
              {(sessionEmail[0] ?? "N").toUpperCase()}
            </div>
            <div className="profile-copy">
              <strong>{sessionEmail.split("@")[0]}</strong>
              <small>{liveStatus}</small>
            </div>
          </div>
        </div>
      </aside>
      <main className="main-area" id="top">
        <header className="topbar">
          <div className="breadcrumb">
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{tab}</strong>
          </div>
          <div className="top-actions">
            {localMode && <span className="preview-badge">LOCAL PREVIEW</span>}
            <button
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
            <button
              className="button button-light top-sign-out"
              onClick={onSignOut}
            >
              <LogOut size={15} /> Sign out
            </button>
            <div className="top-avatar">
              {(sessionEmail[0] ?? "N").toUpperCase()}
            </div>
          </div>
        </header>
        <div className="content-wrap">
          <div className="page-heading">
            <div>
              <div className="eyebrow">
                <span className="live-dot" /> {pageEyebrow}
              </div>
              <h1>{pageTitle}</h1>
              <p>{pageDescription}</p>
            </div>
            <div className="heading-actions">
              <button
                className="button button-light"
                onClick={() => setTab("Help center")}
              >
                <CircleHelp size={16} /> Help center
              </button>
              {role === "household" && (
                <button
                  className="button button-primary"
                  onClick={onNewRequest}
                >
                  <Plus size={17} /> New request
                </button>
              )}
            </div>
          </div>
          {localMode && (
            <div className="preview-notice">
              <ShieldCheck size={15} /> Local preview mode: data stays in this
              browser. No AI service, payment processing, or other users are
              connected.
            </div>
          )}
          {error && (
            <div className="notice notice-error">
              <span>{error}</span>
              <button onClick={clearError} aria-label="Dismiss">
                <span aria-hidden="true">×</span>
              </button>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
