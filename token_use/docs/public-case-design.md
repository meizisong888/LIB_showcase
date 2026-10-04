# Public-data case: design before measurement

Written before downloading the sample or counting its inputs, 2026-10-04.

**Task:** prepare twelve real Library of Congress (LOC) photograph catalog
records for checking whether existing subject headings are supported by the
catalog title and any summary. This is a text-evidence check, not image
interpretation, authority control, or verification of historical truth. Do not
invent a summary when the catalog has none. No replacement headings are requested.

**Source and sampling:** use the first twelve items returned by the FSA/OWI
Color Photographs collection's JSON endpoint, in its returned order, with no
content, token-size or completeness filtering. Fix their IDs and downloaded
record hashes for reproduction. Verify the collection's public reuse statement
and each available rights advisory before publishing metadata. Download no images.

**Necessary content, defined first:** retain the source's title, summary if
present, all subject headings, original date wording, language, creators,
collection/repository provenance, alternate titles, physical/format description,
edition or copy identifiers where present, all catalog notes, rights/access
qualifications, stable record ID, catalog URL and local raw-record pointer.
Keep original field values; an absent field is an explicit missing-information
flag, not a reconstructed fact. Required fields are not a claim that the
source supplies them. Discovering native field names may require schema mapping;
that mapping must be frozen before running the comparison.

**Baseline:** the complete bibliographic `item` object nested in each collection
search result,
with the same source/ID wrapper used for selected material. Exclude HTTP/site
navigation envelopes and image derivatives from both sides. Do not create
extra baseline filler or manufacture duplicates. Keep the downloaded item
objects unchanged; any extraction from the response is documented.

**Prepared material:** retain the configured task fields, complete notes and
qualifications, plus source members and any missing-information flags. Group
only exact task content with all original IDs mapped. Keep every sample record.

**Measurement:** use the same new task template, `write_input` serializer and
local tiktoken 0.12.0 / cl100k_base counter on both sides. Count every piece of
text actually sent, including provenance and warnings. Report the result even
if preparation increases tokens. Report per-field equality and missingness,
not just ID coverage. This case measures preparation and input size only;
no HokieAI call or independent AI-answer evaluation is planned.

Schema inspection found detailed bibliographic objects in the collection
response. A separate item-endpoint probe returned HTTP 500; use the collection
response's native `results[i].item` objects instead. This adjustment precedes
measurement and does not select records by their content or potential reduction.
