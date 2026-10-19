# Model evaluation: actual generation and preliminary AI assessment

The fixed 20-record sample has **80 real answers**, one per record and condition,
using `gpt-6.1-sol` through official Codex CLI 0.163.0 and an existing ChatGPT
login on 2026-10-18. All generation calls completed, with no failures or retries.
All 20 separate AI-evaluation calls also completed without retries.
The [stage-two report](stage2/report.md) records the actual AI evaluation status,
paired results, known evaluator problems and remaining human work.

The original 400 prompts are still prepared inputs. Only the selected 80 were
submitted for generation. Evaluation calls are a separate phase and are not
additional generation replicates. The first-stage token tables remain historical
input measurements, not model-usage totals.

## Inspect the completed workflow

1. The [sample](results/quality-pilot.json), [task](task.txt), [configuration](config.json)
   and 80 prompts were verified against their frozen hashes. No sample, field
   selection or source data changed. The [execution lock](stage2/design-lock.json)
   preceded the first formal call.
2. The [launcher](stage2/transport.py) starts each call in a new ephemeral process
   with source/repository/history absent, tools disabled and only that request's
   user text. [Settings](stage2/settings.json) record the accepted model alias,
   reasoning levels, deadlines, retry caps and unavailable hard output-token cap.
   Common CLI runtime instructions are part of backend input usage.
3. [Native generation logs](stage2/runs/generation/) preserve exact prompts,
   raw answers, original usage objects, timing, completion states and thread IDs.
   No completed answer was repaired or regenerated to improve quality.
4. The existing [importer](prepare_review.py) validated all 80 actual observations.
   [Its audit](stage2/results/review-administration/response-audit.json) and
   [expanded automatic checks](stage2/results/generation-checks.json) test JSON,
   identity, word limits and supplied evidence fields. They do not measure facts.
5. The separate [AI evaluator](stage2/evaluation-prompt.txt) receives one full
   record and four A–D answers per call, using the same evaluator model/settings
   throughout and no generation history. Its [provisional fact lists](stage2/reference-facts.json)
   were drafted before generation by the development assistant, without human
   confirmation. The generation and evaluation model are the same: self-evaluation
   bias remains possible. Raw scoring is preserved even where it misinterprets
   a truthful missing-input limitation against the full source.
6. Two [unscored human packets](stage2/human-review/README.md) are ready. Reviewers
   must independently establish important facts before seeing answers, agree on
   their reference, then score without condition keys or AI results. No human
   scores, agreement estimates or editing times have been entered.

Use the [saved-observation reproduction commands](stage2/reproduction.md) to
recompute tables without new model calls. Do not rerun successful generations.
Backend input/output, cached input and reasoning counts are reported separately
from local tokenizer counts. Monetary cost, development-session consumption and
HokieAI allocation remain unmeasured. A subscription is not zero computation cost.

## Response import contract

Required keys for each JSONL row:

| Key | Meaning |
| --- | --- |
| `request_id` | Exact identifier from `outputs/requests.jsonl` |
| `prompt_sha256` | Hash of the exact prompt that was submitted |
| `model` | Exact model/version used; identical across a comparison |
| `settings` | Object with the actual inference settings; identical across conditions |
| `status` | `success` or `error`; pending placeholders are rejected |
| `response` | Raw model response as a string; an empty failure is `error` |
| `attempts` | Positive integer counting all attempted calls for this request |
| `usage` | Object with integer `input_tokens` and `output_tokens`, or `null` if unknown |
| `latency_seconds` | Measured request duration, or `null` if unavailable |

If retries occur, `usage` must aggregate all attempts whose usage is known;
if any attempt's consumption is unknown, use `null` and retain all available
per-attempt provider logs separately. Extra provider-specific fields may be
retained in the input file. No missing value is interpreted as zero.

The importer checks identifiers, prompt hashes, consistent settings, and output
structure. These checks do not establish factual correctness or prove that a
provider actually saw the claimed prompt. Preserve native request/response logs
for that provenance. A structurally valid response still requires human review.
The importer permits a partial run and reports its size; a partial run must not
be presented as the completed paired experiment.

## Before staff use the drafts

- Confirm that the item-description task fits the intended staff workflow and
  decide what detail a usable draft must retain.
- Recruit two reviewers, freeze their source-fact reference, calibrate the rubric,
  and retain independent scores plus any adjudication.
- Review evaluator errors, particularly input-availability claims and uncertain
  date/role judgments. The AI rubric and scope flags do not create human gold labels.
- Check additional collections and repeated drafts before applying the workflow
  broadly. One answer per condition does not show how much later answers may vary.

Do not label a token-reduction method “equally accurate” from retained fields,
20 pairs, AI scores or a nonsignificant difference. Human evaluation remains pending.
