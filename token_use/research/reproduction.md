# Local reproduction and integration

This is a **developer reproduction check**, not a model experiment or a
librarian user test. The archive's patch was applied on a separate branch from
`8d6eb0bccfc3f8dd98cc588c91732941d95bb7c3`. Only the Library Token Use project is updated.

The supplied study ran on 2026-10-17 UTC. The local reproduction completed at
`2026-10-18T00:24:51.312427+00:00` (2026-10-17 in America/New_York).
Its [execution record](results/local-reproduction/reproduction.json) includes
the archive and patch hashes, commands, exit codes and original result hashes.
No frozen task, condition, source byte or pilot-code change was needed.

## Commands actually executed

From `token_use/research/`:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements.txt
.venv/bin/python pilot.py --setup
.venv/bin/python pilot.py
.venv/bin/python -m unittest test_pilot test_review -v
.venv/bin/python verify.py
```

Installation, setup, the pilot and tests all exited successfully. Installation
and setup could access the network. The source snapshot was already supplied;
the preprocessing run did not download it. The exact installed packages are
listed in [packages.txt](results/local-reproduction/packages.txt).

## Results and preservation

All eight total counts matched the supplied results exactly:

| Encoding | full_pretty | full_compact | task_fields | title_subjects |
| --- | ---: | ---: | ---: | ---: |
| cl100k_base | 160,944 | 129,671 | 85,825 | 31,503 |
| o200k_base | 160,915 | 131,561 | 86,656 | 31,550 |

All 19 hashes in the original artifact manifest matched, including the source,
configuration, task, pilot code, tokenizer resources, per-record counts, field
audit and generated requests. The 400 request texts and 80 selected requests
were reproduced, not submitted to a model. The selected 20 records and their
10/10 description-availability strata are unchanged.

[Five tests passed](results/local-reproduction/tests.stderr.txt), covering
field-value preservation, missingness and response-import validation. Import
unit tests use explicitly synthetic contract fixtures in temporary directories;
these are not observed model responses and are not published as research data.
No research responses or human scores were generated or imported.

[verify.py](verify.py) checks the design and artifact hashes, aggregates all 800
record/condition/encoding counts, checks request identities, and validates local
Markdown paths and heading anchors. Its [verification output](results/local-reproduction/verification.json)
is separate from the original experiment's evidence. External primary sources
were also opened during integration; source metadata and rights are documented
in [data/README.md](data/README.md) and [references.md](references.md).
A [separate online source check](results/local-reproduction/source-check.json)
retrieved the official sample again and matched all 427,069 frozen bytes.
This check was outside the measured preprocessing run and did not replace data.

The supplied top-level `results/` files remain byte-for-byte unchanged.
`pilot.py` normally rewrites `results/run-environment.json`. For this integration,
that newly generated file was saved under `results/local-reproduction/`, and
the supplied environment file was restored after comparison. Future local runs
will again update that one environment record; retain it separately when
comparing histories.

## Environment differences and verification scope

| Measurement | Supplied run | Local reproduction |
| --- | --- | --- |
| Python | 3.12.14 | 3.13.11 |
| tiktoken | 0.12.0 | 0.12.0 |
| Platform | `Linux-6.18.55-x86_64-with-glibc2.39` | `Linux-5.14.0-611.55.1.el9_7.x86_64-x86_64-with-glibc2.34` |
| Recorded preprocessing seconds | 0.825681 | 0.819947 |

These are single runs on different environments, not a performance benchmark.
See the [original environment](results/run-environment.json) and
[local environment](results/local-reproduction/run-environment.json).

The original environment could not perform network namespace isolation or
`strace`; [its failed attempts remain recorded](results/execution.json).
This local reproduction **did not perform OS network isolation or syscall
tracing**. Its default script blocks selected Python socket entry points and
loads local tokenizer tables. This is a limited code-level guard, not evidence
that all OS networking was blocked or that zero network syscalls occurred.
The syscall count remains unknown. The earlier teaching showcase's separate
network evidence does not apply to this research run.

Actual model-answer quality, librarian scores, model fees, provider usage,
HokieAI deductions and development-time Codex usage remain **not measured**.
The next study stage is the [prospective quality evaluation](model-evaluation.md),
which still requires real responses and independent ratings.
