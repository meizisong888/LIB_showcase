# Library Collections to Audio with NotebookLM

**Example: the Wright brothers' first flight.** This showcase turns selected
collection webpage text and photograph catalog descriptions into a short English
audio introduction for library visitors, students, and teachers. Visitors can
hear the collection's story, then follow links to the original materials.

## Listen to the latest audio

**[Download the latest audio — M4A, about 1:27](wright-flight-v2.m4a?raw=true)**

The file is **wright-flight-v2.m4a**, measured on October 31, 2026 at
**86.610431 seconds** and **2,788,268 bytes**. The revised prompt requested
**about 3 minutes**; the actual output is **about 1 minute 27 seconds**.

**Review status: AI-assisted content review completed; issues remain.** The
[automatic transcript](transcript-v2.md) supports several corrections but reveals
an unsupported aircraft comparison and a missing spoken AI disclosure.
One word describing John T. Daniels is uncertain. Human listening and
word-for-word transcript checks remain pending. See the [detailed review](review.md).

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
See [screenshot evidence and its limits](screenshots.md).

## How to reproduce

These are recommended steps; they are not a claim that every step was completed
in the recorded run.

1. **Choose materials.** Select a small collection topic and a few authoritative
   webpages. Keep their titles and links so visitors can explore further.
2. **Import and inspect.** Add the selected sources to a notebook. Open each
   imported text, check that the useful content is present, and verify the
   selected source list before generation.
3. **Check facts.** Use the [source-check prompt](prompts.md#source-check-prompt).
   Open citations and compare dates, people, measurements, and uncertain claims
   with the sources. Record supplementary checks separately.
4. **Set language, format, and instructions.** Suggested settings are English,
   Deep Dive for two hosts, and Short/Shorter where available. Use the
   [revised short-audio prompt](prompts.md#revised-short-audio-prompt), treating its
   three-minute target as a request. The screenshot confirms **Deep Dive,
   English, Short, and 2 sources at that moment**, not the latest run's settings.
5. **Generate and review.** Measure the downloaded result. Check its actual
   claims, then listen from start to finish for pronunciation and audio quality.
   Revise and regenerate if needed; changing a prompt does not change saved audio.
6. **Download and display.** Keep the real file format. Publish the audio with
   source links, prompts, measured duration, and an honest review status.

Google's instructions cover [adding sources](https://support.google.com/notebooklm/answer/16215270?hl=en)
and [customizing and downloading audio](https://support.google.com/notebooklm/answer/16212820?hl=en).
Current help pages use the name Gemini Notebook; screen labels can vary.

## What changed between drafts

| Stage | Output, finding, or change | Verification |
| --- | --- | --- |
| First saved draft | About 5:07, with broader historical discussion. | Inherited AI-assisted review found coin-toss, first-attempt, photograph-framing, and newspaper-reporting problems. |
| Prompt revision | Narrowed the topic; requested 3 minutes; omitted the coin toss, later flights, and newspaper coverage. | Exact recorded prompt preserved in [prompts.md](prompts.md); latest submission/settings not captured. |
| Latest saved audio | About 1:27; covers the flight, arranged photograph, and collection value. | New transcript supports the core facts and omitted coin toss; remaining issues are documented. |
| Still unverified | Human listening quality and complete run history. | No librarian user test or human approval is recorded. |

An intermediate **24:06** version was also reported with screenshot-only evidence.
Its recording is unavailable here and has not been reviewed; two saved files do
not mean only two generations occurred.

## Practical takeaway

Collection text can become a downloadable audio introduction. In this example,
a narrower topic and stronger brevity instructions were followed by a shorter
recording, but specific facts still needed checking. This demonstration does not
measure staff time saved, accuracy gains, or librarian approval.

Historical materials: Library of Congress; supplementary checking: National Park
Service. Audio: Google NotebookLM. No institutional endorsement is implied.
