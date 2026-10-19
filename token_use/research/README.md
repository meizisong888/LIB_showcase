# From Catalog Metadata to a Draft Description

A practical example for library staff: prepare the metadata for **one catalog
item**, ask AI for a short description, and check the draft against its sources.
The aim is to reduce unnecessary input while keeping the evidence needed for a
useful description. Everything on this page comes from saved, completed runs.

[Library Token Use showcase](../README.md) ·
[Follow one record](#follow-one-record-from-input-to-draft) ·
[All measured results](stage2/results/metrics.md) ·
[Complete answer comparisons](stage2/results/examples.md)

## The staff task

| Start with | Prepare locally | Get back from AI | Check before use |
| --- | --- | --- | --- |
| A catalog record with title, descriptions/notes, dates, creators, subjects and source information | A compact input containing the fields needed for this task | A description of at most 80 English words, its record ID, evidence fields and limitations | Supported facts, preserved qualifications, omitted details and source links |

An empty Description does not automatically make a record unusable: its title,
notes and creator roles may still support a limited draft. A program should not
invent the missing description, and neither staff nor AI should assume that they
have inspected the original photograph, map or other object.

## How the workflow works

1. **Choose the task.** The [fixed instruction](task.txt) asks for one item
   description, grounded only in the supplied metadata, with an 80-word limit.
2. **Choose fields explicitly.** [config.json](config.json) defines a 27-field
   option retaining titles, descriptions, notes, date wording, creator roles,
   subjects, rights, IDs and source context. It omits nine delivery/technical or
   derived-location fields. The program copies values; AI does not choose deletions.
3. **Compact and check locally.** JSON formatting can be made smaller without
   deleting values. The [field audit](results/field-audit.json) checks that each
   selected value matches its source. IDs and item URLs keep the result traceable.
4. **Generate the draft.** Send the prepared record with the same task instruction.
   This calls a model; the preceding local preparation does not.
5. **Review and restore evidence when needed.** Compare the draft with the
   original. Missing facts, uncertain dates and creator roles need attention.
   Use more fields or obtain more material if the prepared input is insufficient.

The example uses real Library of Congress (LOC) metadata. [Source, download date
and reuse information](data/README.md) accompany the unchanged
[100-record source file](data/loc-sample.json). These include photographs and
other collection items, not a representative sample of every library workflow.

## What was actually measured

**First, local input preparation for all 100 records.** Each record was prepared
in four ways. The same task instruction was included in every count. Counts use
tiktoken 0.12.0 with two named encodings and exclude backend runtime instructions.
The 400 resulting prompts are prepared inputs, not 400 completed model calls.

| Input condition | cl100k_base tokens | o200k_base tokens | Reduction vs compact baseline, cl100k_base |
| --- | ---: | ---: | ---: |
| All fields, readable JSON | 160,944 | 160,915 | 24.12% more input |
| All fields, compact JSON (primary baseline) | 129,671 | 131,561 | 0.00% |
| 27 task fields, compact JSON | 85,825 | 86,656 | 33.81% |
| Title and subjects only (stress test) | 31,503 | 31,550 | 75.71% |

Compacting full JSON reduced `cl100k_base` input by **19.43%** compared with
readable JSON. Selecting task fields then reduced input by **33.81%** compared
with compact full metadata. Those percentages have different starting points
and must not be added. Retained field values were unchanged, but that check alone
cannot establish answer quality. There were no exact duplicates in this sample,
so no duplicate-removal savings are claimed here.

[Per-record counts](results/per-record.csv) · [Source manifest](data/manifest.json) ·
[Full and selected input example](results/example.json)

## Actual answers for 20 of the records

**Next, the same 20 selected records were sent in all four forms: 80 real
requests.** Ten had a nonempty Description and ten did not. The selection was
fixed before seeing answers. All generations used `gpt-6.1-sol` through official
Codex CLI 0.163.0 on 2026-10-18 with the same settings. Each request had a fresh
context, no browsing or tools, and no access to other inputs or answers.

The four forms were readable full metadata (`full_pretty`), compact full metadata
(`full_compact`), 27 task fields (`task_fields`), and IDs/URLs with title and subjects
(`title_subjects`). The last is an aggressive stress test, not a recommended default.

<!-- STAGE2_TABLE_START -->
| Condition | Completed / planned | Backend input | Backend output | Input change vs compact | Structure pass | AI coverage | Raw AI usable† |
| --- | --- | --- | --- | --- | --- | --- | --- |
| full_pretty | 20/20 | 123,270 | 3,385 | 5.08% higher | 20/20 | 92.33% | 19/20 |
| full_compact | 20/20 | 117,307 | 3,099 | baseline | 20/20 | 93.83% | 18/20 |
| task_fields | 20/20 | 108,209 | 3,081 | 7.76% lower | 20/20 | 94.83% | 19/20 |
| title_subjects | 20/20 | 98,209 | 2,450 | 16.28% lower | 20/20 | 14.75% | 0/20 |
<!-- STAGE2_TABLE_END -->

Backend counts include the common CLI runtime instructions; output counts include
the whole answer, not just its description. All **80/80 generations completed**
without failures or retries and passed checks for JSON, record ID, the 80-word
limit and supplied evidence-field names. These checks establish structure, not
factual accuracy. The backend did not expose refusal/truncation flags, which
remain unknown.

The **20 separate AI-evaluation calls** compared each record's four anonymous
answers against the full source and an AI-authored important-fact list fixed
before generation. Coverage is the mean share of those facts fully conveyed.
The list and ratings have not been confirmed by librarians. The evaluator used
the same model, so self-evaluation bias remains possible.

## What staff can take from these results

- **Task fields reduced input while retaining similar preliminary coverage.**
  Backend input fell **117,307 → 108,209 (7.76%)**; AI-assessed coverage was
  **94.83% vs 93.83%** for compact full metadata. This does not prove that quality
  stayed unchanged. Coverage differences ran in opposite directions for records
  with and without a Description; the [detailed comparison](stage2/report.md)
  shows both groups.
- **The smallest input was much less informative.** Title-and-subjects input had
  **14.75%** coverage. Original dates, notes, roles and contextual details often
  could not be recovered because they were not supplied.
- **Counts depend on what is included.** For the same 20 records, local
  `o200k_base` task-text counts fell **25,527 → 16,429 (35.64%)**. Backend input
  decreased less because it also includes shared runtime instructions.
  Neither percentage measures money saved or HokieAI allocation deductions.
- **AI checks also need checking.** † The evaluator sometimes treated a correct
  statement about a field missing from reduced input as a contradiction of the
  full source. Raw usability labels are therefore review leads, not acceptance
  rates. These mistakes and citation problems are preserved with the answers.

## Follow one record from input to draft

This saved example can be read without installing software or making a new
model call. It uses **row-048**, a record for Julie's Victory Diner sign whose
Description is empty.

1. Open the [complete record with its task](stage2/runs/generation/row-048--full_compact/attempt-01/prompt.txt).
   Locate the title, John Margolies's photographer role, the 1995 date, the slide
   medium and the notes identifying photographer-supplied information.
2. Inspect the `task_fields` list in [config.json](config.json). Those descriptive
   fields and their qualifications remain; technical delivery fields are omitted.
3. Open the [prepared record and complete prompt](stage2/runs/generation/row-048--task_fields/attempt-01/prompt.txt).
   This is the exact text supplied in the completed example. If trying it in
   HokieAI, copy the **whole file**. That would be a new model call with its own
   usage and potentially a different answer; it is not part of the recorded result.
4. Read the [unedited answer](stage2/runs/generation/row-048--task_fields/attempt-01/response.txt).
   Its description is:

   > A 35 mm color slide photographed by John Margolies, titled “Julie's Victory Diner sign, State Street, Watertown, New York,” and dated 1995. The title, date, and keywords are based on information supplied by the photographer. Part of the John Margolies Roadside America photograph archive at the Library of Congress.

5. Check the ID, evidence fields and limitations against the input. The answer
   says that no descriptive text was supplied and that visual details cannot be
   independently confirmed. Staff still need to verify its wording and usefulness.
6. If a needed detail was removed, return to the complete input from step 1.
   Restoring fields cannot supply an absent description or unseen image. For your
   own metadata, define the necessary fields before adapting the task; this saved
   example is not a general-purpose importer for arbitrary library exports.

[More same-record comparisons](stage2/results/examples.md) include both directions
of change. For example, `row-018`'s task-field draft omits a card-mount detail
that the compact-full draft includes, even though the input still contains it.
Keeping a field cannot guarantee that a model will use every useful detail.

## What is complete, and what staff still need to check

| Completed | Still needs work or was not measured |
| --- | --- |
| 100-record local preparation and two-tokenizer counts | Generalization to other exports and tasks |
| 80 actual answers, raw usage and automatic structure checks | Factual and professional suitability of each draft |
| 20 independent AI-evaluation calls, with known evaluator mistakes recorded | Two independent librarian reviews; [blank review packets](stage2/human-review/README.md) are ready |
| Traceable sources, prompts, outputs and checks | Actual charges, HokieAI allocation deductions, staff time and development-session usage |

Local preparation makes no model calls. Draft generation and AI evaluation do
use a model and allowance. The 100-record local runs did not establish operating
system network isolation or zero network syscalls; the online generation run
used filesystem/context isolation and required networking. The separate older
subject-preparation examples have their own recorded offline evidence.
[Execution details](stage2/reproduction.md) keep those scopes distinct.

## Inspect the saved results locally

From `token_use/research/`, in the prepared environment:

```bash
.venv/bin/python stage2/analyze.py
.venv/bin/python stage2/render.py
.venv/bin/python stage2/verify.py
```

These commands read saved observations and make no new model calls.
[Reproduction instructions](stage2/reproduction.md) explain a fresh checkout.
The successful model requests should not be repeated just to inspect the results.

## Reproduce the input result

For the original 100-record counting example, from `token_use/research/`:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python pilot.py --setup
.venv/bin/python pilot.py
.venv/bin/python -m unittest test_pilot test_review -v
.venv/bin/python verify.py
```

Installation and tokenizer setup may access the network. Subsequent preparation
uses frozen local data and tables, with Python socket entry points blocked.
This is not a claim of operating-system network isolation. Frozen input hashes
prevent accidental changes; rerunning writes a new environment record, so retain
the historical evidence described in [the original reproduction notes](reproduction.md).

[Detailed method record](protocol.md) · [Model-checking instructions](model-evaluation.md) ·
[Background sources](references.md) · [Original field audit](results/field-audit.json)

Software uses the repository's MIT license. Source metadata retain their own
attribution and rights context. This is an independent staff showcase, not an
official LOC or VT service or a validated production workflow.
