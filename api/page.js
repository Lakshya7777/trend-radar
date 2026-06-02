export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  const key = process.env.GEMINI_API_KEY;
  if (!key) { res.status(500).json({ error: "Missing GEMINI_API_KEY" }); return; }

  const { niche = "content", platform = "YouTube Shorts" } = req.body || {};

  const prompt = `Build an encouraging starter content page for a BEGINNER faceless creator in "${niche}" on ${platform}. Return ONLY JSON: {"handle":"catchy @handle","tagline":"under 8 word tagline","bio":"2 friendly sentences","first_steps":["3 short steps to launch today each under 10 words"],"posting_plan":[{"day":"Mon","idea":"specific post","format":"faceless format"},{"day":"Tue","idea":"specific post","format":"faceless format"},{"day":"Wed","idea":"specific post","format":"faceless format"},{"day":"Thu","idea":"specific post","format":"faceless format"},{"day":"Fri","idea":"specific post","format":"faceless format"},{"day":"Sat","idea":"specific post","format":"faceless format"},{"day":"Sun","idea":"specific post","format":"faceless format"}],"links":[{"label":"button text","note":"what goes there"},{"label":"button text","note":"what goes there"},{"label":"button text","note":"what goes there"}]}`;

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
