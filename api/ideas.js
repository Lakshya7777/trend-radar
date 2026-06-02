export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  const key = process.env.GEMINI_API_KEY;
  if (!key) { res.status(500).json({ error: "Missing GEMINI_API_KEY" }); return; }

  const { niche = "content", platform = "YouTube Shorts" } = req.body || {};

  const prompt = `You're a warm encouraging content coach for COMPLETE BEGINNERS making FACELESS content (voiceover, screen-recording, stock b-roll, text-on-screen). Niche: "${niche}". Platform: "${platform}". Give 5 specific content ideas they can make THIS WEEK with a phone and free tools. Return ONLY JSON no prose: {"pep":"one warm encouraging sentence max 18 words","signals":[{"title":"short idea name","hook":"exact first line shown on screen","format":"faceless format","why_now":"one line why it works","score":<integer 55-97>,"effort":"Easy|Medium","time":"~XX min","steps":["3 short steps each under 9 words"],"tools":["2-3 free tool names"],"search":"3-5 word youtube search phrase"}]}`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    const data = await r.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const json = JSON.parse(clean.slice(clean.indexOf("{"), clean.lastIndexOf("}") + 1));
    res.status(200).json(json);
  } catch (e) {
    res.status(500).json({ error: "Failed", detail: String(e) });
  }
}
