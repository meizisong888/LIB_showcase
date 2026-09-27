# SkillPrompt

**[Open the recorded walkthrough](https://meizisong888.github.io/LIB_showcase/skillprompt/)** · [Open HokieAI](https://hokie.ai.vt.edu/) · [Recreate SkillPrompt](docs/recreate.md)

SkillPrompt is a personal agent configured inside Virginia Tech’s HokieAI. It helps researchers turn an initial request into a clearer prompt using curated academic method cards. Users inspect proposed changes, accept selected additions, revise the request, or keep the original. Its default output is a prompt; accepting it does not authorize executing the research task.

The public site is a recorded conversation walkthrough with no live model call. A verified public or cross-user link to the native SkillPrompt agent is not available. The HokieAI portal does not open the owner’s agent. See [access and sharing](docs/access-and-sharing.md).

## What it does

Research requests can leave the evidence boundary, comparison structure, and output expectations implicit. SkillPrompt is configured to understand the request, match one primary and up to two supporting cards, propose a prompt, explain changes, accept selective feedback, and finalize on acceptance. Preserving the original on rejection, rematching after substantive changes, and missing-library fallback are configured behaviors; this supplied example does not test those branches.

## Actual implementation

The September 27, 2026 record contains native [English Specific instructions](agent/specific-instructions.txt), one uploaded [knowledge TXT](knowledge/SkillPrompt_Academic_Knowledge_v1.txt), and the following [screenshot-derived settings](agent/settings.json):

| Setting | Observed value |
|---|---|
| Agent type | Personal Agent |
| Model label | OpenAI (gpt-5) |
| Knowledge interpreter | File Search |
| Add Files & Images | Enabled |
| Image Creation / Search the Internet / Generate Artifacts | Disabled |
| Short Description | Blank |
| Platform tab | Contents not collected |

The [knowledge screenshot](evidence/knowledge-file.png) and [runtime screenshot](evidence/runtime-settings.png) are supplied originals. Settings JSON records the interface; it is not a native import schema or proof of backend routing. The conversation exposes no internal retrieval operations. The project does not establish custom retrieval, a custom backend, model training, executable skill installation, live literature search, or live GitHub synchronization. Descriptions in this README and website are editorial copy, not a populated live Short Description.

## Curation and upstream credit

The collection was assembled with AI assistance on September 22, 2026. The contribution is selection and adaptation of open-source methods, seven categories (C1–C7), 16 local identifiers (SK01–SK16), bilingual matching terms, source/license documentation, agent instructions, and an iterative workflow that preserves user control. Upstream authors contributed the research methods; this is not a claim of inventing them or training a new model.

| Upstream repository | Adapted methods | Recorded root license |
|---|---|---|
| [K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills) | Framing, search, design, statistics, figures, writing, references, appraisal | MIT |
| [Orchestra-Research/AI-Research-SKILLs](https://github.com/Orchestra-Research/AI-Research-SKILLs) | Research talks and ML paper reporting | MIT |
| [neuromechanist/research-skills](https://github.com/neuromechanist/research-skills) | Synthesis, manuscript review, proposals | BSD-3-Clause |
| [ShaishavMaisuria/research-paper-lifecycle-skills](https://github.com/ShaishavMaisuria/research-paper-lifecycle-skills) | Rebuttal planning and reproducibility materials | Apache-2.0 |

See the [English per-card source table](docs/card-sources.md) and [full original mappings, licenses, and NOTICE](sources/SkillPrompt_Sources_and_Licenses_v1.md). Keep the full notices with redistributed copies of the knowledge collection. These files remain under their documented upstream terms. The SK identifiers and taxonomy are local, not official upstream names. No endorsement by Virginia Tech or the upstream projects is implied.

The adaptations shorten and independently reword method guidance, add scope and capability boundaries, and omit promotional defaults, unrelated installation steps, and arbitrary output quotas. Seven categories cover research framing; literature; study design and analysis; writing and references; appraisal and review; proposals and communication; and computational research. The original bilingual text and Chinese source notes remain intact.

## The recorded demonstration

The canonical [conversation JSON](demo/conversation.json) contains six messages: three guided inputs and three owner-pasted HokieAI responses from September 27. It is not a native export, instrumented run, or video.

1. **Initial request and proposal:** the user plans to upload five papers on generative AI for research writing. SkillPrompt selects SK04 and SK08 and proposes a refined review request.
2. **Selective feedback and revision:** the user keeps thematic comparison, the five-paper scope, and traceable references, while removing the strict word window, fixed paragraph count, exhaustive evaluation detail, and manual prefilling of labels.
3. **Acceptance and final prompt:** the agent returns the accepted prompt without another confirmation or execution of the review.

[Read the full transcript](demo/transcript.md) or [copy the final prompt](demo/final-prompt.txt). No paper corpus was supplied, no papers were uploaded in this record, and no literature review was executed. Fresh outputs may differ.

The original wording is preserved, including errors. Separate [evaluation notes](docs/evaluation.md) explain that the first SK08 excerpt is not fully exact; the second quotes accurately but attributes plain-language tone too broadly; and [P1]–[P5] is a practical traceability choice, not literal syntax required by SK04. Clear English came from the user. This example demonstrates an interaction, not quantified improvement in research quality, speed, or token efficiency.

The knowledge file’s September 22 “not yet tested” statement is historical. The September 27 demonstration is documented separately without editing the earlier file.

## Reproduce or present

- [Recreate the personal agent and run the guided inputs](docs/recreate.md).
- [Presenter script and instructions for recording a real video](docs/presenter-guide.md). No video file was supplied or invented.
- [Project brief](docs/project-brief.md), [review notes](docs/evaluation.md), and [access evidence](docs/access-and-sharing.md).
- [Archived Chinese upload guide](reference/SkillPrompt_Upload_Guide_ZH_v1.md): historical reference only; current English instructions and recorded settings take precedence.

## Maintain and verify the showcase

The existing Vite/React guide remains at the repository root. `npm run build` builds it normally, then `scripts/build-skillprompt.mjs` generates an isolated static `/skillprompt/` section from `site/index.html`, the canonical conversation, and the original knowledge TXT. Plain HTML with progressive JavaScript enhancement keeps the full documentation and messages readable without JavaScript. Transcript text is HTML-escaped, never interpreted as active markup. No new dependency is needed.

The generator derives all 17 pinned file mappings from the knowledge TXT and checks them against the source notices. This preserves both SK11 sources; the supplied convenience `knowledge/card-index.json` retains only the second repeated source field, so it is archived but not used to render mappings.

Run from the repository root:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run preview -- --host 127.0.0.1
# In a second terminal, against the production preview:
npm run check:skillprompt
npm run check:visual
```

Open `http://127.0.0.1:4173/LIB_showcase/skillprompt/`. Rebuild after editing the static showcase. The original React guide still supports its normal `npm run dev` workflow. The existing main-branch GitHub Pages workflow publishes the combined `dist/` artifact.

`ORIGINALS.sha256` contains the handoff’s checksums for public supplied files. The build validates them; new documentation is outside that manifest. The private handoff link and ZIP are excluded from publication. To check original bytes manually, run `sha256sum -c ORIGINALS.sha256` from this directory.
