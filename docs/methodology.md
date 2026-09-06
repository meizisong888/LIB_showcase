# Recommendation methodology

Last verified: 2026-09-06

## Objective

The guide recommends the best documented fit for a student’s task among currently verified VT-supported student tools. It does not compare the AI industry or measure model quality.

## Ordered decision pipeline

1. **Student access hard filter.** Keep only active services officially available to all VT students. ARC Open OnDemand is retained only when the student confirms an ARC account. Employee-only, limited-pilot, not-approved, and unverified account contexts fail here.
2. **Data-use hard filter.** The selected data category must appear in the service’s current approval record. Export-controlled data and CUI always stop with no recommendation.
3. **Required-capability hard filter.** Source grounding, file upload, coding, API, and multimodal needs are checked against capabilities explicitly documented by VT or ARC.
4. **Task-fit evaluation.** Only tools that passed all hard filters are evaluated for the selected task. Strong and supported labels organize documented alignment; they do not claim measured output quality.
5. **Result.** Return one primary recommendation and no more than two eligible alternatives. Explain every other catalog tool’s earlier exclusion or lower task fit.

The implementation is deterministic in `src/lib/recommend.ts`. It runs locally without a model call or user-data upload.

## Source and conflict rules

Student eligibility, access, capabilities, and restrictions require an official `ai.vt.edu`, `4help.vt.edu`, or `docs.arc.vt.edu` source. A source record states the exact claim scope it supports. Vendor pages and general product knowledge do not expand a VT access claim.

When sources differ, use the newest dated source for service status and audience, then use narrower official articles only for compatible capability or sign-in detail. The September 2, 2026 VT AI Tools page is the current status baseline for this review.

## Data choices

- **Public:** intentionally public or published information.
- **Internal university information:** nonpublic university information.
- **Sensitive or high-risk university information:** information requiring the approved institutional context and any additional applicable controls.
- **Export-controlled data or CUI:** prohibited in every AI tool under current VT guidance.

An AI service’s high-risk approval does not supersede a contract, research protocol, IRB term, data-use agreement, export-control obligation, course rule, or authorization decision.

## No-match behavior

The engine never relaxes a hard requirement to force a recommendation. When nothing remains it displays the canonical no-match message and explains why each catalog option failed. It does not suggest an external fallback.

## Verification and limitations

Automated validation requires complete source arrays, ISO verification dates, approved evidence domains, explicit CUI/export-control prohibitions, capabilities, tasks, and account conditions. Regression tests cover student eligibility, pilot/employee exclusions, ARC conditions, data stops, capability filtering, alternatives, and source completeness.

The guide cannot inspect the user’s files, account configuration, allocation, license, course policy, contract, research protocol, or data-use agreement. Official live sources and responsible human owners remain authoritative.
