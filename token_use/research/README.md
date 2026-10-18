# Library metadata research pilot

**Research question:** Which preparation operations that do not call a model
can reduce input tokens for library item descriptions while keeping the drafts
accurate and informative?

**Input preparation and counting are complete. Actual generation is complete:
80/80 requests.** Automatic checks and **20 independent AI-evaluation calls** are complete
and reported below. **Librarian evaluation remains pending.** The study has not
measured monetary charges, HokieAI allocation or staff time.

[Observed model results](stage2/report.md) · [Same-record answers](stage2/results/examples.md) ·
[Study protocol](protocol.md) · [Sources](data/README.md) ·
[Human review materials](stage2/human-review/README.md) · [Original showcase](../README.md)

## Library task and comparison

A staff member needs an informative description of **one catalog item**, no
more than 80 English words, grounded only in its supplied metadata. The model
returns the item ID, draft, evidence fields and limitations. Staff still need
to check it before use. This is not collection-level archival description,
subject-heading assignment or automated catalog publication.

The frozen data contain 100 real records from the Library of Congress (LOC)
Labs Free to Use and Reuse package, downloaded on 2026-10-17. We retain the
[original source](data/loc-sample.json) and [provenance and reuse terms](data/README.md).
The 20 model-evaluation records were selected before seeing answers: ten with
nonempty Description and ten without. The same records, [task](task.txt) and
[conditions](config.json) are used throughout:

| Condition | What the model receives | Comparison purpose |
| --- | --- | --- |
| `full_pretty` | All 36 fields in readable JSON | Formatting comparison |
| `full_compact` | All 36 fields in compact JSON | Primary baseline |
| `task_fields` | 27 predefined fields, retaining dates, notes, roles, rights and descriptive evidence | Primary field-selection comparison |
| `title_subjects` | IDs, URLs, title and subjects only | Aggressive stress test; not a recommended workflow |

Preparation uses local JSON operations, explicit field lists and hashes.
Generation itself **does call a model**. On 2026-10-18, the official Codex CLI
0.163.0 used the existing ChatGPT login and model identifier `gpt-6.1-sol`.
Generation settings were identical across all four conditions. Every request
used a fresh isolated context with no repository, source-file, history or
retrieval access. Evaluation used separate anonymous contexts with the same
model; possible self-evaluation bias remains. [Execution and isolation evidence](stage2/reproduction.md).

## Real generation results and initial quality comparison

The table covers the **20 paired records**, not all 100 source records.
Backend input includes common CLI runtime instructions. Output includes the
entire answer, including supporting JSON fields. The local counts below use a
different scope and must not be substituted for provider usage.

<!-- STAGE2_TABLE_START -->
| Condition | Completed / planned | Backend input | Backend output | Input change vs compact | Structure pass | AI coverage | Raw AI usable† |
| --- | --- | --- | --- | --- | --- | --- | --- |
| full_pretty | 20/20 | 123,270 | 3,385 | 5.08% higher | 20/20 | 92.33% | 19/20 |
| full_compact | 20/20 | 117,307 | 3,099 | baseline | 20/20 | 93.83% | 18/20 |
| task_fields | 20/20 | 108,209 | 3,081 | 7.76% lower | 20/20 | 94.83% | 19/20 |
| title_subjects | 20/20 | 98,209 | 2,450 | 16.28% lower | 20/20 | 14.75% | 0/20 |
<!-- STAGE2_TABLE_END -->

All 80 generations completed without retries. Automatic checks confirm valid
JSON, matching IDs, descriptions within the 80-word limit and evidence-field
names present in the corresponding input. These are **structure checks, not
factual accuracy**. Provider truncation/refusal flags were not exposed and remain
unknown; raw answers and native usage objects are preserved.

The AI evaluator uses full source records and a provisional important-fact list
fixed before generation. The list and ratings are **not human-confirmed**.
Coverage credits only fully conveyed facts; omissions are separate from invented
claims. † Raw AI usability judgments need particular caution: the evaluator
sometimes penalized a correct statement that a field was absent from a reduced
input because the full source contained it. Those scores are preserved with
scope flags, not silently repaired. They are not librarian acceptance rates.
The primary contrast showed mean AI coverage of **94.83% for task_fields vs
93.83% for full_compact**, with different directions in the two source strata.
The sparse condition's **14.75%** coverage signals substantial missing detail.
These judgments do not establish unchanged quality or professional usability.
See the [paired comparisons, both description strata and evaluator limitations](stage2/report.md).

For these 20 records, task fields reduced local `o200k_base` input from
**25,527 to 16,429 (35.64%)**; measured backend input fell from **117,307 to
108,209 (7.76%)**. The difference reflects shared runtime overhead. Cached input
and reasoning tokens are subsets of input/output, not additional totals.
Generation, evaluation and unknown development usage are reported separately.
No input reduction here is a measured HokieAI quota or financial saving.

## Read an actual same-record comparison

The first scheduled record, [row-100](stage2/results/examples.md#row-100-unfinished-steel-structure-intact-after-quake-san-francisco),
concerns an unfinished steel structure after the San Francisco earthquake.
The source Description also mentions a man among rubble and burned brick and
stone buildings; `Date_text` is `c1906.`. These fields exist in both the full
and task-field inputs and are absent from title-and-subjects input.

Actual `task_fields` description:

> Photographic print dated “c1906.” The catalog describes San Francisco’s earthquake and fire disaster, with a man standing among rubble, an unfinished but intact steel structure in the background, and remnants of burned-out brick and stone buildings nearby. A note states that the photograph was copyrighted by George R. Lawrence & Co., Chicago. Rights metadata states: “No known restrictions on publication.”

Actual `title_subjects` description:

> Titled “Unfinished steel structure intact after quake, San Francisco,” this item is cataloged with subject headings for San Francisco skyscrapers and earthquakes, 1900–1910.

The latter also correctly says that no Description or rights field was supplied.
Its omitted scene detail and date illustrate reduced information, not proof of
invented facts. The evaluator incorrectly treated those input-limit statements
as source contradictions. [The complete raw answers and evaluation](stage2/results/examples.md)
make this failure visible. Further examples include the first sparse-source
record and both extremes of the primary coverage difference, with original-order
tie breaking, rather than only examples favorable to reduction.

## What is complete, and what remains

| Component | Status and boundary |
| --- | --- |
| 100-record preparation, two tokenizers, field-value checks | Complete; original evidence preserved |
| 20 records × four conditions | 80 real generations complete; other prepared prompts were not submitted |
| Automatic structure checks | Complete; no factual-accuracy claim |
| AI-assisted paired evaluation | 20 independent calls complete, producing 80 candidate judgments; documented evaluator errors, no human gold standard |
| Two independent human reviewers | Pending; [two blank packets](stage2/human-review/README.md) are ready |
| Money, HokieAI allocation, staff editing time, development usage | Not measured |

This small, deliberately balanced pilot does not establish quality equivalence,
professional acceptance or general production savings. The source metadata can
be uncertain or wrong; no unseen objects were independently verified. A model
alias without an immutable snapshot, one response per condition, fixed request
order, the shared runtime wrapper and evaluator errors limit generalization.
The title-and-subjects condition is a stress test even if it uses the fewest tokens.

## Reproduce the saved analysis without model calls

From `token_use/research/` in the prepared environment:

```bash
.venv/bin/python stage2/analyze.py
.venv/bin/python stage2/render.py
.venv/bin/python stage2/verify.py
```

These read saved observations. [Reproduction details](stage2/reproduction.md)
cover setup on a fresh checkout, exact commands, resumability, usage accounting
and developer checks. They do not claim librarian user testing. New inference
would consume model allowance; the existing successful calls must not be repeated
as if they were free preprocessing.

## What was actually measured

The source is the LOC Labs official 100-item sample from its Free to Use and
Reuse package. All rows are used. We keep the [original downloaded bytes](data/loc-sample.json)
and [source manifest](data/manifest.json), acquired 2026-10-17. Source records have
36 fields; 31 have nonempty descriptions and 69 do not. Missing descriptions
remain missing; titles and notes may still provide usable evidence.

Counts below sum **100 separately prepared prompts** per condition, using
tiktoken 0.12.0. These are text counts, excluding provider message framing.

| Input condition | cl100k_base tokens | o200k_base tokens | Reduction vs compact baseline, cl100k_base |
| --- | ---: | ---: | ---: |
| All fields, readable JSON | 160,944 | 160,915 | 24.12% more input |
| All fields, compact JSON (primary baseline) | 129,671 | 131,561 | 0.00% |
| 27 task fields, compact JSON | 85,825 | 86,656 | 33.81% |
| Title and subjects only (stress test) | 31,503 | 31,550 | 75.71% |

Read the comparisons separately:

- **Formatting:** readable → compact JSON saves **19.43%** under cl100k_base
  while preserving every parsed field and value.
- **Field selection:** complete compact JSON → 27 task fields saves another
  **33.81%**, preserving the original values of all 27 configured fields.
  The second encoding gives **34.13%** for that same comparison.
- **Sparse input:** keeping only IDs, URLs, title and subjects saves **75.71%**
  against compact full input, but removes notes, dates, rights and other evidence.
  It is a stress test, not a recommended workflow.

The first two percentages have different denominators and must not be added.
Task fields versus readable full JSON is 46.67% lower, but the 33.81% figure
isolates field selection after formatting has already been improved.

All 100 IDs remain in every condition. The task projection retains titles,
descriptions, notes, dates, creator roles, subjects, rights, and source context;
it removes nine delivery/technical or enriched-location fields. Full details
are in [config.json](config.json) and the [field audit](results/field-audit.json).
Exact equality of retained values is **not proof of equivalent model answers**.
There are no duplicate IDs, exact full records, or exact configured task-content
records in this sample; no deduplication savings are claimed.

[Machine-readable results](results/summary.json) ·
[Every record's counts](results/per-record.csv) ·
[First source record and its variants](results/example.json) ·
[Prompt checksums](results/prompt-inventory.json)

## What makes the preparation model-free

The program uses JSON serialization, explicit field lists, hashes, and local
tokenization. It loads no language model or embedding model. Source acquisition
and tokenizer setup are separate online steps; default runs require verified
local tables and block Python socket entry points.

The supplied run succeeded, but its environment did not permit `strace` or
network namespaces. The failed attempts remain in the original
[execution.json](results/execution.json). A separate
[local reproduction](reproduction.md) matched all eight totals and the generated
artifact hashes; it did not perform OS isolation or syscall tracing either.
**Neither run establishes OS-level network isolation or zero network syscalls
for this pilot.** This does not change the older showcase's separate evidence.
Local computation and AI-assisted development are not cost-free.

## Reproduce the input result

From this `token_use/research/` directory, with Python 3.11 or later:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python pilot.py --setup
.venv/bin/python pilot.py
.venv/bin/python -m unittest test_pilot test_review -v
.venv/bin/python verify.py
```

Installation and `--setup` may access the network. Subsequent `pilot.py` runs
use the frozen source and local tokenizer tables. No model key is required.
Changes to frozen data, task, or configuration are rejected; a new study variant
must have its own design record. The [design lock](design-lock.json) was created
before counting; it is not a public preregistration.

`verify.py` checks frozen and generated hashes, count totals, request identities,
and local documentation links. Running `pilot.py` writes a new
`results/run-environment.json`; the published original and this integration's
separate environment record are explained in [reproduction.md](reproduction.md).

The run creates `outputs/requests.jsonl` (400 requests) and
`outputs/pilot-requests.jsonl` (80 selected requests in a recorded deterministic
order), plus results and checksums. Generated prompt files and tokenizer caches
are not committed; the script regenerates them exactly.

## What is still needed for a paper

Two independent reviewers should identify important facts from the full sources
before seeing answers, freeze an agreed reference, and score the blinded drafts.
The teacher and reviewers still need a practical quality margin; none is invented
from these outcomes. Preserve independent ratings and disagreements before any
adjudication. [Evaluation instructions](model-evaluation.md) explain the files.

The contribution is task-specific evidence about which input operations help
and where they stop being useful. A broader claim needs human assessment and,
depending on pilot precision, additional collections or a larger study. Exact
deduplication, incremental processing and keyword retrieval require different
workloads and remain separate from this description experiment.

See [six primary research sources](references.md) and the original
[stage-one reproduction](reproduction.md). Software uses the repository's MIT
license; source metadata retain their attribution and rights context.
