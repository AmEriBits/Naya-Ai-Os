# Infrastructure

Deployment configuration and environment-specific operations belong here. The Supabase project definition, migrations, and deployable backend functions are under `backend/supabase/`; run Supabase CLI commands with `--workdir backend`. The household/vendor web app (`apps/web/`) and restricted operations console (`apps/admin/`) are separate deployable Next.js applications.

Never commit production secrets. Frontend variables prefixed with `NEXT_PUBLIC_` are public client configuration, not secrets. Model-provider keys belong only in Supabase Edge Function secrets, never in either web app's environment.
