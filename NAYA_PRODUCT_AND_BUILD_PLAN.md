# Naya: first real marketplace workflow

## What exists today

The deployed Lovable site contains a strong consumer-facing concept and route prototypes for the household home, shopping request, quotes, tracker, and an admin console. The visible home and admin screens include prefilled order numbers, quotes, ratings, balances, and prices. Treat these as presentation fixtures until the app is connected to a real authenticated database and verified with live records. The new-request page also currently opens with a prefilled list. This is useful for prototyping, but it is not the live marketplace flow described here.

The supplied data model diagram already identifies the core marketplace entities: users, households and memberships, agent and rider profiles, shopping requests and items, quotes, orders, payments, deliveries, quality checks, disputes, reviews, and notifications. The supplied payment SQL adds an append-only transaction history for collections, payouts, and refunds.

## First release: one real end-to-end order

Keep Version 1 to grocery shopping within one launch area. A successful first release means that two real accounts can complete one order end to end, with all state persisted and auditable:

1. **Household account and address** — The user signs in with a verified phone number, creates or joins a household, and saves a delivery address and map pin. Household membership and spending approval are enforced in the database.
2. **Request** — The user enters a typed list, optionally adds a photo or voice recording, selects substitution rules, chooses a delivery window, and sets a maximum budget. Save the raw input and normalized request items separately. Do not publish until the user reviews the parsed list.
3. **AI interpretation (assistive)** — Convert input into editable item name, quantity, unit, brand preference, and substitution allowance. Show uncertainty and ask the user to correct ambiguous quantities. AI output is a draft, never an order or purchase authorization.
4. **Offer to vendors** — Publish the confirmed request to eligible, verified grocery agents in the service area. Notify the vendors and record delivery/acknowledgement per recipient. A vendor sees only the minimum customer details needed to quote.
5. **Vendor quote** — Vendor accepts or declines within a response window. To quote, they provide per-item availability, price, proposed substitutions, delivery estimate, and quote expiry. The household receives a notification when a valid quote arrives.
6. **Household chooses** — Compare total, item changes, ETA, and verified history. Accepting a quote atomically creates one order from a frozen quote snapshot and closes competing quotes. The accepted order is the sole authority for what is purchased.
7. **Payment** — Collect payment through a configured payment provider using provider references and idempotency keys. Persist webhook events and reconcile them before advancing the order. Do not show “escrow held” or permit payout until the actual provider/payment structure supports that claim. Provider-held funds, platform balances, refund rules, and vendor payouts need to be confirmed with the payment provider and appropriate local counsel before launch.
8. **Shopping and substitutions** — Vendor marks items as sourced, unavailable, or proposes a substitute. Each change has a price delta and requires household approval when it changes the confirmed quote or exceeds the agreed tolerance. Upload receipt and item evidence to private storage.
9. **Handoff and delivery** — For the first pilot, vendor self-delivery or customer pickup can be the fulfillment mode; add a verified rider workflow when operations can support it. Capture handoff proof, status timestamps, and delivery proof. The household sees actual states and a support contact, not simulated live tracking.
10. **Completion and reconciliation** — Household confirms delivery or opens a dispute. Resolve partial/failed fulfillment with an itemized refund or adjustment. Release/vendor-settle only through the approved provider flow. Record every provider event, receipt, dispute decision, and payout attempt. Collect a review only after completion.

## Vendor experience and installed hardware

Build a vendor console as a mobile-first installable PWA first; do not require vendors to buy a custom device. Pilot hardware can be a low-cost Android phone or tablet supplied/configured by Naya, with a SIM/data plan and charging support. A Bluetooth thermal printer is optional for receipts or picking tickets. Hardware is an access channel; the same authenticated system must work in a browser if a device is lost or replaced.

Vendor screens should be deliberately small in scope:

- **Onboarding**: phone verification, business and market details, service area, payout details, identity/business verification status, and training checklist. Keep pending vendors unable to receive paid orders.
- **Availability**: online/offline toggle, service hours, coverage, and current workload. Going offline stops new broadcasts but does not erase accepted work.
- **New requests**: a loud, high-contrast queue with request age, pickup/delivery area, item count, budget, and response deadline. Avoid exposing full household address before order acceptance.
- **Quote builder**: item-by-item price, available/partial/unavailable, substitution proposal, delivery fee/ETA, quote expiry, and final total. Validate arithmetic server-side.
- **Active order**: accepted item snapshot, picking checklist, substitution approval state, receipt/photo capture, customer contact rules, and pickup/delivery handoff actions.
- **Earnings and support**: settled vs pending amounts sourced from provider records, downloadable receipts, disputes, and a support route. Never label an internal estimate as paid.

**Request delivery to hardware:** create a database notification/outbox record when a request is published; deliver a push notification to the vendor PWA and update the in-app queue via realtime subscription. Add SMS fallback for urgent requests or vendors who are offline. The notification contains a short prompt and a secure deep link, not sensitive household data. Record delivery, acknowledgement, expiry, and retry. The PWA should cache its shell and retain an unsent quote draft offline, but it must revalidate availability and quote expiry with the server before submission. A tablet, printer, WhatsApp channel, or SMS is not the source of truth; the backend is.

## State and data rules

Use a server-controlled state machine, with explicit allowed transitions and actor authorization. A practical first set is:

`shopping_request: draft -> published -> quoted -> accepted | expired | cancelled`

`order: awaiting_payment -> confirmed -> shopping -> awaiting_customer_approval -> ready_for_handoff -> out_for_delivery -> delivered -> completed`

Exceptions include `payment_failed`, `cancelled`, `disputed`, `partially_fulfilled`, and `refunded`. A request can receive many quotes, but only one quote can be accepted. An order snapshots the accepted quote and request items so later edits cannot rewrite history. Every command checks ownership/role, current state, idempotency, and server-computed totals.

The provided tables are a useful starting point, not a complete implementation contract. Add or verify: quote line items as relational rows (rather than opaque JSON only), quote/request/order state history, per-recipient request delivery, notification outbox and provider attempts, private evidence metadata, auth/role mappings, and server-side transition functions. Keep the supplied append-only `payment_transactions` history; use database transactions and row locks for accept-quote, payment reconciliation, refund reservation, and payout eligibility. Add database constraints for one accepted quote per request and one order per accepted quote. Put Row Level Security on every household/vendor-owned row and test cross-tenant access.

## Real-system acceptance checklist

- A household can sign up, verify, create an address, and submit a request without seeded data.
- A vendor account must be verified and online to receive eligible requests.
- A published request appears for only eligible vendors and is actually acknowledged or expires visibly.
- A quote submitted by a vendor appears for its household; no prefilled quote is used.
- Two simultaneous quote acceptances cannot create two orders.
- Payment state changes only from verified provider webhooks/reconciliation, never from a client-side button alone.
- Every mutation is authorized server-side and every amount is recomputed server-side.
- Uploads use private storage and signed access; one household cannot read another household’s items, address, or evidence.
- Notifications retry safely and do not create duplicate quotes, orders, charges, refunds, or payouts.
- An operator can inspect failures and reconcile a real order without editing production rows by hand.

## Build order

1. Connect the Lovable project to its source repository and staging backend; remove all hard-coded order, quote, balance, and recommendation fixtures from the live customer/vendor paths.
2. Implement authentication, household/address, vendor onboarding/verification, and database access policies.
3. Implement typed request creation and review, then vendor notification delivery and quote submission.
4. Implement race-safe quote acceptance, payment-provider integration in sandbox, webhook verification, and transaction reconciliation.
5. Implement picking, substitutions, evidence, handoff, completion, refunds/disputes, and operational tooling.
6. Pilot with a small group of real households and vendors in one bounded service area before enabling broader AI, recurring shopping, bills, or home services.

## Current implementation boundary

A separate starter implementation is now in [naya-os/](./naya-os/). It has Supabase-backed authentication, household/vendor onboarding, typed-list AI interpretation, real request publishing, verified service-area visibility, per-item quotes, and race-safe quote acceptance. It intentionally contains no sample market data. The deployed Lovable project remains a visual reference; its source repository and backend credentials were not available, so this is a fresh implementation rather than a direct edit of that deployed app.

The starter stops at creating an order in `awaiting_payment`. It does not claim that money is held in escrow or that payouts, delivery tracking, push/SMS hardware notifications, or admin verification are live. Add the selected payment-provider integration and operational controls before piloting with actual orders. The installable vendor web app can run on a Naya-configured Android phone or tablet; purpose-built hardware is not required for the first pilot.

## Private beta scope freeze (2026-11-19)

Target: controlled pilot by 2026-11-26, starting in **NAF Valley Estate**.

- Household account creation and vendor applications are public. Vendor applications require manual operator approval before the vendor can view or quote on requests. Email verification should be enabled for hosted Auth.
- Signup metadata is only an onboarding draft/prefill; database memberships, vendor profiles, and operator-granted admin access remain authoritative.
- Beta flow: household creates and reviews a shopping request, verified vendors submit itemized quotes, and the household compares and accepts a quote. Acceptance creates an order record in `awaiting_payment`.
- The order record does not mean payment was collected or safeguarded, and it does not authorize shopping or delivery. No in-app payment, escrow, payout, refund, or fulfillment progression is in this beta.
- If fulfillment is enabled after payment and operations are approved, use vendor self-delivery or customer pickup. Do not promise Naya rider dispatch or live tracking.
- AI scope is server-side shopping-list interpretation into an editable draft with household review. Meal planning, replenishment predictions, price forecasting, and model training are out of scope.

### Day 1 readiness findings

- Static review found three ordered Supabase migrations and RLS enabled on the marketplace tables. Role-sensitive actions use database RPC checks; admin membership is operator-granted. These findings do not prove the migrations or policies are applied correctly in a live project.
- The `interpret-shopping-list` Edge Function checks the user's session and applies a database-backed limit of 30 calls per user per UTC day. Its provider secret is server-side; deployment and secret configuration could not be verified.
- The Edge Function now rejects malformed, empty, and oversized list input before consuming the daily AI quota. This is a local code change; staging behavior still needs to be exercised.
- No linked staging project, local Supabase credentials, Supabase CLI, or hosting/CI deployment configuration is available in this workspace. The infrastructure directory contains documentation only; a local preview is not staging.
- The app now provides public role-specific signup, email/password sign-in, and metadata-prefilled household/vendor onboarding. Local Supabase config allows signup. Hosted Auth settings, email confirmation, and redirect behavior still need staging verification.
- The landing page now describes the quote-only pilot, removes unsupported social proof and pricing, and labels future capabilities as concepts. Staging and account-level verification are still required before publishing or inviting beta users.

### Explicit action items to reach beta

#### 1. Provision isolated staging (founder/operator)

- [ ] Create a **new Supabase staging project** for this starter. Do not apply these migrations to the Lovable or production database; the migrations are not an in-place migration for that backend.
- [x] Select Vercel as the web host; use separate projects rooted at `apps/web` and `apps/admin`.
- [ ] Deploy the staging app and record its assigned URL. Add that URL and the local development callback to the Supabase Auth redirect allowlist.
- [ ] Put `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in each app's ignored `.env.local` and the hosting provider's staging environment settings. These are public client configuration; never put the Supabase service-role key or `OPENAI_API_KEY` in a `NEXT_PUBLIC_` variable or browser bundle.
- [ ] Keep project references and secrets out of chat. Share only the staging URL and non-secret project reference if hands-on deployment is needed.

**Done when:** the staging site loads from the chosen host and connects to the new staging database, while production/Lovable remains untouched.

#### 2. Apply and verify database migrations (developer + operator)

- [ ] Install the Supabase CLI on the deployment machine and link it to the staging project only.
- [ ] Review the pending migrations and run a dry run before applying them:

  ```sh
  supabase --workdir backend link --project-ref <STAGING_PROJECT_REF>
  supabase --workdir backend migration list
  supabase --workdir backend db push --dry-run
  supabase --workdir backend db push
  supabase --workdir backend migration list
  ```

- [ ] Confirm migrations `202611180001`, `202611180002`, and `202611180003` are recorded as applied.
- [ ] Create separate staging accounts for household A, household B, a pending vendor, a verified vendor, and an admin operator.
- [ ] Verify the access matrix: household A cannot read household B's data; pending vendors cannot read eligible requests or update orders; verified vendors see only matching requests and their orders; non-admins cannot review vendors or resolve disputes; admins cannot be self-provisioned.
- [ ] Add automated RLS/RPC regression tests for those cases before opening the pilot. The repository currently has no app test suite.

**Done when:** all three migrations are recorded in staging and each cross-role/cross-household test passes using real staging accounts.

#### 3. Deploy and exercise the AI function (developer + operator)

- [ ] Add `OPENAI_API_KEY` and, if desired, `OPENAI_MODEL` as Supabase Edge Function secrets in the staging project; do not commit them or enter them into the frontend host.
- [ ] Deploy `interpret-shopping-list` and confirm the deployment uses the intended staging project.
- [ ] Test an authenticated valid list, missing/invalid auth, malformed JSON, empty/oversized input, unreadable model output, and the daily quota. Confirm the model output stays an editable draft and never creates a request by itself.
- [ ] Confirm malformed, empty, and oversized requests do not consume the daily quota.
- [ ] Inspect the built browser assets and host configuration to confirm no server-side key is present.

**Done when:** the authenticated request works in staging, invalid/unauthenticated requests are rejected, quota behavior is confirmed, and only the user-reviewed list can be submitted.

#### 4. Implement household signup and vendor applications (developer + operator)

- [x] Add public role-specific signup and email/password sign-in.
- [x] Enable signup in local Supabase config; configure hosted email confirmation and redirect URLs separately.
- [x] Route signed-in users using database memberships/vendor profiles/admin authorization; use metadata only to select and prefill onboarding.
- [x] Keep vendor applications pending and expose their contact details to authorized admins for review.
- [ ] Test household signup, vendor application, email confirmation, sign-in routing, and rejection of unverified vendor quote access on staging.

**Done when:** household accounts can complete onboarding, vendor applications are reviewed before access, role routing reflects persisted database state, and unverified vendors cannot quote.

#### 5. Make public claims beta-safe (developer + product owner)

- [x] Replace landing-page payment/escrow claims and FAQs with the quote-only boundary.
- [x] Mark proposed household pricing and AI roadmap capabilities as not purchasable until subscription billing and the listed features are implemented.
- [x] Keep payment, escrow, delivery, support, refund/replacement, and savings claims bounded by verified live capability.
- [x] Label illustrative household scenarios as product previews, never as customer testimonials or verified outcomes.
- [x] Explain in the household workspace that quote acceptance creates an `awaiting_payment` record only and that the vendor has not started shopping.
- [ ] Review the final deployed landing page and authenticated screens against the hosted staging behavior before inviting users.

**Done when:** every public and authenticated screen accurately describes the quote-only pilot, distinguishes live features from roadmap plans, and makes no unverified operational, payment, support, or social-proof claim.

#### Proposed household pricing and AI tiers (not yet for sale)

The Naya AI Operating System brief describes a broader roadmap than the current grocery request-to-quote beta: meal and budget planning, household memory, predictive purchasing, price intelligence, vendor recommendations, family events and reminders, gift planning, group buying, errands, bill reminders, and home-service coordination. The pricing page presents these as tiered roadmap capabilities rather than live entitlements.

The brief suggests a paid household subscription range of **₦2,000–₦5,000 per month**. The public page uses draft steps of Just Basket (₦0), Naya Household (₦2,000), Naya Household Pro (₦3,500), and Naya Elite (₦5,000) per household/month. These amounts are proposals, not validated prices. Do not enable billing until AI usage limits, operating costs, request limits, included service boundaries, and payment/refund terms are defined.

In the current beta, typed-list interpretation may be used when the AI service is configured, and the household reviews suggestions before publishing a request. Meal planning, budget intelligence, learned household memory, predictive shopping, price forecasting, AI vendor ranking, concierge workflows, subscriptions, payments, and fulfilment are not available. Grocery, delivery, utility, and third-party service costs are never included in the proposed subscription prices.

#### 6. Run the private-beta acceptance pass (developer + pilot operator)

- [ ] From a household account, submit a list, review/edit the AI draft, and publish the request.
- [ ] From a verified vendor account in NAF Valley Estate, submit an itemized quote; confirm an unrelated or pending vendor cannot see it.
- [ ] From the household account, compare and accept a quote; confirm exactly one order is created in `awaiting_payment`.
- [ ] Confirm the order cannot move to shopping/delivery and the household sees the payment/fulfillment limitation.
- [ ] Verify error reporting, mobile layout, and that no sample data or secrets appear in the staging app.

**Done when:** the complete staging walkthrough passes with separate real accounts and the operator can invite the first pilot users without promising payment, escrow, or fulfillment that Naya does not yet provide.
