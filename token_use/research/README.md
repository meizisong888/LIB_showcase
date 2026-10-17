# Library metadata research pilot

**Research question:** Which preparation steps can reduce LLM input for a library
item-description task while maintaining a useful, accurate staff draft?

**Executed:** 100 real Library of Congress records, four input conditions, two
local tokenizers, and exact field-value checks. **Pending:** actual model answers,
provider usage, and independent staff assessment. The 400 generated prompts are
prepared experimental inputs, not 400 completed model calls.

[Study protocol](protocol.md) · [Related research](references.md) ·
[Model evaluation instructions](model-evaluation.md) · [Original showcase](../README.md)

## Why this is the next experiment

The original showcase demonstrates local preparation. A research paper needs to
learn which operations help a real library task and what information or output
quality they sacrifice. This pilot isolates formatting from field selection,
uses an external real-data sample, and prepares a paired evaluation of model
responses. It does not claim to invent compression, field selection, or deduplication.

The task is to draft a description of **one catalog item**, at most 80 English
words, using only supplied metadata. Library staff would check the draft before
use. This is not collection-level archival description. The exact [task](task.txt)
is identical in every condition and is included in every token count.

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

The recorded default run succeeded. This environment did not permit `strace`
or network namespaces, so **no OS-level network-isolation or zero-syscall claim
is made for this new pilot**. The failed instrumentation attempts are recorded
in [execution.json](results/execution.json), rather than interpreted as successful
offline evidence. This does not change the older showcase's separate evidence.
Local computation and AI-assisted development are not cost-free.

## Reproduce the result

From this `token_use/research/` directory, with Python 3.11 or later:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python pilot.py --setup
.venv/bin/python pilot.py
.venv/bin/python -m unittest test_pilot test_review -v
```

Installation and `--setup` may access the network. Subsequent `pilot.py` runs
use the frozen source and local tokenizer tables. No model key is required.
Changes to frozen data, task, or configuration are rejected; a new study variant
must have its own design record. The [design lock](design-lock.json) was created
before counting; it is not a public preregistration.

The run creates `outputs/requests.jsonl` (400 requests) and
`outputs/pilot-requests.jsonl` (80 selected requests in a recorded deterministic
order), plus results and checksums. Generated prompt files and tokenizer caches
are not committed; the script regenerates them exactly.

## What is needed for a paper

A fixed [20-record quality pilot](results/quality-pilot.json) selects ten records
with descriptions and ten without, using hashes before observing model outcomes.
The same model would receive all four inputs for each item: 80 independent calls.
Its real responses and usage have **not** been collected.

Two reviewers should score the outputs with condition labels hidden: unsupported
claims, lost qualifications, informative coverage of important source facts, and
whether staff could use the draft. Reviewers identify the important facts from
the full records before seeing responses. This prevents a nearly empty but
technically accurate answer from winning simply by saying very little.

[The protocol](protocol.md) specifies paired comparisons, actual input/output
usage, failures and retries, and a quality criterion agreed with the teacher
before scoring. [prepare_review.py](prepare_review.py) imports actual outputs and
builds blinded rating sheets; it never invents model responses or human scores.
The next execution step is selecting the study's model access and reviewers.

The intended contribution is practical evidence about **which input operations
help this library workflow and where they stop being useful**. A paper-level
claim about quality requires the pending evaluation and, depending on pilot
precision, a larger or second-collection study. Deduplication, incremental work,
and keyword retrieval require different workloads and remain separate studies.

## Sources and limits

This is a curated public-data sample, not a representative survey of libraries.
The source package already standardized its metadata; derived locations can be
inaccurate. We assess faithfulness to metadata, not truth about unseen objects.
See [data provenance and reuse](data/README.md) and [six primary research sources](references.md).

No HokieAI allocation, production savings, model accuracy, or staff-time saving
has been measured. The original teaching examples remain separately available.
Software uses the repository's MIT license; source metadata retain their own
attribution and rights context.
