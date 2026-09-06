import type { OfficialSource, Tool } from '../types'

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
  claimScope: 'No-cost student access, verified capabilities, monthly metering, and protected VT environment.',
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
  claimScope: 'VT institutional-account protections and verified Gemini App and Notebook capabilities.',
  lastChecked: REVIEW_DATE,
}

const copilotAtVt: OfficialSource = {
  id: 'vt-copilot-chat',
  title: 'Understanding Microsoft Copilot with Enterprise Data Protection at Virginia Tech',
  url: 'https://4help.vt.edu/sp?id=kb_article&sysparm_article=KB0014762',
  claimScope: 'Student access, VT sign-in, Enterprise Data Protection, web grounding, citations, writing, revision, and summarization.',
  lastChecked: REVIEW_DATE,
}

const copilotEditions: OfficialSource = {
  id: 'vt-copilot-editions',
  title: 'Virginia Tech 4Help: Copilot Chat capabilities and account editions',
  url: 'https://4help.vt.edu/sp?id=kb_article&sysparm_article=KB0015697',
  claimScope: 'File uploads and image generation in Copilot Chat, plus the boundary between included chat and separately licensed integration.',
  lastChecked: REVIEW_DATE,
}

const arcGateway: OfficialSource = {
  id: 'vt-arc-gateway',
  title: 'llm.arc.vt.edu — ARC User Documentation',
  url: 'https://docs.arc.vt.edu/ai/010_llm_arc_vt_edu.html',
  claimScope: 'Student web access without a separate ARC account, API keys, RAG, web search, vision, image generation, models, cost, security, and restrictions.',
  lastChecked: REVIEW_DATE,
}

const arcOpenOnDemand: OfficialSource = {
  id: 'vt-arc-open-ondemand',
  title: 'LLMs via Open OnDemand — ARC User Documentation',
  url: 'https://docs.arc.vt.edu/ai/020_ood_arc_vt_edu.html',
  claimScope: 'ARC-account eligibility, allocation use, web/API access, session limits, network requirements, and security.',
  lastChecked: REVIEW_DATE,
}

export const officialSources: OfficialSource[] = [
  vtTools,
  hokieAiOverview,
  hokieAiForInstructors,
  googleAiAtVt,
  copilotAtVt,
  copilotEditions,
  arcGateway,
  arcOpenOnDemand,
]

const approvedData = ['public', 'internal', 'sensitive'] as const
const prohibitedData = [
  'Export-controlled data, including data governed by ITAR or DFARS',
  'Controlled Unclassified Information (CUI)',
]

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
    costOrLimits: 'No cost to individual users. Usage is metered monthly, and models consume the allocation at different rates.',
    verifiedCapabilities: ['general-chat', 'drafting', 'revising', 'summarization', 'source-grounding', 'file-upload', 'coding', 'image-generation'],
    supportedTasks: [
      { taskId: 'brainstorming-writing', fit: 'strong', reason: 'VT explicitly documents chat plus drafting content.' },
      { taskId: 'revising-writing', fit: 'strong', reason: 'VT explicitly documents revising content.' },
      { taskId: 'summarizing-readings', fit: 'supported', reason: 'Document upload and analysis support a reading-summary workflow.' },
      { taskId: 'source-questions', fit: 'supported', reason: 'VT documents file-based personal agents that answer questions from course materials, though this is not HokieAI’s sole focus.' },
      { taskId: 'coding-debugging', fit: 'strong', reason: 'Coding is an explicitly listed HokieAI capability.' },
      { taskId: 'research-api', fit: 'supported', reason: 'VT identifies HokieAI as supporting research, but does not document student API access.' },
      { taskId: 'image-multimodal', fit: 'supported', reason: 'Image creation is explicitly listed.' },
      { taskId: 'quick-questions', fit: 'strong', reason: 'Its documented chat capability directly supports general questions.' },
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['Use only the VT-hosted HokieAI service.', 'Follow course-specific AI rules and use it only for VT work and assignments.'],
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
    costOrLimits: 'Included student access is verified. The reviewed VT sources do not state a student usage quota; separately purchased premium features are not assumed.',
    verifiedCapabilities: ['general-chat', 'drafting', 'summarization', 'multimodal-input', 'image-generation'],
    supportedTasks: [
      { taskId: 'brainstorming-writing', fit: 'strong', reason: 'VT explicitly lists brainstorming, text generation, and content creation.' },
      { taskId: 'revising-writing', fit: 'supported', reason: 'Text generation can support a revision conversation, but VT does not document direct file editing in the student app.' },
      { taskId: 'summarizing-readings', fit: 'supported', reason: 'Generating summaries is explicitly listed.' },
      { taskId: 'image-multimodal', fit: 'strong', reason: 'VT explicitly documents text, voice, and image questions plus image creation.' },
      { taskId: 'quick-questions', fit: 'strong', reason: 'VT describes the app as answering questions with multimodal inputs.' },
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['Confirm the Google profile says “Managed by vt.edu.”', 'Do not assume a personal Google account receives VT data protection.'],
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
    costOrLimits: 'Included student access is verified. The reviewed VT sources do not state student quotas; separately purchased premium features are not assumed.',
    verifiedCapabilities: ['summarization', 'source-grounding', 'file-upload'],
    supportedTasks: [
      { taskId: 'summarizing-readings', fit: 'strong', reason: 'VT identifies summarization of uploaded content as a primary use.' },
      { taskId: 'source-questions', fit: 'strong', reason: 'VT says Notebook works only with uploaded sources and supports multi-source analysis.' },
      { taskId: 'research-api', fit: 'supported', reason: 'VT identifies research and organization of ideas as supported uses; API access is not documented.' },
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['Confirm the Google profile says “Managed by vt.edu.”', 'Use supported sources such as PDFs, Google Docs, URLs, videos, or text files.'],
    officialSources: [vtTools, googleAiAtVt],
    lastVerified: REVIEW_DATE,
    usageSteps: ['Open NotebookLM while signed in with the VT Google account.', 'Add only the sources permitted for this use.', 'Ask bounded questions and check the response against the uploaded sources.'],
  },
  {
    id: 'copilot-chat-vt',
    name: 'Microsoft Copilot Chat through Virginia Tech',
    initials: 'CC',
    summary: 'The web-based Copilot Chat included with VT Microsoft accounts for general assistance, writing, summaries, web-grounded answers, files, and images.',
    status: 'active-service',
    studentAvailability: 'all-vt-students',
    eligibility: 'All Virginia Tech students, faculty, and staff.',
    requiredAccount: 'VT Hokies Microsoft account with Enterprise Data Protection',
    accessUrl: 'https://copilot.microsoft.com/',
    costOrLimits: 'Copilot Chat is included with VT M365 accounts. It has no Microsoft 365 app integration; separately licensed in-app features are not included.',
    verifiedCapabilities: ['general-chat', 'drafting', 'revising', 'summarization', 'source-grounding', 'file-upload', 'web-search', 'image-generation'],
    supportedTasks: [
      { taskId: 'brainstorming-writing', fit: 'strong', reason: 'VT documents ideas, outlines, and text generation.' },
      { taskId: 'revising-writing', fit: 'strong', reason: 'VT documents grammar, style, paraphrasing, and suggested improvements.' },
      { taskId: 'summarizing-readings', fit: 'supported', reason: 'VT documents file uploads and summarization.' },
      { taskId: 'source-questions', fit: 'supported', reason: 'VT documents uploaded-file analysis and source-linked web answers.' },
      { taskId: 'research-api', fit: 'supported', reason: 'Web-grounded chat and citations support initial research; API access is not documented.' },
      { taskId: 'image-multimodal', fit: 'supported', reason: 'AI-generated images are documented in VT’s Copilot Chat comparison.' },
      { taskId: 'quick-questions', fit: 'strong', reason: 'VT lists quick questions and everyday assistance as primary uses.' },
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['Verify the signed-in account is the VT Hokies account and Enterprise Data Protection applies.', 'Do not assume access to organizational files or in-app Microsoft 365 integration.'],
    officialSources: [vtTools, copilotAtVt, copilotEditions],
    lastVerified: REVIEW_DATE,
    usageSteps: ['Open Copilot and sign in with the VT Hokies account.', 'Confirm the VT account and protection indicator before adding university data.', 'Open cited sources and verify that they support the response.'],
  },
  {
    id: 'arc-llm-gateway',
    name: 'ARC LLM Gateway',
    initials: 'AG',
    summary: 'An on-premises ARC-hosted web and API service with selected open-access models, RAG, web search, vision, and image generation.',
    status: 'active-service',
    studentAvailability: 'all-vt-students',
    eligibility: 'All Virginia Tech students, faculty, and staff; no separate ARC account is required for the web interface.',
    requiredAccount: 'VT credentials; a confidential user-generated API key for API access',
    accessUrl: 'https://llm.arc.vt.edu/',
    costOrLimits: 'No charge to individual web users. Model selection and capacity can change dynamically; interactions are logged and preserved under VT data-protection policies.',
    verifiedCapabilities: ['general-chat', 'summarization', 'source-grounding', 'coding', 'api-access', 'web-search', 'multimodal-input', 'image-generation'],
    supportedTasks: [
      { taskId: 'brainstorming-writing', fit: 'supported', reason: 'VT lists the gateway for generative AI and general-purpose models.' },
      { taskId: 'summarizing-readings', fit: 'supported', reason: 'Review and summarization of data are explicitly listed uses.' },
      { taskId: 'source-questions', fit: 'supported', reason: 'ARC documents retrieval-augmented generation, though file-upload behavior is not explicitly documented.' },
      { taskId: 'coding-debugging', fit: 'strong', reason: 'The current ARC model documentation explicitly identifies coding capability.' },
      { taskId: 'research-api', fit: 'strong', reason: 'ARC explicitly provides user API keys and positions the gateway for research and data review.' },
      { taskId: 'image-multimodal', fit: 'strong', reason: 'ARC documents vision and image generation in the web service.' },
      { taskId: 'quick-questions', fit: 'supported', reason: 'The web interface provides general-purpose hosted LLMs.' },
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['Keep generated API keys confidential.', 'Account for interaction logging and any research protocol or data-use agreement.'],
    officialSources: [vtTools, arcGateway],
    lastVerified: REVIEW_DATE,
    usageSteps: ['Sign in with VT credentials; no separate ARC account is needed.', 'Use the web interface or generate a private API key in account settings.', 'Select a model for the task and verify all outputs.'],
  },
  {
    id: 'arc-open-ondemand',
    name: 'ARC Open OnDemand LLMs',
    initials: 'AO',
    summary: 'A dedicated ARC-hosted LLM session for research workloads needing exclusive web or high-throughput API access.',
    status: 'conditional-access',
    studentAvailability: 'arc-account-required',
    eligibility: 'VT students, faculty, and staff who already have an ARC account and allocation.',
    requiredAccount: 'VT credentials, ARC account, and ARC allocation',
    accessUrl: 'https://ood.arc.vt.edu/',
    costOrLimits: 'Consumes allocation service units. Sessions last at most five days, end after one hour of inactivity, and require the VT network or VPN.',
    verifiedCapabilities: ['general-chat', 'api-access'],
    supportedTasks: [
      { taskId: 'research-api', fit: 'strong', reason: 'VT documents dedicated instances for massive research queries with web and OpenAI-compatible API access.' },
      { taskId: 'quick-questions', fit: 'supported', reason: 'The dedicated service runs user-selected publicly available LLMs, though it is intended for research workloads.' },
    ],
    dataRiskApproval: [...approvedData],
    prohibitedData: [...prohibitedData],
    conditionalRequirements: ['An existing ARC account and allocation are required.', 'Connect through the VT network or VPN.', 'Accept the selected model’s terms using a Hugging Face account when required.'],
    officialSources: [vtTools, arcOpenOnDemand],
    lastVerified: REVIEW_DATE,
    usageSteps: ['Connect to the VT network or VPN and sign in to Open OnDemand.', 'Start a dedicated session using allocation service units.', 'Keep the session API key private and save work before session limits end it.'],
  },
]

export const toolById = Object.fromEntries(tools.map((tool) => [tool.id, tool])) as Record<string, Tool>
