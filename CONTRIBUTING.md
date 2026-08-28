# Contributing

Contributions should make the workbench more accurate, bounded, and useful—not simply larger.

Do not include FERPA records, personal information, credentials, unpublished research, participant data, proprietary material, security incident details, or other nonpublic data in an issue or pull request.

## Start with an Issue Form

Use one of the repository’s structured forms:

- **Submit a Tool or Skill** for a scoped addition.
- **Report Outdated Information** for a fact that changed.
- **Report a Safety Concern** for unsafe guidance, omitted permissions, misleading approval language, inequity, or an accessibility barrier.

Sensitive security or privacy reports belong in the relevant private Virginia Tech or vendor reporting channel, not a public GitHub issue.

## Evidence required

Every factual contribution must include:

1. A canonical first-party source: Virginia Tech policy/guidance, the product publisher’s documentation, or a formal primary research source.
2. The exact claim the source directly supports.
3. The date the source was opened and checked, formatted `YYYY-MM-DD`.
4. The applicable product, account, plan, platform, audience, task, and data boundary.
5. Known limitations, non-use conditions, and uncertainty.

Search snippets, vendor comparison tables about competitors, ordinary blogs, social posts, GitHub stars, and generated answers are not sufficient evidence for a decision-relevant claim.

## Additional requirements for installable skills

Record all of the following:

- publisher and official source/repository URL;
- license and compatible platforms/versions;
- maintenance status and last relevant release;
- file read/write/delete scope;
- network endpoints and telemetry;
- command or code execution;
- OAuth/account scopes, tokens, environment variables, and secrets;
- transitive plugins, packages, MCP servers, and update channels;
- a safe stop, revocation, rollback, and human handoff path.

This project does not automatically install or authorize contributed skills.

## Content rules

- Distinguish products, capabilities, workflow skills, and installable integrations.
- Do not state that a product is “VT approved” unless a current official VT source says so for the exact account and data level.
- Do not convert a vendor claim into an independent finding.
- Use conditional descriptions, not universal winners or unsupported scores.
- A source link must support the nearby claim, not merely discuss the same topic.
- Use plain, professional English and write UI content so it can later be localized.

## Development workflow

```bash
npm install
npm run lint
npm run typecheck
npm test
npm run build
```

Add or update tests when changing recommendation rules, data eligibility, filters, comparison selection, or validation. For a UI change, check keyboard operation, focus visibility, 200% zoom/reflow, mobile layout, reduced motion, empty states, and console errors.

## Pull request checklist

- [ ] The change has an issue or a concise evidence-backed rationale.
- [ ] Sources, claim scope, and verification dates are complete.
- [ ] Applicability and non-use boundaries are explicit.
- [ ] Installable permission fields are complete when relevant.
- [ ] Existing unrelated work is preserved.
- [ ] Lint, typecheck, tests, and production build pass.
- [ ] No secret or sensitive data is present in code, fixtures, logs, issues, or screenshots.
