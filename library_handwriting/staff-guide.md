# Staff guide: handwriting to searchable text

This guide is for a small library preparation workflow. The [README](README.md) contains the complete worked example; the [demonstration](https://meizisong888.github.io/LIB_showcase/library_handwriting/) searches the actual results.

1. **Select and document.** Choose a readable scan and check its specific reuse terms. Record the institution, title, creator, date, image number, download URL and rights link. Check that a reference belongs to the same image, not just the same letter or volume. A digital image may contain a spread.
2. **Keep the first pass independent.** Upload the image to an approved image-capable tool in a new conversation. Paste the [English transcription prompt](prompts.md). Do not supply a public transcript or an earlier model answer. Use a new context if either has already been seen.
3. **Save the first output.** Keep its exact text and separate model notes, prompt, model information available to you, run date and image. Do not clean it up and relabel it as an original output. Unknown usage and costs should remain “not recorded.”
4. **Compare line by line.** Open the image, first pass and reference together. Examine names, dates, numbers, abbreviations, deletions and sentence boundaries. Check fluent-looking words too: in this run, the unmarked `George` had to become `Arago`. Bracketed uncertainty is useful evidence, not a defect to hide.
5. **Make a checked copy.** Record each substantive decision and unresolved reading. Do not modernize the source text. Keep modern-English explanations separate. If the reference conflicts with the scan, mark the conflict and ask a qualified reader rather than automatically accepting the reference.
6. **Save and reuse.** Retain image + AI original + reference + checked text + source ID. Search the checked text to build an index or introduction. Attach a source link to every hit. Record any subsequent human review with its real reviewer, date and scope; none is recorded for this showcase.

## Human review still needed in this run

| Sample and location | Specific task |
| --- | --- |
| 01, left page, third line | Resolve the day after `Mar.`: AI suggested `18`, the reference says `1st`, and the comparison context tentatively reads `13`. The checked text retains `[uncertain: 13]`. Also investigate the March note inside a volume cataloged Jan.–Feb.; do not silently change the catalog date. |
| 02, sixth line | Confirm `Harriot` versus the first-pass `Harriott`, including the middle initial. |
| 02, Charles Norton line | Confirm `Hightown`; the Mary Norton line above reads `Hightstown`. Do not infer the two must match. |
| 02, Charles E. Upperman line | Inspect the address ending: reference `O.D.b.` versus image/AI reading `Pat. O. D. C.`. The checked text flags `D.C.`. |
| 03, left page, riding-skirt line | Resolve the name: reference `London`, first pass `[uncertain: Jorden]`. The checked copy leaves `London` uncertain and does not identify the person. |
| 03, left page, line after `sent me` | Resolve `work` (reference) versus `word` (AI); both are retained as an uncertainty. |
| All pages | Check names, dates, punctuation, superscripts, ditto marks and line segmentation before catalog publication. Independently confirm the `Arago` correction and the rest of the checked working text. |

[Enlarged disputed details and evaluation notes](results/evaluation-notes.md) · [Review decisions for every sample](results/review.json)

## Search limitations

The demonstration searches only these checked texts, literally and without case sensitivity. It does not resolve abbreviations or join a word across line breaks. Uncertain words remain searchable with their uncertainty labels visible; a hit is not confirmation. A missing hit is not evidence that the scan lacks the word.

## Repeating the workflow

The Python scripts reproduce file checks, comparisons and the site from stored evidence. They cannot certify a reading or recreate the original model state. Save a new model run separately and compare it using the same documented normalization. Do not submit these AI outputs to the Library of Congress crowdsourcing platform.
