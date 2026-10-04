# Sources, provenance and verification

Checked **2026-10-04**. Source claims below are deliberately limited to what
was verified; the example data are original synthetic material.

| Source | What was verified or used | Limits |
| --- | --- | --- |
| [Virginia Tech: HokieAI](https://ai.vt.edu/tools/hokieai.html) | The page describes monthly metering and different allocation consumption rates across models. | Numerical quota and token-to-allocation conversion: **not verified**. This project made no HokieAI calls or allocation measurements. |
| [OpenAI: tiktoken repository](https://github.com/openai/tiktoken) | A local byte-pair tokenizer, with an explicit `Encoding` interface. | We pin 0.12.0 and choose `cl100k_base`; we do not infer HokieAI's model encoding. |
| [tiktoken 0.12.0 encoding definitions](https://github.com/openai/tiktoken/blob/0.12.0/tiktoken_ext/openai_public.py) | Installed source inspected during setup: the encoding pattern, ranks and special-token table. | The default loader can download a resource, so our measured path constructs the encoding from prepared local files. |
| [tiktoken 0.12.0 loader](https://github.com/openai/tiktoken/blob/0.12.0/tiktoken/load.py) | Installed source inspected: HTTP fetching belongs to resource setup, not inference. | Our runtime does not call this loader; missing local data fails explicitly. |
| [Manning, Raghavan and Schütze: term frequency and weighting](https://nlp.stanford.edu/IR-book/html/htmledition/term-frequency-and-weighting-1.html) | Traditional count-based retrieval background and the limitations of ignoring word order. | Our precise smoothed weighting formula is stated in [methods](methods.md); no retrieval model is trained. |
| [Local fixture and annotations](../data/README.md) | Original Codex-assisted synthetic records and per-record judgments fixed before retrieval. | No real catalog sampling, librarian labeling or independent model evaluation. Public reuse under [CC0](../data/LICENSE). |

The encoding setup downloads the rank resource from
[OpenAI's public encoding resource](https://openaipublic.blob.core.windows.net/encodings/cl100k_base.tiktoken).
Only the ignored local cache contains that downloaded file; the repository
ships the setup script, not a redistributed tokenizer dataset. Its actual
SHA-256 and tokenizer version are in [metrics.json](../results/metrics.json).
Dependencies and encoding resources were prepared on 2026-10-04 before the
isolated experiment. Package installation is separate from preprocessing.

The verified background explains why reducing unnecessary input is useful;
it supplies **no conversion** from this project's text tokens to HokieAI
allocation, money, or total workflow usage. Current VT guidance remains the
authority for actual use of that service.
