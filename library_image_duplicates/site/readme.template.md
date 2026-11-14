# Finding Duplicate Collection Images with Less Computation

[Open the measured showcase](https://meizisong888.github.io/LIB_showcase/library_image_duplicates/) · [Browse source photographs](https://meizisong888.github.io/LIB_showcase/library_image_duplicates/sources.html)

## The problem

A collection can hold exact copies, smaller files, compressed images and crops of the same photograph. Library staff need candidate pairs to inspect. Two photographs of the same building or scene are **not** duplicates merely because their subjects are similar.

## What this project does

This small, reproducible experiment compares existing methods; it does not propose a new algorithm or claim the globally cheapest solution. It uses **30 real Library of Congress photographs plus artificially constructed variants**, not an established representative test of real collections. Each original has an exact renamed copy, a 40%-size version, a quality-18 JPEG, a crop retaining approximately 75% of its area, and the crop enlarged back to its original dimensions: **180 files**. Five additional files support the incremental experiment.

The catalog source page, actual download URL, collection title, source ID, rights statement, download UTC date and SHA-256 are saved for every original. Rights were assessed per item; “No known restrictions” is retained as a catalog statement, not treated as a blanket public-domain guarantee. All original metadata is saved under [data/metadata](data/metadata). The LOC catalog API rate-limited requests after 11 fresh Highsmith records; remaining records come from earlier official LOC snapshots already in this repository. The source manifest explicitly distinguishes metadata provenance from new image download dates. All images were actually downloaded and transformed.

## How it works

| Method | Plain-language operation | Limitation |
| --- | --- | --- |
| A · File hash | SHA-256 of file bytes, followed by byte equality verification for matching hashes | Confirms only byte-identical files; names and folders do not enter the content hash |
| B · Perceptual hash | Standard `ImageHash.phash`, 64 bits, high-frequency factor 4; compare Hamming distances | Not an AI model; crops can alter the overall fingerprint |
| C · AI features | Official SSCD model; extract one 512-number descriptor per file, then compare descriptors | High cosine similarity is a candidate relationship, not confirmed identity |
| D · Reuse + AI | Confirm exact byte groups, extract only representatives, compare, expand to original file pairs, and cache | Final rule is exact bytes OR AI threshold; pHash is independent evidence, not part of D's decisions |

C is a fair baseline: **one extraction per file**, never one model call per pair. Its application cache includes file scope as well as content and configuration so a first run really extracts each file. D shares features only across byte-verified representatives. Every other independent file gets an AI descriptor even when pHash misses it. Direct vector comparisons are sufficient here; no vector database, Top-k claim, local-feature geometry, model training or paid vision/chat API is used.

We do not infer all pair identities from connected components. For D, each verified exact group has a representative; representative-pair scores are memoized and explicitly expanded to all member pairs. Exact-group member pairs are confirmed by bytes. Other selected pairs still need human review.

## See an example

The [static page](https://meizisong888.github.io/LIB_showcase/library_image_duplicates/#examples) shows every held-out original alongside all five actual variants, with A/B/C/D found/missed labels and source links. A saved-pair explorer includes every method's score, success cases, actual misses and actual false positives. It explicitly labels known-answer **experiment evaluation mode**. Browser controls filter precomputed results; they do not run AI.

Display thumbnails are derived from actual experiment files; [their ledger](data/thumbnails.json) binds them to the full files' hashes. Downloaded originals and full variants are reproducibly rebuilt under ignored `work/`, not committed as redundant large assets.

## Measured results

Recorded UTC: {{RUN_DATE}}. **12 original identities / 72 files for calibration, 18 identities / 108 files for held-out testing**. All variants of an identity stay together. Similar-scene negative groups are also deliberately kept together where designated in [the identity review](data/identity-review.json).

Threshold policy was fixed before testing: maximize calibration pair F1, then precision, then choose the stricter threshold on a tie. Search the pHash integer grid 0–64 and AI cosine grid 0–1 by 0.01. C and D share the AI cutoff. The [complete grid and freeze record](results/thresholds.json) is written before any test inference. The experiment verifies its hash remains unchanged. Frozen values: **{{THRESHOLDS}}**. No test-dependent threshold revision was made. A final clean-environment rerun reconfirmed the same calibration-selected cutoffs without changing the original freeze record; see [calibration confirmation](results/calibration-confirmation.json).

All methods evaluate **the same 5,778 unordered test file pairs**, including 270 true duplicate pairs. Precision = TP/(TP+FP); recall = TP/(TP+FN). Candidates = TP+FP. There is no Top-k retrieval metric in this table.

{{ACCURACY}}

{{MEASURED_FINDING}}

Original-to-variant recovery uses a separate denominator of 18 per column:

{{VARIANTS}}

### Computation

Same machine, fixed two-CPU affinity and thread settings, CPU-only inference. Each measurement starts a new process. Three repetitions per condition; method order is deterministically shuffled. Values are **median [minimum–maximum]**.

{{COSTS}}

{{COST_FINDING}}

The total timer includes process startup, dependency imports, file reads and content hashing, byte checks, cache operations, model weight-integrity verification/loading when needed, decoding, preprocessing, feature extraction including first-forward overhead, pair comparisons and output serialization. Model/data download and transformation preparation are separate. Model loading is lazy: a fully cached run needs no model, whereas a partially cached incremental run includes loading it. Timing that bypasses model loading is not presented as a first run.

Detailed [stage timings and counters](results/benchmark-runs.json) distinguish reading, decoding, hashing, model loading, extraction, comparison and cache operations. [Environment](results/environment.json) records exact dependencies, CPU model, affinity and timing scope; [the complete installed package list](results/packages.txt) includes transitive dependencies. Peak memory is process peak RSS, not incremental allocation. CPU time includes all process threads. **No GPU was used**; no GPU memory or synchronization claim is made. These are not power, energy, monetary-cost or FLOP measurements. OS page caches were not cleared, and other work on the shared host may influence these short runs. Small-data timing does not establish scaling behavior.

### Incremental processing

Starting from the existing test collection, add five files: an exact copy, a newly resized version, a new crop, and two independent photographs with source records. Full recalculation clears application features; incremental processing reuses the established cache. Both enumerate and rehash all 113 files to detect changes; only missing descriptors are recomputed. This is conservative content validation, not an assumption that filename or modification time guarantees unchanged content.

{{INCREMENTAL}}

{{INCREMENTAL_FINDING}}

Full and incremental **scores, candidates and representative mappings matched exactly in all three repetitions**. This is an implementation consistency check, not evidence of model accuracy. [Both prediction sets](results/predictions) and [all incremental timing runs](results/incremental-runs.json) are preserved.

Cache keys bind content SHA-256, algorithm version, method, preprocessing parameters, dependency versions, CPU/device configuration and the model weight hash. C additionally has per-file scope. Cache changes are tested to miss appropriately; files with changed bytes are rehashed. Keys do not depend on the decision threshold because the cached object is a descriptor, not a candidate decision: thresholds are reapplied on every comparison.

## What worked—and what still needs review

Exact byte checks are sufficient for renamed copies. pHash handles the original-to-resize and original-to-compressed comparisons here, with weaker crop recovery and observed false positives at its calibration-selected threshold. AI improves recovery in this particular experiment, but two compressed-to-crop comparisons remain below its threshold. No A/C/D false positives were observed on these test files; that is not a guarantee for other collections.

The page includes real successful recovery, an AI miss, a pHash false positive and two visually verified, distinct photographs of a similar creek scene. No error example is invented. The [identity review](data/identity-review.json) records visual differences and source identities before testing. No uncertain photo identity was forced into a label.

Limitations: a convenience sample of 30 originals, mostly approximately 1,024 pixels on the long side; only selected synthetic transformations; no comprehensive real-catalog identity audit, rephotography, severe damage, handwritten annotations or transfer evaluation. Adjacent photographs may be difficult negatives even when the source exposure differs. A librarian must inspect candidates and provenance. **This tool does not delete, move or overwrite input images.**

## AI model and reproducible identity

- **SSCD `sscd_disc_mixup`**, ResNet50, 512 dimensions, official standalone TorchScript.
- [Official upstream code/documentation snapshot](https://github.com/facebookresearch/sscd-copy-detection/tree/95902662f2217a5f4aa45f2a3fc70a01dfd3b66a): `95902662f2217a5f4aa45f2a3fc70a01dfd3b66a`. This identifies code/documentation, not a separately versioned weight release.
- [Official weights](https://dl.fbaipublicfiles.com/sscd-copy-detection/sscd_disc_mixup.torchscript.pt), SHA-256: `{{MODEL_SHA}}`.
- Upstream repository license: MIT. Weights are downloaded from the authors' public reproduction distribution and are not redistributed in this repository. [Recorded model provenance](data/model.json).
- Preprocessing: Pillow EXIF transpose → RGB → direct bilinear resize to 320×320 (aspect ratio may change) → float32 /255 → mean `[0.485,0.456,0.406]`, std `[0.229,0.224,0.225]` → CHW. No center crop. L2-normalize output; cosine rounded to eight decimals for saved scores and threshold comparisons.
- Batch size 1; CPU; PyTorch two intra-op threads and one inter-op thread; inference mode, eval mode, deterministic algorithms. No training, whitening, descriptor centering or score normalization.
- [SSCD paper](https://arxiv.org/abs/2202.10261): Pizzi et al., *A Self-Supervised Descriptor for Image Copy Detection*, CVPR 2022. [Standard pHash implementation](https://github.com/JohannesBuchner/imagehash).

## Try it

The recorded run uses Python 3.13 on Linux. A CPU-only wheel avoids downloading unused GPU dependencies. Exact measured package versions are pinned; the final measured environment uses a clean virtual environment and an official CPU-only PyTorch wheel.

```bash
git clone https://github.com/meizisong888/LIB_showcase.git
cd LIB_showcase/library_image_duplicates
python3.13 -m venv .venv
source .venv/bin/activate
pip install torch==2.10.0 --index-url https://download.pytorch.org/whl/cpu
pip install -r requirements.txt
python scripts/prepare.py
python scripts/experiment.py --repeats 3
python scripts/build.py --thumbnails
python scripts/check.py
python scripts/evaluate.py --check
```

`prepare.py` verifies the downloaded source bytes and model against committed hashes. It also requires the same transformation records and full-file checksums as the frozen manifest. An upstream replacement or an incompatible decoder/encoder causes a clear failure, not a silent dataset change. Network/catalog availability can vary. Selected catalog pages returned HTTP 403 to automated link checks, although all 32 image downloads succeeded; see [external-link verification limits](results/external-links.json). It reuses the committed source manifest; the one-time `collect.py` discovery/provenance assembly is not part of normal reproduction.

The experiment regenerates local results, timings and the calibration record; times can differ. The deterministic split and selection policy stay fixed. Keep the committed results when comparing your machine to the recorded run. `build.py` generates prose and tables from actual saved artifacts. To regenerate the committed page without models or full images, use `python scripts/build.py` without `--thumbnails`.

Screen your own images without modifying them:

```bash
python scripts/prepare.py --model-only
python scripts/scan.py /path/to/images --method D --output /path/to/review
# Open /path/to/review/index.html. Rerun the same command to reuse features.
# Alternatives: --method A, --method B, or --method C
# Explicit new-data cutoffs: --phash-distance 8 --ai-threshold 0.8
```

Choose an output folder outside the input folder. The report is **candidates for review**, with no ground-truth labels for unknown files. The numeric overrides above are examples, not recommended universal thresholds; calibrate on separate known examples from your collection. A failed image decode stops the run rather than silently omitting a file. All-pairs comparison is quadratic and is intended for small collections.

Local page preview from this project folder:

```bash
python -m http.server 8767
# Open http://localhost:8767/
```

The repository's existing `npm run build` copies the generated page and committed evidence to `dist/library_image_duplicates/`. Its existing GitHub Pages workflow publishes `dist/`. CI builds the static evidence, not an undisclosed new AI experiment.

## Evidence and checks

- [Source manifest](data/sources.json), [source metadata](data/metadata), [image acquisition record](data/collection-preparation.json), [transformations / known identities](data/manifest.json).
- [Measured implementation file hashes](results/implementation.json).
- [Predictions including every scored pair](results/predictions), [metrics](results/metrics.json), [threshold grid](results/thresholds.json), [first/cached timing runs](results/benchmark-runs.json), [incremental runs](results/incremental-runs.json), [preparation](results/preparation.json), [model download timing](data/model.json), [environment](results/environment.json).
- `scripts/check.py`: exact representative checks, identity split integrity, cache key/config invalidation, file/thumbnail checksums, full-vs-incremental equality, rederived metrics, page data equality and local link targets. [Saved check results](results/validation.json).
- `scripts/check-browser.mjs`: desktop/mobile rendering, image loading, candidate filter counts, gallery interactions, console errors and accessibility. Run from the repository root after starting a static server: `node library_image_duplicates/scripts/check-browser.mjs http://127.0.0.1:8767/`.

Project code follows the repository MIT license. Collection photographs and model materials retain their own provenance and rights statements.
