# Library Token Use — A Practical Showcase for Library Staff

**Prepare catalog metadata locally, then give AI the evidence it needs for a
useful staff draft.** This showcase demonstrates how ordinary programs can remove
unneeded formatting, select explicit fields and avoid repeated preparation before
sending material to a model. Staff keep the original records and check the answers.

[Description example and results](research/README.md) ·
[Staff guide: subject review](docs/staff-guide.md) ·
[Complete preparation example](docs/worked-example.md)

## What is the staff task?

**Draft a short description of one library item from its catalog metadata.**
The input includes the title, descriptive notes, dates, creator roles, subjects
and source information. The output is a draft of at most 80 English words,
with its record ID, supporting field names and limitations, ready for staff review.
The program prepares the evidence; AI drafts the text; staff decide whether it
is accurate and useful enough to use.

The showcase also includes preparing subject-review packets, finding candidate
collection materials with keywords, and preparing changed records after an update.
Each task has its own configuration and evidence requirements.

## How do we do it?

1. **Define the task before removing fields.** For item descriptions, a saved
   [configuration](research/config.json) keeps 27 of 36 fields, including title,
   description, notes, date wording, creator roles, rights, IDs and source links.
2. **Prepare the input locally.** Compact JavaScript Object Notation (JSON)
   removes formatting whitespace. Field selection copies the configured values
   unchanged. No model decides which fields to delete, and the original stays available.
3. **Check what remains.** The [field audit](research/results/field-audit.json)
   checks retained values and record identities. Missing information stays missing;
   keeping an ID or passing a format check does not prove that evidence is sufficient.
4. **Ask for the draft using a fixed task.** The [prompt](research/task.txt)
   requires source-grounded descriptions, preserved uncertainty and explicit
   limitations. This step calls a model and consumes model allowance.
5. **Review the answer against the original.** Check dates, roles, attributions,
   omitted details and source links. Restore fields or obtain more material when
   the prepared input cannot support the task.

## What do the completed experiments show?

We used **100 real Library of Congress metadata records** for input preparation
and local token counting. A fixed subset of **20 records** was used for actual
answers: four input approaches per record, **80 model calls**, followed by
**20 separate AI-assisted evaluation calls**. All completed without failures or
retries. The generator was `gpt-6.1-sol` through the official Codex CLI on
2026-10-18; every generation had a fresh context and the same settings.

The table below covers the **20-record answer comparison**. Coverage is the AI
evaluator's estimate of how much of a provisional important-fact list appears
in each description; it is **not factual accuracy or librarian approval**.

| Input approach | Backend input tokens | Backend output tokens | AI-assessed information coverage |
| --- | ---: | ---: | ---: |
| Full metadata, readable JSON | 123,270 | 3,385 | 92.33% |
| Full metadata, compact JSON | 117,307 | 3,099 | 93.83% |
| 27 task-relevant fields | 108,209 | 3,081 | 94.83% |
| Title and subjects, plus IDs/URLs | 98,209 | 2,450 | 14.75% |

Selecting task fields reduced measured backend input from **117,307 to 108,209
(7.76%)**, with similar preliminary coverage (**94.83% vs 93.83%**). This small
example does not prove unchanged quality. The title-and-subjects condition used
less input but omitted substantial detail; it is a stress test, not a staff default.

The 100-record local counting example separately found **33.81%** less input
under `cl100k_base` for task fields versus compact full metadata. Local text
counts exclude the backend's common runtime instructions. Neither percentage
measures money saved or HokieAI allocation deductions. Do not add the percentages.

The AI evaluator also made mistakes about fields absent from reduced inputs.
Raw answers, those mistakes and both favorable and unfavorable examples are
visible in the [detailed results](research/README.md). **Independent librarian
review is still pending.** This is a working example, not a validated production tool.

## See what a staff draft looks like

[This real record](research/stage2/runs/generation/row-048--task_fields/attempt-01/prompt.txt)
concerns Julie's Victory Diner sign. Its Description is empty, but its title,
photographer, date, medium and catalog notes still support a limited draft.
Here is the actual generated description from the task-field input:

> A 35 mm color slide photographed by John Margolies, titled “Julie's Victory Diner sign, State Street, Watertown, New York,” and dated 1995. The title, date, and keywords are based on information supplied by the photographer. Part of the John Margolies Roadside America photograph archive at the Library of Congress.

The [complete answer](research/stage2/runs/generation/row-048--task_fields/attempt-01/response.txt)
also retains the record ID, lists its evidence fields and says that visual details
cannot be independently confirmed. Staff should check those qualifications before
using the draft. [Follow the example step by step](research/README.md#follow-one-record-from-input-to-draft).

## Choose a starting point

| Staff task | Open these files | What still needs judgment |
| --- | --- | --- |
| Draft an item description | [Saved input, prompt and actual answers](research/README.md#follow-one-record-from-input-to-draft) | Factual support, qualifications and useful detail |
| Prepare subject-review materials | [Staff guide](docs/staff-guide.md) and [ready-made packet](results/public-case/prepared.txt) | Whether subjects fit the supplied evidence |
| Find collection candidates | [Retrieval example](docs/experiment-report.md) | Relevance and material the keyword ranking missed |
| Prepare an updated export | [Update instructions](docs/staff-guide.md) | Whether earlier judgments remain valid; the cache stores preparation only |

Read the saved inputs and outputs without installing anything. To try the
12-record subject-preparation example locally after [setup](#try-it), run:

```bash
.venv/bin/python scripts/prepare_public_case.py
```

It creates `outputs/public-review/prepared.txt`, its ID mapping and missing-information
checks. This local preparation makes no model calls; sending the packet to HokieAI
is a separate step.

## More examples: subject review, search and updates

Library staff may send catalog records and collection descriptions to AI tools
for help with subject review or research. With limited AI allocations, it is
useful to complete predictable preparation locally first: keep the task's
necessary fields, find missing material, avoid repeated preparation and retain
a route back to every original record. This project tests that approach with
runnable examples and recorded evidence.

HokieAI describes monthly metering and different allocation consumption rates
across models. Its numerical quota and token-to-allocation conversion were
**not verified** when checked on 2026-10-04. Our input counts do not measure
that meter. [Official Virginia Tech background](https://ai.vt.edu/tools/hokieai.html).
This is an independent teaching project, not an official VT or validated
production service.

### Prepare subject-review materials

**Prepare materials to check whether catalog subjects fit the title and
abstract.** The input is a local JSON Lines (JSONL) export: one record per line,
with an ID, descriptive fields, qualifications and source location. The output
is a smaller review packet, an ID/source map and a list of missing information.
Staff or AI still have to judge the meaning and verify any proposed correction.

Two clearly separated datasets support the example: 60 **synthetic** records
with controlled boundary cases, and 12 **real public Library of Congress (LOC)**
photograph records. In the real sample, 11 records have no summary. The program
flags that evidence gap; it does not invent an abstract or call it a cataloging
error.

### Rules, duplicates and updates

1. A saved configuration selects the fields needed for this task, including
   notes, dates, edition/copy context, restrictions and provenance.
2. Rules flag missing information and, in the synthetic workflow, invalid
   dates or allowed values. A format pass never means a correct subject.
3. Only identical configured task content can share one preparation item;
   every original ID and source remains mapped. Similar titles are not enough.
4. The update workflow reuses prepared material only when the record, task,
   template, rules, vocabulary and code dependencies still match. It stores
   **no completed AI review**.

A separate **Term Frequency–Inverse Document Frequency (TF-IDF)** keyword
ranker offers research candidates. It can miss synonyms, other languages and
relevant context. It is not an exhaustive search. See the
[method/retention/trade-off table](docs/methods.md#where-the-reduction-happens).

### One complete before-and-after record

This **synthetic record, R007**, comes directly from the executed experiment's
[raw export](data/raw/catalog-v1.jsonl#L7) and
[prepared packet](results/case1/prepared.txt). It describes gardening but carries
`Astronomy`. The program preserves that apparent mismatch for review; it does
not resolve it or skip it because its format is valid.

Before — the complete source record:

<!-- EXAMPLE-BEFORE:START -->

```json
{
  "abstract": "A practical book describes bean seed drying, germination tests and storage jars. Its contents concern garden cultivation and contain no astronomical observations.",
  "catalog_ui": {
    "expanded": false,
    "sort_position": 7,
    "thumbnail": "placeholder.svg"
  },
  "collection": "Synthetic teaching collection",
  "copy": "A",
  "date": "1997-06-15",
  "edition": "first",
  "export_note": "Original synthetic metadata for workflow teaching; not a real holding.",
  "id": "R007",
  "import_batch": "teaching-export-01",
  "imported_at": "2026-10-04T00:00:00Z",
  "language": "en",
  "local_shelf": "DEMO/book/007",
  "material_type": "book",
  "restrictions": "Synthetic description open for reuse; no real collection item exists.",
  "source_locator": "data/raw/catalog-v1.jsonl#L7",
  "status": "active",
  "subjects": [
    "Astronomy"
  ],
  "title": "Seed saving in a mountain garden"
}
```

<!-- EXAMPLE-BEFORE:END -->

After — the complete generated preparation item:

<!-- EXAMPLE-AFTER:START -->

```json
{
  "fields": {
    "abstract": "A practical book describes bean seed drying, germination tests and storage jars. Its contents concern garden cultivation and contain no astronomical observations.",
    "collection": "Synthetic teaching collection",
    "copy": "A",
    "date": "1997-06-15",
    "edition": "first",
    "language": "en",
    "material_type": "book",
    "restrictions": "Synthetic description open for reuse; no real collection item exists.",
    "subjects": [
      "Astronomy"
    ],
    "title": "Seed saving in a mountain garden"
  },
  "item_id": "item-915c6d85a8091d4088665c2f67774ae66ded6094f12094ae8ad0f84af96b047b",
  "members": [
    {
      "id": "R007",
      "source_locator": "data/raw/catalog-v1.jsonl#L7"
    }
  ],
  "missing_fields": [],
  "preparation_status": "ready_for_review",
  "rule_issues": []
}
```

<!-- EXAMPLE-AFTER:END -->

| What changed | Why it fits this particular task |
| --- | --- |
| Kept `title`, `abstract`, `subjects` | They are the evidence for the proposed subject check. |
| Kept `language`, `edition`, `copy`, `date`, `material_type`, `collection`, `restrictions` | These qualify interpretation and distinguish sources, versions and copies. |
| Kept ID and original location in `members` | A reviewer can trace the item back to R007 and the exact raw line. |
| Removed `import_batch`, `imported_at`, `catalog_ui`, `local_shelf`, `status`, `export_note` | Export/display details and shelf location are outside this subject task; all records in this first fixture are active. A holdings-location task would need the shelf field back. |
| Added preparation flags and item/member mapping | These are inspection aids and are included in the measured input count. |

`ready_for_review` means that required fields are present, **not that subjects
are correct**. For R008, the empty abstract remains empty and the item is marked
`insufficient_material`. The [retention audit](results/case1/retention.json)
checks all kept field values, not only ID counts. The
[worked example](docs/worked-example.md) also shows complete real-source input
and output, including a missing summary and original rights wording.

### Results for these preparation examples

Counts use **tiktoken 0.12.0 / cl100k_base**, the same task text and JSON
formatting within each comparison, including all sent IDs, source mappings,
flags and instructions. Tables are generated from actual files.

<!-- SHOWCASE-RESULTS:START -->

| Dataset / task | Text tokens: before → after | Input reduction | Retention and limitation |
| --- | ---: | ---: | --- |
| Synthetic · subject preparation | 15,231 → 13,865 | 8.97% | 60 IDs → 58 items; all 12 configured original fields checked; one missing abstract |
| Synthetic · TF-IDF top-5 | 15,212 → 1,279 | 91.59% | 5/12 relevant records; recall 41.67%; seven positives missed |
| Synthetic · TF-IDF top-15 | 15,212 → 3,421 | 77.51% | 10/12 relevant records; recall 83.33%; two positives still missed |
| Synthetic · second update | 13,812 → 1,076 | 92.21% | 56 preparations reused; four newly pending; no AI answers cached |
| Real LOC metadata · subject preparation | 14,908 → 11,481 | 22.99% | 12 IDs; 29 configured content fields plus sources preserved; 11 missing summaries |

<!-- SHOWCASE-RESULTS:END -->

These are **input-token reductions under one encoding**, not HokieAI allocation
or money savings. Top-15 still misses R003 (different English wording) and R017
(Spanish); using the full source restores the fixture's evidence with no input
reduction. The update row compares the current full prepared batch with new
pending material. Its 92.21% does not measure AI review consumption, and earlier
uncompleted reviews still need doing.

For the public sample, every configured value remains equal to its source,
including uncertain dates, complete notes and rights qualifications. Keeping
all IDs alone would not establish that. Missing summaries remain explicitly
missing. These preparation examples do not measure answer quality. The separate
20-record description comparison above includes actual answers and preliminary
AI-assisted checks, but does not establish equally good answers. [Full report](docs/experiment-report.md) ·
[Public sample source, sampling and reuse conditions](data/public-loc/README.md).

## Why the preparation itself makes no model calls

These steps run as ordinary local programs: selecting named fields, comparing
values, parsing rules, calculating hashes and word frequencies. They send no
request to a generative model or embedding service and load no local generative
model. The tokenizer counts text locally; it does not ask a model to answer.
CPU, memory and disk work still have costs.

The recorded synthetic and 12-record public-data preparation runs completed in
verified Linux network isolation, with blocked external connection probes and
**zero network system calls** in each traced preprocessing process. Ten original
checks and four new checks passed. Code inspection covers the absence of local
model loading, which network blocking alone cannot prove.
[Preparation code](scripts/prepare_public_case.py) ·
[Shared local methods](src/library_token_use/core.py) ·
[Original evidence](results/execution/offline-run.json) ·
[Public-case evidence](results/public-case-evidence/offline-run.json).
These statements cover the recorded code paths after installation/acquisition,
not future edits or the surrounding development session.

| Distinct quantity | What we know |
| --- | --- |
| Local preprocessing model calls | Zero for the inspected, executed paths. |
| Prepared input tokens | Measured locally under the named encoding. |
| Model generation and AI evaluation | Measured separately in the [20-record description example](research/stage2/results/metrics.md); both use a model. |
| Codex development usage | Not measured; development itself uses a model. |
| HokieAI actual allocation deduction | Not measured. No HokieAI call was made. |

## Prepare a subject-review packet yourself

Prepare a file → choose the task configuration → run locally → inspect
missing fields, qualifications and sources → copy the complete prepared packet
and its included task prompt to HokieAI → verify the answer against the source.

### Try it

From `token_use/`, one-time setup (network access is allowed here):

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-lock.txt
.venv/bin/python scripts/setup_tokenizer.py
```

Then run the real-source example; no download or model key is needed:

```bash
.venv/bin/python scripts/prepare_public_case.py
```

Open `outputs/public-review/baseline.txt`, `prepared.txt`, `retention.json`,
`id-map.json` and `missing-information.json`. Copy **all of `prepared.txt`**
when ready: its task prompt is already included. A missing abstract may require
more source material before a useful semantic review is possible.

| Ready-to-use file | Purpose |
| --- | --- |
| [Real example input](data/public-loc/records.jsonl) | Download the fixed 12-record public sample; GitHub's Raw view supplies the file. |
| [Task configuration](configs/public-subject-review.json) | Inspect the exact fields and required evidence. |
| [Pre-generated output](results/public-case/prepared.txt) | Read the complete counted packet without running anything. |
| [Copyable prompt](templates/public-subject-review.txt) | Existing-subject review; no invented abstracts, sources or new headings. |
| [Staff guide](docs/staff-guide.md) | Output checks, generic exports, updates and recovery instructions. |

Optional Linux verification: `bash scripts/run_public_offline.sh` reproduces
the new blocked-network run; `bash scripts/run_offline.sh` reproduces the
original synthetic comparisons. Both require `unshare`, `strace` and permitted
user/network namespaces. Ordinary Python runs do not certify network isolation.
Python 3.11+ is required; recorded runs used 3.13.11.

## When to keep more material

- The task needs full text, images, shelf location or another removed field:
  keep that evidence or cancel the projection. Restoring metadata does not
  supply an absent abstract or the underlying archival object.
- The search must find everything: do not rely on top-k. Use the full source
  and appropriate subject expertise; a wider cutoff still can miss evidence.
- Required evidence is missing: report **Insufficient information**
  and obtain it; do not manufacture an answer.
- Prior review conclusions are absent or outdated: a preparation cache is not
  permission to skip review.

Code and original documentation use the repository's [MIT license](../LICENSE).
[Synthetic data terms](data/LICENSE) and [LOC source terms](data/public-loc/README.md#source-and-reuse)
are separate. The description comparison includes real model answers and AI-assisted
checks. Independent librarian review, production savings and staff-time savings
have not been measured.
