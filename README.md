# Cosmic Oracle AI — Free astrology website

A responsive **website for desktop and mobile browsers**. This is not an Android/iOS app. No premium plan, subscription, payment wall or five-question limit is included.

Website URL: https://akashhroy.github.io/cosmic-oracle-ai/

## User experience
- Birth profile stored locally without requiring an account.
- Ask Oracle without signing in once the public Supabase Edge Function is deployed.
- Unlimited free questions (subject to basic anti-abuse protections imposed by the hosting/search/AI providers).
- Hinglish, Hindi and English interface.
- Traditional astrology knowledge library.
- Each answer can include links to the web research sources used.
- Question history is stored in the browser for anonymous visitors.
- Optional Supabase account for cloud-saved birth profiles.

## How the AI works
1. User enters birth date, birth time (if known), birthplace and a question.
2. The Edge Function sends the question to Tavily Search API to retrieve current public web pages about the relevant Vedic astrology concepts.
3. Gemini synthesizes those research snippets and answers in the selected language, including source URLs.
4. The AI is instructed not to invent personal placements, house positions or dasha periods. Until a verified ephemeris is integrated, it explains general possibilities and clearly says what cannot yet be confirmed from the supplied birth data.

**Important limitation:** internet search is not a horoscope calculator. A personal statement such as “Mars is in your 7th house” requires accurate birth time/place, geocoding, time-zone conversion and validated astronomical calculations. The current ephemeris adapter deliberately fails closed. Do not treat generic search snippets as proof of a person's chart.

## Required backend setup
Create a Supabase project. Deploy the function:
`supabase/functions/ask-oracle/index.ts`

Set these Supabase Edge Function secrets:
- `GEMINI_API_KEY` — Google AI Studio Gemini API key
- `TAVILY_API_KEY` — Tavily Search API key

The browser must have the public Supabase project URL and anon/publishable key at build time. In GitHub:
Settings → Secrets and variables → Actions → Variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Never expose `GEMINI_API_KEY`, `TAVILY_API_KEY`, or Supabase service-role key in frontend code or VITE variables.

Optional cloud accounts: run `supabase/migrations/202610300001_initial_schema.sql` in Supabase SQL Editor, enable email auth, and add the GitHub Pages URL to allowed redirects. Anonymous profile/question data stays in browser local storage.

## Deploy
Keep only `.github/workflows/deploy.yml`; delete manually-created duplicate `main.yml`. Set repository Settings → Pages → Source to GitHub Actions. Push to `main`. Workflow runs npm install, TypeScript check, tests, Vite build and deploys `dist`.

## Local commands
Node 20+: `npm install`, `npm run dev`, `npm run typecheck`, `npm test`, `npm run build`.

## Astrology source limitations
The uploaded astrology reports have contradictions; the main GAURAV report is truncated at page 93 and two AstroSage Duggi files are duplicates. They are not a complete classical rulebook. Treat traditional interpretations as cultural/astrological perspectives, not scientific certainty or guaranteed predictions.
<!-- Trigger fresh deployment -->
