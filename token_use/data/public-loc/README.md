# Real public catalog sample: Library of Congress

These are **12 real catalog records**, separate from the project's synthetic
fixtures. No record was written or rewritten by a model. Historical titles and
catalog wording are reproduced as supplied by the source. No images or private
library data were downloaded.

## Source and reuse

Source collection: [Farm Security Administration/Office of War Information
Color Photographs](https://www.loc.gov/collections/fsa-owi-color-photographs/).
The official [Rights and Access statement](https://www.loc.gov/collections/fsa-owi-color-photographs/about-this-collection/rights-and-access/)
describes the collection contents as public domain and available for reuse.
Each of the twelve downloaded bibliographic objects also says `No known
restrictions on publication.` Its original advisory is retained in the output;
this project does not replace source qualifications with its own license.

Credit: Library of Congress, Prints & Photographs Division, Farm Security
Administration/Office of War Information Color Photographs.

Verified **2026-10-04** through the official indexed rights-page text retrieved
by web search and the actual item advisories in the downloaded response. Direct
HTTP requests to the rights page returned 403; that access limitation is recorded
rather than described as a successful page download. This subset is not covered
by our synthetic-data CC0 dedication. Do not generalize this collection's
statement to all Library of Congress holdings. The [general source terms](https://www.loc.gov/legal/)
and original records remain available for checking.

## Acquisition and sampling

The [manifest](manifest.json) records the exact UTC acquisition time, source
URL, returned order, twelve IDs, individual catalog links and SHA-256 checksums.
On 2026-10-04 the acquisition script made one collection API request:

[Collection page 1, twelve results, JSON](https://www.loc.gov/collections/fsa-owi-color-photographs/?fo=json&c=12&sp=1)

We took all twelve results in the order returned, with **no query or filtering
by subject, completeness, rights wording or token savings**. Every item advisory
was checked before publication; a different advisory would have stopped
acquisition instead of silently substituting another record. This convenience
sample is not representative of LOC or of library metadata generally.

[records.jsonl](records.jsonl) stores each complete `results[i].item` object,
unchanged in value, as one JSON object per line. This is the native bibliographic
object, not the outer website/search response: navigation envelopes and image
resources are excluded before defining either input. Thumbnail links already
inside a bibliographic object remain in the full baseline. The complete HTTP
response's checksum is recorded; that response envelope is not redistributed.
A separate item-endpoint probe returned 500, so the detailed objects supplied
by the collection response were used. See the [API documentation](https://www.loc.gov/apis/json-and-yaml/requests/endpoints/).

The [design](../../docs/public-case-design.md), [field configuration](../../configs/public-subject-review.json)
and [task prompt](../../templates/public-subject-review.txt) were fixed and hashed
before token measurement. The date/reuse/notes fields were not removed to
increase the measured reduction. Live API ordering or content may change;
reproduce the published experiment with the checked-in snapshot. The separate
[acquisition script](../../scripts/fetch_public_sample.py) documents how it was
obtained and refuses to overwrite an existing snapshot. It is **not** invoked
by local preprocessing.

## Native schema and retained evidence

The real sample uses native LOC keys, not the synthetic schema's `abstract`
and `source_locator` fields. The adapter constructs a local line pointer while
preserving native `id` and `link` in every member mapping.

| Task information | Native fields kept |
| --- | --- |
| Subject evidence | `title`, `summary`, `subject_headings`, `subjects` |
| Dating and attribution | `date`, `created_published`, `language`, `contributors`, `creators` |
| Description and context | `other_title`, `medium`, `format`, `genre`, `place`, `notes` |
| Provenance and versions/copies | `part_of`, `source_collection`, `repository`, `call_number`, `reproduction_number`, `digital_id`, `control_number`, `other_control_numbers`, `number_former_id`, `edition`, `copy` |
| Rights/access | `rights_advisory`, `rights_information`, `display_offsite` |
| Traceability | `id`, `link`, generated raw-file line pointer |

The configured `summary`, `other_title`, `edition` and `copy` may be absent.
Absent values become explicit `null`, not invented catalog facts. Required
summary absence is flagged; optional edition/copy absence is separately listed.
The original `call_number` and `reproduction_number` still distinguish physical
and reproduction context. This task makes no new edition/copy claim.

Removed fields are administrative timestamps and internal indexing fields,
image-service/thumbnail links, a MARC download link, and duplicate display
representations of retained dates, media and genre. The record-by-record
[retention ledger](../../results/public-case/retention.json) lists every removed
key. A task that depends on those fields needs the full baseline or a revised
configuration.

## What the actual run shows

<!-- PUBLIC-RESULTS:START -->

| Data / task | Records → items | Baseline tokens | Prepared tokens | Input reduction | Retention and limit |
| --- | ---: | ---: | ---: | ---: | --- |
| Real LOC metadata · subject-review preparation | 12 → 12 | 14,914 | 11,487 | 22.98% | All 12 IDs and 29 configured field values per row preserved; 11 records need more evidence |

<!-- PUBLIC-RESULTS:END -->

Eleven summaries are absent in the source; this is an evidence limitation of
our title-and-summary task, not proof of erroneous cataloging. The sole supplied
summary, for `2017877476`, says people **might** be farm workers and attributes
that information to the Flickr Commons project; that uncertainty and attribution
remain unchanged. Record `2017877359` retains the date `194[1] Jan.?`.
Three records share a copper-plant title but remain separate source items.

Only material preparation, retained values and input size were tested. No image
inspection, AI review, catalog correction or HokieAI quota measurement occurred.
[Full worked example](../../docs/worked-example.md) ·
[Counted baseline](../../results/public-case/baseline.txt) ·
[Counted prepared packet](../../results/public-case/prepared.txt).
