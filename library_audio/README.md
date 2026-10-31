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

**Actual access/import date:** October 31, 2026.

**Import method:** Pending. Record whether each source was added as a URL, uploaded file, or pasted webpage text.

**Sources actually used:** Pending. List the source IDs and any substitutions.

Website imports capture webpage text. Importing S3's URL does not mean that the photograph itself or linked manuscript scans were supplied to the model. The S3 record lists the photograph's rights advisory as "No known restrictions on publication." Retain its source credit if using it as a cover.

## Workflow

1. Open the three source pages and inspect their contents.
2. Create a new notebook and import S1, S2, and S3.
   <img width="1465" height="806" alt="image" src="https://github.com/user-attachments/assets/f67e7d09-6724-4dba-8b5e-3077407d25d4" />

3. Inspect the imported text and confirm that the main content is present.
4. Ask for a short fact sheet with source citations, then check those citations.
   <img width="902" height="709" alt="image" src="https://github.com/user-attachments/assets/7ac95904-ef84-4e55-ab49-c2a6bf7dc912" />

5. Open Studio, configure Audio Overview, and enter the generation prompt below.
   <img width="1460" height="799" alt="image" src="https://github.com/user-attachments/assets/d9388336-4fc5-4e7b-be85-72c7ecbdd319" />

6. Generate the audio, listen to the complete recording, and check key claims
   ### Audio demo — first draft

[Download the audio](wright-flight-v1.m4a)

7. Regenerate if needed, then download the selected recording and record the actual settings and result.

   **Editing Prompt:**

Create a SHORT English audio introduction for a library showcase.

Target duration: 3 minutes.
Aim for approximately 350–450 spoken words in total across both hosts.
Use a brief two-host conversation. Prioritize brevity over detail.

Cover ONLY these points, in this order:

1. Opening:
Identify this as an AI-generated introduction based on historical collection materials.

2. The first successful flight:
On December 17, 1903, near Kitty Hawk, North Carolina, Orville Wright piloted the first successful powered flight. It lasted 12 seconds and covered 120 feet.

3. The photograph:
Orville prepared the camera, and John T. Daniels operated the shutter. Explain that the photograph was deliberately arranged, not an accidental snapshot.

4. Why library collections matter:
Briefly explain how the photograph, Orville’s diary, and the telegram help people understand and verify the event.

5. Closing:
Invite listeners to explore the linked Library of Congress materials.

Omit the coin-toss story entirely. Do not discuss the December 14 attempt, later flights, the damaged aircraft, newspaper coverage, childhood, or aviation history.

Use plain language and short sentences. Avoid lengthy introductions, repeated facts, dramatic storytelling, rhetorical questions, and extended reactions between hosts.

Use only the supplied sources. Do not invent quotations or details. End immediately after the invitation to explore the collection.


## Settings and run record

| Setting | Planned value |
| --- | --- |
| Tool | NotebookLM / Gemini Notebook, Audio Overview |
| Notebook title | Library Audio Showcase - Wright Brothers |
| Format | Deep Dive, two hosts |
| Language | English |
| Length option | Shorter, if available |
| Target duration | Approximately 3-5 minutes; a preference, not a guaranteed duration |
| Generation date | Record when generated |
| Number of generation attempts | Record all attempts, including revisions |
| Selected audio filename and format | Keep the real downloaded extension |
| Measured audio duration | Read from the downloaded recording | 

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

## Audio review

**Audio:** First draft — *The Chaos Behind the First Wright Flight*  
**Duration:** Approximately 5 minutes 7 seconds  
**Status:** Revisions needed

This review uses an automatically generated transcript and source verification.
Timestamps are approximate. Human listening checks remain pending.

| Check | Reference point | Source | Audio timestamp | Review result |
| --- | --- | --- | --- | --- |
| Date and location | December 17, 1903, near Kitty Hawk, North Carolina | S1, S3 | 00:47–00:54 | Incomplete: mentions December 1903, but omits the day and location. |
| Pilot | Orville piloted the first successful flight; Wilbur was alongside the machine | S2, S3 | 01:04–01:14 | Partly covered: Orville is correctly identified; Wilbur's position is not clearly described. |
| First-flight measurements | 12 seconds and 120 feet | S2, S3 | 01:09–01:20 | Correct. |
| Photograph | Orville prepared the camera; John T. Daniels operated the shutter | S2, S3 | 01:36–01:57 | Correct. |
| Photograph framing | The photograph was deliberately arranged | S2 | 00:00–00:11; 04:30–04:46 | Revise: descriptions such as "accidental" and "lucky snapshot" understate the preparation. |
| Fourth flight | Wilbur flew 852 feet in 59 seconds | S2 | 02:03–02:28 | Correct; distinguished from the first flight. |
| Collection context | Photographs, diaries, and telegrams document the event | S2, S3 | 03:32–04:03; 04:18–04:35 | Covered: explains the value of visual and written records. |
| Coin-toss chronology | Wilbur won the toss before the unsuccessful December 14 attempt; Orville's turn came on December 17 | S4 | 01:04–01:14 | Incorrect: says Orville won the coin toss. |
| First attempt versus first successful flight | The photograph records the successful December 17 flight, following an unsuccessful December 14 attempt | S3, S4 | 01:26–01:31 | Replace "the very first attempt" with "the first successful powered flight." |
| Newspaper coverage | The newspaper account mixed facts with inaccurate descriptions | S2 | 04:03–04:19 | Replace "without having any actual facts" with "included inaccurate descriptions." |
| Pronunciation and audio quality | Clear speech, understandable names, and no distracting glitches | Human listening | Pending | Pending human review. |

### Additional verification source

**S4:** [National Park Service: 1903—The First Flight](https://home.nps.gov/wrbr/learn/historyculture/thefirstflight.htm)

The LOC exhibition's brief coin-toss description does not clearly explain
the sequence of attempts. S4 was consulted during review to resolve this issue.

### Revision checklist

- [ ] Correct the coin-toss chronology.
- [ ] Distinguish the first attempt from the first successful flight.
- [ ] State the full date and location.
- [ ] Describe the photograph as deliberately arranged.
- [ ] Replace exaggerated claims about newspaper coverage.
- [ ] Generate and review the revised audio.
- [ ] Complete human listening checks.

**Revised audio review:** Pending  
**Human reviewer and review date:** Pending

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
