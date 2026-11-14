# Data sources

[Back to the overview](../README.md) · [Browse all source photographs and rights](https://meizisong888.github.io/LIB_showcase/library_image_duplicates/sources.html)

## Real photographs, constructed edits

The main experiment starts with 30 photographs from the Library of Congress. Five versions of each were actually made in Python: an unchanged copy with a different filename, a smaller image, a compressed JPEG, a crop retaining about 75% of the picture, and that crop enlarged again. Together with the originals, this gives 180 files.

Each edit inherits its original photograph's identity, giving known answers for evaluation. These are real collection images with artificially constructed variants, not a representative sample of every library collection.

Five files were added for the incremental experiment: three further versions of existing test photographs and two new, independent photographs. There are therefore 32 source photographs and 185 experiment files in the complete record.

## Where the images came from

The selection combines 11 Highsmith Archive photographs, 12 FSA/OWI color photographs and nine photographic records from an earlier Library of Congress sample in this repository. It is a convenience sample, not a random sample of the collection.

The catalog API limited requests after the first 11 new records. For the remaining records, the project retained earlier official metadata snapshots already saved in this repository. Every image was actually downloaded. Metadata snapshot dates and image download dates are distinguished in the provenance record.

- [Source manifest](../data/sources.json): page and download URLs, collection title, source ID, photographer, rights statement, download date, image dimensions and file checksum.
- [Original metadata](https://github.com/meizisong888/LIB_showcase/tree/main/library_image_duplicates/data/metadata): preserved source records.
- [Acquisition record](../data/collection-preparation.json): source snapshot hashes and catalog access limits.
- [Transformation ledger](../data/manifest.json): random seed, exact transformation parameters, original identities, calibration/test groups and file checksums.
- [Thumbnail ledger](../data/thumbnails.json): displayed image checksums and their links to the measured files. Existing thumbnails, rather than newly invented images, illustrate the overview.

## Rights and attribution

Rights were checked per item. The catalog wording “No known restrictions” is preserved as a rights statement; it is not rewritten as a guarantee that all library images are public domain. The source page lists each item's rights source and download record. Credit belongs to the named photographers and the Library of Congress, Prints and Photographs Division.

Some historical titles contain dated language. The titles remain unchanged in the source records. The overview uses short image labels for readability.

Some LOC catalog pages return HTTP 403 or 429 to automated requests. All image downloads succeeded during preparation. See [external-link verification limits](../results/external-links.json). The links and saved metadata are retained even where this automated environment cannot verify ordinary-browser access.

## Distinct photographs of similar subjects

[Identity review](../data/identity-review.json) records source IDs and visible differences for selected negative pairs. These include different views of memorials, an industrial plant and a creek scene. Different camera positions, foregrounds and people’s poses distinguish these photographs from crops of a single exposure. Uncertain identities were not forced into labels.

The [full experimental results](full-results.md) explain the split, thresholds, evaluation and limitations.
