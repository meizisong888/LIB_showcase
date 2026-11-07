# Transcription prompt

Use the same prompt for each scan. Supply the image only; do not supply its catalog description, reference transcription, or a previous model answer.

```text
Transcribe all visible writing in this historical document image.
Preserve the original spelling, capitalization, punctuation, and line order.
Read a spread left page first, then right page; separate the pages with a blank line.
Do not translate, paraphrase, modernize, or complete missing content.
Mark a tentative word as [uncertain: word]. Use [illegible] when you cannot read it.
Keep visible ditto marks as marks; do not silently expand them.
Represent readable crossed-out text as [deleted: text] and insertions as
[inserted: text]. Do not invent text beneath an unreadable deletion.
Include visible headings, dates, marginal writing, and numbers.
Return two separate sections: TRANSCRIPTION (only the transcription) and
NOTES (reading uncertainties or layout observations, without historical guesses).
```

The recorded first pass uses this prompt in a fresh Codex context with the three
images presented separately. The notes are saved separately from the transcript.
