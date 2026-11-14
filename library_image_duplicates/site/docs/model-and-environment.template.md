# Model and environment details

[Back to the overview](../README.md)

## Model name, code version and weight identity

- **SSCD `sscd_disc_mixup`**, ResNet50, 512 dimensions, official standalone TorchScript.
- [Official upstream code/documentation snapshot](https://github.com/facebookresearch/sscd-copy-detection/tree/95902662f2217a5f4aa45f2a3fc70a01dfd3b66a): `95902662f2217a5f4aa45f2a3fc70a01dfd3b66a`. This identifies code/documentation, not a separately versioned weight release.
- [Official weights](https://dl.fbaipublicfiles.com/sscd-copy-detection/sscd_disc_mixup.torchscript.pt), SHA-256: `{{MODEL_SHA}}`.
- Upstream repository license: MIT. Weights are downloaded from the authors' public reproduction distribution and are not redistributed in this repository. [Recorded model provenance](../data/model.json).
- Preprocessing: Pillow EXIF transpose → RGB → direct bilinear resize to 320×320 (aspect ratio may change) → float32 /255 → mean `[0.485,0.456,0.406]`, std `[0.229,0.224,0.225]` → CHW. No center crop. L2-normalize output; cosine rounded to eight decimals for saved scores and threshold comparisons.
- Batch size 1; CPU; PyTorch two intra-op threads and one inter-op thread; inference mode, eval mode, deterministic algorithms. No training, whitening, descriptor centering or score normalization.
- [SSCD paper](https://arxiv.org/abs/2202.10261): Pizzi et al., *A Self-Supervised Descriptor for Image Copy Detection*, CVPR 2022. [Standard pHash implementation](https://github.com/JohannesBuchner/imagehash).

## Recorded environment

{{ENVIRONMENT_MD}}

### Direct dependencies

{{DEPENDENCIES_MD}}

The [complete package list](../results/packages.txt) includes transitive dependencies. [Environment JSON](../results/environment.json) records the full platform string and timing scope. [Implementation file hashes](../results/implementation.json) identify the measured detection and evaluation code.

### Preparation

Model download time, URL and hash are in [model.json](../data/model.json). Image download details are recorded [per source](../data/sources.json); [preparation.json](../results/preparation.json) records transformation time. Downloads are excluded from detection timings. Model loading is included whenever features must be calculated.
