# Finding Duplicate Images in Library Collections

Find possible copies of the same photograph so library staff can review them together.

**[Open the image showcase](https://meizisong888.github.io/LIB_showcase/library_image_duplicates/)**

<p><img src="images/2011636061__original.jpg" width="45%" alt="Original" /> <img src="images/2011636061__crop.jpg" width="45%" alt="Cropped version" /></p>

Original (left); cropped version (right). [Source photograph](https://www.loc.gov/pictures/collection/highsm/item/2011636061/).

## Overview

A library collection may contain the same photograph under different filenames, at different sizes, or saved with lower image quality. A cropped version may show only part of the original picture.

This project compares simple methods and AI for finding these versions. It also measures whether reusing earlier calculations saves time. The tool suggests pairs for staff to review; it does not automatically delete files.

## What the tool does

- Finds identical files and edited copies of the same photograph.
- Displays candidate image pairs for review.
- Reuses previous results to avoid unnecessary computation.

An edited copy comes from one original photograph. Another photograph of the same building, taken from a different angle or at another time, is a different image.

## How it works

| Method | What it does |
| --- | --- |
| File hash | Checks whether files contain exactly the same bytes: the information stored inside the file. |
| Perceptual hash (pHash) | Compares compact fingerprints of the overall image appearance. |
| AI image features (SSCD) | Uses a pretrained model to compare visual features, including edited versions. |
| Exact-copy reuse + SSCD | Computes AI features once for identical files and reuses saved features when processing new files. |

pHash is not AI. The reuse method checks identical files first; other files still receive AI comparison, even when pHash misses them.

## Example outputs

These examples use actual files and saved predictions. “Found” means selected for review. The original photograph is known here, so we can check the answers.

### 1. Same image, different filename

<p><img src="images/2011636061__original.jpg" width="45%" alt="Original" /> <img src="images/2011636061__copy.jpg" width="45%" alt="Renamed copy" /></p>

Original (left); renamed copy (right). [Source photograph](https://www.loc.gov/pictures/collection/highsm/item/2011636061/).

**What changed?** Only the filename changed.

**What did the methods find?** All four methods found this pair.

**What does this show?** An exact copy needs no AI to identify it.

### 2. Same photograph, cropped

<p><img src="images/2011636061__original.jpg" width="45%" alt="Original" /> <img src="images/2011636061__crop.jpg" width="45%" alt="Cropped version" /></p>

Original (left); cropped version (right). [Source photograph](https://www.loc.gov/pictures/collection/highsm/item/2011636061/).

**What changed?** About a quarter of the picture was removed.

**What did the methods find?** SSCD and Exact-copy reuse + SSCD found it. File hash and pHash missed it.

**What does this show?** AI can help when an edit changes the overall picture.

### 3. A difficult case: a missed match

<p><img src="images/2011636061__compressed.jpg" width="45%" alt="Compressed version" /> <img src="images/2011636061__crop.jpg" width="45%" alt="Cropped version" /></p>

Compressed version (left); cropped version (right). [Source photograph](https://www.loc.gov/pictures/collection/highsm/item/2011636061/).

**What changed?** One version was compressed; the other was cropped.

**What did the methods find?** None of the four methods found this pair.

**What does this show?** Even AI can miss two edited copies of the same photograph.


## Results

We used **30 real collection photographs** to construct a controlled experiment; its test set contains **270 known duplicate pairs**, not 270 images.

| Method | Duplicate pairs found | False matches | Missed pairs |
| --- | --- | --- | --- |
| File hash | 18 | 0 | 252 |
| pHash | 230 | 94 | 40 |
| SSCD | 268 | 0 | 2 |
| Exact-copy reuse + SSCD | 268 | 0 | 2 |


- File hashes found exact copies.
- pHash found more edited copies but also produced false matches.
- SSCD found 268 of 270 duplicate pairs, with no false matches in this test.
- Reusing exact-copy features preserved these results while reducing processing time.

| Comparison | Without reuse | With reuse |
| --- | --- | --- |
| First run: SSCD → exact-copy reuse + SSCD | 15.77 s | 13.86 s |
| Adding five files: full recalculation → saved-feature reuse | 13.98 s | 3.82 s |

The first row compares the same 108 test files, with both saved-feature stores empty. The second compares the reuse method on 113 files: start from an empty store and recalculate everything, or keep the earlier 108-file results and calculate only missing features. Both ways produced the same output.

Times are medians of three runs in the same environment, including model loading when needed. They measure processing time, not energy or cost. [Full experimental results](docs/full-results.md) explain the measurements and their variation.

## Tools used

Python; SHA-256 and pHash; SSCD `sscd_disc_mixup` (ResNet50); Intel Xeon Gold 6426Y CPU. [Model and environment details](docs/model-and-environment.md).

## Conclusion

In this small experiment, AI helped find edited photograph copies. Confirming identical files first and saving earlier results reduced repeated processing while preserving the matches found.

- Results come from a small controlled dataset and may differ on other collections.
- Candidate matches should be reviewed before collection-management decisions.

## Try it / Further details

After [setup](docs/setup-and-reproduction.md), run these commands from `library_image_duplicates`:

```bash
python scripts/prepare.py --model-only
python scripts/scan.py /path/to/images --method D --output /path/to/review
```

Open `/path/to/review/index.html`. Choose an output folder outside the images folder. The webpage above shows precomputed results, not an online AI detection service.

- [Setup and reproduction](docs/setup-and-reproduction.md)
- [Full experimental results](docs/full-results.md)
- [Data sources](docs/data-sources.md)
- [Model and environment details](docs/model-and-environment.md)
