# Audio review and run evidence

[Back to the showcase](README.md) · [Prompts](prompts.md) · [Screenshots](screenshots.md)

## Scope and method

This is an **AI-assisted review** using automatic transcription and comparison
with historical sources. It is not librarian user testing or a completed human
listening review. Transcription can miss or misrecognize speech; checking text
does not assess pronunciation, voices, pacing, or listening quality.

The first-draft table below preserves the previous README's findings and
approximate timestamps. The underlying first-draft transcript, transcription
model, and review date were not supplied. That review has not been re-created
here. New measurements and the latest recording's review are dated
**October 31, 2026**.

## Saved audio and measurements

Both files were checked against the freshly fetched `origin/main` at commit
`fb3308c`. Sizes and blob IDs match that remote tree. Durations were measured
locally with PyAV 19.0.2 / FFmpeg container and audio-stream metadata; both methods
agree. Both files contain AAC audio in an M4A/MP4 container, stereo, 44,100 Hz.
No audio was renamed, duplicated, or converted for publication.
Both public GitHub download links returned HTTP 200 with `audio/mp4` content;
the downloaded byte counts and Git blob IDs also matched the local files.

| Saved recording | Measured duration | Display duration | File size |
| --- | --- | --- | --- |
| [First draft](The_Chaos_Behind_the_First_Wright_Flight.m4a?raw=true) | 306.735601 seconds | About 5:07 | 9,872,746 bytes |
| [Latest audio](wright-flight-v2.m4a?raw=true) | 86.610431 seconds | About 1:27 | 2,788,268 bytes |

Git blob SHA values:

```text
The_Chaos_Behind_the_First_Wright_Flight.m4a
ff23f5c9c50d454006828a0bbe2160063f90ec16

wright-flight-v2.m4a
4d07d8f4b2a99ee2fe69a605f50ac8001e4d627f
```

The revised prompt requests approximately **3 minutes**, with 350–450 words.
The **1:27** result is the actual output, not the requested duration.
The two saved files are not all generation attempts: the owner also reports an
intermediate **24:06** version shown in a screenshot. Its audio is unavailable
here and has not been reviewed; none of the three saved screenshots shows it.
The total number of attempts and the per-file generation dates are unconfirmed.

## Sources used for checking

Source IDs refer to the [source table](README.md#source-materials).
S1–S3 are the planned Library of Congress materials. S4 is a supplementary
verification source; there is no evidence that it was imported into NotebookLM.

- [S1: The Dream of Flight](https://www.loc.gov/exhibits/dreamofflight/) gives the event's date and historical context.
- [S2: The Achievement](https://www.loc.gov/exhibits/dreamofflight/dream-achieve.html) documents the photograph's preparation, flight measurements, newspaper coverage, diary, and telegram.
- [S3: First-flight photograph record](https://www.loc.gov/item/00652085/) identifies the scene, people, and camera preparation. Direct retrieval returned HTTP 403 during this check; the search-indexed LOC record and its [MARC display](https://www.loc.gov/pictures/item/00652085/marc/) were available through search. This is not evidence of a successful NotebookLM import.
- [S4: NPS, 1903—The First Flight](https://home.nps.gov/wrbr/learn/historyculture/thefirstflight.htm) provides the fuller sequence: Wilbur won the coin toss before the unsuccessful December 14 attempt; Orville's turn followed on December 17.

The LOC exhibition's brief coin-toss description does not clearly explain the
timing of the two attempts. The earlier review consulted S4 to resolve that
ambiguity, and this check confirmed its account. The revised prompt's solution
is to **omit the coin-toss story**, not retell the entire sequence.

## First draft: historical review, known issues

**File:** [The Chaos Behind the First Wright Flight](The_Chaos_Behind_the_First_Wright_Flight.m4a?raw=true)

**Status:** Revisions needed; historical draft.

The principal problems were naming Orville as the coin-toss winner, calling the
photographed flight the first attempt, treating a prepared photograph as an
accidental snapshot, and overstating the lack of facts in newspaper reporting.
The inherited review results are preserved below.

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


## Latest audio: content review

**File:** [wright-flight-v2.m4a](wright-flight-v2.m4a?raw=true)

**Status:** AI-assisted content review completed; issues remain. Human listening pending.

**Reviewer:** Codex (AI-assisted), October 31, 2026.

A new local transcription was made from the complete latest recording using
`faster-whisper` 1.2.1 and `small.en`, with no historical text supplied as a
transcription prompt. The [full automatic transcript](transcript-v2.md) records
the model, parameters, and segment times. It has **not been manually checked
word for word**. The times below are approximate positions in this latest file;
none were copied from the first draft.

| Check | Latest-audio time | Finding from transcription and source comparison |
| --- | --- | --- |
| Date and location | 00:17.300–00:21.300 | States December 17, 1903, near Kitty Hawk, North Carolina; consistent with S1–S3. |
| Orville's role and successful flight | 00:21.880–00:25.440 | Identifies Orville Wright with the first successful powered flight; supported by S2–S3. Does not repeat the first draft's first-attempt wording. |
| Duration and distance | 00:25.960–00:29.840 | States 12 seconds and 120 feet; supported by S2–S3. |
| Prepared photograph | 00:39.700–00:48.440 | Rejects a lucky accident and describes an arranged photograph with Orville setting up the tripod; supported by S2–S3. |
| John T. Daniels and shutter | 00:48.960–00:53.920 | Names Daniels as instructed to operate the shutter; supported by S2–S3. The word before his name is uncertain; see the transcription disagreement below. |
| Coin-toss story | Entire transcript, 00:00–01:26.180 | No coin-toss story appears. The requested omission is supported by the transcript. |
| Other excluded topics | Entire transcript, 00:00–01:26.180 | No December 14 attempt, later flights, damaged aircraft, newspaper coverage, or childhood discussion appears. |
| Collection value | 00:54.520–01:07.860 | Connects the photograph, Orville's diary, and the family telegram to checking the event; these materials are discussed in S2. The diary's unemotional style is also described there. |
| Invitation to explore | 01:19.700–01:26.180 | Invites listeners to explore Library of Congress materials through the show notes; this README supplies those links. |
| New unsupported comparison | 00:30.000–00:35.900 | Compares 120 feet with the wingspan of a modern commercial jet. S1–S4 do not supply this comparison or identify an aircraft; remove it or provide a suitable source in a future version. |
| Spoken AI disclosure | Opening, 00:00–00:11.940; full transcript checked | Does not identify itself as AI-generated, despite the revised prompt's opening requirement. This README labels it, but the recording needs its own disclosure when shared alone. |
| Tone and brevity instructions | 00:12.480–00:14.460; 01:07.860–01:19.700 | Rhetorical questions and dramatic reactions remain despite instructions to avoid them. The output is shorter than the 3-minute / 350–450-word request: about 1:27 and approximately 255 transcribed words. |
| Pronunciation, voices, pacing, and glitches | Whole recording | Not assessed by this text-based review. Human listening remains pending. |

### Transcription disagreement near 00:50

The full `small.en` pass recognizes **“a local guide”** near 00:49.760–00:50.200.
A second local `base.en` pass on the original 00:39–00:55 audio recognizes
**“a local guy”** instead. Neither pass was given a suggested phrase. The raw
full transcript is preserved rather than silently corrected.

This disagreement needs human listening before it can be called an audio error.
If the recording says “guide,” that role is unsupported by the checked sources:
S2 and S4 describe Daniels as being from the local lifesaving station. His name
and shutter operation are supported either way. The unsupported jet comparison
and missing spoken AI disclosure do not depend on this disputed word.

### Remaining work

- [ ] Listen to the complete latest recording and check the transcript word for word, especially “guide” versus “guy” near 00:50.
- [ ] Assess pronunciation, voices, pacing, and audio glitches through human listening; record the reviewer and date when done.
- [ ] For a future recording, remove the unsupported aircraft comparison, include the spoken AI disclosure, and simplify the dramatic reactions. A [suggested next prompt](prompts.md#suggested-next-prompt) is available but has not been run.
- [ ] If regenerating, capture the selected sources, full custom prompt, settings, and generation date, then review the new file independently.

The latest version is suitable for showing the workflow and its limitations;
it is not marked as fully approved interpretive audio. There is no recorded
librarian approval or visitor evaluation.

## Confirmed settings versus recommended practice

| Item | Available evidence | Limit |
| --- | --- | --- |
| Notebook title | Screenshot: Library Audio Showcase - Wright Brothers. | Does not establish the recording dates. |
| Source entry | S1–S3 URLs entered; later visible in the source list. | Complete imported text and the exact per-run selection are not recorded. |
| Fact checking | Fact sheet with an open S2 citation and 2 sources shown. | Not proof that every citation was checked. |
| Audio settings | Screenshot: Deep Dive, English, Short, 2 sources, and beginning of initial prompt. | Not confirmed as the latest recording's settings or full submitted prompt. |
| Prompt revision | Exact revised text in the previous README; latest file described there as generated with a shorter prompt. | No saved screenshot of its submission. |
| Recommended practice | Inspect each import, check claims, capture settings, and listen fully before approval. | These are reproduction instructions, not completed-run claims. |

See the [three original screenshots with captions](screenshots.md) for the
visible evidence. Prompt intentions and screenshots are not substitutes for
checking the generated recording.
