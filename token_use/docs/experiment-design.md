# Library Token Use — Practical Preprocessing Without Model Calls

> Preserved initial specification, written 2026-10-04 before implementation.
> Its future-tense delivery status records the starting plan. For completed
> work and measured results, see [the final report](experiment-report.md).

A runnable guide for library staff preparing collection records and digital
collection descriptions for tools such as HokieAI. Local programs can select
task fields, check explicit rules, avoid repeated preparation, and rank keyword
matches before staff send material to a model. This independent demonstration
is not an official Virginia Tech service or a validated production tool.

## The question

Can we send less material while retaining the evidence needed for a particular
library task? A smaller input alone is not success. Every experiment reports
retention, exceptions, and the work that remains for staff or a model.

Four different claims must stay separate:

- **No model calls during preprocessing:** after setup, the local scripts make
  no generative-model or embedding calls, locally or remotely. CPU work and
  disk access still have costs.
- **Smaller prepared input:** a named local tokenizer counts the complete text
  files. These counts are not HokieAI allocation measurements.
- **Model-assisted development:** Codex is being used to develop and check this
  project. That process uses a model; its usage is not zero or assumed known.
- **Useful retained evidence:** deterministic field selection retains every
  subject-review record; keyword ranking can miss relevant descriptions.

HokieAI's official page, checked **2026-10-04**, describes monthly metering and
different allocation consumption rates for different models. A numerical
allocation or token-to-allocation conversion was **not verified**. See
[VT's official page](https://ai.vt.edu/tools/hokieai.html).

## Methods and planned comparisons

| Method | Library use | Cannot determine |
| --- | --- | --- |
| Explicit field selection | Prepare title, abstract, subjects, language, edition, copy, restrictions and source for subject review | Whether a subject heading is semantically correct |
| Rules and conditions | Flag missing fields, invalid dates or controlled values; filter only an explicitly scoped year/type task | Truth or topical correctness |
| Exact deduplication and dependency-aware reuse | Prepare identical task content once, preserving all IDs; rebuild changed material | Entity identity or a completed AI review |
| Term Frequency–Inverse Document Frequency (TF-IDF) | Rank research-topic candidates without models or embeddings | Exhaustive recall, synonyms, negation or cross-paragraph meaning |

The first three methods use explicit task conditions. TF-IDF selects fallible
candidates and must offer a route back to the complete original descriptions.

The experiment design is written before implementation and measurement:

1. **Subject-review preparation:** compare complete records with configured
   fields and exact task-content groups. Keep every record, including a
   well-formed subject mismatch, missing abstract, edition/copy differences,
   and a restriction that must survive. Count IDs and exact duplicate work.
2. **Research candidates:** use a small, original synthetic collection. Freeze
   per-record relevance labels and quoted evidence before the first ranking;
   compare a narrow keyword selection, a wider selection and the full corpus.
   Report missed IDs and evidence, not just input reduction.
3. **An updated export:** prepare a full first run, then additions, changes,
   deletion/inactivation, and task/vocabulary changes. Cache **prepared
   material only** using content plus task, rules, vocabulary and code
   fingerprints. Compare the current full prepared batch with pending items.

Synthetic data will demonstrate algorithm behavior, not production savings.
Raw inputs will remain immutable. Setup may download dependencies and tokenizer
data; the measured run must work under an effective network block. Results
will be generated from actual complete input files, using identical task text,
JSON formatting and counting rules within each comparison.

## Delivery status

This initial specification precedes implementation. Measured results, the
reproduction command, staff guides and execution evidence will replace this
section after the experiments run. Independent model-answer quality and actual
HokieAI quota consumption are outside the measured experiment.
