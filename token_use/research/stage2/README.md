# Stage 2: locked execution design

This prospective amendment adds actual generation and AI-assisted evaluation to
stage 1. It does not replace the frozen input experiment or authorize human
ratings. The 20 selected records, four conditions, source data and task are
unchanged. The existing 80-request order is preserved, not rerandomized.

Generation uses `gpt-6.1-sol`, low reasoning, through official Codex CLI 0.163.0
and the existing ChatGPT login. Evaluation uses the same model with medium
reasoning. A dated immutable model snapshot is not exposed; this is the exact
catalog model identifier, not a fabricated version. Same-model self-evaluation
bias is a limitation. Settings are fixed before generation in [settings.json](settings.json).

## Isolation and limits

Each call starts a new ephemeral CLI process and mount/PID/IPC namespace using
Bubblewrap. The repository, source files, previous outputs, local session
history, user configuration and skills are absent from that filesystem. Only
standard runtime directories, the CLI binary, a fixed one-sentence base
instruction, existing authentication at its original path, applicable managed
requirements, and an empty per-call output directory are mounted. Credentials
are never copied, printed or sent to the model. The experiment sends one
unchanged prompt through stdin; the CLI can additionally supply common runtime
instructions, which are included in backend input usage rather than counted as
local task text. No other condition or source record is supplied.

Shell, file/image, app/plugin/MCP discovery, browser/search, memory and agent
tools are disabled. Any tool event aborts the experiment. The model has no
hosted retrieval or source-file route. This is filesystem isolation with network
available to the official CLI for inference, not a network-disabled experiment.
[preflight.json](preflight.json) records actual source/history-absence and login
checks before any model request.

The backend uses the installed CLI's built-in ChatGPT endpoint, with an explicit
provider name to set HTTP/stream retries to zero. No endpoint or credential is
replaced by a third-party service. Internal reconnect events stop execution.
No new service, API-key fallback or purchased/reset credits are used.

The CLI does not expose a verified hard output-token cap. All generation
conditions retain the identical <=80-word description requirement and backend
defaults; no unsupported `max_tokens` parameter is invented. The client deadline
is 180 seconds for generation and 300 for evaluation. A deadline preserves a
failure; it is not an output-token cap. Provider finish reasons and reasoning
subcounts unavailable through CLI are null, never zero.

## Frozen evaluation standard

[reference-facts.json](reference-facts.json) was drafted by the Codex development
assistant from full source records before any generation. It is **not confirmed
by humans** and is not a gold standard. Each record has the same provisional
salient-fact list for all four methods. The list prioritizes a useful 80-word
description; it does not demand every metadata field.

[evaluation-prompt.txt](evaluation-prompt.txt) freezes the scoring instructions.
Every evaluation call sees one full source record, that provisional list and
four anonymous answers. Labels A–D are assigned by a SHA-256 ordering with seed
`library-stage2-blind-v1`. [blind-key.json](blind-key.json) is withheld from the
model evaluator and must be withheld from human reviewers. No condition names,
input counts or original generation order enter evaluation prompts. Independent
fresh processes prevent inherited generation context. At most 20 evaluation
calls are allowed, with no evaluation retries.

Errors, qualification losses, fact coverage, informativeness (0–3) and usable
draft judgments (yes/no/uncertain) require answer/source evidence. Missing facts
and fabricated claims are separate outcomes. Covered/partial/missing/uncertain
fact labels are retained. Coverage is fully covered facts divided by the fixed
fact count; uncertainty is reported separately. A thin but noncommittal response
does not automatically qualify as usable. No practical equivalence margin or
human acceptance threshold is claimed.

## Execution, resume and reporting

From `research/`, after the existing tokenizer setup (do not rerun stage 1):

```bash
.venv/bin/python stage2/run.py generate --limit 1
.venv/bin/python stage2/run.py generate
.venv/bin/python stage2/run.py evaluate
```

The first request is formal and counts if completed. A completed backend turn
is not retried for format errors, empty answers, refusals or perceived quality.
Only an explicit failed transport without a completed turn is eligible for one
retry; at most four extra generation attempts are permitted. Authentication,
quota or configuration failures stop further calls. An interrupted attempt
without a terminal record is never automatically repeated. Resume verifies the
frozen design and exact prompt text; successful cases are skipped.

Raw requests, answers, JSON events, usage and per-attempt timing are saved under
`runs/generation/` and `runs/evaluation/`. Backend input/output counts are separate
from stage-1 tokenizer counts. Cached input is a subset of input; reasoning, if
reported, is a subset of output and must not be added twice. Unknown failed-call
usage makes a complete cost total unknown; known usage remains reportable.
Development-session usage is unknown and separate from both experimental phases.
Human ratings remain pending.

Analysis is paired by record and stratified by Description availability. The
primary contrast is task fields versus compact full input. Formatting and sparse
input are separate contrasts. The report will select the first scheduled record
in each stratum, plus the largest positive and negative primary usability/coverage
differences (ties broken by original order); it will not select examples solely
because they favor reduction. No significance or quality-equivalence claim will
be inferred from 20 pairs or from AI judgments.

Backend references checked 2026-10-18: [Codex non-interactive mode](https://developers.openai.com/codex/noninteractive)
and [ChatGPT plan route limitations](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations).
