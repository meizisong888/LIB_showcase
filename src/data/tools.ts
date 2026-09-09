import type { OfficialSource, TaskFit, TaskGoal, TaskSupport, Tool, VerifiedCapability, VerifiedCapabilityRecord } from '../types'

export const REVIEW_DATE = '2026-09-06'

const vtTools: OfficialSource = {
  id: 'vt-ai-tools',
  title: 'AI Tools & Access at Virginia Tech',
  url: 'https://ai.vt.edu/tools.html',
  claimScope: 'Student availability, service status, access, approved data levels, and the CUI/export-control prohibition. Page last updated September 2, 2026.',
  lastChecked: REVIEW_DATE,
}

const hokieAiOverview: OfficialSource = {
  id: 'vt-hokieai',
  title: 'HokieAI',
  url: 'https://ai.vt.edu/tools/hokieai.html',
  claimScope: 'No-cost student access, chat, drafting and revising, coding, document analysis, image creation, and monthly metering.',
  lastChecked: REVIEW_DATE,
}

const hokieAiForInstructors: OfficialSource = {
  id: 'vt-hokieai-instructors',
  title: 'HokieAI for Instructors',
  url: 'https://4help.vt.edu/sp?id=kb_article&sysparm_article=KB0016456',
  claimScope: 'Student sign-in and source-grounded personal agents used with course materials.',
  lastChecked: REVIEW_DATE,
}

const googleAiAtVt: OfficialSource = {
  id: 'vt-google-ai',
  title: 'Virginia Tech 4Help: Gemini App and NotebookLM access',
  url: 'https://4help.vt.edu/sp?id=kb_article&sysparm_article=KB0016244',
  claimScope: 'VT institutional-account protections and verified Gemini App and NotebookLM capabilities.',
  lastChecked: REVIEW_DATE,
}

const copilotAtVt: OfficialSource = {
  id: 'vt-copilot-chat',
  title: 'Understanding Microsoft Copilot with Enterprise Data Protection at Virginia Tech',
  url: 'https://4help.vt.edu/sp?id=kb_article&sysparm_article=KB0014762',
  claimScope: 'Student access, VT sign-in, web grounding, citations, writing, revision, and summarization.',
  lastChecked: REVIEW_DATE,
}

const copilotEditions: OfficialSource = {
  id: 'vt-copilot-editions',
  title: 'Virginia Tech 4Help: Copilot Chat capabilities and account editions',
  url: 'https://4help.vt.edu/sp?id=kb_article&sysparm_article=KB0015697',
  claimScope: 'File uploads and image generation in included Copilot Chat, and the boundary from separately licensed Microsoft 365 Copilot.',
  lastChecked: REVIEW_DATE,
}

const arcGateway: OfficialSource = {
  id: 'vt-arc-gateway',
  title: 'llm.arc.vt.edu — ARC User Documentation',
  url: 'https://docs.arc.vt.edu/ai/010_llm_arc_vt_edu.html',
  claimScope: 'Student web access without a separate ARC account, API keys, RAG, web search, vision, image generation/editing, coding models, cost, and restrictions.',
  lastChecked: REVIEW_DATE,
}

const arcOpenOnDemand: OfficialSource = {
  id: 'vt-arc-open-ondemand',
  title: 'LLMs via Open OnDemand — ARC User Documentation',
  url: 'https://docs.arc.vt.edu/ai/020_ood_arc_vt_edu.html',
  claimScope: 'ARC-account eligibility, allocation use, dedicated web/API sessions, session limits, and VT network or VPN requirements.',
  lastChecked: REVIEW_DATE,
}

const approvedData = ['public', 'internal', 'sensitive'] as const
const prohibitedData = [
  'Export-controlled data, including data governed by ITAR or DFARS',
  'Controlled Unclassified Information (CUI)',
]

const capability = (capabilityName: VerifiedCapability, sourceIds: string[], evidenceSummary: string): VerifiedCapabilityRecord => ({
  capability: capabilityName,
  sourceIds,
  evidenceSummary,
})

const taskFit = (goal: TaskGoal, fit: TaskFit, reason: string, sourceIds: string[], evidenceSummary: string): TaskSupport => ({
  goal,
  fit,
  reason,
  sourceIds,
  evidenceSummary,
})

export const tools: Tool[] = [
  {
    id: 'hokieai',
    name: 'HokieAI',
    initials: 'HA',
    summary: 'Virginia Tech’s protected, university-supported workspace for chat, writing, code, document analysis, agents, and image creation.',
    status: 'active-service',
    studentAvailability: 'all-vt-students',
    eligibility: 'All Virginia Tech students, faculty, and staff.',
    requiredAccount: 'VT username and passphrase',
    accessUrl: 'https://hokie.ai.vt.edu/',
    accessCta: 'Open HokieAI',
    costOrLimits: 'No cost to individual users. Usage is metered monthly, and models consume the allocation at different rates.',
    verifiedCapabilities: [
      capability('general-chat', ['vt-hokieai'], 'The HokieAI overview explicitly lists chat.'),
      capability('drafting', ['vt-hokieai'], 'The HokieAI overview explicitly lists drafting content.'),
      capability('revising', ['vt-hokieai'], 'The HokieAI overview explicitly lists revising content.'),
      capability('summarization', ['vt-hokieai'], 'VT documents document upload for analysis; this guide limits the claim to analysis and summarization workflows.'),
      capability('source-grounding', ['vt-hokieai-instructors'], 'VT documents personal agents that use course materials as sources.'),
      capability('file-upload', ['vt-hokieai'], 'The HokieAI overview explicitly lists document upload for analysis.'),
      capability('coding', ['vt-hokieai'], 'The HokieAI overview explicitly lists coding.'),
      capability('image-generation', ['vt-hokieai'], 'The HokieAI overview explicitly lists image creation.'),
    ],
    supportedTasks: [
      taskFit('brainstorm-first-draft', 'strong', 'Its documented chat and drafting functions directly match idea development and first-draft work.', ['vt-hokieai'], 'VT explicitly lists chat and drafting content.'),
      taskFit('revise-writing', 'strong', 'Its documented revision function directly matches improving existing writing.', ['vt-hokieai'], 'VT explicitly lists revising content.'),
      taskFit('summarize-uploaded', 'supported', 'Document upload and analysis support a reading-summary workflow.', ['vt-hokieai'], 'VT explicitly lists document upload for analysis.'),
      taskFit('questions-provided-sources', 'supported', 'Personal agents can use course materials as sources, but this is not the platform’s only documented focus.', ['vt-hokieai-instructors'], 'VT documents source-based personal agents for course materials.'),
      taskFit('coding-debugging', 'strong', 'Coding is an explicitly listed HokieAI capability.', ['vt-hokieai'], 'VT explicitly lists coding.'),
      taskFit('image-generation', 'strong', 'Image creation is an explicitly listed HokieAI capability.', ['vt-hokieai'], 'VT explicitly lists image creation.'),
      taskFit('quick-question', 'strong', 'The documented chat function directly supports a general question.', ['vt-hokieai'], 'VT explicitly lists chat.'),
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['Use only the VT-hosted HokieAI service.', 'Follow course-specific AI rules and use it only for VT work and assignments.'],
    notSuitableWhen: ['The task requires student API access, current web search, citations, or multimodal input; those capabilities are not verified for HokieAI in the reviewed VT sources.'],
    officialSources: [vtTools, hokieAiOverview, hokieAiForInstructors],
    lastVerified: REVIEW_DATE,
    usageSteps: ['Sign in at the VT-hosted portal.', 'Choose a model with the monthly meter in mind.', 'Provide only the minimum permitted context, then verify the output.'],
  },
  {
    id: 'gemini-vt',
    name: 'Google Gemini App through Virginia Tech',
    initials: 'GA',
    summary: 'The Gemini App available through the VT Google account for text, ideas, summaries, multimodal questions, and image creation.',
    status: 'active-service',
    studentAvailability: 'all-vt-students',
    eligibility: 'All Virginia Tech students, faculty, and staff.',
    requiredAccount: 'VT Google account showing “Managed by vt.edu”',
    accessUrl: 'https://gemini.google.com/',
    accessCta: 'Open Gemini with your VT account',
    institutionalAccountReminder: 'Use the VT Google account and confirm the profile says “Managed by vt.edu.” A personal Google account does not inherit VT protections.',
    costOrLimits: 'Included student access is verified. The reviewed VT sources do not state a student usage quota; separately purchased premium features are not assumed.',
    verifiedCapabilities: [
      capability('general-chat', ['vt-google-ai'], 'VT describes the Gemini App as answering questions.'),
      capability('drafting', ['vt-google-ai'], 'VT lists text generation, brainstorming, and content creation.'),
      capability('summarization', ['vt-google-ai'], 'VT explicitly lists generating summaries.'),
      capability('multimodal-input', ['vt-google-ai'], 'VT documents questions using text, voice, and images.'),
      capability('image-generation', ['vt-google-ai'], 'VT explicitly lists image creation.'),
    ],
    supportedTasks: [
      taskFit('brainstorm-first-draft', 'strong', 'VT explicitly documents brainstorming, text generation, and content creation.', ['vt-google-ai'], 'The VT Google AI article lists brainstorming and content generation.'),
      taskFit('multimodal-understanding', 'strong', 'VT explicitly documents questions using text, voice, and images.', ['vt-google-ai'], 'The VT Google AI article lists multimodal questions.'),
      taskFit('image-generation', 'strong', 'VT explicitly documents image creation.', ['vt-google-ai'], 'The VT Google AI article lists image creation.'),
      taskFit('quick-question', 'strong', 'VT describes the app as answering questions with text, voice, or images.', ['vt-google-ai'], 'The VT Google AI article lists question answering.'),
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['Confirm the Google profile says “Managed by vt.edu.”', 'Do not assume a personal Google account receives VT data protection.'],
    notSuitableWhen: ['The task requires verified file upload, source-only grounding, citations, coding, or student API access.'],
    officialSources: [vtTools, googleAiAtVt],
    lastVerified: REVIEW_DATE,
    usageSteps: ['Sign in with the VT Google account.', 'Verify “Managed by vt.edu” before entering university information.', 'Ask for the desired format and independently check the result.'],
  },
  {
    id: 'notebooklm-vt',
    name: 'Google NotebookLM through Virginia Tech',
    initials: 'NL',
    summary: 'A VT Google-account research assistant that works from uploaded sources and supports multi-source summaries and analysis.',
    status: 'active-service',
    studentAvailability: 'all-vt-students',
    eligibility: 'All Virginia Tech students, faculty, and staff.',
    requiredAccount: 'VT Google account showing “Managed by vt.edu”',
    accessUrl: 'https://notebooklm.google.com/',
    accessCta: 'Open NotebookLM with your VT account',
    institutionalAccountReminder: 'Use the VT Google account and confirm the profile says “Managed by vt.edu.” A personal Google account does not inherit VT protections.',
    costOrLimits: 'Included student access is verified. The reviewed VT sources do not state student quotas; separately purchased premium features are not assumed.',
    verifiedCapabilities: [
      capability('summarization', ['vt-google-ai'], 'VT identifies summarization of uploaded content as a NotebookLM use.'),
      capability('source-grounding', ['vt-google-ai'], 'VT states that NotebookLM works from sources the user supplies.'),
      capability('file-upload', ['vt-google-ai'], 'VT documents adding PDFs, Google Docs, URLs, videos, and text files as sources.'),
    ],
    supportedTasks: [
      taskFit('summarize-uploaded', 'strong', 'Summarizing user-supplied material is a primary documented NotebookLM workflow.', ['vt-google-ai'], 'VT documents summarization of uploaded content.'),
      taskFit('questions-provided-sources', 'strong', 'VT says NotebookLM works only with uploaded sources and supports multi-source analysis.', ['vt-google-ai'], 'VT documents source-bounded questions and analysis.'),
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['Confirm the Google profile says “Managed by vt.edu.”', 'Use supported sources such as PDFs, Google Docs, URLs, videos, or text files.'],
    notSuitableWhen: ['The task requires open-web research, coding, API access, multimodal input, or image generation.'],
    officialSources: [vtTools, googleAiAtVt],
    lastVerified: REVIEW_DATE,
    usageSteps: ['Open NotebookLM while signed in with the VT Google account.', 'Add only sources permitted for this use.', 'Ask bounded questions and check the response against those sources.'],
  },
  {
    id: 'copilot-chat-vt',
    name: 'Microsoft Copilot Chat through Virginia Tech',
    initials: 'CC',
    summary: 'The web-based Copilot Chat included with VT Microsoft accounts for writing, web-grounded answers, citations, files, and image generation.',
    status: 'active-service',
    studentAvailability: 'all-vt-students',
    eligibility: 'All Virginia Tech students, faculty, and staff.',
    requiredAccount: 'VT Hokies Microsoft account with Enterprise Data Protection',
    accessUrl: 'https://copilot.microsoft.com/',
    accessCta: 'Open Copilot Chat with your VT account',
    institutionalAccountReminder: 'Use the VT Hokies Microsoft account and confirm Enterprise Data Protection. A personal Microsoft account does not inherit VT protections.',
    costOrLimits: 'Copilot Chat is included with VT M365 accounts. It has no Microsoft 365 app integration; separately licensed in-app features are not included.',
    verifiedCapabilities: [
      capability('general-chat', ['vt-copilot-chat'], 'VT lists quick questions and everyday assistance.'),
      capability('drafting', ['vt-copilot-chat'], 'VT documents ideas, outlines, and text generation.'),
      capability('revising', ['vt-copilot-chat'], 'VT documents grammar, style, paraphrasing, and suggested improvements.'),
      capability('summarization', ['vt-copilot-chat'], 'VT explicitly documents summarizing content.'),
      capability('source-grounding', ['vt-copilot-chat', 'vt-copilot-editions'], 'VT documents file analysis and web-grounded answers with linked sources.'),
      capability('file-upload', ['vt-copilot-editions'], 'VT documents file upload in included Copilot Chat.'),
      capability('web-search', ['vt-copilot-chat'], 'VT documents grounding answers in current web information.'),
      capability('citations', ['vt-copilot-chat'], 'VT documents citations and source links in Copilot responses.'),
      capability('image-generation', ['vt-copilot-editions'], 'VT documents image generation in included Copilot Chat.'),
    ],
    supportedTasks: [
      taskFit('brainstorm-first-draft', 'strong', 'VT documents ideas, outlines, and text generation.', ['vt-copilot-chat'], 'VT lists brainstorming and writing uses.'),
      taskFit('revise-writing', 'strong', 'VT documents grammar, style, paraphrasing, and suggested improvements.', ['vt-copilot-chat'], 'VT lists revision uses.'),
      taskFit('summarize-uploaded', 'supported', 'VT documents file uploads and summarization.', ['vt-copilot-chat', 'vt-copilot-editions'], 'VT separately documents summarization and file upload.'),
      taskFit('questions-provided-sources', 'supported', 'VT documents uploaded-file analysis; NotebookLM is more directly source-bounded.', ['vt-copilot-chat', 'vt-copilot-editions'], 'VT documents file upload and content analysis.'),
      taskFit('research-web-citations', 'strong', 'Current web grounding and source citations directly match this task.', ['vt-copilot-chat'], 'VT documents web-grounded answers with citations.'),
      taskFit('image-generation', 'supported', 'VT documents image generation, though it is one of several general chat functions.', ['vt-copilot-editions'], 'VT documents image generation in Copilot Chat.'),
      taskFit('quick-question', 'strong', 'VT lists quick questions and everyday assistance as primary uses.', ['vt-copilot-chat'], 'VT explicitly lists quick questions.'),
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['Verify the signed-in account is the VT Hokies account and Enterprise Data Protection applies.', 'Do not assume access to organizational files or in-app Microsoft 365 integration.'],
    notSuitableWhen: ['The task requires coding, API access, or verified multimodal input. Included Copilot Chat is not the separately licensed Microsoft 365 Copilot.'],
    officialSources: [vtTools, copilotAtVt, copilotEditions],
    lastVerified: REVIEW_DATE,
    usageSteps: ['Open Copilot and sign in with the VT Hokies account.', 'Confirm the VT account and protection indicator before adding university data.', 'Open cited sources and verify that they support the response.'],
  },
  {
    id: 'arc-llm-gateway',
    name: 'ARC LLM Gateway',
    initials: 'AG',
    summary: 'An on-premises ARC-hosted web and API service with selected models, RAG, web search, vision, and image generation or editing.',
    status: 'active-service',
    studentAvailability: 'all-vt-students',
    eligibility: 'All Virginia Tech students, faculty, and staff; no separate ARC account is required for the web interface.',
    requiredAccount: 'VT credentials; a confidential user-generated API key for API access',
    accessUrl: 'https://llm.arc.vt.edu/',
    accessCta: 'Open ARC LLM Gateway',
    costOrLimits: 'No charge to individual web users. Model selection and capacity can change dynamically; interactions are logged and preserved under VT data-protection policies.',
    verifiedCapabilities: [
      capability('general-chat', ['vt-arc-gateway'], 'ARC provides a hosted Open WebUI interface with general-purpose models.'),
      capability('summarization', ['vt-arc-gateway'], 'ARC describes review and summarization uses for hosted models.'),
      capability('source-grounding', ['vt-arc-gateway'], 'ARC explicitly documents retrieval-augmented generation (RAG).'),
      capability('coding', ['vt-arc-gateway'], 'ARC documents hosted models with an explicit coding capability.'),
      capability('api-access', ['vt-arc-gateway'], 'ARC explicitly documents student-generated API keys.'),
      capability('web-search', ['vt-arc-gateway'], 'ARC explicitly documents and configures web search.'),
      capability('multimodal-input', ['vt-arc-gateway'], 'ARC explicitly documents vision capability.'),
      capability('image-generation', ['vt-arc-gateway'], 'ARC explicitly documents image generation and image editing.'),
    ],
    supportedTasks: [
      taskFit('brainstorm-first-draft', 'supported', 'General-purpose hosted models can support generative work, but ARC does not present drafting as a primary student workflow.', ['vt-arc-gateway'], 'ARC documents a general generative AI web interface.'),
      taskFit('questions-provided-sources', 'supported', 'ARC documents RAG, but not the same source-only uploaded-document workflow as NotebookLM.', ['vt-arc-gateway'], 'ARC explicitly documents RAG.'),
      taskFit('coding-debugging', 'strong', 'The current ARC documentation identifies hosted models with coding capability.', ['vt-arc-gateway'], 'ARC documents coding-optimized model capability.'),
      taskFit('api-research-workflow', 'strong', 'ARC explicitly provides API keys to students and positions the gateway for research workflows.', ['vt-arc-gateway'], 'ARC documents student access and user-generated API keys.'),
      taskFit('research-web-citations', 'supported', 'ARC documents web search, but the reviewed page does not verify citation output.', ['vt-arc-gateway'], 'ARC explicitly documents web search.'),
      taskFit('multimodal-understanding', 'strong', 'ARC explicitly documents vision input.', ['vt-arc-gateway'], 'ARC explicitly lists vision.'),
      taskFit('image-generation', 'strong', 'ARC explicitly documents image generation and image editing.', ['vt-arc-gateway'], 'ARC documents both image generation and edition.'),
      taskFit('quick-question', 'supported', 'The web interface provides general-purpose hosted LLMs.', ['vt-arc-gateway'], 'ARC documents a hosted Open WebUI service.'),
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['Keep generated API keys confidential.', 'Account for interaction logging and any research protocol or data-use agreement.'],
    notSuitableWhen: ['The task requires a verified file-upload workflow, citations, or a dedicated exclusive instance.'],
    officialSources: [vtTools, arcGateway],
    lastVerified: REVIEW_DATE,
    usageSteps: ['Sign in with VT credentials; no separate ARC account is needed for the web interface.', 'Use the web interface or generate a private API key in account settings.', 'Select a model for the task and verify all outputs.'],
  },
  {
    id: 'arc-open-ondemand',
    name: 'ARC Open OnDemand LLMs',
    initials: 'AO',
    summary: 'A dedicated ARC-hosted LLM session for research workloads needing exclusive web or high-throughput API access.',
    status: 'conditional-access',
    studentAvailability: 'arc-account-required',
    eligibility: 'VT students, faculty, and staff with an ARC account, an active allocation, and VT network or VPN access.',
    requiredAccount: 'VT credentials, ARC account, and active ARC allocation',
    accessUrl: 'https://ood.arc.vt.edu/',
    accessCta: 'Open ARC Open OnDemand',
    costOrLimits: 'Consumes allocation service units. Sessions last at most five days, end after one hour of inactivity, and require the VT network or VPN.',
    verifiedCapabilities: [
      capability('general-chat', ['vt-arc-open-ondemand'], 'ARC documents a web interface to a user-selected dedicated LLM.'),
      capability('api-access', ['vt-arc-open-ondemand'], 'ARC explicitly documents OpenAI-compatible API access.'),
      capability('dedicated-instance', ['vt-arc-open-ondemand'], 'ARC documents exclusive dedicated instances without request-per-minute or request-per-hour limits.'),
    ],
    supportedTasks: [
      taskFit('api-research-workflow', 'supported', 'It supports massive API queries, but access consumes an existing ARC allocation and is intended for dedicated research workloads.', ['vt-arc-open-ondemand'], 'ARC documents dedicated instances for massive queries and API access.'),
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['An existing ARC account is required.', 'An active ARC allocation with service units is required.', 'Connect through the VT network or VPN.', 'Accept the selected model’s terms using a Hugging Face account when required.'],
    notSuitableWhen: ['The student lacks an ARC account, active allocation, or VT network/VPN access, or the task does not justify a dedicated high-throughput instance.'],
    officialSources: [vtTools, arcOpenOnDemand],
    lastVerified: REVIEW_DATE,
    usageSteps: ['Connect to the VT network or VPN and sign in to Open OnDemand.', 'Start a dedicated session using allocation service units.', 'Keep the session API key private and save work before session limits end it.'],
  },
]

export const toolById = Object.fromEntries(tools.map((tool) => [tool.id, tool])) as Record<string, Tool>
