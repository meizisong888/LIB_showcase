# Full experimental results

[Back to the overview](../README.md) · [Open the showcase](https://meizisong888.github.io/LIB_showcase/library_image_duplicates/)

These are the preserved results of the original controlled experiment. The shorter overview changes how they are presented, not the data, thresholds or calculations.

## Methods and comparison rules

| Method | Plain-language operation | Limitation |
| --- | --- | --- |
| A · File hash | SHA-256 of file bytes, followed by byte equality verification for matching hashes | Confirms only byte-identical files; names and folders do not enter the content hash |
| B · Perceptual hash | Standard `ImageHash.phash`, 64 bits, high-frequency factor 4; compare Hamming distances | Not an AI model; crops can alter the overall fingerprint |
| C · AI features | Official SSCD model; extract one 512-number descriptor per file, then compare descriptors | High cosine similarity is a candidate relationship, not confirmed identity |
| D · Reuse + AI | Confirm exact byte groups, extract only representatives, compare, expand to original file pairs, and cache | Final rule is exact bytes OR AI threshold; pHash is independent evidence, not part of D's decisions |

C is a fair baseline: **one extraction per file**, never one model call per pair. Its application cache includes file scope as well as content and configuration so a first run really extracts each file. D shares features only across byte-verified representatives. Every other independent file gets an AI descriptor even when pHash misses it. Direct vector comparisons are sufficient here; no vector database, Top-k claim, local-feature geometry, model training or paid vision/chat API is used.

We do not infer all pair identities from connected components. For D, each verified exact group has a representative; representative-pair scores are memoized and explicitly expanded to all member pairs. Exact-group member pairs are confirmed by bytes. Other selected pairs still need human review.

## Measured results

Recorded UTC: {{RUN_DATE}}. **12 original identities / 72 files for calibration, 18 identities / 108 files for held-out testing**. All variants of an identity stay together. Similar-scene negative groups are also deliberately kept together where designated in [the identity review](../data/identity-review.json).

Threshold policy was fixed before testing: maximize calibration pair F1, then precision, then choose the stricter threshold on a tie. Search the pHash integer grid 0–64 and AI cosine grid 0–1 by 0.01. C and D share the AI cutoff. The [complete grid and freeze record](../results/thresholds.json) is written before any test inference. The experiment verifies its hash remains unchanged. Frozen values: **{{THRESHOLDS}}**. No test-dependent threshold revision was made. A final clean-environment rerun reconfirmed the same calibration-selected cutoffs without changing the original freeze record; see [calibration confirmation](../results/calibration-confirmation.json).

All methods evaluate **the same 5,778 unordered test file pairs**, including 270 true duplicate pairs. Precision = TP/(TP+FP); recall = TP/(TP+FN). Candidates = TP+FP. There is no Top-k retrieval metric in this table.

{{ACCURACY}}

{{MEASURED_FINDING}}

Original-to-variant recovery uses a separate denominator of 18 per column:

{{VARIANTS}}

### Computation

The short overview rounds raw median times directly to two decimal places. For example, 13.864708 seconds is shown as 13.86 seconds. The older 13.87-second summary rounded the already rounded three-decimal value (13.865) again. This presentation correction does not change any measured run. The tables below retain three decimals.

Same machine, fixed two-CPU affinity and thread settings, CPU-only inference. Each measurement starts a new process. Three repetitions per condition; method order is deterministically shuffled. Values are **median [minimum–maximum]**.

{{COSTS}}

{{COST_FINDING}}

The total timer includes process startup, dependency imports, file reads and content hashing, byte checks, cache operations, model weight-integrity verification/loading when needed, decoding, preprocessing, feature extraction including first-forward overhead, pair comparisons and output serialization. Model/data download and transformation preparation are separate. Model loading is lazy: a fully cached run needs no model, whereas a partially cached incremental run includes loading it. Timing that bypasses model loading is not presented as a first run.

Detailed [stage timings and counters](../results/benchmark-runs.json) distinguish reading, decoding, hashing, model loading, extraction, comparison and cache operations. [Environment](../results/environment.json) records exact dependencies, CPU model, affinity and timing scope; [the complete installed package list](../results/packages.txt) includes transitive dependencies. Peak memory is process peak RSS, not incremental allocation. CPU time includes all process threads. **No GPU was used**; no GPU memory or synchronization claim is made. These are not power, energy, monetary-cost or FLOP measurements. OS page caches were not cleared, and other work on the shared host may influence these short runs. Small-data timing does not establish scaling behavior.

### Incremental processing

Starting from the existing test collection, add five files: an exact copy, a newly resized version, a new crop, and two independent photographs with source records. Full recalculation clears application features; incremental processing reuses the established cache. Both enumerate and rehash all 113 files to detect changes; only missing descriptors are recomputed. This is conservative content validation, not an assumption that filename or modification time guarantees unchanged content.

{{INCREMENTAL}}

{{INCREMENTAL_FINDING}}

Full and incremental **scores, candidates and representative mappings matched exactly in all three repetitions**. This is an implementation consistency check, not evidence of model accuracy. [Both prediction sets](../results/predictions) and [all incremental timing runs](../results/incremental-runs.json) are preserved.

Cache keys bind content SHA-256, algorithm version, method, preprocessing parameters, dependency versions, CPU/device configuration and the model weight hash. C additionally has per-file scope. Cache changes are tested to miss appropriately; files with changed bytes are rehashed. Keys do not depend on the decision threshold because the cached object is a descriptor, not a candidate decision: thresholds are reapplied on every comparison.

## What worked—and what still needs review

Exact byte checks are sufficient for renamed copies. pHash handles the original-to-resize and original-to-compressed comparisons here, with weaker crop recovery and observed false positives at its calibration-selected threshold. AI improves recovery in this particular experiment, but two compressed-to-crop comparisons remain below its threshold. No A/C/D false positives were observed on these test files; that is not a guarantee for other collections.

The page includes real successful recovery, an AI miss, a pHash false positive and two visually verified, distinct photographs of a similar creek scene. No error example is invented. The [identity review](../data/identity-review.json) records visual differences and source identities before testing. No uncertain photo identity was forced into a label.

Limitations: a convenience sample of 30 originals, mostly approximately 1,024 pixels on the long side; only selected synthetic transformations; no comprehensive real-catalog identity audit, rephotography, severe damage, handwritten annotations or transfer evaluation. Adjacent photographs may be difficult negatives even when the source exposure differs. A librarian must inspect candidates and provenance. **This tool does not delete, move or overwrite input images.**

## Evidence and checks

- [Source manifest](../data/sources.json), [source metadata](../data/metadata), [image acquisition record](../data/collection-preparation.json), [transformations / known identities](../data/manifest.json).
- [Measured implementation file hashes](../results/implementation.json).
- [Predictions including every scored pair](../results/predictions), [metrics](../results/metrics.json), [threshold grid](../results/thresholds.json), [first/cached timing runs](../results/benchmark-runs.json), [incremental runs](../results/incremental-runs.json), [preparation](../results/preparation.json), [model download timing](../data/model.json), [environment](../results/environment.json).
- `scripts/check.py`: exact representative checks, identity split integrity, cache key/config invalidation, file/thumbnail checksums, full-vs-incremental equality, rederived metrics, page data equality and local link targets. [Saved check results](../results/validation.json).
- `scripts/check-browser.mjs`: desktop/mobile rendering, image loading, candidate filter counts, gallery interactions, console errors and accessibility. Run from the repository root after starting a static server: `node library_image_duplicates/scripts/check-browser.mjs http://127.0.0.1:8767/`.

Project code follows the repository MIT license. Collection photographs and model materials retain their own provenance and rights statements.
