# Frozen Library of Congress sample

[loc-sample.json](loc-sample.json) is the unmodified byte stream downloaded from
the Library of Congress (LOC) Labs [Free to Use and Reuse data package](https://data.labs.loc.gov/free-to-use/).
The official package provides a 100-item random sample of its 2,610 curated
items. We use all 100 rows without selecting for length, descriptions, or token
savings. The source does not document the sample's random seed. This is a
sample of curated selections, not a representative sample of library holdings.

[manifest.json](manifest.json) records the download URL, UTC acquisition time,
byte count, and SHA-256 checksum. The data were acquired on 2026-10-17.
These are real published metadata, not model-generated records. No images or
private records were acquired. The data package itself previously mapped and
standardized source metadata; this is not a raw MARC export.

Credit: Library of Congress, LC Labs, the contributing collecting divisions,
and AVP. The original [documentation](https://data.labs.loc.gov/free-to-use/README.html)
describes the collection and field transformations. Its rights statement says
the curated resources are public domain, have no known copyright, or have been
cleared by the copyright owner for public use. This study preserves each
record's original Rights field, including qualifications and source links;
it does not grant a new blanket license to collection materials. The project's
software license does not replace source terms.

The raw `Location` field contains enrichment from OpenStreetMap; credit
[OpenStreetMap contributors](https://www.openstreetmap.org/copyright).
LOC cautions that these geocoded matches can be inaccurate. The task projection
omits this enrichment but preserves original `Location_text`. Original catalog
wording, including historical terminology, remains in the snapshot.

For a separate, fresh acquisition, run from `research/`:

```bash
python acquire.py --out outputs/new-download
```

This requires a network connection and refuses to overwrite existing data.
Live content may change. Reproduce the published pilot using the checked-in
snapshot; changing it requires a new design, checksum, and separately reported
run. The default preprocessing never downloads source data.
