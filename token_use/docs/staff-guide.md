# Before you paste library materials into HokieAI

Use these six steps from the `token_use/` directory after the
[one-time setup](../README.md#quick-start). Practice on the synthetic export
first. The program prepares materials; it does not perform an AI review.

1. **Name one library task and choose its configuration.** Use
   [subject-review.json](../configs/subject-review.json) for title/abstract/subject
   matching, [research-candidates.json](../configs/research-candidates.json) for
   the Appalachian flood research query, or
   [reports-2000-2025.json](../configs/reports-2000-2025.json) for a date/type
   inventory. The last task needs only rules. Do not apply its year limit to
   subject review. Read the field list before using a different task.

2. **Prepare one export and keep its original.** The demonstration input is
   [catalog-v1.jsonl](../data/raw/catalog-v1.jsonl): one JSON object per line,
   with a unique `id`, source pointer and the fields in
   [the schema](../data/README.md). Keep your own working export in ignored
   `outputs/my-export.jsonl`, then add `--input outputs/my-export.jsonl` to
   the relevant command. Map native catalog fields to this schema first;
   this example is not a MARC importer. Preserve the complete abstract,
   edition/copy, date, language, restrictions and stable collection provenance.

3. **Run the chosen local command.** For the subject task:

   ```bash
   .venv/bin/python scripts/run.py prepare --out outputs/review
   ```

   For research use `.venv/bin/python scripts/run.py retrieve --top-k 15 --out outputs/research`.
   For the inventory use `.venv/bin/python scripts/run.py filter --out outputs/inventory`.
   To reproduce all published comparisons with network isolation, run
   `bash scripts/run_offline.sh` on supported Linux.

4. **Check exceptions and trace one item before sending.** Open
   `outputs/review/review-checks.json`: confirm every expected ID occurs in
   `members`, inspect `missing_fields`, `rule_issues`, dates and `restrictions`.
   `insufficient_material` means obtain the missing material or report that
   limit. The demo's [retention audit](../results/case1/retention.json) checks
   every kept value against the raw export; custom exports still need your
   source/schema check. Inspect `R007` (format passes but its subject is wrong),
   `R008` (missing abstract) and `R016` (copy restriction). Open a complete row:

   ```bash
   .venv/bin/python scripts/run.py show --id R016
   ```

   Research outputs retain complete descriptions and source locators; read
   qualifications and both paragraphs of `R004`. Inventory exceptions appear
   in `outputs/inventory/inventory.json`. Do not turn rule success into a
   semantic approval.

5. **Copy one complete prepared file, then verify the response.** For subject
   review, paste `outputs/review/pending.txt`; for research, paste
   `outputs/research/candidates.txt`. Each already begins with a usable
   [subject task template](../templates/subject-review.txt) or
   [research task template](../templates/research-candidates.txt), followed by
   the material. Ask for IDs, exact evidence and insufficient-material flags
   as those templates specify. Check the answer against the original before
   changing a catalog record. Do not paste caches or audit files. The count in
   `input-count.json` describes the prepared file, not HokieAI's quota debit.
   For synonyms, another language, exclusions or a need to find everything,
   widen k or cancel selection:

   ```bash
   .venv/bin/python scripts/run.py retrieve --all --out outputs/research-full
   ```

   Use `outputs/research-full/candidates.txt`. In this fixture, even top-15
   misses `R003` and `R017`; the full descriptions are available locally, not
   full archival objects. No keyword cutoff establishes exhaustive recall.

6. **On an update, reuse preparation with its dependencies.** Keep the first
   output directory, then run:

   ```bash
   .venv/bin/python scripts/run.py prepare --input data/raw/catalog-v2.jsonl --previous-cache outputs/review/cache.json --out outputs/review-v2
   ```

   Read `outputs/review-v2/status.json` for additions, changes, deleted/inactive
   IDs and reused preparations. New or changed content appears in
   `outputs/review-v2/pending.txt`. Task, template, rules, vocabulary or code
   changes cause rebuilding. **A preparation cache is not a completed-review
   log.** Use only the update batch for review if you separately retained and
   checked prior judgments; otherwise review the first batch too or rerun
   without `--previous-cache` to prepare every active record again.

| Library task | Recommended method | Information you must retain |
| --- | --- | --- |
| Subject alignment | Configured fields + exact grouping | All IDs; title, abstract, subjects, language, edition/copy, dates, restrictions, provenance |
| Date/type inventory | Rules + explicit scope | Actual dates/types, exceptions, IDs and sources |
| Research candidates | TF-IDF plus scope expansion or full source | Full description, qualifications, geography, restrictions and source |
| Updated export | Dependency-aware preparation reuse | Changes, retirement ledger, current sources and separately verified prior judgments |
