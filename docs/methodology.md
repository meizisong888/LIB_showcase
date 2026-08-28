# Methodology

Last reviewed: 2026-08-28

## Objective

AI Workbench for VT helps a person select a product and repeatable workflow for the task at hand. It does not answer which model is universally best and does not benchmark model intelligence.

## Recommendation sequence

1. **Safety hard filter.** Unknown data classification stops the process. Products whose current profile does not include the selected data boundary are excluded before points are calculated.
2. **Documented capability fit.** Every task-tool cell is Strong, Capable, Conditional, or Not focused based on documented product features. The engine then considers input, output, web, citations, file editing, coding, collaboration mode, ecosystem, access, and learning effort.
3. **Explain the result.** The main result shows a fit band, limitation, alternatives, and safety exclusions. The deterministic point calculation is disclosed only as explanation—not a benchmark or quality ranking.
4. **Dynamic human handoff.** A separate function selects a workflow skill using role, task, input, output, sensitivity, primary product, sources, files, and code needs. The result names the checks and decisions a person must complete.

Weights are declared in `src/data/recommendationRules.ts`; product matching is in `src/lib/recommend.ts`; workflow selection is independently implemented in `src/lib/selectWorkflowSkill.ts`. They are deterministic and tested. No prompt or model API participates.

## Plain-language data choices

The interface uses Public, Internal, Restricted, and Unknown as task-friendly entry points. They route toward—without replacing—the current Virginia Tech Low, Moderate, and High Risk Classification Standard. Mixed data uses the highest applicable risk.

An official high-risk product listing is still conditional on the correct VT account instance and exact data rules. Some regulated data needs additional controls or review even when a product appears on the approved-tools page.

## Inclusion criteria

A tool enters the MVP when it adds meaningful coverage across the stable General, Research, Office, or Coding families. It must have current first-party documentation for decision-relevant claims and a complete task-fit map. Task fit describes documented feature alignment, not observed output performance.

A workflow skill must include provenance, a bounded problem, use/non-use conditions, inputs, steps, reusable prompt, expected output, failure modes, human checklist, safety boundary, sources, and review date. Selected skills can also include a structured educational example with context, sample input, output sections, a likely failure, and human revision.

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
