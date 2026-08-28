# AI Workbench for VT

## Live Website

**[Open AI Workbench for VT →](https://meizisong888.github.io/LIB_showcase/)**

A task-first, evidence-aware Capstone MVP for Virginia Tech students, faculty, staff, and researchers. It helps a user choose an AI product for a specific task, adopt a repeatable workflow skill, understand when not to use it, and verify the result.

> Independent capstone project. Not an official Virginia Tech service.

The site is static and runs entirely in the browser. It has no login, database, analytics, paid model API, automatic installation, or server-side form processing.

## What is included

- A rule-based Task Finder with safety hard filters, documented capability-fit bands, visible calculation details, alternatives, dynamic workflow selection, and a human-only stop path.
- Eight researched product profiles spanning VT-protected, general, research, source-grounded, office, and coding workflows.
- An accessible 8 × 8 task-tool matrix, stable product-family filters, and side-by-side comparison for up to three tools.
- Twelve complete skills: ten workflow skills and two installable coding-agent reviews.
- Skill filters for task, role, AI compatibility, type, input, risk, internet, authorization, and code execution.
- Four worked educational examples plus copyable prompts, failure modes, verification lists, data warnings, and source links.
- Four role scenarios that prefill the finder without sending task data to a server.
- Responsible AI guidance grounded in official Virginia Tech sources.
- Methodology, source register, contribution flow, content guide, and usability evaluation plan.
- Three structured GitHub Issue Forms and a GitHub Pages workflow.

## Technology

- React 19 + TypeScript
- Vite 8
- React Router
- Vitest + Testing Library
- ESLint
- Static TypeScript data modules; no backend

## Local development

Requires Node.js 24 or a compatible current Node release.

```bash
npm install
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`.

## Validation

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

The build creates both `dist/index.html` and `dist/404.html`. The fallback lets direct client-side routes load on GitHub Pages while preserving routes such as `/recommend` and `/skills/:slug`.

## Content architecture

```text
src/data/sources.ts               canonical source register
src/data/tools.ts                 product profiles
src/data/tasks.ts                 eight task entry points
src/data/skills.ts                workflow and installable skills
src/data/recommendationRules.ts   visible weights and safety messages
src/data/scenarios.ts             role-based illustrative finder scenarios
src/lib/recommend.ts              deterministic recommendation engine
src/lib/selectWorkflowSkill.ts    independent workflow-skill selection
src/lib/validation.ts             evidence and completeness checks
src/pages/                        route-level experiences
```

UI copy that is reused across the site starts in `src/i18n/en.ts`, providing an initial boundary for future localization. Content data remains separate from components so it can later move to translated or externally managed records.

## Recommendation boundary

Safety eligibility is evaluated before fit. An unknown classification returns no product. For internal or restricted data, only products with current VT evidence for the selected boundary remain eligible. A high-risk product listing is still not permission for every regulated dataset; contracts, IRB protocols, export controls, data-use agreements, and account configuration can add requirements.

After safety filtering, the engine maps each product’s documented task capability as Strong, Capable, Conditional, or Not focused, then accounts for input, output, live web, sources, file editing, coding, collaboration mode, ecosystem, access, and learning effort. The user-facing result shows a fit band; the point calculation is available only as an explanation detail. It does not claim measured model quality or rank the industry.

See [Methodology](docs/methodology.md) and the live `/methodology` route.

## GitHub Pages

The production base path is `/LIB_showcase/`. The workflow at `.github/workflows/deploy.yml` runs lint, typecheck, tests, and build before uploading the Pages artifact.

Repository administration still needs to enable GitHub Pages with **GitHub Actions** as the source under **Settings → Pages → Build and deployment → Source**. The project does not change remote settings or secrets. If the repository name changes, update `base` in `vite.config.ts`.

## Documentation

- [Contributing](CONTRIBUTING.md)
- [Methodology](docs/methodology.md)
- [Content update guide](docs/content-update-guide.md)
- [Capstone usability evaluation plan](docs/usability-evaluation-plan.md)

## Current limits

- Product capabilities, prices, policies, and account terms change. The live canonical source is authoritative.
- The finder cannot inspect a file, license, contract, administrator setting, course rule, IRB, or data-use agreement.
- Product profiles describe evidence reviewed on 2026-08-28, not guaranteed availability.
- Installable skills are documented only; the site never installs or authorizes them.
- Browser-only content validation runs at build/test time and does not replace editorial review.

## License

Project code and original content are provided under the MIT License. Product names belong to their respective owners. No Virginia Tech logo is used.
