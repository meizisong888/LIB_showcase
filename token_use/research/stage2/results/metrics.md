# Observed results: 20 paired records

Generated from [summary.json](summary.json) and [paired-comparisons.json](paired-comparisons.json). AI ratings are unconfirmed judgments, not librarian acceptance or factual accuracy rates.

| Condition | Completed / planned | Backend input | Backend output | Input change vs compact | Structure pass | AI coverage | Raw AI usable† |
| --- | --- | --- | --- | --- | --- | --- | --- |
| full_pretty | 20/20 | 123,270 | 3,385 | 5.08% higher | 20/20 | 92.33% | 19/20 |
| full_compact | 20/20 | 117,307 | 3,099 | baseline | 20/20 | 93.83% | 18/20 |
| task_fields | 20/20 | 108,209 | 3,081 | 7.76% lower | 20/20 | 94.83% | 19/20 |
| title_subjects | 20/20 | 98,209 | 2,450 | 16.28% lower | 20/20 | 14.75% | 0/20 |

Changes use full_compact as the denominator. Backend input includes common CLI/runtime instructions; local counts below cover only the fixed task and supplied record. Cached input and reasoning output are subsets, not additional totals.

† Some evaluator judgments wrongly treat statements about missing **supplied input** as contradictions of the full source. Raw usability and error scores are preserved, with scope flags below; they are not reliable staff acceptance estimates.

## Execution and observed backend usage

| Condition | Planned | Attempted requests | Attempts | Completed | Failed | Retries | Cached input | Reasoning output | Client seconds (sum) | Median seconds |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| full_pretty | 20 | 20 | 20 | 20 | 0 | 0 | 64,640 | 0 | 125.64 | 6.09 |
| full_compact | 20 | 20 | 20 | 20 | 0 | 0 | 65,664 | 0 | 134.21 | 6.42 |
| task_fields | 20 | 20 | 20 | 20 | 0 | 0 | 69,120 | 0 | 124.12 | 6.02 |
| title_subjects | 20 | 20 | 20 | 20 | 0 | 0 | 64,640 | 0 | 119.70 | 5.77 |

Elapsed time includes startup and allowance checks, not only inference. Failed and retry attempts are included in known totals.

| Phase | Actual calls | Input | Output | Cached input | Reasoning output |
| --- | --- | --- | --- | --- | --- |
| Generation | 80 | 446,995 | 12,015 | 264,064 | 0 |
| AI-assisted evaluation | 20 | 157,060 | 41,273 | 65,024 | 3,666 |

Development-session usage, monetary cost and HokieAI allocation: **not measured**. AI evaluation completed 20/20 attempted calls, with 0 retries.

## Local task-text counts for these same 20 records

| Condition | cl100k_base | o200k_base | cl100k_base reduction vs compact |
| --- | --- | --- | --- |
| full_pretty | 31,447 | 31,490 | -25.35% |
| full_compact | 25,088 | 25,527 | 0.00% |
| task_fields | 16,230 | 16,429 | 35.31% |
| title_subjects | 6,414 | 6,429 | 74.43% |

These reuse the frozen first-stage counts for the selected subset, not a repeat of the 100-record input experiment.

## Automatic checks (structure only)

| Condition | Valid JSON | Correct ID | 1–80 words | Mean description words | Evidence fields supplied | Empty | Refusal-text flags |
| --- | --- | --- | --- | --- | --- | --- | --- |
| full_pretty | 20 | 20 | 20 | 54.00 | 20 | 0 | 0 |
| full_compact | 20 | 20 | 20 | 55.10 | 20 | 0 | 0 |
| task_fields | 20 | 20 | 20 | 56.60 | 20 | 0 | 0 |
| title_subjects | 20 | 20 | 20 | 35.95 | 20 | 0 | 0 |

Word counts use whitespace splitting. These checks do not establish factual accuracy or English-language correctness. Provider refusal and truncation flags are **unknown**: the CLI does not expose them. Successful JSON parsing and absence of refusal wording are narrower observations.

## AI-assisted quality judgments

Coverage is the mean of each record’s fully covered provisional facts / fixed fact count. Partial and uncertain facts are retained separately. Omissions and unsupported claims are distinct; errors and qualifier losses can overlap and must not be added as independent error totals.

| Condition | Rated | Description errors: drafts (claims) | All raw error claims | Uncertain error claims | Limitations error claims | Input-scope flags: drafts | Drafts with qualifier loss (losses) | Covered / facts | Partial / uncertain facts | Mean coverage | Informativeness 0–3 | Usable yes / no / uncertain | Citation/schema flags |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| full_pretty | 20 | 0 (0) | 0 | 0 | 0 | 0 | 0 (0) | 75/81 | 5/1 | 92.33% | 3.00 | 19 / 1 / 0 | 1 |
| full_compact | 20 | 0 (0) | 0 | 0 | 0 | 0 | 0 (0) | 76/81 | 4/1 | 93.83% | 3.00 | 18 / 2 / 0 | 0 |
| task_fields | 20 | 0 (0) | 0 | 0 | 0 | 0 | 0 (0) | 77/81 | 3/1 | 94.83% | 3.00 | 19 / 1 / 0 | 0 |
| title_subjects | 20 | 2 (2) | 37 | 1 | 35 | 20 | 0 (0) | 12/81 | 21/0 | 14.75% | 1.60 | 0 / 20 / 0 | 12 |

“Description errors” means the evaluator’s exact flagged quotation occurs in the description, not only in limitations. This post-hoc location check does not validate the judgment. Statements about unavailable metadata may occur in either section. “Input-scope” flags request inspection against the actually supplied fields; they do not silently replace any AI score. See [individual evidence and flags](ai-evaluation.json). Citation flags identify review needs; the program does not silently repair raw evaluator judgments. A nonflagged quotation is not proof of a correct judgment.

## Description availability strata

| Stratum | Condition | Generated / structure pass | Rated | Description errors (drafts) | Qualifier loss (drafts) | Mean coverage | Informativeness | Usable yes / no / uncertain |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| description_present | full_pretty | 10/10 | 10 | 0 | 0 | 94.17% | 3.00 | 9 / 1 / 0 |
| description_present | full_compact | 10/10 | 10 | 0 | 0 | 96.67% | 3.00 | 9 / 1 / 0 |
| description_present | task_fields | 10/10 | 10 | 0 | 0 | 94.17% | 3.00 | 9 / 1 / 0 |
| description_present | title_subjects | 10/10 | 10 | 2 | 0 | 7.00% | 1.30 | 0 / 10 / 0 |
| description_missing | full_pretty | 10/10 | 10 | 0 | 0 | 90.50% | 3.00 | 10 / 0 / 0 |
| description_missing | full_compact | 10/10 | 10 | 0 | 0 | 91.00% | 3.00 | 9 / 1 / 0 |
| description_missing | task_fields | 10/10 | 10 | 0 | 0 | 95.50% | 3.00 | 10 / 0 / 0 |
| description_missing | title_subjects | 10/10 | 10 | 0 | 0 | 22.50% | 1.90 | 0 / 10 / 0 |

The sample is deliberately 10/10; it does not estimate the source collection’s 31/69 mix.

## Paired differences against full_compact

| Contrast | Stratum | Pairs | Coverage change (percentage points) | More / fewer error claims | Usability transitions |
| --- | --- | --- | --- | --- | --- |
| task_fields | all | 20 | +1.00 | 0/0 | yes -> yes: 18; no -> no: 1; no -> yes: 1 |
| task_fields | description_present | 10 | -2.50 | 0/0 | yes -> yes: 9; no -> no: 1 |
| task_fields | description_missing | 10 | +4.50 | 0/0 | yes -> yes: 9; no -> yes: 1 |
| full_pretty | all | 20 | -1.50 | 0/0 | yes -> yes: 18; no -> no: 1; no -> yes: 1 |
| full_pretty | description_present | 10 | -2.50 | 0/0 | yes -> yes: 9; no -> no: 1 |
| full_pretty | description_missing | 10 | -0.50 | 0/0 | yes -> yes: 9; no -> yes: 1 |
| title_subjects | all | 20 | -79.08 | 20/0 | yes -> no: 18; no -> no: 2 |
| title_subjects | description_present | 10 | -89.67 | 10/0 | yes -> no: 9; no -> no: 1 |
| title_subjects | description_missing | 10 | -68.50 | 10/0 | yes -> no: 9; no -> no: 1 |

The primary contrast is task_fields. full_pretty is formatting; title_subjects is an aggressive stress test. No significance, noninferiority or equivalence claim follows from these 20 pairs and AI ratings.
