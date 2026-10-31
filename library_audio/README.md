# Library Collections to Audio with NotebookLM

**Example: The Wright Brothers' First Flight**

**Status: In progress. Audio generation and review are pending.**

## What this showcase demonstrates

This showcase demonstrates how a library staff member can use NotebookLM's Audio Overview to turn selected collection information into an audio introduction for students and general visitors.

The example uses Library of Congress exhibition text and the catalog record for a historical photograph. The intended output is a short English conversation introducing the first flight and the collection materials that document it.

## Listen to the result

**Audio:** Pending. Add a download link after uploading the actual audio file.

**Duration:** Pending.

**Human review:** Pending.

**Optional cover photograph:** Add the downloaded image after uploading it to this folder, with a credit and a link to S3 below.

## Source materials

| ID | Source | Role in the audio |
| --- | --- | --- |
| S1 | [The Dream of Flight](https://www.loc.gov/exhibits/dreamofflight/) | Short introduction to the historical event and the Library's exhibition |
| S2 | [The Achievement](https://www.loc.gov/exhibits/dreamofflight/dream-achieve.html) | Background on the Wright brothers' experiments, the first flights, and related collection materials |
| S3 | [First flight photograph: catalog record](https://www.loc.gov/item/00652085/) | Date, people, and description of the specific photograph |

**Publisher:** Library of Congress.

**Actual access/import date:** Pending.

**Import method:** Pending. Record whether each source was added as a URL, uploaded file, or pasted webpage text.

**Sources actually used:** Pending. List the source IDs and any substitutions.

Website imports capture webpage text. Importing S3's URL does not mean that the photograph itself or linked manuscript scans were supplied to the model. The S3 record lists the photograph's rights advisory as "No known restrictions on publication." Retain its source credit if using it as a cover.

## Workflow

1. Open the three source pages and inspect their contents.
2. Create a new notebook and import S1, S2, and S3.
3. Inspect the imported text and confirm that the main content is present.
4. Ask for a short fact sheet with source citations, then check those citations.
5. Open Studio, configure Audio Overview, and enter the generation prompt below.
6. Generate the audio, listen to the complete recording, and check key claims.
7. Regenerate if needed, then download the selected recording and record the actual settings and result.

## Settings and run record

| Setting | Planned value | Actual value |
| --- | --- | --- |
| Tool | NotebookLM / Gemini Notebook, Audio Overview | Pending |
| Notebook title | Library Audio Showcase - Wright Brothers | Pending |
| Format | Deep Dive, two hosts | Pending |
| Language | English | Pending |
| Length option | Shorter, if available | Pending |
| Target duration | Approximately 3-5 minutes; a preference, not a guaranteed duration | Pending |
| Generation date | Record when generated | Pending |
| Number of generation attempts | Record all attempts, including revisions | Pending |
| Selected audio filename and format | Keep the real downloaded extension | Pending |
| Measured audio duration | Read from the downloaded recording | Pending |

## Prompts

### Source check in notebook chat

```text
Using only the sources in this notebook, create a short fact sheet about the Wright brothers' first flight. Include the date and location, who piloted the first flight, its duration and distance, how the photograph was taken, and which collection materials document the event. Cite each factual statement. Distinguish the first flight from later flights that day. Flag conflicting or missing information rather than filling it in.
```

### Custom instructions for Audio Overview

```text
Create a short English conversation for university students and library visitors who are new to the Wright brothers' first flight.

Use only the supplied Library of Congress sources. Focus on the first flight on December 17, 1903, how the photograph records the event, and how photographs and written records help people explore history through library collections.

Explain unfamiliar terms in plain language. Keep the discussion focused and aim for approximately 3-5 minutes. Distinguish the first flight from the later flights that day. Do not invent quotations or personal experiences. When sources are unclear, omit the claim or explain the uncertainty.

Briefly identify the Library of Congress as the source and finish by inviting listeners to explore the linked collection materials. This is an AI-generated introduction to historical materials, not an original historical recording.
```

**Prompt actually used:** Pending. If the instructions change, replace the prompt above with the exact final text and describe the change in the revision table below.

## Human review

The checks below are prepared reference points, not completed reviews. Record a timestamp only after locating the claim in the actual audio. Check other factual claims in the recording as well.

| Check | Reference point | Source | Audio timestamp | Review result |
| --- | --- | --- | --- | --- |
| Date | December 17, 1903 | S1, S3 | Pending | Pending |
| Pilot | Orville piloted the first flight; Wilbur was alongside the machine | S2: First Flight Photograph; S3 | Pending | Pending |
| First-flight measurements | 12 seconds and 120 feet | S2: First Flight Photograph; S3 title | Pending | Pending |
| Photograph | Orville set up the camera; John T. Daniels triggered the shutter | S2: First Flight Photograph; S3 | Pending | Pending |
| Later flights, if mentioned | The fourth flight was 852 feet in 59 seconds | S2: Wrecked Plane | Pending | Pending |
| Collection context | Explain the photograph and related written records using the supplied descriptions | S2: Orville's Account; S3 | Pending | Pending |
| Other claims and audio quality | Check additional claims, pronunciation, intelligibility, and glitches | Relevant source passage | Pending | Pending |

**Reviewer and review date:** Pending.

**Review status:** Pending. Use "Reviewed: no issues found in the checks listed above" or "Reviewed: issues listed below," as appropriate.

### Revisions

| Attempt/date | Issue and timestamp | Change made | Selected file |
| --- | --- | --- | --- |
| Pending | Pending | Pending | Pending |

If a factual issue remains, document it and retain draft status. Changing the prompt or source text does not alter audio that has already been generated.

## Result and practical use

Complete this section after producing and reviewing the recording.

- **Input:** Pending. Record the sources actually imported.
- **Output:** Pending. Record the audio format, duration, and file link.
- **Observed benefit:** Pending. Describe what a visitor or staff member can do with the result.
- **Corrections or limitations observed:** Pending. Report only what occurred in this run.

## Progress

- [ ] Source pages inspected and import methods recorded
- [ ] Imported text checked
- [ ] Fact sheet checked against sources
- [ ] Audio generated and settings recorded
- [ ] Complete recording reviewed
- [ ] Corrections completed or remaining issues documented
- [ ] Selected audio uploaded and download link tested
- [ ] Actual results and screenshots added

## Evidence to add as the work progresses

Suggested files to add beside this README:

- `sources.png`: imported source list
- `settings.png`: Audio Overview format, language, length, and instructions
- `result.png`: generated recording with duration
- `cover.jpg`: optional first-flight photograph from S3
- `wright-first-flight-v1.<actual-extension>`: downloaded audio

Add Markdown image and audio-download links only after the corresponding files exist. Use the real audio extension; changing a filename from WAV to MP3 does not convert the file. A README download link is sufficient for this first version. An inline audio player can be added later on a GitHub Pages webpage.

## Tool instructions

- [Open NotebookLM](https://notebooklm.google.com/)
- [Google: Add or discover sources](https://support.google.com/notebooklm/answer/16215270?hl=en)
- [Google: Generate, customize, and download Audio Overviews](https://support.google.com/notebooklm/answer/16212820?hl=en)

The current Google help pages may use the name Gemini Notebook. Controls can vary by account. Education accounts may not support public notebook sharing, so this showcase uses a downloaded audio file.

## Attribution

Historical source materials: Library of Congress, linked individually above. Audio generation: Google NotebookLM / Gemini Notebook. This is a demonstration of AI-assisted collection interpretation. No endorsement by the Library of Congress is implied.
