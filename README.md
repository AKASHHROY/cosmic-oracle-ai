# Cosmic Oracle AI — MVP project scaffold

This repository uses the supplied Gemini notebook's architecture, source audit and code concepts.

## Included
- Luxury black / purple / gold responsive React interface.
- English, Hindi and Hinglish language switching.
- Birth-profile form with birth-time accuracy.
- Nine source-rule groups from the uploaded report analysis.
- Navamsha, whole-sign house, Vimshottari and cautious dosha helper functions.
- Supabase Edge Function security shell with origin allowlist and fail-closed response.
- Vitest tests and GitHub Pages workflow.

## Important: what is intentionally not enabled
The notebook did not supply a validated complete ephemeris calculation. Its own trial planetary calculations differed from the reference PDFs. Therefore `src/lib/astrology/ephemeris.ts` refuses to invent planetary longitudes or Ascendant. The Oracle endpoint also returns a controlled 503 until server-side ephemeris, chart schema, and atomic quota reservation/commit are implemented. This avoids misleading astrology results and avoids consuming quota on failed requests.

## Run locally
Install Node.js 20+, then:
1. `npm install`
2. `npm run dev`
3. `npm run typecheck`
4. `npm test`
5. `npm run build`

## Configure Supabase later
Create the database schema and owner-only RLS policies before deploying the Edge Function. Set secrets server-side only. Never expose `GEMINI_API_KEY` or service-role keys through `VITE_` variables.

## Source caveats
- Primary GAURAV PDF is truncated at page 93.
- Two AstroSage Duggi reports are duplicates.
- The uploaded reports are not a complete classical astrology rulebook.
- Gemstone and other source contradictions are preserved as caveats, not silently reconciled.
