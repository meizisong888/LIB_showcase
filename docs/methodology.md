# Methodology

Last reviewed: 2026-08-28

## Objective

AI Workbench for VT helps a person select a product and repeatable workflow for the task at hand. It does not answer which model is universally best and does not benchmark model intelligence.

## Recommendation sequence

1. **Safety hard filter.** Unknown data classification stops the process. Products whose current profile does not include the selected data boundary are excluded before points are calculated.
2. **Conditional fit.** The engine scores only user-stated needs: task, input, web, citations, file editing, coding, collaboration, ecosystem, access, and learning effort.
3. **Explain the result.** Every addition, deduction, safety exclusion, close call, and tool limitation is shown.
4. **Human handoff.** The result includes a workflow skill, optional installable-skill review, source links, data reminder, and verification checklist.

Weights are declared in `src/data/recommendationRules.ts`; execution is in `src/lib/recommend.ts`. They are deterministic and tested. No prompt or model API participates in ranking.

## Plain-language data choices

The interface uses Public, Internal, Restricted, and Unknown as task-friendly entry points. They route toward—without replacing—the current Virginia Tech Low, Moderate, and High Risk Classification Standard. Mixed data uses the highest applicable risk.

An official high-risk product listing is still conditional on the correct VT account instance and exact data rules. Some regulated data needs additional controls or review even when a product appears on the approved-tools page.

## Inclusion criteria

A tool enters the MVP when it adds meaningful coverage across general assistance, source-grounded research, live-web research, office ecosystems, university-protected access, or coding. It must have current first-party documentation for decision-relevant claims.

A workflow skill must include a bounded problem, use/non-use conditions, inputs, steps, reusable prompt, expected output, failure modes, human checklist, safety boundary, sources, and review date.

An installable skill additionally requires publisher, official source, license, compatible platforms, requested permissions, file/network/command access, maintenance state, and security notes.

## Source hierarchy

- **Official:** Virginia Tech or the product publisher. Required for policy, VT approval, access, capability, privacy, and current plan claims.
- **Curated:** A workflow judgment assembled under this project’s declared review criteria.
- **Community:** A discovery lead that must be independently checked before inclusion or installation.

Source scope is recorded with each source. A URL is not treated as evidence for claims outside its scope.

## Verification status

- **Verified:** the record has sources, a valid review date, boundaries, and all type-specific required fields as of the date shown.
- **Needs review:** evidence or a required field is absent or uncertain.
- **Outdated:** current authoritative evidence contradicts a displayed claim.

Validation automatically prevents a structurally incomplete record from displaying as Verified. Editorial review remains necessary.

## Update process

1. Open the canonical page; never validate from a search snippet.
2. Check product/account/plan/platform scope and the page’s update date.
3. Compare the exact stored claim to the source.
4. Update the record, source scope, and verification date together.
5. Add or update a regression test when eligibility or scoring changes.
6. Run lint, typecheck, tests, and production build.
7. Mark uncertain evidence Needs review instead of filling the gap.

## Limitations

The MVP cannot determine a user’s true data class, license, contract, course rule, account settings, IRB terms, or data-use agreement. It cannot guarantee model output or current feature availability. Official live sources and responsible human owners remain authoritative.
