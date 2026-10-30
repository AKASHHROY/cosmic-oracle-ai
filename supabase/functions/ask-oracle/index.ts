const cors = (origin: string | null) => ({
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": origin === "https://akashhroy.github.io" ? origin : "https://akashhroy.github.io",
  "Vary": "Origin",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
});
const json = (origin: string | null, status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: cors(origin) });

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json(origin, 405, { error: "METHOD_NOT_ALLOWED" });

  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const tavilyKey = Deno.env.get("TAVILY_API_KEY");
  if (!geminiKey || !tavilyKey) {
    return json(origin, 503, {
      error: "SERVER_NOT_CONFIGURED",
      message: "Oracle research is not connected yet. Configure GEMINI_API_KEY and TAVILY_API_KEY in Supabase Edge Function secrets.",
    });
  }

  let body: any;
  try { body = await req.json(); } catch { return json(origin, 400, { error: "INVALID_JSON" }); }
  const p = body?.profile;
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  const language = ["en", "hi", "hinglish"].includes(body?.language) ? body.language : "hinglish";
  if (!p || typeof p !== "object" || !/^\d{4}-\d{2}-\d{2}$/.test(p.birth_date || "") ||
      typeof p.birth_place !== "string" || p.birth_place.length < 2 ||
      question.length < 3 || question.length > 1200) {
    return json(origin, 400, { error: "INVALID_REQUEST", message: "Please provide a saved birth profile and a question." });
  }

  try {
    // Search the public web server-side. No search API key is ever sent to the browser.
    const searchQuery = `Vedic astrology ${question} relevant houses planets Vimshottari dasha traditional interpretation`;
    const searchResponse = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: tavilyKey, query: searchQuery, search_depth: "advanced",
        max_results: 7, include_answer: false, include_raw_content: false,
      }),
    });
    if (!searchResponse.ok) throw new Error("WEB_RESEARCH_FAILED");
    const searchData = await searchResponse.json();
    const sources = (searchData.results || []).slice(0, 7).map((r: any) => ({
      title: String(r.title || "Source").slice(0, 240),
      url: String(r.url || ""),
      content: String(r.content || "").slice(0, 1800),
    })).filter((r: any) => r.url && r.content);

    const prompt = `You are Cosmic Oracle AI, a thoughtful Vedic astrology explainer. Answer in ${language === "hi" ? "Hindi" : language === "en" ? "English" : "natural Hinglish"}.

USER BIRTH PROFILE (provided by user; NOT a calculated horoscope):
${JSON.stringify({
  name: p.name || "User", birth_date: p.birth_date, birth_time: p.birth_time || "unknown",
  birth_place: p.birth_place, time_accuracy: p.time_accuracy || "unknown"
})}

QUESTION:
${question}

LIVE WEB RESEARCH:
${JSON.stringify(sources)}

IMPORTANT RULES:
1. Use the research snippets to explain traditional Vedic astrology concepts relevant to the question. Do not claim that a search result is an authoritative or universally accepted rule.
2. You do NOT have calculated Ascendant, planetary longitudes, house cusps, aspects, divisional charts or Vimshottari dasha. Never invent them, and never claim Mars/Saturn/etc is in this person's 7th house based only on date/place.
3. If the question needs a personal chart, explain what can be said generally and what requires a verified chart calculation. Birth time accuracy matters.
4. For marriage questions, explain the traditional factors astrologers examine (7th house/lord, Venus/Jupiter as relevant significators, Navamsha D9, running dasha and transits) and distinguish general meanings from this user's unknown placements. Do not assert "Mars is delaying your marriage" unless verified chart data actually says so.
5. Offer balanced possibilities, not deterministic claims or guaranteed dates. Do not frighten, shame, blame character, prescribe gemstones/rituals as certainty, or claim astrology is scientifically proven.
6. If sources disagree or snippets are weak, say so. Include a short "Sources" list with the most relevant URLs from the research, and describe which claims they support.
7. Be warm, direct and practical. Give the user a useful answer rather than only disclaimers.
8. No medical, legal, financial or safety-critical advice based on astrology.

Return the answer as readable Markdown.`;

    const aiResponse = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + encodeURIComponent(geminiKey),
      {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.45, maxOutputTokens: 1400 },
        }),
      },
    );
    if (!aiResponse.ok) throw new Error("AI_PROVIDER_FAILED");
    const aiData = await aiResponse.json();
    const answer = aiData?.candidates?.[0]?.content?.parts?.map((x: any) => x.text || "").join("\n").trim();
    if (!answer) throw new Error("EMPTY_AI_RESPONSE");
    return json(origin, 200, {
      id: crypto.randomUUID(), answer,
      sources: sources.map(({ title, url }: any) => ({ title, url })),
      researched_at: new Date().toISOString(),
      access: "free",
    });
  } catch (err) {
    console.error("Oracle research failed", err);
    return json(origin, 502, {
      error: "ORACLE_FAILED",
      message: "Web research or AI generation failed. Please try again in a moment.",
    });
  }
});
