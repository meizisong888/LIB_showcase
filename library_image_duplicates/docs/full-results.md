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

Recorded UTC: 2026-11-14T20:18:42Z. **12 original identities / 72 files for calibration, 18 identities / 108 files for held-out testing**. All variants of an identity stay together. Similar-scene negative groups are also deliberately kept together where designated in [the identity review](../data/identity-review.json).

Threshold policy was fixed before testing: maximize calibration pair F1, then precision, then choose the stricter threshold on a tie. Search the pHash integer grid 0–64 and AI cosine grid 0–1 by 0.01. C and D share the AI cutoff. The [complete grid and freeze record](../results/thresholds.json) is written before any test inference. The experiment verifies its hash remains unchanged. Frozen values: **pHash distance ≤ 20; AI cosine ≥ 0.75**. No test-dependent threshold revision was made. A final clean-environment rerun reconfirmed the same calibration-selected cutoffs without changing the original freeze record; see [calibration confirmation](../results/calibration-confirmation.json).

All methods evaluate **the same 5,778 unordered test file pairs**, including 270 true duplicate pairs. Precision = TP/(TP+FP); recall = TP/(TP+FN). Candidates = TP+FP. There is no Top-k retrieval metric in this table.

| Method | Precision | Recall | TP | FP | FN | Candidates |
| --- | --- | --- | --- | --- | --- | --- |
| A · File hash | 100.0% | 6.7% | 18 | 0 | 252 | 18 |
| B · Perceptual hash | 71.0% | 85.2% | 230 | 94 | 40 | 324 |
| C · AI features | 100.0% | 99.3% | 268 | 0 | 2 | 268 |
| D · Reuse + AI | 100.0% | 99.3% | 268 | 0 | 2 | 268 |


Exact hashing found all 18 byte-for-byte copies but no edited versions. pHash found 230 of 270 duplicate pairs and selected 94 different-photo pairs. SSCD recovered 38 true pairs pHash missed and missed 0 that pHash found. C and D each found 268/270 with 0 false positives and 2 misses. Every original-to-variant pair was found by AI, but two compressed-to-cropped pairs were missed. That is why pair-level evaluation matters.

Original-to-variant recovery uses a separate denominator of 18 per column:

| Method | Exact copy | Smaller (40%) | JPEG quality 18 | Crop (~25% removed) | Crop, enlarged again |
| --- | --- | --- | --- | --- | --- |
| A · File hash | 18 / 18 | 0 / 18 | 0 / 18 | 0 / 18 | 0 / 18 |
| B · Perceptual hash | 18 / 18 | 18 / 18 | 18 / 18 | 13 / 18 | 13 / 18 |
| C · AI features | 18 / 18 | 18 / 18 | 18 / 18 | 18 / 18 | 18 / 18 |
| D · Reuse + AI | 18 / 18 | 18 / 18 | 18 / 18 | 18 / 18 | 18 / 18 |


### Computation

The short overview rounds raw median times directly to two decimal places. For example, 13.864708 seconds is shown as 13.86 seconds. The older 13.87-second summary rounded the already rounded three-decimal value (13.865) again. This presentation correction does not change any measured run. The tables below retain three decimals.

Same machine, fixed two-CPU affinity and thread settings, CPU-only inference. Each measurement starts a new process. Three repetitions per condition; method order is deterministically shuffled. Values are **median [minimum–maximum]**.

| Method / cache | Wall seconds | CPU seconds | Peak RSS MiB | Files read | AI extractions | Cache hits |
| --- | --- | --- | --- | --- | --- | --- |
| A · first | 0.250 [0.210–0.252] | 0.105 [0.104–0.108] | 44.750 [44.750–45.000] | 108 | 0 | 0 |
| A · warm | 0.210 [0.208–0.213] | 0.103 [0.103–0.105] | 45.000 [44.500–45.500] | 108 | 0 | 0 |
| B · first | 2.387 [2.379–2.445] | 1.328 [1.325–1.343] | 98.324 [97.512–98.926] | 108 | 0 | 0 |
| B · warm | 0.445 [0.418–0.446] | 0.268 [0.267–0.274] | 59.000 [58.750–59.000] | 108 | 0 | 108 |
| C · first | 15.773 [15.430–20.591] | 23.385 [22.931–24.628] | 510.375 [500.918–515.383] | 108 | 108 | 0 |
| C · warm | 0.481 [0.473–0.493] | 0.276 [0.275–0.278] | 59.750 [59.750–59.750] | 108 | 0 | 108 |
| D · first | 13.865 [13.513–19.538] | 20.393 [20.271–20.601] | 502.789 [500.941–510.348] | 108 | 90 | 0 |
| D · warm | 0.454 [0.441–0.455] | 0.275 [0.274–0.275] | 59.500 [59.000–59.500] | 108 | 0 | 90 |


C extracted 108 features; D extracted 90, saving 18 model calls (16.7%) by verifying exact copies first. Median first-run wall time was 15.773s for C and 13.865s for D (12.1% lower for D). Both still pay for all file reads and content hashing. Warm runs load cached arrays and do not load the model.

The total timer includes process startup, dependency imports, file reads and content hashing, byte checks, cache operations, model weight-integrity verification/loading when needed, decoding, preprocessing, feature extraction including first-forward overhead, pair comparisons and output serialization. Model/data download and transformation preparation are separate. Model loading is lazy: a fully cached run needs no model, whereas a partially cached incremental run includes loading it. Timing that bypasses model loading is not presented as a first run.

Detailed [stage timings and counters](../results/benchmark-runs.json) distinguish reading, decoding, hashing, model loading, extraction, comparison and cache operations. [Environment](../results/environment.json) records exact dependencies, CPU model, affinity and timing scope; [the complete installed package list](../results/packages.txt) includes transitive dependencies. Peak memory is process peak RSS, not incremental allocation. CPU time includes all process threads. **No GPU was used**; no GPU memory or synchronization claim is made. These are not power, energy, monetary-cost or FLOP measurements. OS page caches were not cleared, and other work on the shared host may influence these short runs. Small-data timing does not establish scaling behavior.

### Incremental processing

Starting from the existing test collection, add five files: an exact copy, a newly resized version, a new crop, and two independent photographs with source records. Full recalculation clears application features; incremental processing reuses the established cache. Both enumerate and rehash all 113 files to detect changes; only missing descriptors are recomputed. This is conservative content validation, not an assumption that filename or modification time guarantees unchanged content.

| Method / cache | Wall seconds | CPU seconds | Peak RSS MiB | Files read | AI extractions | Cache hits |
| --- | --- | --- | --- | --- | --- | --- |
| full | 13.979 [13.819–14.894] | 21.370 [21.267–21.599] | 508.242 [506.805–514.785] | 113 | 94 | 0 |
| reuse | 3.819 [3.748–4.163] | 3.193 [3.166–3.212] | 503.004 [501.531–508.953] | 113 | 4 | 90 |


Full recalculation extracted 94 features; incremental reuse extracted 4 and reused 90. The added exact copy reused its verified representative. Median wall time: 13.979s full versus 3.819s incremental.

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
