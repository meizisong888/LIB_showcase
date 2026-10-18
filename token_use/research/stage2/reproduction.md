# Inspect and reproduce the second-stage analysis

The saved calls are observations, not templates awaiting execution. Inspect
[the report](report.md), [tables](results/metrics.md), [examples](results/examples.md)
and [verification record](results/verification.json) without calling any model.
The original 100-record counting experiment and its evidence are unchanged.

## Recompute from saved observations

From `token_use/research/`, using the existing Python environment:

```bash
.venv/bin/python stage2/analyze.py
.venv/bin/python stage2/render.py
.venv/bin/python stage2/verify.py
```

These commands do not call a model. Analysis uses the previously regenerated
`outputs/pilot-requests.jsonl` and the committed saved calls. On a fresh checkout,
follow the [stage-one setup](../README.md#reproduce-the-input-result) first to
recreate the identical request files; that setup also reruns stage-one counting
and writes a new environment record. Preserve historical results before doing
so if the working copy is being used as an evidence archive.

`analyze.py` imports the existing structure-check function and exports actual
answers in the [response import contract](../model-evaluation.md).
The existing importer was also run through:

```bash
.venv/bin/python stage2/prepare_humans.py
```

It creates the [administrative audit](results/review-administration/response-audit.json)
and two [blank human review packets](human-review/README.md). It refuses to
replace an existing human sheet; deleting it is not part of reproduction.

## What was executed online

The [locked execution design](README.md), [settings](settings.json),
[hash lock](design-lock.json), [fixed order](generation-order.json) and
[preflight](preflight.json) preceded the first formal generation. The original
selected records, source data, conditions and task were not changed.

The real commands were:

```bash
.venv/bin/python stage2/run.py generate --limit 1
.venv/bin/python stage2/run.py generate
.venv/bin/python stage2/run.py evaluate
```

These commands use model allowance on new requests; they are not the no-model
analysis commands above. The first call was successful and counted in the 80,
not discarded as a trial. The committed script resumes matching completed
requests and never regenerates an answer to improve its apparent quality.
Do not delete `runs/` and mistake a newly generated experiment for reproduction
of these exact outputs.

The launcher uses the recorded local official Codex CLI binary and existing
ChatGPT login. Another machine may not provide the same model alias, CLI,
Bubblewrap or allowance. It must document a separate run rather than silently
alter this locked experiment. No exact stochastic-output reproducibility or
immutable model snapshot is claimed.

## Evidence layout and boundaries

Every attempt below `runs/generation/` or `runs/evaluation/` preserves:

| File | Purpose |
| --- | --- |
| `prompt.txt`, `request.json` | Exact submitted user text, request identity and SHA-256 |
| `invocation.json` | Model, actual CLI options and environment variable names; no secret values |
| `allowance.json` | Pre-call read-only included-allowance check; no account identity or credential |
| `events.jsonl`, `stderr.txt` | Native CLI events and diagnostics, including raw usage |
| `response.txt` | Unedited final answer |
| `status.json` | UTC start/end, elapsed time, completion state, usage, thread identity and observed tool events |

The filesystem probe verifies that source, repository, user configuration and
session history are absent inside the generation environment. Calls use fresh
ephemeral threads, with browsing and tool capabilities disabled. Saved
evaluation prompts can be regenerated from the full source plus the anonymized
answers and checked byte for byte. The evaluator cannot read the condition key.
Answer content may still suggest a condition; anonymous labels do not guarantee
perfect blinding.

Network access is required for inference. This run did **not** claim a network
namespace blockade or syscall tracing. Logs show what the official CLI exposed;
they are not a packet capture or inspection of provider internals. The fixed
runtime wrapper adds input tokens beyond the original task text. Cross-request
cached prefixes are usage accounting, not shared conversational memory.

The CLI prints a diagnostic that Code Mode is unavailable because its host is
disabled. This is a fail-closed capability diagnostic, not an executed tool;
the native log is retained. A tool event or internal reconnect would stop the
launcher rather than be silently accepted as an isolated comparison.

After the first successful formal call, the raw usage object revealed a
`reasoning_output_tokens` field. A documented [lock amendment](design-lock.json)
added extraction of this field. No prompt, model setting, schedule, rubric or
output changed, and the call was not repeated. Aggregates read the preserved raw
usage object, including that first call; missing counters remain unknown.

All checks here are **developer reproduction and evidence checks**, not a
librarian user study. Human scoring, monetary charges, HokieAI allocation and
development-session usage remain unmeasured.
