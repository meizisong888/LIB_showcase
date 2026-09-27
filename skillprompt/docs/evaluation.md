# Demonstration review

Evidence: three agent responses pasted by the owner on September 27, 2026, following the guided messages included in the transcript. This is a manual review of supplied outputs, not an independently instrumented run or a benchmark.

| Behavior | Status in this demonstration | Evidence |
|---|---|---|
| Interpret task and extract keywords | Observed | First response identifies the planned materials, topic, audience and comparative goal |
| Map the request to explicit C1–C7 categories | Not shown explicitly | First response lists keywords and skill IDs but does not display a category code |
| Select a primary and supporting skill | Observed | SK04 primary, SK08 supporting |
| Explain meaningful changes | Observed, with attribution issues | Explanations are present; some model choices are attributed too broadly to the cards |
| Quote the knowledge cards exactly | Partial | First SK08 excerpt is inaccurate; second-round excerpts match the file |
| Keep accepted requirements during revision | Observed | Five-paper scope, thematic comparison and traceable labels retained |
| Remove rejected details | Observed | Strict 450–550 window and fixed paragraph count removed; evaluation detail reduced |
| Assign paper labels later instead of manual prefilling | Observed in prompt wording | Revised prompt assigns labels on upload; no actual paper upload has occurred |
| Finalize after acceptance without another question | Observed | Third response supplies the final prompt |
| Avoid executing the review before being asked | Observed | All three outputs concern prompt refinement |
| Rematch after a substantive task change | Not tested | This example keeps the same research task |
| Honor rejection of every change | Not tested | No rejection-all turn was supplied |
| Fallback when knowledge is missing or no card fits | Not tested | No such test was supplied |
| Preserve decisions across different chats | Not claimed | Instructions cover the current conversation only |
| Provide a cross-user agent link | Unverified | No second-account access test supplied |

## Grounding checks

The second-round SK04 excerpt is present verbatim in the knowledge file:

> Group evidence around themes or methodological differences. Compare agreements and contradictions, noting differences in settings or design. Link important statements to identifiable supplied sources.

The second-round SK08 excerpt is also present verbatim:

> Preserve factual meaning, numbers, and uncertainty. Separate performed methods and observed results from interpretation.

The first-round wording “Determine the purpose … and audience” is not an exact passage in the SK08 method field. The actual method begins “Determine the purpose of the requested section and make an evidence-based outline when needed.” The audience appears separately in Useful inputs. These should not be merged into an apparent verbatim quotation.

Even in the second response, the SK08 excerpt does not directly prescribe plain-language tone. Clear, accessible English came from the user's initial request. Likewise, SK04 supports traceable sources; the particular [P1]–[P5] notation is an implementation choice rather than a literal card requirement.

Other observations:

- The first proposal adds several specific constraints, including a numeric word window and a fixed paragraph count. The user successfully removes these in the next turn.
- The first response says it could add a label-mapping block even if the user keeps the original request. This is a wording concern, not an observed rejection-all failure; that branch was not exercised.
- The revised mapping includes venue and year, which the user did not specifically request. Availability of those fields was not tested.
- Pasted prompts arrive with flattened formatting. The package restores line breaks for readability without treating the paste format as proof of a HokieAI rendering defect.
- Correct quotations show agreement with the accessible knowledge content. They do not establish which retrieval or context-injection operation ran inside HokieAI.

## Accurate showcase claim

“In a three-turn demonstration, SkillPrompt selected relevant academic method cards, proposed a refined request, incorporated selective user feedback, and returned a final prompt after acceptance. Source-to-change explanations were useful but still showed attribution errors.”

Do not claim quantified improvements in research quality, speed, or token efficiency from this single demonstration. Preserve the original outputs rather than silently correcting them into a more successful transcript.
