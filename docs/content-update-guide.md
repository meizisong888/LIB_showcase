# Content update guide

Use this guide when a product, skill, price, capability, account term, VT policy, or source changes.

## 1. Locate the record and claim

- Products: `src/data/tools.ts`
- Skills: `src/data/skills.ts`
- Tasks: `src/data/tasks.ts`
- Sources: `src/data/sources.ts`
- Safety and points: `src/data/recommendationRules.ts`

Record the exact field and visible sentence affected. Avoid broad “refresh everything” edits that make review harder.

## 2. Verify the canonical source

Prefer, in order:

1. Current Virginia Tech policy or guidance for VT availability, approval, data, academic, research, or security claims.
2. The product publisher’s current documentation for capabilities, access, pricing conditions, permissions, privacy, and compatibility.
3. A formal primary paper when a research claim—not a product claim—is needed.

Open the page. Check its publisher, date, applicable plan/account/platform, and the exact supporting passage. Never use a search summary as final evidence.

## 3. Update source scope

If the URL is new, add a unique source ID, clear title, publisher, canonical URL, source tier, supported claim scope, and `verifiedAt` date to `sources.ts`. Reuse a source only when its scope covers the new claim.

## 4. Preserve boundaries

Update what the tool does **and** what conditions or limitations changed. Keep these distinctions explicit:

- product versus model;
- capability versus workflow;
- personal versus VT/institutional account;
- included versus separately licensed feature;
- vendor statement versus this project’s evidence-based judgment.

Never infer VT approval. Use the current official approved-tools page and exact data/account language.

## 5. Review safety effects

If a product’s VT data-risk status changes, update `dataLevels`, `vtStatus`, `privacy`, `sourceIds`, recommendation tests, and visible safety content together. Use Needs review while evidence is ambiguous.

For installable items, re-check publisher ownership, source URL, license, platforms, requested permissions, network/file/command access, maintenance, transitive dependencies, and security notes.

## 6. Validate

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Then manually check the affected route, source links, keyboard focus, small-screen reflow, empty states, and browser console. Open a structured outdated-information issue when provenance or review discussion is useful.
