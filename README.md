# Naya OS

Mobile-first household marketplace foundation built from the Naya Lovable preview, supplied data model, and payment event design. It deliberately starts with a real household request → verified vendor quote → household acceptance workflow and loads no sample marketplace records.

## Repository layout

- `apps/web/`: Next.js App Router application for the public site and household/vendor workspaces.
- `apps/web/components/`: feature components grouped by area, with reusable primitives in `ui/`.
- `apps/admin/`: separately built and deployed Next.js operator console. Access is confirmed by Supabase database authorization, not by the app URL.
- `backend/supabase/`: database migrations, RLS/RPC logic, Edge Functions, and Supabase project configuration. Supabase is the backend; a duplicate API server is not needed.
- `infrastructure/`: deployment and environment operations documentation.
- Root `pnpm-workspace.yaml` and `turbo.json`: pnpm/Turborepo workspace orchestration.

This keeps product surfaces and backend boundaries in one monolithic repository, while deploying them as separate services.

## Local setup

Requirements: Node 22 or newer, pnpm 11, and a Supabase project.

1. Create a fresh Supabase staging project and apply all migrations in order from `backend/supabase/migrations/`. Do not use the Lovable or production project.
2. Copy `.env.example` to both `apps/web/.env.local` and `apps/admin/.env.local`. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in each file from the project API settings; set `NEXT_PUBLIC_ADMIN_URL` in the web app file to the admin app URL. Next.js reads environment files from each app directory.
3. Install dependencies from the repository root with `pnpm install`.
4. Run the household/vendor app with `pnpm dev` at `http://localhost:3000`. Run the separate admin app with `pnpm --filter @naya/admin dev` at `http://localhost:3001`.
5. Disable public signups in the hosted Supabase Auth settings before inviting anyone. The local `backend/supabase/config.toml` also sets `enable_signup = false`, but that setting does not change an already-hosted project. Send invitations with the redirect URL `<staging-site>/accept-invite`; the invitee sets a password there. Vendor verification remains a separate operator action.
6. Deploy the `interpret-shopping-list` Supabase Edge Function. Set `OPENAI_API_KEY` and optional `OPENAI_MODEL` as backend function secrets; the browser never receives the AI key. A database-enforced limit allows 30 list interpretations per authenticated user each UTC day.
7. Grant admin access only to a trusted operator, using the Supabase SQL editor after confirming the user ID: `insert into public.admin_users (user_id, granted_by) values ('<operator-user-uuid>', '<granting-operator-uuid>');`. The admin role cannot be self-selected or self-granted.

Add the local development URL and the exact staging URL to Supabase Auth's redirect allowlist. Use the Supabase CLI with the backend work directory, for example `supabase --workdir backend link --project-ref <project-ref>`, followed by `supabase --workdir backend db push` and `supabase --workdir backend functions deploy interpret-shopping-list`. Configure AI secrets in the Supabase dashboard or the CLI without committing them or exposing them in frontend settings.

## Implemented

- Email/password authentication using Supabase Auth.
- Household creation and membership-scoped request access.
- Vendor application and pending verification state.
- AI-assisted typed-list normalization with a human review step.
- Publishing actual shopping requests and reading live vendor responses.
- Per-item available/unavailable vendor pricing, server-computed quote totals, quote expiry, and request-scoped quote acceptance.
- RLS policies and server-side RPC checks for membership, vendor verification, quote submission, and single-order acceptance.
- Exact service-area request matching and realtime request/quote updates.
- Responsive household and vendor workspaces with real empty states and live database records.
- Separate restricted admin application under `apps/admin/`.
- Installable PWA shell for vendor phones/tablets, plus a desktop-friendly admin site. Push notifications are not yet connected, so background hardware alerts are not promised.
- Vendor fulfilment status transitions with an append-only order timeline.
- Vendor basket-change proposals with a household approval gate; declining pauses the order until the vendor revises and resubmits.
- Household delivery confirmation or issue reporting, vendor verification, and admin dispute-resolution notes through guarded RPCs.
- Admin read access to platform queues is gated by operator-granted membership in `admin_users`.
- Invite-only app onboarding: sign-in only, with an invitation-session password setup route at `/accept-invite`. The hosted Supabase Auth signup setting and real invite delivery still require staging verification.

## Local preview mode

If Supabase is not configured, choose **Explore the working preview** on the setup screen. This starts with an empty browser-local workspace so you can enter a household, a vendor, a request, and quotes, then click through the order timeline and admin review. Preview data is stored only in that browser and is not shared with another device or account. The preview can skip the funding gate to demonstrate fulfilment, but it never represents that money was collected or paid. List interpretation in preview is basic line splitting, not the AI service. Use Supabase for shared, authenticated, live operation.

## Not connected yet

Quote acceptance creates an order in `awaiting_payment`. Vendor work is blocked at that state: a verified payment backend must advance it to `confirmed` before shopping can start. During shopping, a vendor can propose item or price changes, but fulfilment pauses until a household approves; a decline requires the vendor to revise and resubmit. The app includes operational order states, disputes, and the escrow, payout, refund, and append-only payment event tables, but no payment provider or legally/contractually approved holding arrangement is connected. It therefore does not collect, hold, refund, or pay out funds. Never represent an internal database row or a payment provider's ordinary balance as escrow. Before launch, select a payment partner that explicitly supports the agreed safeguarded-funds flow, implement signed webhooks, idempotent collection/release/refund operations and reconciliation, and obtain appropriate local legal/compliance review.

The private beta is quote-only: accepting a quote creates the `awaiting_payment` record and does not collect payment or start shopping or delivery. The landing walkthrough and future-capability cards are illustrative concepts, not available services. Local preview mode is a separate demonstration and must not be used to represent staging behavior.

The admin verification and dispute tools are implemented for authenticated operator membership. The user ID must be provisioned out of band; do not expose `admin_users` writes to browser clients. The admin UI shows live orders and disputes, and records resolution notes, but an admin resolution does not itself execute a refund.

Before operating with real customers, add a provider-confirmed funding and settlement adapter, vendor delivery-address access only after funding, geocoded service-area matching, push/SMS outbox delivery, proof-of-delivery evidence storage, and a deployed rider/dispatch integration. Review the starter migrations against the existing Supabase project before applying them; they are not an in-place migration for the Lovable backend.
