# Executed experiment report

Run date: **2026-10-04**. Exact UTC times, dependency versions, probe results
and exit statuses are in [offline-run.json](../results/execution/offline-run.json).
The original experiment covers synthetic preparation and evidence retention.
The added [real public-data case](#real-public-data-case) has separate input,
outputs and execution evidence. Neither is a study of production savings or
AI-answer quality.

## Design and data

The [initial project/design note](experiment-design.md) was written before the
code. No suitable catalog data existed in the target directory. We authored
the fixed [60-row synthetic export](../data/raw/catalog-v1.jsonl), with 58
distinct task inputs, ordinary export metadata and deliberate boundary cases.
There is no filler paragraph repeated to manufacture a large baseline.
[Data provenance, schema and license](../data/README.md) explain what can be
reused publicly.

The research task is to find descriptions of how Appalachian communities
experienced or responded to river flooding. The literal query is `Appalachian
community flood river`. The per-record [gold standard](../data/retrieval-gold.json)
was authored from every complete description before retrieval ran. It records
the evidence, rationale and an insufficient-description case. The authoring
was Codex-assisted, not librarian annotation, and was not independent of the
synthetic-fixture author. [Fixture hashes](../data/fixture-lock.json) were fixed
before implementing retrieval and are checked on each demo run. The ranker
accepts only documents and query configuration, never gold labels.

## Measurement rules

- Tokenizer: **tiktoken 0.12.0**, explicit **cl100k_base** encoding. Complete
  UTF-8 files are counted locally, including task text, JSON formatting,
  group IDs, all ID/source mappings, flags and sent selection explanations.
  Literal special-token-like text is treated as ordinary text.
- Each comparison uses the same task text, JSON key order/indentation and
  counting rule on both sides. Subject baseline: complete source records.
  Retrieval baseline: the complete original corpus. Update baseline: the
  current active batch after the same field selection and grouping; it is
  **not** the larger full-export baseline from case 1.
- Reduction is `1 - prepared_tokens / baseline_tokens`. No system/chat
  wrapper, document-upload conversion, model output, currency or HokieAI
  accounting is measured. Local audits/caches are excluded from sent material.
- Retention uses equality of every selected field and source member. Recall
  is relevant source-record IDs retained divided by relevant source-record
  IDs in the fixture. Evidence retention checks the stored complete evidence
  passage in the selected description, including paragraph breaks. It does
  not score a model's understanding of that passage.

## Actual results

<!-- RESULTS:START -->

| Case / task | Input → retained or pending records | Baseline text tokens | Prepared text tokens | Input reduction | Evidence / recall | Boundary |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| 1 · Subject review | 60 → 60 | 15,231 | 13,865 | 8.97% | 60/60 IDs; 58 items; all 12 configured original fields unchanged | R007 passes format rules but still needs semantic review; R008 has insufficient material. |
| 2 · Candidates top5 | 60 → 5 | 15,212 | 1,279 | 91.59% | Recall 5/12; evidence 5/12 | Missed: R003, R004, R005, R010, R013, R015, R017; lexical decoys may remain. |
| 2 · Candidates top15 | 60 → 15 | 15,212 | 3,421 | 77.51% | Recall 10/12; evidence 10/12 | Missed: R003, R017; lexical decoys may remain. |
| 2 · Full source fallback | 60 → 60 | 15,212 | 15,212 | 0.00% | Recall 12/12; evidence 12/12 | Complete fixture supplied; relevance judgment still required. Not exhaustive outside this fixture. |
| 3 · first | 60 → 60 | 13,865 | 13,865 | 0.00% | 60 pending; 0 reused; all active IDs accounted for | Prepared material cache only; no completed AI review cached. |
| 3 · second | 60 → 4 | 13,812 | 1,076 | 92.21% | 4 pending; 56 reused; all active IDs accounted for | Prepared material cache only; no completed AI review cached. |
| 3 · task-change | 60 → 60 | 14,856 | 14,856 | 0.00% | 60 pending; 0 reused; all active IDs accounted for | Prepared material cache only; no completed AI review cached. |
| 3 · vocabulary-change | 60 → 60 | 13,844 | 13,844 | 0.00% | 60 pending; 0 reused; all active IDs accounted for | Prepared material cache only; no completed AI review cached. |
| 3 · rules-change | 60 → 60 | 13,801 | 13,801 | 0.00% | 60 pending; 0 reused; all active IDs accounted for | Prepared material cache only; no completed AI review cached. |

<!-- RESULTS:END -->

This historical table and [summary.md](../results/summary.md) retain the original
[metrics.json](../results/metrics.json). The README's combined table is rendered
from those metrics and the separate public-case metrics. The first and update
rows have different baselines as defined above; their percentages must not
be added together. Dependency-reset rows each start independently from the
second-run cache rather than accumulating changes in sequence.

## What survived and what failed

**Case 1.** All 60 IDs remain mapped to 58 exact task items; only two repeated
computations are avoided. Twelve original fields (including IDs and source
pointers) remain from the original eighteen, with all retained values unchanged.
The prepared input also adds flags and mappings, so its net reduction is modest.
That overhead is counted instead of hidden. `R007` passes all syntax and local
vocabulary rules despite its gardening/astronomy mismatch. It is still pending
semantic review. `R008` has no abstract and is marked `insufficient_material`.
The revised edition `R015`, copy B `R016`, and restrictions on `R005/R016/R020`
survive. The separate rule-only inventory logs invalid date `R018` and invalid
type `R019` as exceptions; those checks require no model.

ID coverage alone is not an information-retention test. The configured
subject-review requirements and their actual preservation are:

<!-- FIELD-RETENTION:START -->

| Required information | Nonempty source values | Preservation / exception |
| --- | ---: | --- |
| `title` | 60/60 | Equal to original for every row; retained without rewriting |
| `abstract` | 59/60 | Equal to original for every row; R008 stays empty and is explicitly insufficient |
| `subjects` | 60/60 | Equal to original for every row; R007's allowed but mismatched Astronomy term still reaches review |
| `language` | 60/60 | Equal to original for every row; retained without rewriting |
| `edition` | 60/60 | Equal to original for every row; R015 remains separate |
| `copy` | 60/60 | Equal to original for every row; R016 remains separate |
| `date` | 60/60 | Equal to original for every row; R018's invalid date remains with a rule issue |
| `material_type` | 60/60 | Equal to original for every row; R019's unrecognized type remains with a rule issue |
| `collection` | 60/60 | Equal to original for every row; retained without rewriting |
| `restrictions` | 60/60 | Equal to original for every row; R005/R016/R020 qualifications unchanged |
| `id` | 60/60 | Equal to original for every row; retained without rewriting |
| `source_locator` | 60/60 | Equal to original for every row; retained without rewriting |

<!-- FIELD-RETENTION:END -->

The task configuration determines which evidence is needed; it cannot prove
that an employee chose the right task scope. In particular, `local_shelf` was
removed for this subject task and must return for a holdings-location task.

**Case 2.** Top-5 finds only 5 of the 12 positive source rows. Its results
include repeated export descriptions, visibly consuming candidate slots.
Top-15 finds 10 of 12. It now includes `R004`, where location and response are
in different paragraphs; the complete abstract preserves both. But `R003`
uses *Blue Ridge*, *inundation* and *shared shelter*, while `R017` is Spanish.
Neither matches the English query terms. The wider result also includes
`R006` (explicit exclusions), `R009` (metaphorical flood), `R011` (wrong region),
`R012` (forecasts only) and `R014` (bibliography without relevant evidence).
Supplying the entire original corpus retains all 12 evidence passages and
removes the input reduction. No cutoff here proves completeness in a real
unlabeled collection. The twelve positives include two duplicate export rows;
this is record-level recall, not deduplicated work-level recall.

Top-5 recall is **41.67%**; top-15 recall is **83.33%**. The large input reductions
therefore come with measured omissions. Every missed positive ID is accounted for:

| ID | Narrow/wider result | Explanation grounded in the source and ranking |
| --- | --- | --- |
| R003 | Missed by both | Uses Blue Ridge, inundation and shared shelter rather than query words; zero query-term overlap. |
| R004 | Missed by top-5; included at rank 15 | Lower lexical score; location and response occupy different paragraphs, both retained when selected. |
| R005 | Missed by top-5; included at rank 13 | Relevant shelter response falls below the cutoff; source access qualification must stay attached. |
| R010 | Missed by top-5; included at rank 8 | Relevant relief ledger falls below the narrow cutoff. |
| R013 | Missed by top-5; included at rank 11 | Relevant evacuation/recovery evidence falls below the narrow cutoff. |
| R015 | Missed by top-5; included at rank 6 | Revised-edition response evidence is outside top-5; other export rows occupy candidate slots. |
| R017 | Missed by both | Spanish wording lacks the literal English query terms; retrieval has no translation. |

Ranks come from [ranking.json](../results/case2/ranking.json); source judgments
were fixed before retrieval. Widening is a recovery option, not a completeness
guarantee. Neither selection is suitable as proof of an exhaustive search.

**Case 3.** The first run prepares 60 active records as 58 items and establishes
a cache. The second export has 61 rows: `R004` was deleted, `R005` is inactive,
`R007` and `R020` changed, and `R061/R062` were added. It therefore has 60 active
records again. Preparation is reused for 56; four records produce new items.
The retired IDs are removed from the cache and logged, and current source
locators are refreshed. Separate task-field, vocabulary and rule changes
rebuild all 60 active records. The exact altered dependencies are saved beside
each result. The cache stores prepared payloads only. No actual review answers
were generated or reused; prior incomplete reviews still need completing.

Thus 92.21% refers only to the reduction in newly pending prepared input versus
the current full prepared batch. Actual AI review consumption is **not measured**.

## Real public-data case

Twelve real LOC FSA/OWI color-photograph records were acquired on 2026-10-04.
They are separate from all synthetic gold labels and boundary tests. The
[source README](../data/public-loc/README.md) documents reuse conditions,
credit, exact API request, snapshot hashes and the unfiltered first-page sample.
The [design](public-case-design.md), configuration and task prompt were fixed
before token counting; no field or record was adjusted to improve reduction.

The current counts use the revised English-only response label
`Insufficient information`. Both complete inputs were regenerated and recounted
with the same revised prompt. The manifest records the previous and current
template hashes; task scope, field selection and raw source records are unchanged.

<!-- PUBLIC-RESULTS:START -->

| Data / task | Records → items | Baseline tokens | Prepared tokens | Input reduction | Retention and limit |
| --- | ---: | ---: | ---: | ---: | --- |
| Real LOC metadata · subject-review preparation | 12 → 12 | 14,908 | 11,481 | 22.99% | All 12 IDs and 29 configured field values per row preserved; 11 records need more evidence |

<!-- PUBLIC-RESULTS:END -->

Baseline: all fields in each native bibliographic `results[i].item` object,
with the same source/member wrapper as prepared material. It excludes website
response envelopes, not selected catalog evidence. Preparation retains the 29
configured content fields and all original IDs/URLs/line pointers. Both files
contain the same task template, JSON formatting and tokenizer convention as
each other. The [retention ledger](../results/public-case/retention.json) checks
all values and lists every deleted field and source absence.

Eleven records have no summary. They remain in the prepared packet with explicit
nulls and `insufficient_material`; this is a task-evidence limitation, not an
automatic claim that the catalog is wrong. The one supplied summary retains its
uncertainty and attribution. Original date strings such as `194[1] Jan.?` are
not normalized into invented precision. All records have the native rights
advisory preserved. Similar copper-plant titles remain separate source records;
no duplicate reduction was manufactured.

The new [blocked-network run](../results/public-case-evidence/offline-run.json)
exited 0, traced zero network syscalls and passed four targeted checks. It uses
the same local tokenizer and source-value equality approach. Acquisition and
setup occur outside this run. The original synthetic core and its historical
evidence were left intact; no need to rerun those unchanged calculations just
to rewrite the explanation. The
[developer reproduction check](../results/showcase-checks/developer-check.json)
also executed the public-case command from the revised documentation and checked
its outputs. It is not a librarian user test or an independent AI evaluation.

## Input files

These files include the complete task text and exactly the material counted.

| Comparison | Baseline | Prepared / fallback | Local audit |
| --- | --- | --- | --- |
| Subject review | [Complete records](../results/case1/baseline.txt) | [All IDs, grouped task fields](../results/case1/prepared.txt) | [Field equality and mapping](../results/case1/retention.json) |
| Research candidates | [Complete descriptions and records](../results/case2/baseline.txt) | [Top-5](../results/case2/top5.txt), [top-15](../results/case2/top15.txt); baseline is full fallback | [Full ranking](../results/case2/ranking.json), [top-15 omissions](../results/case2/top15-evaluation.json) |
| Initial preparation | [Full prepared batch](../results/case3/first/baseline.txt) | [Pending batch](../results/case3/first/pending.txt) | [Initial status](../results/case3/first/status.json) |
| Updated preparation | [Current full prepared batch](../results/case3/second/baseline.txt) | [New pending batch](../results/case3/second/pending.txt) | [Update status](../results/case3/second/status.json) |
| Task changed | [Current full batch](../results/case3/task-change/baseline.txt) | [Rebuilt batch](../results/case3/task-change/pending.txt) | [Actual dependency change](../results/case3/task-change/dependency-change.json) |
| Vocabulary changed | [Current full batch](../results/case3/vocabulary-change/baseline.txt) | [Rebuilt batch](../results/case3/vocabulary-change/pending.txt) | [Actual dependency change](../results/case3/vocabulary-change/dependency-change.json) |
| Rules changed | [Current full batch](../results/case3/rules-change/baseline.txt) | [Rebuilt batch](../results/case3/rules-change/pending.txt) | [Actual dependency change](../results/case3/rules-change/dependency-change.json) |

## No-model-call evidence and its scope

One-time dependency and tokenizer setup preceded the measured run. The actual
command was `bash scripts/run_offline.sh`. It used
`unshare --user --map-root-user --net` to create a different Linux network
namespace. The namespace had only loopback. External IPv4 connection failed
with `ENETUNREACH`; IPv6 failed with `EADDRNOTAVAIL` because no usable source
address was present. Namespace identifiers, routes and probes are recorded in
[offline-run.json](../results/execution/offline-run.json), not inferred from an
`OFFLINE` environment variable. An initial verification-harness attempt rejected
the IPv6 error code; accepting that explicit unavailable-address result after
checking namespace/interfaces allowed the complete traced run. No calculation
result or label was changed in response to retrieval quality.

The full `scripts/run.py demo` process and its children were traced using
`strace -f -e trace=network`. It exited 0 and issued **zero network syscalls**;
the [raw trace](../results/execution/network-syscalls.log) records process exit.
The [code/import audit](../results/execution/code-audit.json) records the exact
source hashes and dependencies. The entry path uses Python standard-library
logic and a locally constructed `tiktoken.Encoding`. There is no inference
client, local generative-model loading, embedding call, AI compression,
AI query expansion or online fallback. `requests` is installed transitively
with tiktoken and is used by its setup downloader; it is not used by the
measured preprocessing path. No model key is needed or read.

Network blocking alone cannot prove the absence of a local model. That part
is supported by inspected code/dependencies and the explicit encoding-only
loading path. The combined evidence covers this exact run and source hashes,
not future modified code or the surrounding Codex session. Linux isolation
availability varies. The wrapper fails if its checks cannot establish blocking;
the ordinary cross-platform demo command makes no isolation claim.

Ten focused [checks](../tests/test_invariants.py) passed inside the isolated
namespace; see [their actual output](../results/execution/tests.txt). They cover
source/field preservation, editions/copies, missing abstracts, syntax-normal
semantic mismatches, observed retrieval omissions, deletion/inactivation,
current source pointers, corrupted cache payloads, dependency/template content
changes without version bumps, required-field removal, unknown status and a
missing tokenizer with no download fallback. Multiple invariants share a test.

## What was and was not measured

| Quantity | Result / observability |
| --- | --- |
| Preprocessing model/embedding calls | **0** for the inspected, executed code path; successful blocked-network run plus local-code audit |
| Prepared text input size | Measured from all complete files under `cl100k_base`; generated table above |
| Codex development / annotation usage | **Not measured**; Codex used a model, so this was not a zero-token development process |
| Independent baseline/prepared model-answer evaluation | **Not run**; no reliable isolated comparison or real usage record was collected |
| HokieAI actual allocation or financial savings | **Not measured**; no service calls made and no numerical conversion verified |
| CPU time, energy, production throughput or staff benefit | **Not benchmarked**; ordinary local computation still has cost |

The defensible outcome is reproducible preparation, counted inputs and retained
or missed evidence. It does not establish semantic answer equivalence, production
effectiveness, general recall, or end-to-end token savings. See the
[seven-step staff workflow](staff-guide.md) for the checks that remain human work.
