"use client";

import { ArrowRight, Clock3, ShieldCheck } from "lucide-react";
import AuthScreen from "@/components/auth/auth-screen";
import SignupScreen from "@/components/auth/signup-screen";
import LandingPage from "@/components/landing/landing-page";
import SetupHousehold from "@/components/onboarding/setup-household";
import SetupScreen from "@/components/onboarding/setup-screen";
import VendorOnboarding from "@/components/onboarding/vendor-onboarding";
import QuoteDialog from "@/components/requests/quote-dialog";
import ShoppingRequestDialog from "@/components/requests/shopping-request-dialog";
import AdminDashboard from "@/components/workspace/admin-dashboard";
import HouseholdDashboard from "@/components/workspace/household-dashboard";
import VendorDashboard from "@/components/workspace/vendor-dashboard";
import WorkspaceFrame from "@/components/workspace/workspace-frame";
import useNayaApp from "@/app/hooks/useNayaApp";

export default function NayaApp() {
  const app = useNayaApp();

  if (app.pathname === "/")
    return (
      <LandingPage
        onLogin={() =>
          app.session ? app.goTo("/app/household") : app.goTo("/login")
        }
        onStart={
          app.session
            ? () => app.goTo("/app/household")
            : app.isConfigured
              ? () => app.goTo("/signup")
              : app.enterLocalPreview
        }
        startLabel={
          app.session
            ? "Open workspace"
            : app.isConfigured
              ? "Create account"
              : "Explore Naya"
        }
      />
    );
  if (!app.session && !app.isConfigured)
    return (
      <SetupScreen
        onLocalPreview={app.enterLocalPreview}
        onBack={() => app.goTo("/")}
      />
    );
  if (app.pathname === "/signup" && !app.session)
    return (
      <SignupScreen
        busy={app.busy || app.loading}
        error={app.error}
        onSubmit={app.createAccount}
      />
    );
  if (!app.session)
    return (
      <AuthScreen
        email={app.authEmail}
        setEmail={app.setAuthEmail}
        password={app.authPassword}
        setPassword={app.setAuthPassword}
        onSubmit={app.handleAuth}
        busy={app.busy}
        error={app.error}
        notice={app.signupNotice}
      />
    );
  if (
    app.role === "admin" &&
    !app.localMode &&
    app.setupState === "ready" &&
    !app.loading
  )
    return (
      <main className="admin-app-redirect">
        <span className="eyebrow">SEPARATE OPERATIONS APP</span>
        <h1>Naya Admin has its own workspace.</h1>
        <p>
          Continue to the restricted operations console and sign in with your
          operator account.
        </p>
        <a
          className="button button-primary"
          href={process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001"}
        >
          Open admin console <ArrowRight size={15} />
        </a>
        <button className="landing-login" onClick={app.signOut}>
          Sign out
        </button>
      </main>
    );

  const pageTitle =
    app.role === "household"
      ? "A little more room to breathe."
      : app.role === "vendor"
        ? "Your shop, running smoothly."
        : "Naya operations, at a glance.";
  const pageDescription =
    app.role === "household"
      ? "One thoughtful place for the things that keep home moving."
      : app.role === "vendor"
        ? "See real household requests and send a clear, itemized quote."
        : "Review live orders, vendor applications, disputes, and payment states.";

  return (
    <WorkspaceFrame
      role={app.role}
      vendorName={app.vendorName}
      localMode={app.localMode}
      liveStatus={app.liveStatus}
      sessionEmail={app.session.user.email ?? ""}
      hasVendorProfile={app.hasVendorProfile}
      availableWorkspaces={app.availableWorkspaces}
      canApplyAsVendor={app.canApplyAsVendor}
      tab={app.tab}
      setTab={app.setTab}
      switcherOpen={app.switcherOpen}
      setSwitcherOpen={app.setSwitcherOpen}
      switchWorkspace={app.switchWorkspace}
      onSignOut={app.signOut}
      error={app.error}
      clearError={() => app.setError("")}
      onNewRequest={app.openMarketRequest}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      outstandingQuotes={app.outstandingQuotes}
    >
      {app.setupState === "no-household" && app.role === "household" && (
        <SetupHousehold
          onSubmit={app.createHousehold}
          busy={app.busy}
          error={app.error}
          name={app.householdName}
          setName={app.setHouseholdName}
          address={app.address}
          setAddress={app.setAddress}
          serviceArea={app.householdServiceArea}
          setServiceArea={app.setHouseholdServiceArea}
          familySize={app.familySize}
          setFamilySize={app.setFamilySize}
          localPreview={app.localMode}
          onSkipLocal={() => app.setSetupState("ready")}
        />
      )}
      {app.setupState === "no-vendor" && app.role === "vendor" && (
        <VendorOnboarding
          onSubmit={app.registerVendor}
          busy={app.busy}
          business={app.businessName}
          setBusiness={app.setBusinessName}
          contactName={app.vendorContactName}
          setContactName={app.setVendorContactName}
          phone={app.vendorPhone}
          setPhone={app.setVendorPhone}
          category={app.vendorCategory}
          setCategory={app.setVendorCategory}
          area={app.serviceArea}
          setArea={app.setServiceArea}
        />
      )}
      {app.setupState === "pending-vendor" && app.role === "vendor" && (
        <div className="pending-card">
          <div className="pending-symbol">
            <Clock3 size={22} />
          </div>
          <div>
            <span className="eyebrow">VENDOR VERIFICATION</span>
            <h2>Your application is in review</h2>
            <p>
              Naya will verify your business before sending you household
              requests. You can close this page; we’ll update your account when
              review is complete.
            </p>
          </div>
          <span className="status-pill status-pending">Pending review</span>
        </div>
      )}
      {app.setupState === "admin-denied" && app.role === "admin" && (
        <div className="pending-card">
          <div className="pending-symbol">
            <ShieldCheck size={22} />
          </div>
          <div>
            <span className="eyebrow">RESTRICTED WORKSPACE</span>
            <h2>Admin access is not assigned</h2>
            <p>
              An authorized operator must grant admin membership in the
              database. This account cannot grant itself access.
            </p>
          </div>
        </div>
      )}
      {app.setupState === "ready" && (
        <>
          {app.role === "household" ? (
            <HouseholdDashboard
              loading={app.loading}
              requests={app.requests}
              quotes={app.quotes}
              orders={app.orders}
              openComposer={app.openMarketRequest}
              onUpload={() => app.listUploadRef.current?.click()}
              onVoice={app.startVoiceNote}
              onAccept={app.acceptQuote}
              onConfirm={app.confirmDelivery}
              onBasketDecision={app.decideBasketChange}
              busy={app.busy}
            />
          ) : app.role === "vendor" ? (
            <VendorDashboard
              loading={app.loading}
              requests={app.requests}
              orders={app.orders}
              business={app.vendorName}
              busy={app.busy}
              localPreview={app.localMode}
              onStatus={app.updateOrderStatus}
              onBasketChange={app.requestBasketChange}
              onQuote={(request) => {
                app.setSelectedRequest(request);
                app.setQuoteLinePrices({});
                app.setQuoteUnavailable({});
                app.setQuoteEta("");
                app.setQuoteMessage("");
              }}
            />
          ) : (
            <AdminDashboard
              loading={app.loading}
              orders={app.orders}
              vendors={app.adminVendors}
              disputes={app.adminDisputes}
              busy={app.busy}
              onVerify={app.verifyVendor}
              onResolve={app.resolveDispute}
            />
          )}
        </>
      )}
      <ShoppingRequestDialog
        open={app.composerOpen}
        onClose={() => app.setComposerOpen(false)}
        fileInputRef={app.listUploadRef}
        onUpload={app.handleListUpload}
        listText={app.listText}
        setListText={app.setListText}
        aiMessage={app.aiMessage}
        busy={app.busy}
        onInterpret={app.interpretList}
        parsedItems={app.parsedItems}
        budget={app.budget}
        setBudget={app.setBudget}
        onSubmit={app.submitRequest}
      />
      <QuoteDialog
        request={app.selectedRequest}
        onClose={() => app.setSelectedRequest(null)}
        busy={app.busy}
        quoteUnavailable={app.quoteUnavailable}
        setQuoteUnavailable={app.setQuoteUnavailable}
        quoteLinePrices={app.quoteLinePrices}
        setQuoteLinePrices={app.setQuoteLinePrices}
        quoteEta={app.quoteEta}
        setQuoteEta={app.setQuoteEta}
        quoteMessage={app.quoteMessage}
        setQuoteMessage={app.setQuoteMessage}
        quoteTotal={app.quoteTotal}
        onSubmit={app.submitQuote}
      />
    </WorkspaceFrame>
  );
}
