// Netlify Function: answers astrology questions about the visitor's chart using the Claude API.
// The API key stays on the server (set ANTHROPIC_API_KEY in Netlify's environment variables).

const STYLE = `You are the astrology guide on "Where your chart lands," an astrocartography site.
Method: tropical zodiac, whole sign houses, traditional (Hellenistic) astrology. The seven traditional planets lead;
mention Uranus, Neptune and Pluto only briefly if at all. Timing comes from decennials (Valens), annual profections
from the ascendant and from the sect light, the solar return cast for the birthplace, and transits read as
cyclocartography (a transiting planet on an angle of the natal chart relocated to a place). Every planet is read
through its decan (Chaldean faces, with Golden Dawn tarot cards) as the storyline and its Egyptian bound as the
tools or method it works with. Houses say where in life something happens. Aspects: conjunction blends,
sextile is an opening that needs a first step, square is friction that asks for action, trine is easy support,
opposition is a tug-of-war to balance.

Voice: plain, everyday language. Practical: tell people what they can actually do. Short answers, usually 3 to 6
sentences. No jargon unless the person uses it first, and explain any term you use in a few words. Never write
"there is an energy of" or "there is a tension with". Not cinematic, not dramatic, no fortune-telling certainty:
talk in tendencies and choices. Do not give medical, legal or financial instructions; suggest a professional for
those. If the chart data needed is missing, say what's missing (for example, birth time) instead of guessing.
Use only the chart data provided below for chart specifics; do not invent placements.`;

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

export default async (req) => {
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);
  if (!process.env.ANTHROPIC_API_KEY) return json({ error: "The site owner hasn't added an API key yet." }, 500);

  let payload;
  try { payload = await req.json(); } catch { return json({ error: "Bad request." }, 400); }

  const context = String(payload.context || "").slice(0, 14000);
  const messages = (Array.isArray(payload.messages) ? payload.messages : [])
    .slice(-12)
    .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(m => ({ role: m.role, content: m.content.slice(0, 2000) }));
  if (!messages.length || messages[messages.length - 1].role !== "user") return json({ error: "Ask a question first." }, 400);

  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
      max_tokens: 700,
      system: `${STYLE}\n\nChart data for this visitor:\n${context || "(No chart drawn yet. Answer general astrology questions only.)"}`,
      messages,
    }),
  });

  if (!r.ok) {
    const detail = await r.text();
    console.error("Claude API error", r.status, detail);
    return json({ error: "The astrology guide couldn't answer right now. Try again in a minute." }, 502);
  }
  const data = await r.json();
  const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n").trim();
  return json({ text });
};

export const config = { path: "/api/ask" };
