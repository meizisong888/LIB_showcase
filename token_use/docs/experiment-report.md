# Executed experiment report

Run date: **2026-10-04**. Exact UTC times, dependency versions, probe results
and exit statuses are in [offline-run.json](../results/execution/offline-run.json).
This is an experiment on synthetic preparation and evidence retention, not a
study of production savings or AI-answer quality.

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

This table, the README table and [summary.md](../results/summary.md) are generated
from the same [metrics.json](../results/metrics.json). The first and update
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

**Case 3.** The first run prepares 60 active records as 58 items and establishes
a cache. The second export has 61 rows: `R004` was deleted, `R005` is inactive,
`R007` and `R020` changed, and `R061/R062` were added. It therefore has 60 active
records again. Preparation is reused for 56; four records produce new items.
The retired IDs are removed from the cache and logged, and current source
locators are refreshed. Separate task-field, vocabulary and rule changes
rebuild all 60 active records. The exact altered dependencies are saved beside
each result. The cache stores prepared payloads only. No actual review answers
were generated or reused; prior incomplete reviews still need completing.

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
[six-step staff workflow](staff-guide.md) for the checks that remain human work.
