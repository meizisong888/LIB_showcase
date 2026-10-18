# Same-record answers: selected without favoring reduction

The frozen design specified the first record in each description stratum and both extremes of primary usability/coverage differences. For a deterministic operational rule, extremes below use **coverage delta** (task_fields minus full_compact), break ties by the original schedule, and report usability alongside. Duplicate selections appear once. Choosing coverage as the scalar was an analysis-time clarification of the frozen rule, not a separately preregistered formula. This is a developer inspection of raw outputs and AI judgments, not human scoring. All [80 raw answers](../runs/generation/) and [all AI judgments](ai-evaluation.json) remain available.

## row-100: Unfinished steel structure intact after quake, San Francisco

Selected because: First scheduled record with a nonempty Description.

[Original item](http://www.loc.gov/item/2004680400/) · [Frozen full source](../../data/loc-sample.json) · [Raw evaluator response](../runs/evaluation/row-100/attempt-01/response.txt)

Provisional source facts, fixed before generation and not human-confirmed:

```json
[
  {
    "fact_id": "F1",
    "fact": "Unfinished steel structure remained intact after the San Francisco earthquake and fire.",
    "source_fields": [
      "Title",
      "Description"
    ],
    "source_values": {
      "Title": "Unfinished steel structure intact after quake, San Francisco",
      "Description": [
        "Photo shows the San Francisco earthquake and fire disaster with a man standing among rubble in foreground and an unfinished but intact steel structure in background and remnants of burned out brick and stone buildings nearby"
      ]
    }
  },
  {
    "fact_id": "F2",
    "fact": "Man among foreground rubble, with burned brick and stone buildings nearby.",
    "source_fields": [
      "Description"
    ],
    "source_values": {
      "Description": [
        "Photo shows the San Francisco earthquake and fire disaster with a man standing among rubble in foreground and an unfinished but intact steel structure in background and remnants of burned out brick and stone buildings nearby"
      ]
    }
  },
  {
    "fact_id": "F3",
    "fact": "Photographic print dated c1906; do not turn the copyright date into a precise exposure date.",
    "source_fields": [
      "Medium",
      "Date_text",
      "Notes"
    ],
    "source_values": {
      "Medium": [
        "1 photographic print."
      ],
      "Date_text": "c1906.",
      "Notes": [
        "Caption card tracings: Photog. Index; Ca. SF Earthquake; Shelf.",
        "Photo copyrighted by George R. Lawrence & Co., Chicago.",
        "Title from item."
      ]
    }
  }
]
```

### full_pretty

[Exact prompt](../runs/generation/row-100--full_pretty/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-100--full_pretty/attempt-01/response.txt)

```json
{
  "record_id": "http://www.loc.gov/item/2004680400/",
  "description": "Photographic print cataloged as “Unfinished steel structure intact after quake, San Francisco,” with the date recorded as “c1906.” The catalog description identifies a man standing among rubble, an unfinished but intact steel structure behind him, and remnants of burned-out brick and stone buildings following the San Francisco earthquake and fire. A note credits George R. Lawrence & Co., Chicago, as the photograph’s copyright holder.",
  "evidence_fields": ["Title", "Date_text", "Medium", "Description", "Notes"],
  "limitations": ["The underlying photograph was not examined.", "No creator is identified; the copyright credit does not establish authorship."]
}
```

Raw AI judgment: 3/3 fully covered facts; 0 partial; 0 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **yes**.

**Evaluator’s reason (unconfirmed):** “with the date recorded as “c1906.”” follows Date_text, and the man, structure, and burned remnants follow Description. “copyright holder” reflects Notes without assigning photographer authorship. No important correction or addition is needed.

### full_compact

[Exact prompt](../runs/generation/row-100--full_compact/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-100--full_compact/attempt-01/response.txt)

```json
{"record_id":"http://www.loc.gov/item/2004680400/","description":"Photographic print titled “Unfinished steel structure intact after quake, San Francisco,” dated “c1906.” The catalog description identifies a man standing amid rubble, an unfinished but intact steel structure behind him, and nearby remnants of burned-out brick and stone buildings following the San Francisco earthquake and fire. A note credits the photograph’s copyright to George R. Lawrence & Co., Chicago.","evidence_fields":["Title","Date_text","Medium","Description","Notes"],"limitations":["Description relies on catalog metadata, not examination of the photograph.","No creator is identified; the copyright credit does not establish photographer authorship."]}
```

Raw AI judgment: 3/3 fully covered facts; 0 partial; 0 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **yes**.

**Evaluator’s reason (unconfirmed):** “dated “c1906.”” preserves Date_text; “an unfinished but intact steel structure behind him” and “nearby remnants of burned-out brick and stone buildings” faithfully convey Description. No important factual addition or correction is needed.

### task_fields

[Exact prompt](../runs/generation/row-100--task_fields/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-100--task_fields/attempt-01/response.txt)

```json
{"record_id":"http://www.loc.gov/item/2004680400/","description":"Photographic print dated “c1906.” The catalog describes San Francisco’s earthquake and fire disaster, with a man standing among rubble, an unfinished but intact steel structure in the background, and remnants of burned-out brick and stone buildings nearby. A note states that the photograph was copyrighted by George R. Lawrence & Co., Chicago. Rights metadata states: “No known restrictions on publication.”","evidence_fields":["Medium","Date_text","Description","Notes","Rights"],"limitations":["The underlying photograph has not been examined; visual details follow the catalog description.","No creator is identified; the copyright note does not establish a creator role."]}
```

Raw AI judgment: 3/3 fully covered facts; 0 partial; 0 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **yes**.

**Evaluator’s reason (unconfirmed):** “Photographic print dated “c1906.”” follows Medium and Date_text; the scene follows Description. “No known restrictions on publication” reproduces Rights without expanding permission. No important correction or addition is needed.

### title_subjects

[Exact prompt](../runs/generation/row-100--title_subjects/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-100--title_subjects/attempt-01/response.txt)

```json
{"record_id":"http://www.loc.gov/item/2004680400/","description":"Titled “Unfinished steel structure intact after quake, San Francisco,” this item is cataloged with subject headings for San Francisco skyscrapers and earthquakes, 1900–1910.","evidence_fields":["Title","Subject_headings"],"limitations":["No image or Description field is supplied to verify the title’s characterization.","No creator or creation date is supplied; 1900–1910 appears only in subject headings.","No rights information is supplied."]}
```

Raw AI judgment: 0/3 fully covered facts; 1 partial; 3 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **no**.

**Evaluator’s reason (unconfirmed):** “No image or Description field is supplied” and “No rights information is supplied” contradict Description and Rights; the date limitation also misrepresents Date_text, Date, and Genre. Correct those limitations and add the man, rubble, burned building remnants, photographic-print medium, and recorded “c1906.” date.

**Input-scope warning:** this evaluator flagged a limitation about supplied/missing material. The generator may be describing its reduced input correctly; check the exact prompt. The raw judgment above has not been repaired.

## row-048: Julie's Victory Diner sign, State Street, Watertown, New York

Selected because: First scheduled record with an empty Description; Largest primary coverage increase; original-order tie break.

[Original item](http://www.loc.gov/item/2017703606/) · [Frozen full source](../../data/loc-sample.json) · [Raw evaluator response](../runs/evaluation/row-048/attempt-01/response.txt)

Provisional source facts, fixed before generation and not human-confirmed:

```json
[
  {
    "fact_id": "F1",
    "fact": "Photograph of Julie's Victory Diner sign on State Street, Watertown, New York.",
    "source_fields": [
      "Title",
      "Medium"
    ],
    "source_values": {
      "Title": "Julie's Victory Diner sign, State Street, Watertown, New York",
      "Medium": [
        "1 photograph : color transparency ; 35 mm (slide format)."
      ]
    }
  },
  {
    "fact_id": "F2",
    "fact": "John Margolies is photographer.",
    "source_fields": [
      "Creators"
    ],
    "source_values": {
      "Creators": [
        {
          "Name": "Margolies, John",
          "Role": "photographer"
        }
      ]
    }
  },
  {
    "fact_id": "F3",
    "fact": "Dated 1995; title/date/keywords are based on photographer-supplied information.",
    "source_fields": [
      "Date_text",
      "Notes"
    ],
    "source_values": {
      "Date_text": "1995.",
      "Notes": [
        "Credit line: John Margolies Roadside America photograph archive (1972-2008), Library of Congress, Prints and Photographs Division.",
        "Forms part of: John Margolies Roadside America photograph archive (1972-2008).",
        "Title, date and keywords based on information provided by the photographer.",
        "Purchase; John Margolies 2008 (DLC/PP-2008:109-3).",
        "General information about the John Margolies Roadside America photograph archive is available at http://hdl.loc.gov/loc.pnp/pp.mrg",
        "Margolies categories: Eating and drinking establishment signs."
      ]
    }
  },
  {
    "fact_id": "F4",
    "fact": "Color transparency in 35 mm slide format.",
    "source_fields": [
      "Medium"
    ],
    "source_values": {
      "Medium": [
        "1 photograph : color transparency ; 35 mm (slide format)."
      ]
    }
  }
]
```

### full_pretty

[Exact prompt](../runs/generation/row-048--full_pretty/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-048--full_pretty/attempt-01/response.txt)

```json
{
  "record_id": "http://www.loc.gov/item/2017703606/",
  "description": "A 35 mm color slide photographed by John Margolies, titled “Julie's Victory Diner sign, State Street, Watertown, New York,” and dated 1995. The title and date are based on information supplied by the photographer. Part of the John Margolies Roadside America photograph archive at the Library of Congress.",
  "evidence_fields": ["Creators", "Title", "Date", "Medium", "Notes", "Repository"],
  "limitations": [
    "No descriptive text is supplied, and the underlying image has not been examined.",
    "Title and date rely on photographer-provided information.",
    "Structured location entries include conflicting Watertown identifications; the description retains the location stated in the title."
  ]
}
```

Raw AI judgment: 3/4 fully covered facts; 1 partial; 0 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **yes**.

**Evaluator’s reason (unconfirmed):** “A 35 mm color slide photographed by John Margolies” and the full title provide concrete identification (Medium, Creators, Title). “The title and date are based on information supplied by the photographer” preserves relevant qualifications (Notes). Omitted keyword provenance is not an important addition for this draft.

### full_compact

[Exact prompt](../runs/generation/row-048--full_compact/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-048--full_compact/attempt-01/response.txt)

```json
{"record_id":"http://www.loc.gov/item/2017703606/","description":"A 35 mm color slide by photographer John Margolies, dated 1995 and titled “Julie's Victory Diner sign, State Street, Watertown, New York.” The title and date are based on information supplied by the photographer. Part of the John Margolies Roadside America photograph archive at the Library of Congress.","evidence_fields":["Creators","Date","Title","Medium","Notes"],"limitations":["No descriptive text is supplied, and the underlying image has not been examined.","Structured location entries include conflicting Watertown locations; the description retains the photographer-supplied title."]}
```

Raw AI judgment: 3/4 fully covered facts; 1 partial; 0 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **yes**.

**Evaluator’s reason (unconfirmed):** “A 35 mm color slide by photographer John Margolies” and the full title provide concrete identification (Medium, Creators, Title). “The title and date are based on information supplied by the photographer” preserves relevant qualifications (Notes). Omitted keyword provenance is not an important addition for this draft.

### task_fields

[Exact prompt](../runs/generation/row-048--task_fields/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-048--task_fields/attempt-01/response.txt)

```json
{"record_id":"http://www.loc.gov/item/2017703606/","description":"A 35 mm color slide photographed by John Margolies, titled “Julie's Victory Diner sign, State Street, Watertown, New York,” and dated 1995. The title, date, and keywords are based on information supplied by the photographer. Part of the John Margolies Roadside America photograph archive at the Library of Congress.","evidence_fields":["Title","Creators","Date","Medium","Notes"],"limitations":["No descriptive text is supplied; visual details cannot be independently confirmed from the metadata.","Title, date, and keywords rely on information provided by the photographer."]}
```

Raw AI judgment: 4/4 fully covered facts; 0 partial; 0 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **yes**.

**Evaluator’s reason (unconfirmed):** “A 35 mm color slide photographed by John Margolies” and the full title supply concrete identification (Medium, Creators, Title); “dated 1995” retains photographer-supplied provenance (Date_text, Notes). No substantive correction or important addition is needed.

### title_subjects

[Exact prompt](../runs/generation/row-048--title_subjects/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-048--title_subjects/attempt-01/response.txt)

```json
{"record_id":"http://www.loc.gov/item/2017703606/","description":"The title identifies this item as “Julie's Victory Diner sign, State Street, Watertown, New York.” Catalog terms include color slides and associate the record with diners and signs in 1990–2000; these terms do not independently confirm the item's visual content or creation date.","evidence_fields":["Title","Subject_headings","Subjects"],"limitations":["No description or underlying image is supplied to verify visual content.","No creator, explicit creation date, or rights information is supplied."]}
```

Raw AI judgment: 1/4 fully covered facts; 1 partial; 1 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **no**.

**Evaluator’s reason (unconfirmed):** “No creator, explicit creation date, or rights information is supplied” contradicts Creators, Date_text, Notes and Rights and needs correction. The description's “Catalog terms include color slides” also needs the available photographer, qualified 1995 date and 35 mm detail for adequate coverage.

**Input-scope warning:** this evaluator flagged a limitation about supplied/missing material. The generator may be describing its reduced input correctly; check the exact prompt. The raw judgment above has not been repaired.

## row-018: Freedman's Village, Arlington [i.e., Alexandria], Va.

Selected because: Largest primary coverage decrease; original-order tie break.

[Original item](http://www.loc.gov/item/2014645761/) · [Frozen full source](../../data/loc-sample.json) · [Raw evaluator response](../runs/evaluation/row-018/attempt-01/response.txt)

Provisional source facts, fixed before generation and not human-confirmed:

```json
[
  {
    "fact_id": "F1",
    "fact": "Photograph of African-American adults and children reading in front of a barracks-like building.",
    "source_fields": [
      "Description",
      "Medium"
    ],
    "source_values": {
      "Description": [
        "Photograph shows African-American adults and children reading books while lined up in front of a barracks-like building. The same building is shown in \"Freedman's Barracks, Alexandria, Va.\" (LC LOT 4161-H, no. 22) The National Archives describes this photograph as \"A contraband school\" (ID 111-B-S240). The White House Historical Association describes this photo as depicting the residents of Camp Barker as they prepared for Lincoln's visit."
      ],
      "Medium": [
        "1 photograph : albumen print on card mount."
      ]
    }
  },
  {
    "fact_id": "F2",
    "fact": "Title corrects Arlington to Alexandria; external catalog descriptions differ, so do not silently settle the location/identity conflict.",
    "source_fields": [
      "Title",
      "Description"
    ],
    "source_values": {
      "Title": "Freedman's Village, Arlington [i.e., Alexandria], Va.",
      "Description": [
        "Photograph shows African-American adults and children reading books while lined up in front of a barracks-like building. The same building is shown in \"Freedman's Barracks, Alexandria, Va.\" (LC LOT 4161-H, no. 22) The National Archives describes this photograph as \"A contraband school\" (ID 111-B-S240). The White House Historical Association describes this photo as depicting the residents of Camp Barker as they prepared for Lincoln's visit."
      ]
    }
  },
  {
    "fact_id": "F3",
    "fact": "Photographed between 1862 and 1865; printed between 1880 and 1889.",
    "source_fields": [
      "Date_text"
    ],
    "source_values": {
      "Date_text": "[photographed between 1862 and 1865, printed between 1880 and 1889]"
    }
  },
  {
    "fact_id": "F4",
    "fact": "Albumen print on card mount.",
    "source_fields": [
      "Medium"
    ],
    "source_values": {
      "Medium": [
        "1 photograph : albumen print on card mount."
      ]
    }
  }
]
```

### full_pretty

[Exact prompt](../runs/generation/row-018--full_pretty/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-018--full_pretty/attempt-01/response.txt)

```json
{
  "record_id": "http://www.loc.gov/item/2014645761/",
  "description": "Albumen print on card mount, photographed between 1862 and 1865 and printed between 1880 and 1889. The catalog describes African-American adults and children reading books outside a barracks-like building. Titled “Freedman's Village, Arlington [i.e., Alexandria], Va.,” the photograph has differing identifications: the National Archives calls it “A contraband school”; the White House Historical Association identifies Camp Barker residents preparing for Lincoln’s visit.",
  "evidence_fields": ["Medium", "Date_text", "Description", "Title"],
  "limitations": [
    "No creator is identified.",
    "Institutional identifications differ; the precise setting is unresolved in the supplied metadata.",
    "The underlying photograph was not examined."
  ]
}
```

Raw AI judgment: 4/4 fully covered facts; 0 partial; 0 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **yes**.

**Evaluator’s reason (unconfirmed):** “Albumen print on card mount,” both date ranges, and “differing identifications” faithfully convey Medium, Date_text, Title, and Description. No substantive correction or important addition is needed.

### full_compact

[Exact prompt](../runs/generation/row-018--full_compact/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-018--full_compact/attempt-01/response.txt)

```json
{"record_id":"http://www.loc.gov/item/2014645761/","description":"Albumen photograph on card mount, photographed between 1862 and 1865 and printed between 1880 and 1889. The catalog describes African-American adults and children reading books outside a barracks-like building. Titled “Freedman's Village, Arlington [i.e., Alexandria], Va.,” it is described by the National Archives as “A contraband school” and by the White House Historical Association as Camp Barker residents preparing for Lincoln’s visit.","evidence_fields":["Medium","Date_text","Description","Title"],"limitations":["No creator is identified.","Location and context have differing identifications in the supplied metadata.","The underlying photograph has not been examined."]}
```

Raw AI judgment: 4/4 fully covered facts; 0 partial; 0 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **yes**.

**Evaluator’s reason (unconfirmed):** “Albumen photograph on card mount,” both date ranges, and the separately attributed National Archives and White House Historical Association descriptions faithfully convey Medium, Date_text, Title, and Description. No substantive correction or important addition is needed.

### task_fields

[Exact prompt](../runs/generation/row-018--task_fields/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-018--task_fields/attempt-01/response.txt)

```json
{"record_id":"http://www.loc.gov/item/2014645761/","description":"Albumen photograph, photographed between 1862 and 1865 and printed between 1880 and 1889. The catalog describes African-American adults and children reading books outside a barracks-like building. Titled “Freedman's Village, Arlington [i.e., Alexandria], Va.,” it has differing institutional identifications: the National Archives calls it “A contraband school,” while the White House Historical Association identifies Camp Barker residents preparing for Lincoln’s visit.","evidence_fields":["Medium","Date_text","Description","Title"],"limitations":["No creator is identified.","Institutional identifications differ; the underlying photograph has not been examined."]}
```

Raw AI judgment: 3/4 fully covered facts; 1 partial; 0 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **yes**.

**Evaluator’s reason (unconfirmed):** “Albumen photograph,” the two production date ranges, and “differing institutional identifications” faithfully summarize Medium, Date_text, Description, and Title. The omitted card mount is a minor physical-detail omission, not an important addition needed for this draft.

### title_subjects

[Exact prompt](../runs/generation/row-018--title_subjects/attempt-01/prompt.txt) · [Raw answer](../runs/generation/row-018--title_subjects/attempt-01/response.txt)

```json
{"record_id":"http://www.loc.gov/item/2014645761/","description":"The title identifies this item as “Freedman's Village, Arlington [i.e., Alexandria], Va.” Catalog subjects associate it with freedmen in Alexandria, Virginia, in 1860–1870, the Civil War, and albumen prints; these terms do not independently establish what the item depicts.","evidence_fields":["Title","Subject_headings","Subjects"],"limitations":["No description or image is supplied to verify depicted content.","No creator, item date, or rights information is supplied.","The title includes a bracketed location correction."]}
```

Raw AI judgment: 0/4 fully covered facts; 2 partial; 2 unsupported/contradicted claims (0 quoted in description); 0 qualifier losses; usable **no**.

**Evaluator’s reason (unconfirmed):** The limitations “No description or image is supplied” and “No creator, item date, or rights information is supplied” need correction against Description, Date_text, and Rights. The title-and-subject summary also needs important additions from Description, Date_text, and Medium, including the depicted activity and differing institutional identifications.

**Input-scope warning:** this evaluator flagged a limitation about supplied/missing material. The generator may be describing its reduced input correctly; check the exact prompt. The raw judgment above has not been repaired.
