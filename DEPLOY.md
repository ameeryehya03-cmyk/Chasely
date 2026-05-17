# Chasely — Deployment Guide
## Total time: ~45 minutes. No server experience needed.

---

## STEP 1 — Get your free accounts (10 min)

Sign up for all three (all free):
- **Vercel**: https://vercel.com/signup (sign in with GitHub)
- **Supabase**: https://supabase.com/dashboard/sign-up
- **Google Cloud**: https://console.cloud.google.com

---

## STEP 2 — Set up Supabase (5 min)

1. Go to https://supabase.com → New project
2. Name it: `chasely` | Pick a strong password | Region: Middle East (or closest)
3. Wait ~2 min for it to provision
4. Click **SQL Editor** in the left sidebar
5. Paste the entire contents of `supabase-schema.sql` and click **Run**
6. Go to **Settings → API** and copy:
   - `Project URL` → this is your `SUPABASE_URL`
   - `service_role` key (under "Project API keys") → this is your `SUPABASE_SERVICE_KEY`
   ⚠️ Keep the service_role key secret — never put it in frontend code

---

## STEP 3 — Set up Google OAuth (10 min)

1. Go to https://console.cloud.google.com
2. Create a new project → name it `chasely`
3. Go to **APIs & Services → Enable APIs** → search "Google Calendar API" → Enable
4. Go to **APIs & Services → OAuth consent screen**
   - User type: External
   - App name: Chasely | Add your email
   - Scopes: add `https://www.googleapis.com/auth/calendar.events`
   - Save
5. Go to **Credentials → Create Credentials → OAuth 2.0 Client ID**
   - Application type: Web application
   - Authorised JavaScript origins: `https://your-app.vercel.app` (and `http://localhost:3000` for testing)
   - Copy the **Client ID** → paste it into `public/index.html` replacing `YOUR_GOOGLE_CLIENT_ID`

---

## STEP 4 — Get your Anthropic API key (2 min)

1. Go to https://console.anthropic.com
2. Click **API Keys → Create Key**
3. Copy it — this is your `ANTHROPIC_API_KEY`
   ⚠️ This is what costs money (~$0.01 per analysis). Set a usage limit in the console.

---

## STEP 5 — Deploy to Vercel (10 min)

### Option A: Via GitHub (recommended)
1. Push this folder to a GitHub repo:
   ```
   cd chasely
   git init
   git add .
   git commit -m "Initial Chasely deploy"
   gh repo create chasely --public --push
   ```
2. Go to https://vercel.com → New Project → Import your `chasely` repo
3. Click **Environment Variables** and add these 4:

   | Key                    | Value                          |
   |------------------------|-------------------------------|
   | ANTHROPIC_API_KEY      | sk-ant-...your key...          |
   | SUPABASE_URL           | https://xxx.supabase.co        |
   | SUPABASE_SERVICE_KEY   | eyJ...your service key...      |
   | ADMIN_SECRET           | any strong password you choose |

4. Click **Deploy** → wait 2 min → you have a live URL!

### Option B: Via Vercel CLI
```bash
npm install -g vercel
cd chasely
npm install
vercel
# Follow prompts, then add env vars in Vercel dashboard
```

---

## STEP 6 — Add your domain (optional, ~5 min)

1. Buy `chasely.io` or `getchasely.com` on Namecheap (~$10/yr)
2. In Vercel → your project → **Settings → Domains** → add your domain
3. Follow the DNS instructions (just copy 2 DNS records to Namecheap)

---

## STEP 7 — Test everything

1. Open your Vercel URL
2. Sign up with your real email
3. Go to Supabase → Table Editor → `leads` — you should see your signup
4. Upload a WhatsApp screenshot → check it extracts details
5. Click "Add to Google Calendar" → a popup asks for Google permission → check your calendar

---

## VIEWING YOUR LEADS

To download all leads as a CSV, make this request (replace values):
```
curl -H "x-admin-key: YOUR_ADMIN_SECRET" \
  "https://your-app.vercel.app/api/leads?format=csv" \
  -o chasely-leads.csv
```

Or open in browser: `https://your-app.vercel.app/api/leads?format=csv`
with header `x-admin-key: your-password`

For a quick view use a browser extension like "ModHeader" to set the header,
or just check Supabase directly → Table Editor → leads.

---

## COSTS (monthly)

| Service     | Free tier               | Paid if exceeded       |
|-------------|-------------------------|------------------------|
| Vercel      | Unlimited deploys       | $20/mo (Pro)           |
| Supabase    | 50,000 rows free        | $25/mo                 |
| Anthropic   | Pay per use ~$0.01/req  | Just usage             |
| Google Cal  | Free                    | Free                   |
| Domain      | $10/year                | Renewal                |

**At 100 users/day → ~$30/month total. At <10 users/day → ~$0.**

---

## NEXT STEPS TO GROW

1. **Share on Instagram**: record a 30-second reel showing screenshot → calendar event appearing in real time. Post from @thecareercloser.
2. **WhatsApp groups**: drop the link in Dubai real estate / broker groups with "free tool for agents"
3. **Follow up your leads**: export weekly, DM them about Trifid Media / PagePro / Huspy referrals
4. **Add a referral flow**: give users a share link, track who refers who (add a `referred_by` column to leads table)
5. **Monetize later**: add a Stripe paywall for a "Pro" tier (unlimited reminders, team sharing, WhatsApp bot)
