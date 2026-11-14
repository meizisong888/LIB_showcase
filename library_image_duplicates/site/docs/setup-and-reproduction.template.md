# Setup and reproduction

[Back to the overview](../README.md)


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

`prepare.py` verifies the downloaded source bytes and model against committed hashes. It also requires the same transformation records and full-file checksums as the frozen manifest. An upstream replacement or an incompatible decoder/encoder causes a clear failure, not a silent dataset change. Network/catalog availability can vary. Selected catalog pages returned HTTP 403 to automated link checks, although all 32 image downloads succeeded; see [external-link verification limits](../results/external-links.json). It reuses the committed source manifest; the one-time `collect.py` discovery/provenance assembly is not part of normal reproduction.

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


## Documentation updates without model inference

To rebuild the presentation from existing results, run only:

```bash
python scripts/build.py
python scripts/check.py --static-only
python scripts/evaluate.py --check
```

These commands do not run the AI model. Documentation source files live in `site/readme.template.md`, `site/index.template.html` and `site/docs/`. Keep edits there so the next build preserves them.
