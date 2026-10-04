# Library Token Use — Practical Preprocessing Without Model Calls

**Prepare library materials locally before sending them to HokieAI or another
AI tool.** This runnable showcase is for staff reviewing collection metadata
and finding research candidates in digital collection descriptions.

It asks a practical question: **what can an ordinary program do first, while
keeping the evidence needed for the task?** Smaller inputs alone are not success.
The examples report preserved fields, missing material, retrieval failures and
cache invalidation alongside token counts.

Independent teaching project; not an official Virginia Tech service or a
validated production tool. All collection records are explicitly synthetic.

## Start here

- [Employee guide: six steps](docs/staff-guide.md) · [中文操作指南](docs/staff-guide.zh-CN.md)
- [What can be done without AI?](docs/methods.md)
- [Experiment report and execution evidence](docs/experiment-report.md)
- [Data definitions](data/README.md) · [Sources and verification dates](docs/sources.md)

## What “without model calls” means

1. **Preprocessing:** the installed local scripts use field lists, rules,
   hashes and keyword statistics. No local or remote generative model,
   embedding service, model key or inference request is involved. CPU work,
   memory and disk access still have costs.
2. **Prepared input:** `tiktoken 0.12.0`, encoding `cl100k_base`, counts the
   entire generated text file locally. This is an input-size measure under
   that encoding, not HokieAI's actual allocation accounting.
3. **Development:** Codex helped write the code, synthetic records and
   relevance judgments. Codex uses a model. Its development usage is **not
   measured**, and no independent model-answer comparison was run.
4. **Usefulness:** exact selection preserves configured task evidence; keyword
   candidates can omit relevant material. Staff still make or verify semantic
   judgments and follow the source restrictions.

HokieAI's official page, checked **2026-10-04**, describes monthly metering and
different allocation consumption rates across models. A numerical quota and
token-to-allocation conversion were **not verified**. This project did not
measure HokieAI quota or money saved. [Official VT background](https://ai.vt.edu/tools/hokieai.html).

## Methods that do not need a model

| Method | Useful library task | What it cannot decide |
| --- | --- | --- |
| Explicit field selection | Keep title, abstract, subjects, language, edition, copy, dates, restrictions and provenance for subject review | Whether a subject is supported by the content |
| Rules and explicit conditions | Check missing fields, dates and allowed values; inventory reports in a specified year range | Whether a plausible date or subject is true |
| Exact grouping and dependency-aware cache | Prepare identical task content once, keep every ID, rebuild changed material | Whether two holdings are the same entity, or an AI review is finished |
| Term Frequency–Inverse Document Frequency (TF-IDF) | Rank research candidates from staff-supplied query words | Exhaustive recall, synonyms, negation or cross-paragraph meaning |

The first three methods follow deterministic task conditions. TF-IDF offers
fallible candidate ranking. It is a traditional text calculation, with no
embedding model or AI query rewriting.

## Three executed comparisons

The [design](docs/experiment-design.md) preceded implementation. Per-record
[relevance judgments](data/retrieval-gold.json) and their evidence were fixed
before the first retrieval run; they are Codex-assisted synthetic annotations,
**not librarian annotation**. Raw records remain unchanged.

<!-- RESULTS:START -->

| Comparison | Records: input → retained/pending | Text tokens: baseline → prepared | Input reduction | Evidence |
| --- | ---: | ---: | ---: | --- |
| 1 · Subject review | 60 → 60 | 15,231 → 13,865 | 8.97% | 60/60 IDs; 58 items; all 12 configured original fields unchanged |
| 2 · Candidates top5 | 60 → 5 | 15,212 → 1,279 | 91.59% | Recall 5/12; evidence 5/12 |
| 2 · Candidates top15 | 60 → 15 | 15,212 → 3,421 | 77.51% | Recall 10/12; evidence 10/12 |
| 2 · Full source fallback | 60 → 60 | 15,212 → 15,212 | 0.00% | Recall 12/12; evidence 12/12 |
| 3 · second | 60 → 4 | 13,812 → 1,076 | 92.21% | 4 pending; 56 reused; all active IDs accounted for |

<!-- RESULTS:END -->

1. **Subject review:** every original ID remains represented. A well-formed
   gardening record carrying `Astronomy` still reaches review (`R007`);
   `R008` is flagged `insufficient_material` because its abstract is missing.
   Editions, copies and access restrictions survive. Grouping removes repeated
   preparation, not holdings.
2. **Research candidates:** the query is `Appalachian community flood river`.
   The narrow selection misses evidence; the wider selection still misses
   `R003` (different English wording) and `R017` (Spanish). Wider results also
   include lexical decoys. Full-source fallback restores the fixture's evidence
   at the original input size. This is not exhaustive literature retrieval.
3. **Updated records:** a first run establishes a preparation cache. The next
   export adds, changes, deletes and inactivates records. A changed task,
   vocabulary or rules configuration invalidates all active preparations in
   separate demonstrations. The cache stores **no AI answers**. Pending-only
   size is not proof that any review can be skipped.

See the [complete generated table](results/summary.md),
[machine-readable metrics](results/metrics.json) and
[complete before/after input files](docs/experiment-report.md#input-files).
Reduction means `1 - prepared_text_tokens / baseline_text_tokens`, including
the complete task instruction, JSON structure, IDs, mappings and any candidate
explanation actually sent. Service-side chat wrappers and output tokens are
not measured.

## Quick start

Use Python **3.11+**; the recorded run used Python 3.13.11 on Linux. Work from
this `token_use/` directory. One-time setup can use the network:

```bash
python3 -m venv .venv
.venv/bin/python -m pip install -r requirements-lock.txt
.venv/bin/python scripts/setup_tokenizer.py
```

Then reproduce the experiments, evidence and checks with one command:

```bash
bash scripts/run_offline.sh
```

This Linux command requires `unshare` (util-linux), `strace`, and permitted
unprivileged user/network namespaces. It **fails** if isolation is unavailable.
The ordinary command `.venv/bin/python scripts/run.py demo` runs the same
calculations but does not certify network isolation. Missing tokenizer
files cause a local error, never an automatic download during preprocessing.

The recorded full run exited successfully in a distinct network namespace
with only loopback, failed external IPv4/IPv6 connectivity probes, and **zero
network system calls** in the traced preprocessing process. The ten checks
also passed inside that namespace. [Actual log and scope](results/execution/offline-run.json).

## Work on one task

```bash
# All subject-review records; generated prompt is outputs/review/pending.txt
.venv/bin/python scripts/run.py prepare --out outputs/review

# Wider research candidates; complete descriptions and source locators
.venv/bin/python scripts/run.py retrieve --top-k 15 --out outputs/research

# Rule-only inventory; no model step needed
.venv/bin/python scripts/run.py filter --out outputs/inventory
```

Follow the [employee guide](docs/staff-guide.md) before copying material into
HokieAI. Outputs include the task template. Original data are never executed
as instructions. Keep local/private working exports in ignored `outputs/` or
`scratch/`; the checked-in `data/` is only the public synthetic fixture.

## Limits and reuse

The small dataset demonstrates mechanisms and failure cases; the percentages
do not estimate a real library's savings. No independent baseline-versus-
prepared model answers, actual model usage, staff study, CPU-cost benchmark or
HokieAI quota measurement was performed. Schema mapping, local vocabulary,
task scope and source restrictions need staff review before real use.

Code and original documentation follow the repository's [MIT license](../LICENSE).
The synthetic fixture is also explicitly offered under [CC0 1.0](data/LICENSE).
No real patron, private collection or credential data are included.
