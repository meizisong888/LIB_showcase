# Recommendation methodology

Last verified: 2026-09-06

## Objective

The guide recommends the best documented fit for a student’s task among currently verified VT-supported student tools. It does not compare the AI industry or measure model quality.

## Ordered decision pipeline

1. **Verified VT student access hard filter.** Keep only records that pass catalog validation and represent an active service for all VT students or the explicitly conditional ARC option. Employee-only, limited-pilot, not-approved, externally evidenced, and unverified account contexts fail here.
2. **ARC-condition hard filter.** ARC Open OnDemand requires all three confirmations: an ARC account, an active allocation, and VT network or VPN access. An account without an allocation does not pass. The ARC LLM Gateway web interface does not require a separate ARC account.
3. **Data-use hard filter.** The selected data category must appear in the service’s current approval record. Export-controlled data and CUI always stop with no recommendation.
4. **Every required capability hard filter.** File upload, source grounding, current web search, citations, coding, API access, multimodal input, image generation, and dedicated instances are independent requirements checked against capabilities explicitly documented by VT or ARC. No `OR` shortcut lets one capability substitute for another.
5. **Task-fit evaluation.** Only tools that passed every hard filter are evaluated for the selected task. Strong and supported labels organize documented alignment; they do not claim measured output quality.
6. **Result.** A unique highest fit receives the `Primary recommendation` label. A shared highest fit returns every tied tool alphabetically under `Equally suitable verified matches`; catalog array order never breaks a tie. Up to two lower-fit eligible alternatives may follow.

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

Automated validation requires complete source arrays, ISO verification dates, approved evidence domains, explicit CUI/export-control prohibitions, complete ARC conditions, and resolvable source IDs plus evidence summaries for every capability and task fit. Regression tests cover deterministic catalog reordering, ties, student eligibility, pilot/employee exclusions, all ARC prerequisites, data stops, independent capability filtering, exact access links, and source resolution.

The guide cannot inspect the user’s files, account configuration, allocation, license, course policy, contract, research protocol, or data-use agreement. Official live sources and responsible human owners remain authoritative.
