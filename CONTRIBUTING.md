# Contributing

Contributions should keep this project accurate, small, and explicitly limited to Virginia Tech students.

Do not put credentials, student records, participant data, export-controlled information, CUI, unpublished research, proprietary material, or other nonpublic data in an issue, fixture, screenshot, or pull request.

## Evidence required

A recommendable tool must have current official evidence from `ai.vt.edu`, `4help.vt.edu`, or `docs.arc.vt.edu` that directly supports student eligibility and the recorded account boundary. Each changed claim must include its supporting URL, claim scope, and the date the page was opened.

Do not infer student access from a consumer free tier, personal registration, educational discount, employee license, pilot, or product popularity. Do not infer a capability that the reviewed official pages do not state.

## Update workflow

1. Open the live VT AI Tools page and any linked VT or ARC documentation.
2. Resolve audience or status conflicts in favor of the newest, clearest official source.
3. Update `src/data/tools.ts`, including source scope and `lastVerified`.
4. Keep the institutional account distinct from personal or separately licensed editions.
5. Update recommendation and validation tests.
6. Run:

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

For UI changes, also check keyboard operation, focus visibility, small-screen reflow, screen-reader names, color contrast, reduced motion, and browser console errors.

## Pull request checklist

- [ ] Current official VT/ARC evidence verifies general student access or an explicit ARC-account condition.
- [ ] Every capability and limit has a matching official claim scope.
- [ ] Institutional and personal account contexts are clearly separated.
- [ ] Export-controlled data and CUI remain a complete stop.
- [ ] Employee-only and limited-pilot records cannot enter ordinary student results.
- [ ] Existing unrelated work is preserved.
- [ ] Lint, typecheck, tests, and production build pass.
