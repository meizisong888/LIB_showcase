export const ui = {
  projectName: 'AI Workbench for VT',
  disclaimer: 'Independent capstone project. Not an official Virginia Tech service.',
  nav: {
    home: 'Home',
    recommend: 'Find the right AI',
    tools: 'Compare tools',
    skills: 'Browse skills',
    safety: 'Responsible AI',
  },
  home: {
    eyebrow: 'Task-first, not hype-first',
    title: 'Choose AI for the work in front of you.',
    description: 'Start with your task, constraints, and data—not a leaderboard. Get a transparent recommendation, a repeatable skill, and a human review plan.',
    question: 'What do you need to accomplish?',
  },
  pageHeaders: {
    recommend: {
      eyebrow: 'Transparent rule-based matching',
      title: 'Find the right AI for this task',
      description: 'Tell us what the work demands. We apply data-safety exclusions first, then score task fit, evidence, files, ecosystem, access, and learning effort.',
    },
    tools: {
      eyebrow: 'Conditional comparison',
      title: 'Compare AI tools without a fake leaderboard',
      description: 'Search and select up to three products. Compare task fit, evidence behavior, file access, ecosystems, cost conditions, and data boundaries side by side.',
    },
    skills: {
      eyebrow: 'Repeatable, inspectable workflows',
      title: 'Skills that include the human part',
      description: 'Every skill defines when to use it, when not to, what to prepare, a reusable prompt, common failures, and an output-verification checklist.',
    },
    findSkill: {
      eyebrow: 'A safer discovery process',
      title: 'Find and evaluate a skill',
      description: 'A popular skill is not necessarily safe, maintained, or right for your task. Use this eight-step evidence and permission review before installation.',
    },
    safety: {
      eyebrow: 'Responsible AI',
      title: 'Protect the data. Verify the output. Keep a human accountable.',
      description: 'This page summarizes current Virginia Tech guidance for practical decisions. It is not legal advice and does not replace the official policy, data steward, IRB, instructor, or security review.',
    },
    methodology: {
      eyebrow: 'Methodology & sources',
      title: 'A recommendation you can inspect',
      description: 'The finder is a deterministic client-side rules engine. It does not call an LLM, profile users, or produce a universal product score.',
    },
    contribute: {
      eyebrow: 'Contribute evidence, not hype',
      title: 'Help keep the workbench accurate',
      description: 'Use a structured issue to propose a tool or skill, flag stale information, or report a safety concern. Every content change needs a source and verification date.',
    },
  },
  actions: {
    start: 'Start task finder',
    compare: 'Compare AI tools',
    browse: 'Browse skills',
    copy: 'Copy prompt',
    copied: 'Copied to clipboard',
    reset: 'Reset filters',
  },
  dates: {
    reviewed: 'Last reviewed',
    currentReview: 'August 28, 2026',
  },
} as const
