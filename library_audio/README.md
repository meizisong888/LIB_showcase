# Library Collections to Audio with NotebookLM

**Example: the Wright brothers' first flight.** This showcase turns selected
collection webpage text and photograph catalog descriptions into a short English
audio introduction for library visitors, students, and teachers. Visitors can
hear the collection's story, then follow links to the original materials.

## Listen to the latest audio

**[Download the latest audio — M4A, about 1:27](wright-flight-v2.m4a?raw=true)**

The revised prompt requested **about 3 minutes**; the actual output is
**about 1:27**. Detailed measurements are recorded in the
[audio review](review.md#saved-audio-and-measurements).

**Review status: Reviewed and approved by Meizi Song for this showcase on October 31, 2026.**

Meizi Song completed full listening and content review of the latest recording,
as confirmed by the project owner. See the [detailed review](review.md) for the
final approval and earlier AI-assisted observations. The
[automatic transcript](transcript-v2.md) has not been manually checked word for word.

[Download the first version — M4A, about 5:07](The_Chaos_Behind_the_First_Wright_Flight.m4a?raw=true)
— **historical draft / known issues**, retained to show the revision process.
If GitHub opens a file page, use its download control to save the audio.

## Source materials

S1–S3 are the selected Library of Congress materials for this example.

| ID | Title and link | Purpose |
| --- | --- | --- |
| S1 | [The Dream of Flight](https://www.loc.gov/exhibits/dreamofflight/) | Introduce the event and exhibition. |
| S2 | [The Achievement](https://www.loc.gov/exhibits/dreamofflight/dream-achieve.html) | Explain the flight, photograph, diary, and telegram. |
| S3 | [First flight, 120 feet in 12 seconds, 10:35 a.m.; Kitty Hawk, North Carolina](https://www.loc.gov/item/00652085/) | Identify the photograph, people, and camera preparation. |
| S4 | [NPS: 1903—The First Flight](https://home.nps.gov/wrbr/learn/historyculture/thefirstflight.htm) | Supplementary verification of the coin toss and attempt chronology. |

S4 was used during checking; its import into NotebookLM is **not confirmed**.
Screenshots show S1–S3 entered and later listed, but only **2 sources** selected.
The exact sources used for each recording are unconfirmed. Webpage text imports
do not establish that photographs or linked manuscript scans were supplied.

## How to reproduce

These are recommended steps; they are not a claim that every step was completed
in the recorded run. The screenshots show earlier workflow steps, not confirmed
settings for the latest recording.

### 1. Choose materials

Select a small collection topic and a few authoritative webpages. Keep their
titles and links so visitors can explore further.

### 2. Import and inspect the sources

Add the selected sources to a notebook. Open each imported text, check that the
useful content is present, and verify the selected source list before generation.

![Entering source URLs in NotebookLM](images/sources.png)

*Entering the selected Library of Congress source URLs.*

### 3. Check the facts

Use the [source-check prompt](prompts.md#source-check-prompt). Open citations and
compare dates, people, measurements, and uncertain claims with the sources.
Record supplementary checks separately.

![Checking a source citation in NotebookLM](images/source-check.png)

*Checking a generated fact sheet against a source citation.*

### 4. Configure the Audio Overview

Suggested settings are English, Deep Dive for two hosts, and Short/Shorter where
available. Use the [revised short-audio prompt](prompts.md#revised-short-audio-prompt),
treating its three-minute target as a request.

![Configuring the Audio Overview](images/studio.png)

*Selecting the audio format, language, and length.*

See the [screenshot notes](screenshots.md) for details about the recorded settings.

### 5. Generate and review

Generate the audio and measure the downloaded result. Check its actual claims,
then listen from start to finish for pronunciation and audio quality. Revise and
regenerate if needed; changing a prompt does not change saved audio.

### 6. Download and share

Keep the real downloaded file format. Share the audio with source links, prompts,
measured duration, and an honest review status.

Google's instructions cover [adding sources](https://support.google.com/notebooklm/answer/16215270?hl=en)
and [customizing and downloading audio](https://support.google.com/notebooklm/answer/16212820?hl=en).
Current help pages use the name Gemini Notebook; screen labels can vary.

## What changed between drafts

| Stage | Output, finding, or change | Verification |
| --- | --- | --- |
| First saved draft | About 5:07, with broader historical discussion. | Inherited AI-assisted review found coin-toss, first-attempt, photograph-framing, and newspaper-reporting problems. |
| Prompt revision | Narrowed the topic; requested 3 minutes; omitted the coin toss, later flights, and newspaper coverage. | Exact recorded prompt preserved in [prompts.md](prompts.md); latest submission/settings not captured. |
| Latest saved audio | About 1:27; covers the flight, arranged photograph, and collection value. | Earlier AI-assisted observations are preserved; Meizi Song completed full listening and content review and approved it for this showcase on October 31, 2026. |
| Review limits | Word-for-word transcript proofreading and complete run history remain unconfirmed. | Approval applies to this showcase; no librarian user test is recorded. |

An intermediate **24:06** version was also reported with screenshot-only evidence.
Its recording is unavailable here and has not been reviewed; two saved files do
not mean only two generations occurred.

## Practical takeaway

Collection text can become a downloadable audio introduction. In this example,
a narrower topic and stronger brevity instructions were followed by a shorter
recording, but specific facts still needed checking. This demonstration does not
measure staff time saved or accuracy gains.

Historical materials: Library of Congress; supplementary checking: National Park
Service. Audio: Google NotebookLM. No institutional endorsement is implied.
