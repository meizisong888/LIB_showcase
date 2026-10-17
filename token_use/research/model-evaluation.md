# Model evaluation: prepared, not yet run

The checked-in token results contain no model answers or human ratings.
`pilot.py` prepares 400 independent requests and a fixed 20-record quality pilot.
The quality pilot balances records with and without a nonempty Description;
its 50/50 mix is deliberately different from the source sample's mix.

## Run the paired comparison

1. Run `python pilot.py` to regenerate the frozen requests.
2. Read `results/quality-pilot.json`. Use its 20 record keys and all four
   conditions: 80 requests. Submit each request in a fresh, independent context.
3. Before calling a model, record its exact identifier/version, provider,
   date, inference settings, output-token cap, retry policy, and spending limit.
   Use the same settings and task text for all conditions. Shuffle request order
   with a recorded seed; do not put successive conditions into one conversation.
4. Preserve each raw response and provider usage report. Record errors and every
   attempted call. Include any returned reasoning and cached-token breakdowns,
   separately from billed tokens. Local tiktoken counts exclude provider message
   framing and are not a replacement for provider usage. A web interface without
   usage reports can support a quality pilot, but its actual consumption stays
   unknown. Codex development conversations are outside the measured workload.
5. Export one JSON object per line using the contract below, then run
   `python prepare_review.py --responses outputs/responses.jsonl --out outputs/review-01`.
6. Give each of two reviewers a separate copy of `blinded-review.csv`, the full
   frozen source records, and the rubric in [protocol.md](protocol.md). Keep
   `condition-key.json` out of their materials until ratings are complete.

This repository does not yet include a provider adapter or execute paid calls.
Use the model access approved for the study and preserve its native logs. Do not
paste API credentials into GitHub. Selecting and connecting that model is the
next execution step, not a completed experiment.

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

## What must still be decided with the teacher

- Whether drafting collection descriptions is the intended staff task.
- The model and available access/budget.
- Two reviewers, their rubric calibration, and a practical quality margin.
- Whether a second collection is needed to test generalization.

Only after reviewing the pilot should the team choose a larger sample size.
Do not label a token-reduction method "equally accurate" based only on field
retention, an unblinded impression, or a nonsignificant difference in a small pilot.
