# Content update guide

Use this guide whenever VT changes a service, audience, account requirement, capability, data approval, quota, or access page.

## 1. Re-open the official evidence

Start at `https://ai.vt.edu/tools.html`. Follow its HokieAI, 4Help, or ARC documentation links. For the eligibility and capability catalog, accept only `ai.vt.edu`, `4help.vt.edu`, and `docs.arc.vt.edu` evidence.

Record the page title, URL, supported claim scope, and the date you checked it. A search snippet is not evidence.

## 2. Confirm the exact account context

Answer these before editing:

- Is the service available to all students, only students with an ARC account, employees, or a limited pilot?
- Which VT institutional account or protection indicator is required?
- Is a named capability part of included student access or a separate paid/license tier?
- Which data categories are approved, and what additional rules remain?
- Did the direct access URL or usage limit change?

If general student access is not explicit, do not mark the tool recommendable.

## 3. Update the centralized record

Edit `src/data/tools.ts`. Update the affected tool, its `officialSources` claim scopes, and `lastVerified` together. Add only capabilities the reviewed official page explicitly states.

Keep these distinctions visible:

- VT institutional account versus personal account;
- included student service versus employee purchase or pilot;
- ARC Gateway versus ARC Open OnDemand;
- high-risk approval versus permission for a specific regulated dataset;
- documented task fit versus measured AI quality.

Never add export-controlled data or CUI to `dataRiskApproval`.

## 4. Review the engine effect

Update tests whenever access, data approval, capability, task support, or ARC conditions change. Confirm the ordered filters still run before task scoring and that no-match remains possible.

## 5. Validate

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Then review the changed page at desktop and mobile widths, with keyboard navigation and an accessibility scan. Check every official source and access link.
