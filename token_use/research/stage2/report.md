# Actual model generation and preliminary quality comparison

**Question:** Which model-free input-preparation operations reduce input for a
library item-description task while preserving accurate, informative drafts?
This second stage completed **80 generation calls and 20 independent AI-evaluation
calls**, with **0 failures and 0 retries** in both phases, for the frozen
20-record pilot. It adds AI-assisted assessment; **human librarian review is
still pending**. It does not measure charges or HokieAI allocation.

[Research entry](../README.md) · [All measured tables](results/metrics.md) ·
[Same-record examples](results/examples.md) · [Raw generation](runs/generation/) ·
[Raw evaluation](runs/evaluation/) · [Reproduce analysis](reproduction.md)

## Setup held constant

- **Data/task:** the same 20 frozen LOC records, ten with Description and ten
  without, each in four conditions. The exact original instruction asks for a
  public-facing item description of at most 80 English words, with ID, evidence
  fields and limitations. No sources, fields, task text or sample membership
  changed. The other 320 prepared prompts were not submitted.
- **Model/backend:** `gpt-6.1-sol`, official Codex CLI 0.163.0, existing ChatGPT
  login, run on 2026-10-18. This is the accepted catalog model identifier; an
  immutable dated model snapshot was not exposed. [Environment](environment.json)
  and [exact settings](settings.json) are recorded separately from stage one.
- **Generation:** low reasoning, identical backend defaults across conditions,
  one original user prompt per call and a 180-second client deadline. The route
  exposes no verified hard output-token cap; the shared 80-word instruction is
  not such a cap. No unsupported parameter was invented. The first formal
  request succeeded and was retained in the experiment.
- **Order/context:** the existing 80-request sequence was preserved. Each call
  used a fresh ephemeral thread and Bubblewrap filesystem/process isolation;
  repository, full sources, other answers and session history were absent.
  Browsing, retrieval, files, shell, memory and other tool capabilities were
  disabled. Only the assigned prompt plus the common CLI runtime wrapper
  entered the model context. [Evidence and limits](reproduction.md).
- **Evaluation:** at most 20 new independent calls, one per source record, using
  the same model at medium reasoning with a 300-second deadline and no retries.
  Each saw the full source, a pre-generation AI-authored fact list, and four
  answers labeled A–D in a deterministic randomized order. Conditions, token
  counts and generation sequence were hidden. The [rubric](evaluation-prompt.txt),
  [reference facts](reference-facts.json) and [label mapping](blind-key.json)
  were frozen beforehand; the mapping was withheld from the evaluator. Facts
  and judgments are not human gold labels. Same-model self-evaluation bias and
  inference of conditions from answer content remain possible.

The [design lock](design-lock.json) records one bookkeeping amendment after the
first successful call: extraction of the newly observed reasoning-usage field.
The authoritative raw object was preserved. No model input, inference option,
scoring standard or successful request changed or was repeated.

## Direct observations: execution and resource use

All **80/80 generations completed**, with **0 failed requests and 0 retries**.
Every answer passed the existing importer and expanded structure checks: valid
JSON, correct source ID, a 1–80-word description and evidence-field names present
in the assigned input. No answer was repaired or selected from multiple drafts.
No empty answer or heuristic refusal phrase was observed. Provider refusal and
truncation flags are unavailable and remain **unknown**, not measured zero.

<!-- STAGE2_TABLE_START -->
| Condition | Completed / planned | Backend input | Backend output | Input change vs compact | Structure pass | AI coverage | Raw AI usable† |
| --- | --- | --- | --- | --- | --- | --- | --- |
| full_pretty | 20/20 | 123,270 | 3,385 | 5.08% higher | 20/20 | 92.33% | 19/20 |
| full_compact | 20/20 | 117,307 | 3,099 | baseline | 20/20 | 93.83% | 18/20 |
| task_fields | 20/20 | 108,209 | 3,081 | 7.76% lower | 20/20 | 94.83% | 19/20 |
| title_subjects | 20/20 | 98,209 | 2,450 | 16.28% lower | 20/20 | 14.75% | 0/20 |
<!-- STAGE2_TABLE_END -->

The quality columns above are **unconfirmed AI judgments**, not direct accuracy
measurements. † Raw usability labels have a documented input-scope problem
described below; use them as review leads, not acceptance rates.

Generation used **446,995 input tokens and 12,015 output tokens** in the native
backend counters. Of those inputs, 264,064 were reported cached; of those
outputs, 0 were reported reasoning tokens. These subsets must not be added
again. The [phase totals](results/metrics.md#execution-and-observed-backend-usage)
report AI-evaluation input/output/cached/reasoning separately and preserve every
known attempted-call usage object. Development-session consumption is unknown.
Subscription inference still has computational and allowance costs.

For the primary comparison, backend input fell **117,307 → 108,209 (7.76%)**;
output was **3,099 → 3,081**. Local counts of the same task text were
**25,088 → 16,230 (35.31%)** under `cl100k_base` and
**25,527 → 16,429 (35.64%)** under `o200k_base`. The backend includes a common
runtime wrapper: in this run every generation's reported input exceeded its
local `o200k_base` count by 4,589. This observed offset does not establish an
official tokenizer specification or a universal overhead constant.

Readable → compact formatting reduced measured backend input by **4.84%**.
Title-and-subjects input was **16.28%** lower than compact full input. Different
denominators must not be added. These are neither monetary savings nor measured
HokieAI deductions. Cached-prefix variation, fixed request order and startup
overhead also prevent treating the small latency differences as a speed claim.

## AI-assisted judgments: interpret separately from structure

The [full results](results/metrics.md#ai-assisted-quality-judgments) report errors,
lost qualifications, coverage, informativeness and usability by condition, with
both description strata and per-record paired differences. Fully covered facts
count toward coverage; partial and uncertain facts are listed separately.
Omission and invention are different outcomes. A short answer does not earn a
high score merely by avoiding concrete claims.

<!-- QUALITY_INTERPRETATION_START -->
- **Primary: task_fields vs full_compact.** Mean per-record coverage was
  **94.83% vs 93.83%**, a paired difference of **+1.00 percentage point**.
  Raw usable judgments were **19/20 vs 18/20**: 18 pairs yes/yes, one no/no,
  one compact-no/task-yes. This is a small descriptive difference, not evidence
  of superiority or unchanged quality. Coverage was **2.50 points lower** for
  the ten description-present records and **4.50 points higher** for the ten
  description-missing records. A pooled figure would hide that difference.
- **Formatting: full_pretty vs full_compact.** Coverage was **92.33% vs 93.83%**
  (−1.50 points), while raw usable labels were 19/20 vs 18/20. The underlying
  record values were identical. This variation reinforces why a single output
  per condition cannot establish invariant quality from serialization alone.
- **Aggressive removal: title_subjects vs full_compact.** Coverage was
  **14.75% vs 93.83%** (−79.08 points), and mean informativeness was **1.60 vs
  3.00** on the fixed 0–3 rubric. In the two strata, sparse coverage was 7.00%
  with a source Description and 22.50% without one. Raw usable labels were
  0/20, but all 20 sparse drafts have input-scope flags: that raw acceptance-like
  number is especially unsuitable as a validated quality rate. The raw answers
  nevertheless visibly omit source details that were removed from their inputs.

The evaluator flagged no unsupported/contradicted claims or material qualifier
losses for the three fuller conditions. It flagged 37 contradicted claims and
one uncertain claim in the sparse condition; **these are not 37 established
hallucinations**. Thirty-five of the contradicted quotes occur in limitations;
the other two description quotes also discuss unavailable metadata. Scope
mistakes affect their interpretation. The evaluator recorded no qualifier-loss
items in any arm; absence of such AI flags is not proof that qualifications are
always correct.

Thirteen candidate judgments have citation-check flags (one readable-full and
twelve sparse). Two records also attracted concerns about the provisional fact
list: `row-092`'s group-level morning date and `row-038`'s implied lack of
independent verification. The first concern leaves one fact uncertain in each
fuller arm; its denominator was not silently changed. The complete raw concerns
and fact-level reasoning are retained for human review.
<!-- QUALITY_INTERPRETATION_END -->

These are paired observations from one answer per condition, not a repeatability
or equivalence test. No practical loss margin was agreed with human reviewers.
The fixed fact list contains composite facts: omitting one detail can turn an
entire fact from covered to partial even if the evaluator still calls the draft
usable. That choice and the relevance of each fact need human review.

## A failure in the evaluator, retained rather than hidden

For `row-100`, title-and-subjects input contains no Description, Date_text or
Rights field. Its raw answer correctly says **“No rights information is
supplied.”** The evaluator sees the full source's `Rights` value, **“No known
restrictions on publication.”**, and calls the answer a contradiction. It also
penalizes truthful statements about missing description/date input.

This is an evaluator scope mistake: the full source is the reference for what a
useful description could say, but it is not the text supplied to every generator.
The resulting raw error and usability scores must not be presented as reliable
factual-error rates. The [raw evidence](runs/evaluation/row-100/attempt-01/response.txt)
and [actual limited prompt](runs/generation/row-100--title_subjects/attempt-01/prompt.txt)
allow this to be checked directly.

A **post-hoc diagnostic**, added after seeing this problem, locates flagged
quotes in descriptions versus limitations and flags input-availability claims
for comparison with the actual prompt. It does not silently fix the evaluator's
scores. Citation checks separately flag nonverbatim or unmatched quotations.
An exact quote alone does not prove a sound judgment. Raw outputs, scope flags
and original AI labels all remain available in [ai-evaluation.json](results/ai-evaluation.json).
The fixed evaluator prompt was not rewritten mid-run, and no evaluation was
repeated to obtain a better score.

## Same-record answers, including unfavorable differences

[The worked comparisons](results/examples.md) print all four complete raw
answers for selected records, their source facts and the unedited evaluator
explanations. The frozen design called for the first record in each stratum
plus both extremes of the primary coverage/usability difference. The analysis
operationalizes the extremes by coverage delta, reports usability alongside,
and breaks ties by the original schedule. Choosing coverage as the scalar
was an analysis-time clarification, not a separately preregistered formula. [Selection reasons](results/example-selection.json)
are machine-readable; the full dataset is also published.

In `row-100`, full and task-field answers retain the scene, qualified date and
copyright/rights context. The sparse answer gives only the title and indexed
subjects. Those omissions are visible without accepting the evaluator's flawed
error labels. Other selected pairs show that full and projected inputs can
produce different detail choices even when the relevant source field is retained.
Specifically, `row-018`'s compact draft includes “on card mount,” while the
projected draft omits that detail despite retaining `Medium`; coverage falls
from 4/4 to 3/4. For `row-048`, the projected draft includes photographer-supplied
keyword provenance omitted by the compact draft, increasing coverage from 3/4
to 4/4. Both directions are shown. One stochastic answer per arm cannot isolate
all causes of those differences.

## What remains for humans, and what the checks establish

Two [blank reviewer packets](human-review/README.md) contain source records,
source-fact worksheets and anonymized responses. They contain **no human scores**.
Two reviewers should first establish a shared factual reference without viewing
answers, then independently judge supported claims, material qualifications,
useful detail and editing needs. Preserve disagreements and any adjudication.
The AI-generated reference and rubric do not substitute for that process.

[Developer verification](results/verification.json) checks frozen hashes, exact
saved prompts, unique threads, observed tool events, raw answer/event agreement,
anonymous evaluation payloads, pending human sheets and unchanged stage-one
evidence. Resume is checked with the backend disabled so verification cannot
submit an accidental extra request. [Run-file hashes](results/run-file-hashes.json)
make published observations auditable. This is not librarian user testing.

Online inference requires networking. This run claims filesystem/context
isolation and no observed tool events, **not** blocked network syscalls, a packet
capture or access to provider internals. The original offline/counting evidence
has not been upgraded to a stronger claim.

Remaining limits include only 20 deliberately balanced records from one curated
metadata sample; source ambiguity and no inspection of original objects; a
single model alias and one output per condition; fixed generation order and
unexposed provider termination flags; AI-written references, same-model judgment
bias and evaluator errors. Human acceptance, repeat-run variability, real costs,
HokieAI allocation, staff time and development usage remain unmeasured. **No
quality-equivalence, librarian-approval or production-savings claim is made.**
