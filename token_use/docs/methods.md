# What can be done before calling a model?

Decide the library task first. These programs follow explicit instructions;
they do not decide what the user really needs. A passed format rule is never
a reason to omit a record from subject review.

## A. Task-driven field selection

[subject-review.json](../configs/subject-review.json) names the fields to keep.
The subject task retains title, abstract, subjects, language, edition, copy,
date, material type, collection provenance and restrictions. Each record also
retains its ID and source locator inside its group's `members` list. Removed
fields are the import batch/time, display state, shelf export field, active
status and synthetic export note. Active status has already been applied only
in the update task. Shelf information is outside this subject-review task;
a holdings-location task would need a different field list.

**Use:** prepare material for checking whether subject terms match a title and
abstract. The list is a saved configuration, not a model's deletion judgment.
**Cannot solve:** meaning, factual accuracy, authority control, or evidence not
present in the export. A missing field becomes `null` (or retains its empty
value) with `insufficient_material`; it is not invented or silently dropped.
An invalid date is preserved with an issue. A configuration that removes a
declared required field is rejected.

The [retention audit](../results/case1/retention.json) checks every kept field
against every original record. `R007` has valid syntax and an allowed local
subject, but the gardening abstract does not support `Astronomy`. It remains
in the materials. `R008` remains despite its missing abstract. The current
checklist is sufficient for this declared synthetic task, not every cataloging
decision; reintroduce a field if the task depends on it.

## B. Rules and explicit conditions

[rules.json](../configs/rules.json) uses required-field checks, Python date
parsing, a date-shape regular expression and membership in explicit sets.
The vocabulary is a tiny teaching list, not an external authority file.
[Rule results](../results/case1/rule-results.json) identify missing abstracts,
impossible dates and unrecognized material types without a model.

**Use:** prepare an inventory of reports dated 2000–2025 with
[reports-2000-2025.json](../configs/reports-2000-2025.json). Every input ID gets
`included`, `outside_explicit_scope` or `exception_needs_review` in
[the inventory ledger](../results/rules/scoped-inventory.json). Invalid dates
and unknown types require inspection instead of being silently excluded.
**Cannot solve:** whether a valid-looking date is historically true or an
allowed heading is relevant. This date/type filter is a separate inventory
task. It is never applied to remove records from subject review or to the
research query, which has no date limitation.

## C. Exact grouping and incremental preparation

For grouping, the program compares the canonical JSON (JavaScript Object
Notation) serialization of **all selected content and preparation flags**.
Only exact matches share a task item. The full Secure Hash Algorithm 256-bit
(SHA-256) digest provides an item label; exact serialized equality, rather than
a shortened hash, determines grouping. All original IDs and locators are sent
in the item. `R001/R059` and `R002/R060` are duplicate export rows;
`R015` is a different edition and `R016` a different copy, so they stay separate.

**Use:** avoid preparing the same subject-review input twice while allowing a
decision to be mapped back to all equivalent source rows. This does not merge
catalog entities, discard copies or change source records.
**Cannot solve:** near duplicates, conflicting provenance or identity matching.
If a field affects the task, it belongs in the configuration before grouping.

The incremental fingerprint includes exported record content, the task
configuration, complete task template, rules and vocabulary content, and
implementation-file hashes. Changing contents invalidates the cache even when
a version label is not updated. Declared versions are retained for explanation.
This is deliberately conservative: even changes to nonselected record fields
rebuild preparation. Only `source_locator` is excluded from the content hash:
in this schema it is a current snapshot/line pointer, refreshed on every run.
Stable provenance is the separate `collection` field; changing it invalidates
reuse. Do not put unique provenance solely into a movable locator.

A stored prepared payload must match its stored checksum before reuse. These
are trusted local cache files with corruption checks, not authenticated audit
records. Removed or inactive IDs leave the cache and appear in `status.json`.
Unknown/missing active status is rejected by the update workflow rather than
silently interpreted as permission to skip a record.

**This cache records preparation, not completion.** The scripts never ask a
model to review anything, and no model answers enter the cache. Staff must keep
their own completed-review record. If earlier judgments do not exist, use the
original pending batch too, or rerun `prepare` without `--previous-cache`.
No timestamp alone, unchanged record text alone or format pass establishes a
reusable semantic conclusion.

## D. Keyword candidate retrieval

The implementation in [core.py](../src/library_token_use/core.py) uses Term
Frequency–Inverse Document Frequency (TF-IDF). For the title, complete abstract
and subjects, it lowercases text, extracts `[a-z0-9]+` terms and removes the
explicit stopword list. There is no stemming, translation or automatic synonym
expansion. It uses:

```text
TF(t,d) = 1 + ln(count(t,d))                 for present terms
IDF(t)  = 1 + ln((1 + number_of_records) / (1 + document_frequency(t)))
weight  = TF × IDF; divide each vector by its Euclidean length
score   = dot product of normalized query and document weights
```

Query terms absent from the corpus have zero weight. Ties use ascending record
ID. `top-k` takes exactly up to k rows, including zero-score rows if necessary;
the score and matched terms stay visible. These are sparse word-count vectors,
**not learned embeddings**. The English-oriented token pattern is a limitation
for multilingual collections.

**Use:** offer a manageable set of collection descriptions for a researcher to
inspect. The output retains the complete original abstract (no sentence or
paragraph clipping), title, relevant metadata, restrictions and source locator.
**Cannot solve:** negation, metaphor, another language, synonyms, or evidence
whose meaning spans paragraphs. For example, `R004` needs both the location
paragraph and the later flood-response paragraph. `R006`, `R009`, `R011`,
`R012` and `R014` are lexical false positives in the wider set.

Increasing k can recover some omissions, but cannot establish recall for an
unlabeled real collection. The demonstration's top-15 still omits `R003` and
`R017`. Use `retrieve --all` to cancel selection or `show --id R003` to inspect
an original record. For a search that must be exhaustive, start with all
materials and use appropriate subject expertise; a top-k ranking is inadequate.

## What the token count proves

The local tokenizer is byte-pair encoding, not model inference. Complete UTF-8
input files are serialized with the same JSON indentation, key ordering and
task text within each pair. Counting uses `encode(..., disallowed_special=())`,
so literal special-token-looking strings in records remain ordinary text.
Added group IDs, all member mappings, rule flags, retrieval scores and selection
notes are counted whenever they are in the sent file. Local audit files are
not sent and therefore are not counted. Uploading extra files or adding a
conversation changes the actual input.

`1 - prepared_tokens / baseline_tokens` is a reduction under `cl100k_base`.
It says nothing by itself about model quality, output tokens, server-side
document parsing, billing, HokieAI allocation, or Codex development cost.
