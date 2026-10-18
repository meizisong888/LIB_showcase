# Materials for two independent human reviewers — pending

No librarian or other human has rated these responses. The blank cells are
intentional; neither model scores nor simulated human ratings fill them.

An administrator should give each reviewer only this page, the
[source records](source-records.json), their source-fact sheet and their answer
sheet. Do not give them the repository's model reports, condition keys or AI
judgments before rating. Public availability of those files means operational
blinding depends on distributing this restricted packet and reviewer conduct;
it cannot be guaranteed merely by removing column labels.

1. Independently read the 20 full source records and fill
   [reviewer 1's source-fact sheet](reviewer-1-source-facts.csv) or
   [reviewer 2's source-fact sheet](reviewer-2-source-facts.csv), **before opening
   the answers**. Choose important facts realistic for an 80-word item
   description, cite source fields, and note ambiguous or conflicting metadata.
2. Agree on a shared factual reference and what counts as a usable draft.
   Preserve both independent lists and the agreed reference separately. The
   earlier AI-authored list is not a human gold standard and should not replace
   this step. No teacher-approved quality-equivalence margin exists yet.
3. Independently score [reviewer 1's answers](reviewer-1.csv) or
   [reviewer 2's answers](reviewer-2.csv). The 80 rows are in hashed order, without
   condition names, token counts, model identity or generation sequence. Match
   each answer to its `record_key` in the supplied full sources.
4. Count unsupported/contradicted claims and material losses of qualifications;
   cite exact answer snippets and source fields in `notes`. Mere omission of a
   fact is a coverage issue, not an invented claim. Use `uncertain` in notes when
   the metadata cannot settle a judgment.
5. Record supported salient facts available and covered in the description,
   with partial/uncertain coverage explained in `informativeness_notes`.
   `acceptable` is yes/no/uncertain: a yes needs concrete useful information and
   no substantive correction or important addition, allowing stylistic edits.
   A nearly empty answer does not pass simply because it avoids errors.
6. Measure `editing_seconds` only if editing is actually performed. Retain the
   original independent sheets and any subsequent adjudication; the administrator
   can reveal the condition key after ratings are complete.

The full record is the reference for metadata faithfulness, not independent
proof of what an unseen object contains. Reviewers may infer a condition from
answer content despite hidden labels. No human agreement, acceptance rate or
editing-time result has yet been collected.
