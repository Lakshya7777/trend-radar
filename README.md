# Content Trend Radar

A bright, beginner-friendly idea generator for faceless creators. Pick a niche,
get content ideas with step-by-step how-tos, free tools, and example-video links,
plus an auto-built content page.

**Stack:** Vite + React (frontend) and Vercel serverless functions (`/api/ideas`,
`/api/page`) that call the Anthropic API. Your API key stays on the server and is
never exposed to the browser.

---

## What you need (all free to start)

1. A **GitHub** account — github.com
2. A **Vercel** account — vercel.com (sign in with GitHub, it's free)
3. An **Anthropic API key** — console.anthropic.com

---

## Step 1 — Get your Anthropic API key

1. Go to **console.anthropic.com** and sign in.
2. Open **Settings → API Keys → Create Key**.
3. Copy the key (it starts with `sk-ant-`). **Keep it secret** — treat it like a
   password. You'll paste it into Vercel in Step 4, never into the code.

> Cost: the API is pay-as-you-go per request, and there are some free starter
> credits. To lower cost, open `api/ideas.js` and `api/page.js` and change the
> model from `claude-sonnet-4-6` to `claude-haiku-4-5-20251001`.

## Step 2 — Put this code on GitHub

Easiest (no command line):
1. On github.com, click **New repository**, name it `trend-radar`, create it.
2. On the empty repo page, click **uploading an existing file**, then drag in all
   the files/folders from this project. Commit.

Or with the command line, from this folder:
```bash
git init
git add .
git commit -m "Content Trend Radar"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/trend-radar.git
git push -u origin main
```

## Step 3 — Import into Vercel

1. Go to **vercel.com → Add New… → Project**.
2. Pick your `trend-radar` repo and click **Import**.
3. Vercel auto-detects **Vite** — leave the build settings as they are.
4. Click **Deploy**. (It'll go live, but the AI won't work yet — that's Step 4.)

## Step 4 — Add your key, then redeploy

1. In your new Vercel project: **Settings → Environment Variables**.
2. Add one variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** your `sk-ant-...` key
   - Apply to Production (and Preview/Development if you want).
3. Click **Save**.
4. Go to **Deployments → (latest) → ⋯ → Redeploy** so the key takes effect.

Open your live URL and tap **Give me ideas**. Done 🎉

---

## Run it locally (optional)

`npm run dev` runs only the frontend (the `/api` routes won't work). To test the
full thing locally, install the Vercel CLI and run `vercel dev`, then create a
`.env` file with `ANTHROPIC_API_KEY=sk-ant-...` (already git-ignored).

## Troubleshooting

- **"Missing ANTHROPIC_API_KEY"** → you skipped Step 4, or didn't redeploy after
  adding it.
- **Ideas won't load** → check the function logs in Vercel → your project →
  Deployments → Functions. A 401 means the key is wrong; a JSON parse error means
  try again (the model occasionally returns extra text).
- **Never commit your key.** It belongs only in Vercel's env vars / a local `.env`.
