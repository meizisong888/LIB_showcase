# Worked example: prepare a subject-review packet

This is a static, complete example you can read on GitHub. No presentation,
recording, account or live model response is needed. The files below are actual
run artifacts. This example uses **real public LOC metadata**; the shorter R007
example in the README is explicitly synthetic.

## 1. Start with the employee's question and original record

The employee wants to check existing subject headings against a photograph
record's title and any summary. This is a text-evidence task. It cannot establish
what an unseen photograph depicts or whether the metadata is historically true.

Open [the fixed input](../data/public-loc/records.jsonl). The first record is
`2017877351`, a Lowell commuter photograph. Its
[catalog source](https://www.loc.gov/pictures/item/2017877351/) and
[acquisition manifest](../data/public-loc/manifest.json) make its provenance
checkable. Here is its **complete native bibliographic object**, from
[example-before.json](../results/public-case/example-before.json):

<!-- PUBLIC-BEFORE:START -->

```json
{
  "call_number": "LC-USF35-1 [P&P]",
  "contributors": [
    "Delano, Jack, 1914-1997, photographer"
  ],
  "control_number": "2017877351",
  "created": "2023-02-14T06:38:17Z",
  "created_published": "1941 Jan.",
  "created_published_date": "1941 Jan.",
  "creators": [
    {
      "link": "https://www.loc.gov/pictures/related/?fi=name&q=Delano%2C%20Jack%2C%201914-1997&co=fsac",
      "role": "photographer",
      "title": "Delano, Jack, 1914-1997"
    }
  ],
  "date": "1941 Jan.",
  "digital_id": [
    "fsac 1a33849 https://hdl.loc.gov/loc.pnp/fsac.1a33849"
  ],
  "display_offsite": true,
  "format": [
    "still image"
  ],
  "formats": [
    {
      "link": "https://www.loc.gov/pictures/related/?fi=format&q=Slides--Color.&co=fsac",
      "title": "Slides--Color."
    }
  ],
  "genre": [
    "Slides--Color"
  ],
  "id": "2017877351",
  "language": [
    "eng"
  ],
  "link": "https://www.loc.gov/pictures/item/2017877351/",
  "marc": "https://www.loc.gov/pictures/item/2017877351/marc/",
  "medium": [
    "1 slide : color."
  ],
  "medium_brief": "1 slide :",
  "mediums": [
    "1 slide : color."
  ],
  "modified": "2023-02-14T06:38:18Z",
  "notes": [
    "11671-1.",
    "Transfer from U.S. Office of War Information, 1944.",
    "General information about the FSA/OWI Color Photographs is available at http://hdl.loc.gov/loc.pnp/pp.fsac",
    "Title from FSA or OWI agency caption.",
    "Additional information about this photograph might be available through the Flickr Commons project at http://www.flickr.com/photos/library_of_congress/2178248615"
  ],
  "number_former_id": [
    "https://www.loc.gov/item/2017877351",
    "https://www.loc.gov/item/fsa1992000012/PP"
  ],
  "other_control_numbers": [
    "19977862",
    "fsa1992000012/PP"
  ],
  "part_of": "Farm Security Administration - Office of War Information color slides and transparencies collection (Library of Congress)",
  "place": [
    {
      "latitude": "",
      "link": "https://www.loc.gov/pictures/related/?fi=place&q=Massachusetts--Lowell&co=fsac",
      "longitude": "",
      "title": "Massachusetts--Lowell"
    }
  ],
  "raw_collections": [
    "ammem",
    "diof",
    "flickrppoc",
    "fsac",
    "pp",
    "srtg"
  ],
  "repository": "Library of Congress Prints and Photographs Division Washington, D.C. 20540 USA http://hdl.loc.gov/loc.pnp/pp.print",
  "reproduction_number": "LC-DIG-fsac-1a33849 (digital file from original slide)\nLC-USF351-1 (color film copy slide)",
  "resource_links": [
    "https://hdl.loc.gov/loc.pnp/fsac.1a33849"
  ],
  "rights_advisory": "No known restrictions on publication.",
  "rights_information": "No known restrictions on publication.",
  "service_low": "https://tile.loc.gov/storage-services/service/pnp/fsac/1a33000/1a33800/1a33849_150px.jpg",
  "service_medium": "https://tile.loc.gov/storage-services/service/pnp/fsac/1a33000/1a33800/1a33849r.jpg",
  "sort_date": "1939",
  "source_collection": [
    "Farm Security Administration - Office of War Information color slides and transparencies collection (Library of Congress)"
  ],
  "source_created": "1985-01-01T00:00:00Z",
  "source_modified": "2023-02-07T13:08:13Z",
  "subject_headings": [
    "commuters",
    "bus stops",
    "United States--Massachusetts--Lowell",
    "Massachusetts--Lowell"
  ],
  "subjects": [
    "Commuters",
    "Bus stops",
    "United States--Massachusetts--Lowell"
  ],
  "thumb_gallery": "https://tile.loc.gov/storage-services/service/pnp/fsac/1a33000/1a33800/1a33849_150px.jpg",
  "title": "Commuters, who have just come off the train, waiting for the bus to go home, Lowell, Mass."
}
```

<!-- PUBLIC-BEFORE:END -->

The absent summary is a fact about this input, not a defect diagnosed by the
program. The title identifies commuters and a bus stop, but the declared
review still requires a summary or an explicit statement of insufficient evidence.

## 2. Read the task configuration before removing anything

[public-subject-review.json](../configs/public-subject-review.json) names all
29 content fields retained. Titles, summaries and subjects supply task evidence;
notes, original dates, creators, language, rights, collection provenance and
copy/reproduction identifiers qualify it. `id` and `link` move into the member
mapping. An absent configured field is represented by null and, when required,
listed in `missing_fields`.

The complete [task/design note](public-case-design.md) was fixed before token
measurement. Removed fields are recorded individually: import/index timestamps,
image-service links and duplicate display representations do not determine
subject support in this specific text-only task. A different task may need them.

## 3. Run the actual local command, if desired

After [setup](../README.md#try-it), from `token_use/`:

```bash
.venv/bin/python scripts/prepare_public_case.py
```

The command reads the checked-in sample and writes `outputs/public-review/`.
It neither downloads source data nor invokes a model. The pre-generated
[baseline](../results/public-case/baseline.txt) and
[prepared packet](../results/public-case/prepared.txt) are available to readers
who do not run it. Both contain the same complete task prompt and use the same
JSON serializer and tokenizer.

## 4. Compare the complete prepared item

The following is the generated first item from
[example-after.json](../results/public-case/example-after.json), not a hand-edited
illustration. It retains the complete catalog notes and rights statement.

<!-- PUBLIC-AFTER:START -->

```json
{
  "fields": {
    "call_number": "LC-USF35-1 [P&P]",
    "contributors": [
      "Delano, Jack, 1914-1997, photographer"
    ],
    "control_number": "2017877351",
    "copy": null,
    "created_published": "1941 Jan.",
    "creators": [
      {
        "link": "https://www.loc.gov/pictures/related/?fi=name&q=Delano%2C%20Jack%2C%201914-1997&co=fsac",
        "role": "photographer",
        "title": "Delano, Jack, 1914-1997"
      }
    ],
    "date": "1941 Jan.",
    "digital_id": [
      "fsac 1a33849 https://hdl.loc.gov/loc.pnp/fsac.1a33849"
    ],
    "display_offsite": true,
    "edition": null,
    "format": [
      "still image"
    ],
    "genre": [
      "Slides--Color"
    ],
    "language": [
      "eng"
    ],
    "medium": [
      "1 slide : color."
    ],
    "notes": [
      "11671-1.",
      "Transfer from U.S. Office of War Information, 1944.",
      "General information about the FSA/OWI Color Photographs is available at http://hdl.loc.gov/loc.pnp/pp.fsac",
      "Title from FSA or OWI agency caption.",
      "Additional information about this photograph might be available through the Flickr Commons project at http://www.flickr.com/photos/library_of_congress/2178248615"
    ],
    "number_former_id": [
      "https://www.loc.gov/item/2017877351",
      "https://www.loc.gov/item/fsa1992000012/PP"
    ],
    "other_control_numbers": [
      "19977862",
      "fsa1992000012/PP"
    ],
    "other_title": null,
    "part_of": "Farm Security Administration - Office of War Information color slides and transparencies collection (Library of Congress)",
    "place": [
      {
        "latitude": "",
        "link": "https://www.loc.gov/pictures/related/?fi=place&q=Massachusetts--Lowell&co=fsac",
        "longitude": "",
        "title": "Massachusetts--Lowell"
      }
    ],
    "repository": "Library of Congress Prints and Photographs Division Washington, D.C. 20540 USA http://hdl.loc.gov/loc.pnp/pp.print",
    "reproduction_number": "LC-DIG-fsac-1a33849 (digital file from original slide)\nLC-USF351-1 (color film copy slide)",
    "rights_advisory": "No known restrictions on publication.",
    "rights_information": "No known restrictions on publication.",
    "source_collection": [
      "Farm Security Administration - Office of War Information color slides and transparencies collection (Library of Congress)"
    ],
    "subject_headings": [
      "commuters",
      "bus stops",
      "United States--Massachusetts--Lowell",
      "Massachusetts--Lowell"
    ],
    "subjects": [
      "Commuters",
      "Bus stops",
      "United States--Massachusetts--Lowell"
    ],
    "summary": null,
    "title": "Commuters, who have just come off the train, waiting for the bus to go home, Lowell, Mass."
  },
  "item_id": "item-a123b63b1223fc2ed41b2277e14a4ac19d68b51a21d8f5f4e2aa0e0644e914d2",
  "members": [
    {
      "id": "2017877351",
      "source_locator": "data/public-loc/records.jsonl#L1",
      "source_url": "https://www.loc.gov/pictures/item/2017877351/"
    }
  ],
  "missing_fields": [
    "summary"
  ],
  "optional_context_not_supplied": [
    "other_title",
    "edition",
    "copy"
  ],
  "preparation_status": "insufficient_material"
}
```

<!-- PUBLIC-AFTER:END -->

The ID, catalog URL and raw-file line remain in `members`. There is no inferred
abstract: `summary` is null and `missing_fields` names it. Optional edition,
copy and alternate-title absence is separately visible. This does not erase
the supplied call number or reproduction information.

## 5. Inspect the checks and mapping

Open `outputs/public-review/retention.json`, `id-map.json` and
`missing-information.json`; the published equivalents are
[retention](../results/public-case/retention.json),
[ID map](../results/public-case/id-map.json) and
[missing-information list](../results/public-case/missing-information.json).
All twelve records remain separate; the repeated copper-plant title in
`2017877451`, `2017877452` and `2017877454` does not establish an exact duplicate.
For an actual grouping example, see the synthetic R001/R059 pair in
[the original retention map](../results/case1/retention.json).

Two more real qualifications are important: `2017877359` retains the uncertain
date `194[1] Jan.?`; `2017877476` retains the summary's *might be farm workers*
and its Flickr Commons attribution. The checker verifies value equality and
mapping, not the truth or meaning of those statements. It flags eleven missing
summaries rather than treating every retained ID as sufficient evidence.

## 6. Open what would be sent to HokieAI

Use **all of `outputs/public-review/prepared.txt`**, including its opening
[task prompt](../templates/public-subject-review.txt). The task asks for IDs,
suspected issues, exact evidence and an insufficient-information label; it
forbids invented summaries, sources and headings. No replacement vocabulary
is used. If a revised task restricts terms to a vocabulary, supply and count
that vocabulary too. No actual HokieAI response is claimed in this example.

If a needed source field was excluded, use `baseline.txt` instead. For a summary
not present in either file, obtain appropriate additional material or retain an
insufficient-information conclusion. Restoring the baseline cannot create it.

## 7. Read the result with its limitation

<!-- PUBLIC-RESULTS:START -->

| Data / task | Records → items | Baseline tokens | Prepared tokens | Input reduction | Retention and limit |
| --- | ---: | ---: | ---: | ---: | --- |
| Real LOC metadata · subject-review preparation | 12 → 12 | 14,914 | 11,487 | 22.98% | All 12 IDs and 29 configured field values per row preserved; 11 records need more evidence |

<!-- PUBLIC-RESULTS:END -->

Every configured value and source member was preserved; missing source evidence
remains missing. The percentage is a text-input reduction under cl100k_base,
not a measured HokieAI allocation change or proof of equally good AI answers.
The new [isolated run](../results/public-case-evidence/offline-run.json) and four
[targeted checks](../results/public-case-evidence/tests.txt) validate preparation.
The [developer reproduction check](../results/showcase-checks/developer-check.json)
records execution of the documented command, artifact equality and link checks.
It is **not** a librarian user test. No recording or oral explanation is required
for this deliverable.
