# Disciple

Turn one sermon series into a full set of ministry resources: small group guides, daily devotionals, kids lessons, family discussion cards, social posts, email recaps, slide outlines, and series-wide promo, reading plans, and leader primers.

The web app lives in [`web/`](web/) (Next.js + TypeScript + Tailwind, using Claude through the Anthropic SDK).

## Run it locally

```bash
cd web
cp .env.example .env.local   # then add your ANTHROPIC_API_KEY
npm install
npm run dev
```

Open http://localhost:3000.

## How it's organized

| Path | What it is |
| --- | --- |
| `web/src/app/page.tsx` | Marketing landing page with pricing |
| `web/src/app/dashboard` | List of a user's series |
| `web/src/app/series/new`, `series/[id]/edit` | Series editor, including "Import from planning doc" |
| `web/src/app/series/[id]` | Resource board: generate, view, copy, and download each resource |
| `web/src/app/api/generate` | Streams one resource from Claude |
| `web/src/app/api/import` | Pulls a structured series out of a pasted planning doc |
| `web/src/lib/resources.ts` | **The resource catalog.** Add or change resource types and their instructions here |
| `web/src/lib/prompts.ts` | System prompt and how series/week details are packaged for Claude |
| `web/src/lib/storage.ts` | Browser `localStorage` persistence (placeholder until there's a database) |

## Roadmap to selling it

The current build is a working single-user prototype. Before charging other pastors, it still needs:

1. **Accounts and a database.** Swap `lib/storage.ts` for a real backend (e.g. Postgres via Supabase/Neon) with sign-in (Clerk, Auth.js, or Supabase Auth). Right now data lives only in the browser.
2. **Billing.** Stripe Checkout and the customer portal, with plan limits enforced in the API routes.
3. **Usage protection.** Rate limiting and per-plan generation quotas on `/api/generate`, because every call spends API credit.
4. **Per-church settings.** Saved church voice, Bible translation, and logo, reused across series.
5. **Better export.** DOCX/PDF/Google Docs export and branded templates.
6. **Your workflow's prompts.** Move the prompts you've already refined with Claude into `lib/resources.ts`.
