// Vercel serverless function: POST /api/ideas  { niche, platform }
// Your ANTHROPIC_API_KEY lives here on the server and is NEVER sent to the browser.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    res.status(500).json({ error: "Missing ANTHROPIC_API_KEY env var on Vercel." });
    return;
  }

  try {
    const { niche = "content", platform = "YouTube Shorts" } = req.body || {};

    const prompt =
      `You're a warm, encouraging content coach for COMPLETE BEGINNERS who make FACELESS content ` +
      `(voiceover, screen-recording, stock/AI b-roll, text-on-screen — never on camera). ` +
      `Niche: "${niche}". Platform: "${platform}". ` +
      `Give 5 specific content ideas they could make THIS WEEK with just a phone and free tools. Be reassuring and concrete. ` +
      `Return ONLY JSON, no prose: ` +
      `{"pep":"one warm encouraging sentence (max 18 words)","signals":[{` +
      `"title":"short idea name","hook":"the exact first line shown/said on screen",` +
      `"format":"faceless format in a few words","why_now":"one short line why it works",` +
      `"score":<integer 55-97 momentum>,"effort":"Easy|Medium","time":"~XX min",` +
      `"steps":["3 to 4 tiny steps, each under 9 words"],` +
      `"tools":["2-3 FREE tool names like CapCut, Canva, ElevenLabs"],` +
      `"search":"a 3-5 word phrase to find similar videos"}]}`;

    const json = await callClaude(key, prompt);
    res.status(200).json(json);
  } catch (e) {
    res.status(500).json({ error: "Generation failed", detail: String(e) });
  }
}

async function callClaude(key, prompt) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6", // switch to "claude-haiku-4-5-20251001" for lower cost
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await r.json();
  const text = (data.content || []).map((b) => b.text || "").join("\n");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1));
}
