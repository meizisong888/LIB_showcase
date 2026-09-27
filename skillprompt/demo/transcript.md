# SkillPrompt demonstration transcript

Recorded September 27, 2026. The owner pasted these three HokieAI responses after the guided inputs shown below. This is not a native export or a tool-call log.

Formatting was normalized: UI labels and paste artifacts were removed, and paragraph breaks and text code fences were restored. The response wording is retained, including the grounding issues reviewed in [evaluation notes](../docs/evaluation.md). The five papers are planned materials; no paper upload or review execution is part of this record.

## Round 1 — User input

I plan to upload five papers about generative AI for research writing. I want to write a roughly 500-word literature review for an interdisciplinary research group meeting, comparing the papers’ approaches and limitations in clear, accessible English.

Please help me improve this request before I upload the papers. For now, only refine the prompt; do not write the review.

## Round 1 — SkillPrompt response

Here’s a concise refinement of your request, keeping your intent while making the downstream writing task clear, bounded, and easy to execute.

Task understanding and keywords

- Goal: Refine a prompt that will produce a ~500-word literature review comparing five papers on generative AI for research writing, for an interdisciplinary research group meeting, in clear, accessible English.
- Materials: Five papers you will upload.
- Output: Short, comparative review emphasizing approaches and limitations.
- Keywords: generative AI, research writing, approaches, limitations, interdisciplinary audience, literature synthesis, thematic comparison.

Matched skill cards and why they fit

- Primary: SK04 — Evidence synthesis and related work. This card directly supports building a comparative, theme-based synthesis grounded in supplied papers with traceable attributions.
  - Excerpt: “For each available study, capture its question, context, method, findings, and limitations. Group evidence around themes… Compare agreements and contradictions… Link important statements to identifiable supplied sources.”
  - How it guides changes: We added instructions to group by themes, compare agreements/contradictions, and tag statements with the specific paper labels.
- Supporting: SK08 — Academic drafting and revision. This card helps ensure the review preserves factual meaning and is structured for the intended audience.
  - Excerpt: “Preserve factual meaning… Separate … results from interpretation… Match structure to the article type… Determine the purpose … and audience.”
  - How it guides changes: We added plain-language constraints, gentle explanation of jargon, and a compact narrative structure appropriate for a group meeting.
- Citation note: No clickable file citation is provided in this response. Excerpts are from the SkillPrompt Academic Knowledge v1.0 text you supplied.

Proposed prompt (ready to copy)

```text
Task: Write a concise, comparative literature review (~500 words, target 450–550) for an interdisciplinary research group meeting. The topic is generative AI for research writing. You will receive five papers; refer to them using the provided short labels [P1]–[P5] (to be mapped to titles by the user).

Audience and tone:
- Write in clear, accessible English for an interdisciplinary audience. Minimize jargon; when a key term is necessary (e.g., “retrieval-augmented generation”), briefly define it in plain language.
- Use a compact narrative (2–3 short paragraphs). Avoid bullet lists unless a brief list improves clarity.

Scope and evidence boundaries:
- Base all statements only on the five supplied papers. Do not infer coverage of the broader field or claim recency.
- Link important claims to specific papers by adding bracketed labels inline, e.g., “… improves draft coherence [P2, P4].”
- If a statement relies on just one paper, indicate that explicitly (e.g., “[P3] only”).

Comparative focus (guided by the supplied papers):
- Identify 2–3 themes that cut across the papers (e.g., intended writing stage, model/class of approach, integration with tools, human-in-the-loop design).
- For each theme, compare approaches and note where the studies agree or contradict each other, paying attention to differences in settings, datasets/tasks, evaluation methods, and assumptions.
- For each paper you mention within a theme, briefly capture: the goal/question, approach (model/data/workflow), evaluation method/metrics, and the authors’ stated limitations.

Limitations and uncertainty:
- Distinguish observed results from interpretation. Preserve uncertainty and caveats from the papers (e.g., small sample sizes, domain constraints, generalization limits).
- Do not invent results, datasets, or metrics not present in the provided documents.

Deliverable format:
- Opening: 1–2 sentences that orient the reader to the shared problem the papers address, in plain language.
- Body: 1–2 thematic paragraphs that compare approaches and limitations with inline paper labels.
- Close: 1–2 sentences highlighting practical implications or open questions relevant to the group meeting (e.g., what to try next, what evidence is missing), clearly marked as implications drawn from the five papers.

Paper label mapping (to be provided by the user before writing):
[P1] =
[P2] =
[P3] =
[P4] =
[P5] =
```

Meaningful changes and reasons

1. “Compare the papers’ approaches and limitations” → Added explicit thematic structure and comparison guidance, with agreements/contradictions and context differences. Reason: From SK04 (“Group evidence around themes… Compare agreements and contradictions… noting differences in settings or design.”).
2. “Clear, accessible English for an interdisciplinary group” → Added tone and jargon-handling instructions. Reason: From SK08 (“Determine the purpose … and audience … Match structure to the article type … Preserve factual meaning.”).
3. Implicit evidence base → Made it explicit to use only the five uploaded papers, avoid claiming exhaustive coverage or recency, and tag statements with [P1]–[P5]. Reason: From SK04 (“Link important statements to identifiable supplied sources… Distinguish a quick section draft from a corpus-based review.”).
4. “~500 words” → Set a 450–550-word window and 2–3 paragraph narrative for readability and consistency. Reason: Practical scoping aligned to your constraint and SK08’s guidance on structure.
5. Unstated uncertainty handling → Added explicit instruction to preserve stated limitations and avoid inventing claims. Reason: From SK08 (“Preserve factual meaning… Separate … results from interpretation.”).

Optional suggestions (you can adopt any or none)

- If you care about specific comparison axes, add them to “themes” (e.g., evaluation metrics for writing quality, human time-on-task, integration with citation managers).
- If you want a specific citation style in-text (e.g., author-year), provide the mapping format alongside [P1]–[P5]; otherwise, bracket labels suffice for traceability.

How would you like to proceed?

- Accept the full proposal as-is.
- Accept with edits: tell me which parts to keep or adjust (e.g., different word range, prefer bullet points, add/remove comparison axes).
- Keep your original request. If so, I can still add the minimal label-mapping block to streamline the next step.

## Round 2 — User input

I accept the thematic comparison, the use of only the five supplied papers, and traceable references to those papers.

Please make these changes:
- Keep the target at approximately 500 words, but remove the strict 450–550-word range and fixed paragraph count.
- Focus on approaches and limitations. Remove the requirement to report every paper’s evaluation methods and metrics within each theme.
- Assign [P1]–[P5] when I upload the papers and show which title each label refers to, rather than asking me to fill in a mapping now.
- Keep the revised prompt shorter and easier to use.

If you quote a skill card, use an exact excerpt and distinguish it from your own suggestions.

Show the revised prompt and briefly explain what changed. Do not write the review yet.

## Round 2 — SkillPrompt response

**Revised prompt (short and ready to copy)**

```text
Task: Write an approximately 500-word comparative literature review for an interdisciplinary research group meeting. Topic: generative AI for research writing. Base all statements only on the five supplied papers.

When the papers are uploaded:
- Assign short labels [P1]–[P5] and display a mapping “[P#] — full title (venue, year)” before writing. Use these labels for all inline attributions.

Audience and tone:
- Clear, accessible English; minimize jargon. Briefly define a necessary term in plain language if it aids understanding.

Scope and evidence boundaries:
- Do not imply exhaustive field coverage or recency beyond the five papers.
- Attach bracketed labels to key claims (e.g., “… improves outline quality [P2, P4]”; if a point relies on one paper, indicate it, e.g., “[P3] only”).

Comparative focus:
- Organize the review around 2–3 cross-cutting themes (e.g., writing stage targeted, model/workflow integration, human-in-the-loop).
- Compare each theme’s approaches and limitations; highlight agreements and contradictions and note context differences only when essential.
- Do not provide exhaustive evaluation methods or metrics; include such details only if they are crucial to the comparison.

Limitations and uncertainty:
- Preserve authors’ caveats (e.g., small samples, domain limits) and avoid inventing results or claims.

Deliverable:
- Brief opening to orient the shared problem, thematic comparison centered on approaches and limitations, and a short closing on practical implications or open questions. Paragraphing at your discretion.
```

**Why these skills fit (with exact excerpts)**

- Primary — SK04 Evidence synthesis and related work. Exact excerpts: “Group evidence around themes or methodological differences. Compare agreements and contradictions, noting differences in settings or design. Link important statements to identifiable supplied sources.” These lines justify the thematic comparison, explicit contrasts, and inline paper labels.
- Supporting — SK08 Academic drafting and revision. Exact excerpts: “Preserve factual meaning, numbers, and uncertainty. Separate performed methods and observed results from interpretation.” These support the plain-language tone and keeping caveats intact without inventing details.
- Note: No clickable file citation is provided in this response.

**What changed (brief)**

1. Word and structure flexibility: Removed the 450–550 range and fixed paragraph count; now simply “approximately 500 words” with paragraphing at your discretion. (Your request)
2. Narrowed focus: Centered on approaches and limitations; removed the requirement to report every paper’s evaluation methods/metrics, allowing inclusion only when essential to the comparison. (Your request)
3. Label assignment workflow: The assistant will assign [P1]–[P5] upon upload and display the “[P#] — title” mapping automatically; you no longer need to prefill it. (Your request)
4. Concision: Shortened and streamlined the prompt while preserving your accepted constraints—use only the five papers, organize them thematically, and provide traceable references. (Aligned with SK04; exact excerpts above)

If you’d like, I can adjust the example themes or the attribution format before you upload the papers.

## Round 3 — User input

I accept this version. Please give me the final prompt, ready to copy.

## Round 3 — SkillPrompt response

**Final prompt**

```text
Task: Write an approximately 500-word comparative literature review for an interdisciplinary research group meeting. Topic: generative AI for research writing. Base all statements only on the five supplied papers.

When the papers are uploaded:
- Assign short labels [P1]–[P5] and display a mapping “[P#] — full title (venue, year)” before writing. Use these labels for all inline attributions.

Audience and tone:
- Clear, accessible English; minimize jargon. Briefly define necessary terms in plain language if it aids understanding.

Scope and evidence boundaries:
- Do not imply exhaustive field coverage or recency beyond the five papers.
- Attach bracketed labels to key claims (e.g., “… improves outline quality [P2, P4]”; if a point relies on one paper, indicate it, e.g., “[P3] only”).

Comparative focus:
- Organize the review around 2–3 cross-cutting themes (e.g., writing stage targeted, model/workflow integration, human-in-the-loop).
- Compare each theme’s approaches and limitations; highlight agreements and contradictions and note context differences only when essential.
- Do not provide exhaustive evaluation methods or metrics; include such details only if they are crucial to the comparison.

Limitations and uncertainty:
- Preserve authors’ caveats (e.g., small samples, domain limits) and avoid inventing results or claims.

Deliverable:
- Brief opening to orient the shared problem, thematic comparison centered on approaches and limitations, and a short closing on practical implications or open questions. Paragraphing at your discretion.
```
