# VT Student AI Guide

**[Open the live guide](https://meizisong888.github.io/LIB_showcase/)**

VT Student AI Guide is a task-first recommender for Virginia Tech students. It recommends only AI services that a current Virginia Tech or ARC source explicitly says students can access. It does not compare the wider AI industry, rank model quality, or fill gaps with products a student can buy or register for independently.

> Independent student project. It is not an official Virginia Tech service. Official pages remain authoritative.

The site is static and runs entirely in the browser. Form selections are not uploaded, no account is created, and no model API is called.

## Current recommendation catalog

Core tools available to all VT students:

1. HokieAI
2. Google Gemini App through Virginia Tech
3. Google NotebookLM through Virginia Tech
4. Microsoft Copilot Chat through Virginia Tech
5. ARC LLM Gateway

ARC Open OnDemand LLMs are a conditional option. They enter the eligible set only when the student confirms all three documented prerequisites: an ARC account, an active ARC allocation, and VT network or VPN access.

All tool information was re-verified on **2026-09-06**. The VT AI Tools page reports that it was last updated on **September 2, 2026**.

## Inclusion standard

A tool can enter the recommendation catalog only when current official evidence verifies all of the following for the exact service and account context:

- student eligibility;
- VT or ARC institutional access requirements;
- service status;
- the capability recorded in the data file;
- the applicable data-risk approval and prohibitions;
- known account, cost, quota, allocation, or session conditions.

For eligibility and access evidence, this project accepts only Virginia Tech-controlled sources on `vt.edu`, `4help.vt.edu`, or `docs.arc.vt.edu`. Product popularity, a consumer free tier, educational discounts, personal registration, vendor marketing, and general knowledge are not evidence of VT student access.

The institutional version and personal version of a product are never treated as interchangeable. Students must use the exact VT account identified on the tool card. A personal Google or Microsoft account does not automatically receive Virginia Tech’s documented data protections.

## Why common external AI products are excluded

Consumer ChatGPT, Claude, Perplexity, GitHub Copilot, and other self-registered or self-purchased products are not ordinary recommendations because the reviewed VT sources do not establish them as generally provided student services. Google AI Pro and licensed Microsoft 365 Copilot are excluded because the current VT Tools page describes them as employee products requiring departmental purchase.

ChatGPT Edu is also excluded from all recommendation results. The current VT page describes it as a limited 500-user pilot ending in December 2026, not a service available to the general student population. The project does not infer general access from the existence of that pilot.

## Recommendation algorithm

The form builds a `TaskProfile` from a precise goal and separate mandatory-feature choices. Its ten goals are:

1. brainstorm ideas or create a first draft;
2. revise or improve existing writing;
3. summarize uploaded readings or documents;
4. ask questions using only provided sources;
5. research current information with web sources or citations;
6. write, explain, or debug code;
7. build an API-based or automated research workflow;
8. understand an image, diagram, screenshot, or voice input;
9. generate or edit an image;
10. ask a quick general question.

File upload, source grounding, web search, citations, coding, API access, multimodal input, image generation, and a dedicated instance are independent Boolean requirements. Coding never implies API access, and image generation never implies that a tool can understand image input.

The deterministic engine runs in this order:

```text
verified VT student access hard filter
→ ARC account/allocation/network hard filter
→ data-use restriction hard filter
→ every mandatory capability hard filter
→ documented task-fit classification
→ recommendation result
```

Task-fit classification never runs for a tool that failed an earlier stage. Every selected function is a pass/fail constraint. ARC Open OnDemand fails unless account, active allocation, and network/VPN access are all confirmed; the ARC LLM Gateway web interface does not require a separate ARC account.

If one eligible tool has the highest documented fit, the result labels it `Primary recommendation`. If two or more tools share that fit, the interface labels the group `Equally suitable verified matches`, shows every tied tool alphabetically, and does not claim that the first item is better. Catalog array order is never a tiebreaker. In both cases the interface states:

> This project’s documented-fit classification based on official VT capabilities, not a Virginia Tech ranking or performance benchmark.

Export-controlled data and Controlled Unclassified Information (CUI) stop the process with no recommendation. Virginia Tech explicitly states that these categories are not authorized for use with any AI tool. If no tool passes every selected requirement, the interface displays:

> No verified Virginia Tech student AI tool currently matches all of these requirements.

It never recommends an external fallback merely to produce a result.

See [the full methodology](docs/methodology.md).

## Official sources

- [AI Tools & Access at Virginia Tech](https://ai.vt.edu/tools.html)
- [HokieAI](https://ai.vt.edu/tools/hokieai.html)
- [HokieAI for Instructors — KB0016456](https://4help.vt.edu/sp?id=kb_article&sysparm_article=KB0016456)
- [Understanding Google’s AI Tools — KB0016244](https://4help.vt.edu/sp?id=kb_article&sysparm_article=KB0016244)
- [Understanding Microsoft Copilot with Enterprise Data Protection — KB0014762](https://4help.vt.edu/sp?id=kb_article&sysparm_article=KB0014762)
- [Copilot Chat and Microsoft 365 Copilot differences — KB0015697](https://4help.vt.edu/sp?id=kb_article&sysparm_article=KB0015697)
- [ARC LLM Gateway documentation](https://docs.arc.vt.edu/ai/010_llm_arc_vt_edu.html)
- [ARC Open OnDemand LLM documentation](https://docs.arc.vt.edu/ai/020_ood_arc_vt_edu.html)

Where an older knowledge article and the dated VT Tools page differ, the project uses the September 2, 2026 VT Tools page for current status and audience, while retaining narrower capability details only when they do not expand student eligibility.

## Data model and maintenance

All recommendation records and their source objects are centralized in [`src/data/tools.ts`](src/data/tools.ts). Every capability and task-fit record names the exact source IDs supporting it; a tool-level source list alone is not sufficient. Every tool includes:

```ts
{
  id,
  name,
  status,
  studentAvailability,
  eligibility,
  requiredAccount,
  accessUrl,
  accessCta,
  costOrLimits,
  verifiedCapabilities,
  supportedTasks,
  dataRiskApproval,
  prohibitedData,
  conditionalRequirements,
  notSuitableWhen,
  officialSources,
  lastVerified
}
```

To update or add a tool:

1. Re-open the current VT AI Tools page and the linked VT/ARC documentation.
2. Confirm that the exact service is explicitly available to students; otherwise do not add it as recommendable.
3. Record only capabilities directly supported by those official pages, and add `sourceIds` plus an `evidenceSummary` to every capability record.
4. Separate institutional, employee, pilot, paid, and personal account contexts.
5. Bind every task-fit record—especially every `strong` fit—to specific official source IDs.
6. Update source claim scopes and `lastVerified` together.
7. Add or update regression tests for eligibility, data restrictions, independent capabilities, deterministic ties, and all ARC prerequisites.
8. Run every validation command below.

See [the content update guide](docs/content-update-guide.md) and [contribution rules](CONTRIBUTING.md).

## Technology and local development

- React 19 and TypeScript
- Vite 8
- React Router
- Vitest and Testing Library
- ESLint
- Playwright and axe for visual/accessibility checks

Requires Node.js 24 or a compatible current release.

```bash
npm install
npm run dev
```

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

For a built preview, start `npm run preview -- --host 127.0.0.1` and run `npm run check:visual` in another terminal. Production uses hash-based routing so every GitHub Pages route starts from a successful root-document request; the build also creates `dist/404.html` as a fallback.

## Current limits

- The recommender cannot classify the user’s actual file or determine course, IRB, contract, export-control, or data-use-agreement permissions.
- A high-risk approval is not blanket authorization for every regulated dataset.
- Capabilities, quotas, models, licenses, and VT policies can change after the displayed verification date.
- The recommendation describes documented fit among the current VT-supported student tools; it does not measure output quality or guarantee correctness.

## License

Project code and original content are provided under the MIT License. Product names belong to their owners. No Virginia Tech or product logo is used.
