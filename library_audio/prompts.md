# Prompts for Library Collections to Audio

[Back to the showcase](README.md) · [Review and evidence](review.md)

These three prompts are copied verbatim from the previous README at commit
`fb3308c`. Headings and context have been added; the historical prompt text has
not been rewritten.

The source-check response and the beginning of the initial audio prompt are
visible in the [screenshots](screenshots.md). The complete submitted prompt for
each saved recording is not independently captured. The earlier README records
the revised prompt below and associates the latest audio with a shorter, more
focused prompt; no screenshot shows its submission or the latest run's settings.

## Source-check prompt

```text
Using only the sources in this notebook, create a short fact sheet about the Wright brothers' first flight. Include the date and location, who piloted the first flight, its duration and distance, how the photograph was taken, and which collection materials document the event. Cite each factual statement. Distinguish the first flight from later flights that day. Flag conflicting or missing information rather than filling it in.
```

## Initial audio prompt

The original target was approximately 3–5 minutes.

```text
Create a short English conversation for university students and library visitors who are new to the Wright brothers' first flight.

Use only the supplied Library of Congress sources. Focus on the first flight on December 17, 1903, how the photograph records the event, and how photographs and written records help people explore history through library collections.

Explain unfamiliar terms in plain language. Keep the discussion focused and aim for approximately 3-5 minutes. Distinguish the first flight from the later flights that day. Do not invent quotations or personal experiences. When sources are unclear, omit the claim or explain the uncertainty.

Briefly identify the Library of Congress as the source and finish by inviting listeners to explore the linked collection materials. This is an AI-generated introduction to historical materials, not an original historical recording.
```

## Revised short-audio prompt

The recorded revision targets 3 minutes and 350–450 spoken words. These are
requests, not measured results: the saved latest audio lasts 86.610431 seconds
(about 1:27). This prompt asks to **omit the coin-toss story entirely**, rather
than explain the full chronology. It also excludes newspaper coverage and later
flights. See the [audio review](review.md) for what the recording actually says.

```text
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
```

## Suggested next prompt

This is a new suggestion based on the latest review, **not a historical prompt
or a completed generation**. It has not been tested. Preserve the omission of
the coin-toss story and review the next output independently.

```text
Create a short English audio introduction for library visitors.
Aim for about 3 minutes, but prioritize accurate, concise coverage over filling time.

Begin: "This is an AI-generated introduction to historical collection materials from the Library of Congress."

Use only the selected sources. Cover the first successful powered flight on December 17, 1903, near Kitty Hawk, North Carolina: Orville Wright piloted it for 12 seconds over 120 feet.

Explain that Orville prepared the camera and instructed John T. Daniels to operate the shutter. Describe the photograph as deliberately arranged. Use Daniels's name without adding an occupation or role not supported by the sources.

Briefly explain how the photograph, Orville's diary, and the telegram help visitors investigate the event. Finish by inviting listeners to explore the linked Library of Congress materials.

Omit the coin-toss story, December 14 attempt, later flights, damaged aircraft, newspaper coverage, childhood, and general aviation history. Do not add modern-aircraft comparisons, invented details, or quotations from historical figures.

Use plain language and short sentences. Avoid rhetorical questions, dramatic reactions, and repeated facts. End after the invitation to explore the materials.
```
