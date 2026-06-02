// Vercel serverless function: POST /api/page  { niche, platform }

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
      `Build an encouraging starter content page for a BEGINNER faceless creator in "${niche}" on ${platform}. ` +
      `Return ONLY JSON: {"handle":"catchy @handle","tagline":"<8 word tagline","bio":"2 friendly sentences",` +
      `"first_steps":["3 short steps to launch the page today, each under 10 words"],` +
      `"posting_plan":[{"day":"Mon","idea":"specific post","format":"faceless format"} ...7 days],` +
      `"links":[{"label":"button text","note":"what goes there"} x3]}`;

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
