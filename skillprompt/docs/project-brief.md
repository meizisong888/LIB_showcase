# SkillPrompt

SkillPrompt is a personal agent configured inside Virginia Tech's HokieAI. It helps researchers turn an initial request into a clearer prompt using a curated collection of academic methods. Users can inspect the proposed changes, accept only the parts they want, revise the request, or keep their original wording.

## Implementation

The prototype combines an existing HokieAI language model, the Specific Instructions in this package, and one uploaded text knowledge source. The UI displays the knowledge source's interpreter as File Search. No custom retrieval algorithm or retrieval trace has been collected, so the documentation should describe the platform configuration and observed answers, rather than claim a verified custom retrieval pipeline.

The selected model is displayed as OpenAI (gpt-5) in the user's September 27 screenshot. File and image attachments are enabled. Internet search, image creation, and artifact generation are disabled. The Short Description field is empty. The Platform tab contents were not collected.

The default product is an improved prompt. Accepting that prompt does not itself ask the agent to execute the research task. Skill references provide methods; they do not install the source repositories' scripts or connect to their external services.

## Intended interaction

1. Understand the goal, materials, audience, output, and constraints; extract keywords and identify relevant categories.
2. Choose one primary skill card and, when useful, up to two supporting cards.
3. Apply the cards' relevant methods to improve the request while preserving the user's intent.
4. Show the proposed prompt, meaningful changes, and source-to-change connections.
5. Let the user accept all or some changes, provide edits, or retain the original.
6. Reconsider skills when substantive requirements change; avoid unnecessary rematching for wording edits.
7. Return the final prompt when the user accepts, without another confirmation cycle.

These are configured rules. The supplied demo directly demonstrates the initial proposal, selective revision, and finalization path. Other branches have not yet been demonstrated in the supplied record.

## Knowledge collection and contribution

The original collection was assembled with AI assistance on September 22, 2026. It contains 16 locally numbered method cards across seven categories, with English methods and Chinese/English matching terms. It draws from four community-maintained repositories:

| Repository | Role in this collection | Recorded root license |
|---|---|---|
| [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | Research framing, search, design, statistics, figures, writing, references and appraisal | MIT |
| [Orchestra-Research/AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs) | Research talks and ML paper reporting | MIT |
| [neuromechanist/research-skills](https://github.com/neuromechanist/research-skills) | Literature synthesis, manuscript review and proposals | BSD-3-Clause |
| [ShaishavMaisuria/research-paper-lifecycle-skills](https://github.com/ShaishavMaisuria/research-paper-lifecycle-skills) | Rebuttal planning and reproducibility materials | Apache-2.0 |

The curation work selected relevant files, shortened and independently reworded their methods into prompt-building cards, introduced the C1–C7 taxonomy and SK01–SK16 identifiers, added bilingual matching terms and capability boundaries, and preserved pinned source links and license notices. Promotional defaults, unrelated installation instructions and arbitrary output quotas were not carried into the adaptations. This is a documented curation and interaction-design contribution; it does not represent invention of the upstream research methods or training of a new model.

The exact per-card source paths, pinned commits and full license texts are in [Sources and Licenses](../sources/SkillPrompt_Sources_and_Licenses_v1.md). Keep that file with any redistributed collection. The repositories are provenance links, not live connections; updating a repository does not automatically update the uploaded knowledge file.

## Demonstration

The owner supplied three consecutive English agent responses after sending the guided prompts in this package. The scenario concerns a planned upload of five papers about generative AI for research writing. No five-paper upload or completed literature review is evidenced by this demo. The agent selects SK04 (Evidence synthesis and related work) and SK08 (Academic drafting and revision), refines the request, applies selective user feedback, and returns a final prompt on acceptance.

This is a prompt-refinement demonstration, not an evaluation of literature-review quality. The complete messages are retained in [the transcript](../demo/transcript.md), with observations in [the evaluation notes](evaluation.md).

## Current access

The agent is configured as a Personal Agent. A working cross-user SkillPrompt link has not been verified. Public GitHub documentation can provide the configuration and source file so that readers with appropriate HokieAI access can recreate the agent. The public walkthrough can show the supplied conversation without requiring access to the owner's account. See [access and sharing](access-and-sharing.md).

## Historical source files

The original September 22 knowledge file and source notes are preserved byte-for-byte, including their statement that the pack had not yet been tested inside HokieAI at creation time. The September 27 user-supplied conversation is later evidence, documented separately here. The archived Chinese upload guide is reference material; the current agent instructions and settings in this package take precedence over older examples in that guide.
