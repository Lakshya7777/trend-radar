import { useState, useEffect } from "react";

// Content Trend Radar — Vercel build.
// Calls /api/ideas and /api/page (serverless) so the API key stays on the server.

const NICHES = [
  "AI tools & automation", "Personal finance", "Discipline & motivation",
  "Psychology facts", "History stories", "Side hustles", "Fitness & health",
  "Space & science", "Tech news", "Productivity",
];
const PLATFORMS = ["YouTube Shorts", "Instagram Reels", "TikTok", "X / Twitter", "YouTube long-form"];

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');`;
const FILLS = ["#FFE08A", "#B8F2D8", "#FFC9D4", "#C7E4FF", "#FFD8A8", "#E4D4FF"];

const yt = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const px = (q) => `https://www.pexels.com/search/videos/${encodeURIComponent(q)}/`;

async function callApi(path, payload) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("api error " + res.status);
  return res.json();
}

export default function TrendRadar() {
  const [niche, setNiche] = useState(NICHES[0]);
  const [custom, setCustom] = useState("");
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [signals, setSignals] = useState([]);
  const [page, setPage] = useState(null);
  const [saved, setSaved] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [building, setBuilding] = useState(false);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState("start");
  const [open, setOpen] = useState(null);

  const activeNiche = custom.trim() || niche;

  useEffect(() => {
    try { const v = localStorage.getItem("tr_saved"); if (v) setSaved(JSON.parse(v)); } catch (e) {}
  }, []);
  function persist(next) { setSaved(next); try { localStorage.setItem("tr_saved", JSON.stringify(next)); } catch (e) {} }

  async function scan() {
    setScanning(true); setErr(""); setSignals([]); setTab("radar");
    try {
      const data = await callApi("/api/ideas", { niche: activeNiche, platform });
      setSignals((data.signals || []).sort((a, b) => b.score - a.score).map((s) => ({ ...s, pep: data.pep })));
    } catch (e) { setErr("Hmm, that scan didn't come through. Give it another tap!"); }
    finally { setScanning(false); }
  }

  async function build() {
    setBuilding(true); setErr(""); setPage(null);
    try {
      const data = await callApi("/api/page", { niche: activeNiche, platform });
      setPage(data); setTab("page");
    } catch (e) { setErr("That didn't build — try once more!"); }
    finally { setBuilding(false); }
  }

  function toggleSave(sig) {
    const ex = saved.find((s) => s.hook === sig.hook);
    persist(ex ? saved.filter((s) => s.hook !== sig.hook) : [{ ...sig, niche: activeNiche }, ...saved]);
  }
  const isSaved = (sig) => !!saved.find((s) => s.hook === sig.hook);

  return (
    <div className="tr">
      <style>{`
        ${FONTS}
        .tr{--bg:#FFF7EC;--ink:#241d18;--mut:#7a6f63;--line:#241d18;
          --coral:#FF6B5E;--mint:#28C2A0;--sky:#3D8BFF;--sun:#FFC53D;--pink:#FF77A9;
          min-height:100vh;background:var(--bg);color:var(--ink);font-family:'Hanken Grotesk',sans-serif;
          padding:24px 18px 64px;position:relative;overflow:hidden;}
        .tr::before{content:"";position:absolute;inset:0;pointer-events:none;
          background-image:radial-gradient(#241d1815 1.4px,transparent 1.4px);background-size:22px 22px;opacity:.5;}
        .blob{position:absolute;border-radius:50%;filter:blur(8px);opacity:.5;pointer-events:none;z-index:0;}
        .wrap{max-width:880px;margin:0 auto;position:relative;z-index:1;}
        .fred{font-family:'Fredoka',sans-serif;}
        .card{background:#fff;border:2.5px solid var(--ink);border-radius:20px;box-shadow:5px 5px 0 var(--ink);}
        .lift{transition:transform .12s,box-shadow .12s;}
        .lift:hover{transform:translate(-2px,-2px);box-shadow:7px 7px 0 var(--ink);}
        .head{display:flex;align-items:center;gap:14px;margin-bottom:6px;}
        .badge-i{width:54px;height:54px;border-radius:16px;border:2.5px solid var(--ink);background:var(--sun);
          box-shadow:4px 4px 0 var(--ink);display:flex;align-items:center;justify-content:center;font-size:26px;flex:none;
          animation:bob 3s ease-in-out infinite;}
        @keyframes bob{50%{transform:translateY(-5px) rotate(-3deg)}}
        .kick{display:inline-block;background:var(--pink);color:#fff;border:2px solid var(--ink);border-radius:999px;
          font-weight:700;font-size:10.5px;letter-spacing:1.5px;text-transform:uppercase;padding:3px 11px;margin-bottom:7px;box-shadow:2px 2px 0 var(--ink);}
        .title{font-size:34px;font-weight:700;line-height:.95;letter-spacing:-.5px;}
        .sub{color:var(--mut);font-size:14px;margin:12px 0 20px;max-width:600px;line-height:1.55;}
        .panel{padding:20px;margin-top:6px;}
        .lbl{font-family:'Fredoka';font-weight:600;font-size:12px;letter-spacing:.5px;text-transform:uppercase;color:var(--ink);display:block;margin-bottom:9px;}
        .chips{display:flex;flex-wrap:wrap;gap:8px;}
        .chip{font-size:13px;font-weight:600;padding:7px 13px;border-radius:999px;border:2px solid var(--ink);
          background:#fff;color:var(--ink);cursor:pointer;transition:.12s;}
        .chip:hover{transform:translateY(-1px);box-shadow:2px 2px 0 var(--ink);}
        .chip.on{background:var(--sky);color:#fff;box-shadow:2px 2px 0 var(--ink);}
        .ipt{width:100%;background:#fff;border:2px solid var(--ink);border-radius:12px;color:var(--ink);
          padding:11px 14px;font-size:14px;font-family:inherit;outline:none;box-sizing:border-box;}
        .ipt:focus{box-shadow:3px 3px 0 var(--ink);}
        .row{display:flex;gap:20px;flex-wrap:wrap;}
        .col{flex:1;min-width:230px;}
        .btn{font-family:'Fredoka';font-weight:600;border:2.5px solid var(--ink);border-radius:14px;padding:13px 22px;
          font-size:15px;cursor:pointer;box-shadow:4px 4px 0 var(--ink);transition:.1s;}
        .btn:hover{transform:translate(-1px,-1px);box-shadow:5px 5px 0 var(--ink);}
        .btn:active{transform:translate(4px,4px);box-shadow:0 0 0 var(--ink);}
        .btn:disabled{opacity:.55;cursor:wait;transform:none;box-shadow:4px 4px 0 var(--ink);}
        .btn-coral{background:var(--coral);color:#fff;}
        .btn-mint{background:var(--mint);color:#fff;}
        .acts{display:flex;gap:12px;margin-top:18px;flex-wrap:wrap;}
        .tabs{display:flex;gap:9px;margin:26px 0 8px;flex-wrap:wrap;}
        .tab{font-family:'Fredoka';font-weight:600;font-size:13.5px;padding:8px 16px;border-radius:999px;border:2.5px solid var(--ink);
          background:#fff;cursor:pointer;transition:.1s;color:var(--ink);}
        .tab:hover{transform:translateY(-1px);}
        .tab.on{background:var(--ink);color:var(--bg);}
        .pep{background:var(--sun);border:2.5px solid var(--ink);border-radius:16px;box-shadow:4px 4px 0 var(--ink);
          padding:13px 16px;font-weight:600;font-size:14.5px;margin:14px 0 4px;display:flex;gap:9px;align-items:center;}
        .sig{padding:18px;margin-top:14px;animation:pop .35s ease both;}
        @keyframes pop{from{opacity:0;transform:translateY(10px)}}
        .sig-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;}
        .sig-name{font-family:'Fredoka';font-weight:600;font-size:19px;line-height:1.1;}
        .hook{font-size:15px;margin:10px 0;line-height:1.5;font-weight:600;}
        .hook span{background:#fff;border:2px solid var(--ink);border-radius:10px;padding:8px 12px;display:inline-block;box-shadow:2px 2px 0 var(--ink);}
        .pills{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;}
        .pill{font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;border:2px solid var(--ink);background:#fff;}
        .why{font-size:13px;color:var(--mut);margin-top:10px;font-weight:500;}
        .scorebox{text-align:center;flex:none;}
        .score{font-family:'Fredoka';font-weight:700;font-size:30px;line-height:1;background:#fff;border:2.5px solid var(--ink);
          border-radius:14px;box-shadow:3px 3px 0 var(--ink);width:62px;height:62px;display:flex;align-items:center;justify-content:center;}
        .scorelbl{font-size:9px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--mut);margin-top:5px;}
        .steps{margin-top:14px;border-top:2px dashed var(--ink);padding-top:14px;}
        .step{display:flex;gap:11px;align-items:flex-start;margin-bottom:9px;font-size:14px;font-weight:500;}
        .num{font-family:'Fredoka';font-weight:700;font-size:12px;width:24px;height:24px;border-radius:50%;border:2px solid var(--ink);
          background:var(--mint);color:#fff;display:flex;align-items:center;justify-content:center;flex:none;}
        .tools{margin-top:12px;}.tools .pill{background:var(--sky);color:#fff;}
        .links{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;}
        .ln{font-family:'Fredoka';font-weight:600;font-size:13px;text-decoration:none;color:var(--ink);border:2.5px solid var(--ink);
          border-radius:11px;padding:9px 14px;box-shadow:3px 3px 0 var(--ink);display:inline-flex;gap:7px;align-items:center;transition:.1s;}
        .ln:hover{transform:translate(-1px,-1px);box-shadow:4px 4px 0 var(--ink);}
        .ln-yt{background:#FF4D4D;color:#fff;}.ln-px{background:#fff;}
        .more{background:none;border:none;color:var(--coral);font-family:'Fredoka';font-weight:600;font-size:13px;cursor:pointer;margin-top:12px;padding:0;}
        .save{background:#fff;border:2px solid var(--ink);border-radius:10px;padding:6px 12px;font-family:'Fredoka';font-weight:600;
          font-size:12px;cursor:pointer;margin-top:14px;box-shadow:2px 2px 0 var(--ink);}
        .save.on{background:var(--sun);}
        .err{background:var(--coral);color:#fff;border:2.5px solid var(--ink);border-radius:14px;padding:12px 15px;
          font-weight:600;font-size:14px;margin-top:16px;box-shadow:3px 3px 0 var(--ink);}
        .empty{text-align:center;color:var(--mut);font-size:14px;padding:34px 14px;line-height:1.7;}
        .plan{display:flex;gap:12px;align-items:baseline;padding:11px 0;border-bottom:2px dotted var(--ink);}
        .day{font-family:'Fredoka';font-weight:700;color:var(--coral);font-size:14px;width:46px;flex:none;}
        .gstep{display:flex;gap:13px;align-items:flex-start;margin:14px 0;}
        .gnum{font-family:'Fredoka';font-weight:700;font-size:15px;width:34px;height:34px;border-radius:12px;border:2.5px solid var(--ink);
          display:flex;align-items:center;justify-content:center;flex:none;box-shadow:3px 3px 0 var(--ink);color:#fff;}
        .gtxt b{font-family:'Fredoka';font-weight:600;font-size:15px;}.gtxt p{margin:3px 0 0;font-size:13.5px;color:var(--mut);line-height:1.5;}
        .toolrow{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;}
        .foot{color:var(--mut);font-size:12px;margin-top:30px;line-height:1.6;text-align:center;}
      `}</style>

      <div className="blob" style={{ width: 200, height: 200, background: "var(--sun)", top: -40, right: -30 }} />
      <div className="blob" style={{ width: 150, height: 150, background: "var(--mint)", top: 220, left: -50 }} />
      <div className="blob" style={{ width: 170, height: 170, background: "var(--pink)", bottom: 40, right: -40 }} />

      <div className="wrap">
        <div className="head">
          <div className="badge-i">📡</div>
          <div>
            <span className="kick">Make content the easy way</span>
            <div className="title fred">Content Trend Radar</div>
          </div>
        </div>
        <p className="sub">No camera. No studio. No experience needed. Pick your niche, get ideas you can film this week — each one comes with exact steps, free tools, and example videos to copy. You've got this. ✨</p>

        <div className="card panel">
          <div className="row">
            <div className="col">
              <span className="lbl">① What's your niche?</span>
              <div className="chips">
                {NICHES.map((n) => (
                  <button key={n} className={`chip ${!custom && niche === n ? "on" : ""}`}
                    onClick={() => { setNiche(n); setCustom(""); }}>{n}</button>
                ))}
              </div>
              <input className="ipt" style={{ marginTop: 11 }} placeholder="…or type your own idea ✍️"
                value={custom} onChange={(e) => setCustom(e.target.value)} />
            </div>
            <div className="col" style={{ maxWidth: 250, flex: "0 0 250px" }}>
              <span className="lbl">② Where will you post?</span>
              <div className="chips">
                {PLATFORMS.map((p) => (
                  <button key={p} className={`chip ${platform === p ? "on" : ""}`} onClick={() => setPlatform(p)}>{p}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="acts">
            <button className="btn btn-coral" onClick={scan} disabled={scanning}>
              {scanning ? "Finding ideas… 🔍" : "✦ Give me ideas"}
            </button>
            <button className="btn btn-mint" onClick={build} disabled={building}>
              {building ? "Building… 🛠️" : "Build my page"}
            </button>
          </div>
          {err && <div className="err">😅 {err}</div>}
        </div>

        <div className="tabs">
          {[["start", "Start here"], ["radar", "Ideas"], ["page", "My page"], ["saved", `Saved · ${saved.length}`]].map(([k, l]) => (
            <button key={k} className={`tab ${tab === k ? "on" : ""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === "start" && <StartHere />}

        {tab === "radar" && (signals.length ? (<>
          {signals[0]?.pep && <div className="pep">🎬 {signals[0].pep}</div>}
          {signals.map((s, i) => (
            <SignalCard key={i} s={s} idx={i} open={open === i} setOpen={() => setOpen(open === i ? null : i)}
              onSave={() => toggleSave(s)} saved={isSaved(s)} />
          ))}
        </>) : <div className="empty">No ideas yet! 🌱<br />Pick a niche above and tap <b>Give me ideas</b>.</div>)}

        {tab === "page" && (page ? <PageView page={page} /> :
          <div className="empty">No page built yet. 📄<br />Tap <b>Build my page</b> for a ready-to-use profile + plan.</div>)}

        {tab === "saved" && (saved.length ? saved.map((s, i) => (
          <SignalCard key={i} s={s} idx={i} open={open === "s" + i} setOpen={() => setOpen(open === "s" + i ? null : "s" + i)}
            onSave={() => toggleSave(s)} saved badge={s.niche} />
        )) : <div className="empty">Nothing saved yet. ⭐<br />Tap <b>save</b> on any idea — it stays here even after you reload.</div>)}

        <div className="foot">
          Ideas are AI-generated starting points based on what performs in each niche — they're prompts to get you moving, not live trend data.
        </div>
      </div>
    </div>
  );
}

function heat(s) { return s >= 80 ? "var(--coral)" : s >= 68 ? "var(--sun)" : "var(--mint)"; }

function SignalCard({ s, idx, open, setOpen, onSave, saved, badge }) {
  const fill = FILLS[idx % FILLS.length];
  return (
    <div className="card lift sig" style={{ background: fill, animationDelay: `${idx * 70}ms` }}>
      <div className="sig-top">
        <div style={{ flex: 1 }}>
          <div className="sig-name">{s.title}</div>
          {badge && <span className="pill" style={{ marginTop: 6, display: "inline-block" }}>📁 {badge}</span>}
          <div className="hook"><span>{s.hook}</span></div>
          <div className="pills">
            <span className="pill" style={{ background: s.effort === "Easy" ? "var(--mint)" : "var(--sun)", color: "#fff" }}>{s.effort || "Easy"}</span>
            <span className="pill">⏱ {s.time || "~30 min"}</span>
          </div>
          {s.why_now && <div className="why">💡 {s.why_now}</div>}
        </div>
        <div className="scorebox">
          <div className="score" style={{ color: heat(s.score) }}>{s.score}</div>
          <div className="scorelbl">buzz</div>
        </div>
      </div>

      <button className="more" onClick={setOpen}>{open ? "▲ hide the how-to" : "▾ show me how to make it"}</button>

      {open && (<>
        <div className="steps">
          {(s.steps || []).map((st, i) => (
            <div className="step" key={i}><span className="num">{i + 1}</span><span>{st}</span></div>
          ))}
        </div>
        {s.tools?.length > 0 && (
          <div className="tools">
            <span className="lbl" style={{ marginBottom: 6 }}>Free tools you'll use</span>
            <div className="pills">{s.tools.map((t, i) => <span className="pill" key={i}>{t}</span>)}</div>
          </div>
        )}
        <div className="links">
          <a className="ln ln-yt" href={yt(s.search || s.title)} target="_blank" rel="noopener noreferrer">▶ Watch similar videos</a>
          <a className="ln ln-px" href={px(s.search || s.title)} target="_blank" rel="noopener noreferrer">🖼 Free visuals & b-roll</a>
        </div>
      </>)}

      <div><button className={`save ${saved ? "on" : ""}`} onClick={onSave}>{saved ? "★ Saved" : "☆ Save this idea"}</button></div>
    </div>
  );
}

function PageView({ page }) {
  return (
    <div className="card panel">
      <span className="lbl">Your profile</span>
      <div className="fred" style={{ fontSize: 24, fontWeight: 700 }}>{page.handle}</div>
      <div style={{ color: "var(--coral)", fontWeight: 600, fontSize: 15, margin: "4px 0 10px" }}>{page.tagline}</div>
      <div style={{ fontSize: 14.5, lineHeight: 1.6 }}>{page.bio}</div>

      {page.first_steps?.length > 0 && (<>
        <span className="lbl" style={{ marginTop: 22 }}>Launch it today — 3 steps</span>
        {page.first_steps.map((st, i) => (
          <div className="gstep" key={i}>
            <span className="gnum" style={{ background: ["var(--coral)", "var(--sun)", "var(--mint)"][i % 3] }}>{i + 1}</span>
            <div className="gtxt"><b>{st}</b></div>
          </div>
        ))}
      </>)}

      <span className="lbl" style={{ marginTop: 22 }}>Your 7-day posting plan</span>
      {(page.posting_plan || []).map((d, i) => (
        <div className="plan" key={i}>
          <span className="day">{d.day}</span>
          <span style={{ flex: 1, fontSize: 14 }}>{d.idea}<span style={{ color: "var(--mut)" }}> — {d.format}</span></span>
        </div>
      ))}

      <span className="lbl" style={{ marginTop: 22 }}>Link buttons for your bio</span>
      {(page.links || []).map((l, i) => (
        <div className="plan" key={i}>
          <span style={{ color: "var(--sky)", fontWeight: 700, fontSize: 14 }}>▸ {l.label}</span>
          <span style={{ color: "var(--mut)", fontSize: 13 }}>{l.note}</span>
        </div>
      ))}
    </div>
  );
}

function StartHere() {
  const steps = [
    ["Pick ONE niche + platform", "Don't overthink it. You picked above — that's enough to start. You can change later.", "var(--coral)"],
    ["Steal a proven format", "Tap “Give me ideas” for angles + the exact hook to say. Copy what already works in your niche.", "var(--sun)"],
    ["Make it faceless", "Screen-record or drop free b-roll, add a voiceover (your phone or ElevenLabs), then auto-caption in CapCut.", "var(--mint)"],
    ["Hook hard in 2 seconds", "Your first line decides everything. Use the hook the radar gives you — no slow intros.", "var(--sky)"],
    ["Post 3–5× a week for 30 days", "Consistency beats perfection every time. Most creators quit before this — don't be most creators.", "var(--pink)"],
  ];
  const tools = [["CapCut", "Edit + auto-captions"], ["Canva", "Thumbnails & text"], ["ElevenLabs", "AI voiceover"], ["Pexels", "Free b-roll clips"], ["Claude / ChatGPT", "Write your script"]];
  return (
    <div className="card panel">
      <span className="lbl" style={{ fontSize: 14 }}>🚀 Your first faceless video in 5 steps</span>
      <p style={{ color: "var(--mut)", fontSize: 14, lineHeight: 1.55, margin: "4px 0 18px" }}>
        You do not need a face, a camera, or a budget — just a phone and about 30 minutes. Follow these and you'll have something posted today.
      </p>
      {steps.map(([t, d, c], i) => (
        <div className="gstep" key={i}>
          <span className="gnum" style={{ background: c }}>{i + 1}</span>
          <div className="gtxt"><b>{t}</b><p>{d}</p></div>
        </div>
      ))}
      <span className="lbl" style={{ marginTop: 22 }}>🧰 Everything you need (all free)</span>
      <div className="toolrow">
        {tools.map(([n, d], i) => (
          <div className="card" key={i} style={{ padding: "9px 13px", boxShadow: "3px 3px 0 var(--ink)", background: FILLS[i % FILLS.length] }}>
            <div className="fred" style={{ fontWeight: 600, fontSize: 14 }}>{n}</div>
            <div style={{ fontSize: 12, color: "var(--mut)", fontWeight: 500 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
