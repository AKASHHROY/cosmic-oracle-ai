# Cosmic Oracle AI — Website v2

A responsive, multi-section website for Cosmic Oracle AI (not a native/mobile application).

## Website sections
- Public landing page and brand story
- Birth profile workspace (local-device save without backend; private cloud save with Supabase)
- Oracle question page and conversation history
- Source knowledge library
- Plans page (checkout intentionally disabled until a payment provider is configured)
- Methodology and transparency page
- English, Hindi and Hinglish interface

## Run locally
Node.js 20+: `npm install`, `npm run dev`. Validate with `npm run typecheck`, `npm test`, `npm run build`.

## GitHub Pages
The single workflow at `.github/workflows/deploy.yml` builds and deploys the Vite website to `https://akashhroy.github.io/cosmic-oracle-ai/`. GitHub Pages source must be set to GitHub Actions.

## Supabase setup
1. Create a Supabase project.
2. Run `supabase/migrations/202610300001_initial_schema.sql` in the SQL Editor.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as GitHub Actions repository variables (Settings → Secrets and variables → Actions → Variables). They are public client configuration; never add a service-role key to the website.
4. Deploy the Edge Function `ask-oracle` using Supabase CLI. Set `GEMINI_API_KEY` as an Edge Function secret.
5. In Supabase Auth URL configuration, set Site URL to `https://akashhroy.github.io` and add redirect URL `https://akashhroy.github.io/cosmic-oracle-ai/`.
6. Add a GitHub Actions build step to write the two `VITE_` variables into `.env.production` before `npm run build`, or use repository variables in the workflow.

## Important limitations
- A validated Vedic ephemeris/Ascendant provider is not included. The website deliberately does not fabricate planetary positions, Lagna, houses or Dasha values. The Oracle prompt explicitly tells Gemini not to invent them.
- The five-free-question reservation is enforced server-side in SQL. Premium checkout is not enabled and no payment is collected.
- Birth-place geocoding and actual chart generation remain future integrations.
- The source PDFs contain known limitations: the primary report is truncated at page 93, two AstroSage Duggi reports are duplicates, and report contradictions are retained as caveats.
