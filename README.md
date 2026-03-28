# RivalScope — AI Competitive Intelligence

**Instant competitive analysis powered by DataForSEO + Claude AI.**

Enter any domain, compare against up to 2 competitors, and get a full strategic briefing in under 30 seconds. No login required for end users.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Android-Tipster/rivalscope&env=DATAFORSEO_USER,DATAFORSEO_PASS,ANTHROPIC_API_KEY&envDescription=API%20keys%20required%20to%20run%20RivalScope)

---

## What It Does

RivalScope pulls **live SEO data** for any domain and runs it through Claude AI to generate a sharp, specific competitive intelligence briefing:

- **Traffic comparison** — organic keyword count, estimated monthly visits, traffic value
- **Top keywords table** — highest-traffic keywords with position and search volume, color-coded by rank tier
- **Visual bar charts** — instant side-by-side comparison across all domains
- **AI Strategic Briefing** — Claude analyzes the numbers and gives 3 concrete actions to take in the next 30 days

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16, React 19, Tailwind CSS v4 |
| SEO Data | DataForSEO API (domain_rank_overview + ranked_keywords) |
| AI Analysis | Claude Haiku (claude-haiku-4-5-20251001) via Anthropic SDK |
| Deployment | Vercel (recommended) or Render |

---

## Quick Start (Local)

```bash
git clone https://github.com/Android-Tipster/rivalscope
cd rivalscope
npm install

# Create .env.local with your API keys
DATAFORSEO_USER=your@email.com
DATAFORSEO_PASS=your_dataforseo_password
ANTHROPIC_API_KEY=sk-ant-...

npm run dev
# Open http://localhost:3000
```

---

## Deploy to Vercel (5 minutes)

1. Click the **Deploy with Vercel** button above
2. Connect your GitHub account and fork the repo
3. Fill in the 3 environment variables when prompted
4. Deploy

The `vercel.json` in this repo handles all configuration automatically.

---

## Environment Variables

| Variable | Source |
|---|---|
| `DATAFORSEO_USER` | [dataforseo.com](https://dataforseo.com) — free trial available |
| `DATAFORSEO_PASS` | Same DataForSEO account |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |

---

## Revenue Model

Built to be a **$49/month SaaS** or **$19/report** tool for:
- SEO agencies running competitor analysis for clients
- In-house marketers tracking competitor movements
- Founders doing pre-launch market research

The "Request Full Report" CTA in the results UI links to an email by default. Replace with a Stripe payment link to monetize.

---

## API Endpoint

**POST `/api/analyze`**

```json
{
  "target": "yoursite.com",
  "competitors": ["competitor1.com", "competitor2.com"]
}
```

Returns domain metrics for all domains, top keywords for target, and a Claude-generated strategic briefing.

---

Built with DataForSEO + Claude AI. Live data, updated in real time from Google's index.
