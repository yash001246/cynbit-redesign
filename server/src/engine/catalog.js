// Mirrors the six labs, five roadmap phases and 60-day sprint published at
// cynbit.in/bitelevate. Weights (0-3) are this prototype's own judgement.

export const INTERESTS = [
  { id: 'ui', label: 'Building interfaces' },
  { id: 'api', label: 'APIs & databases' },
  { id: 'ai', label: 'AI & LLM apps' },
  { id: 'quality', label: 'Testing & quality' },
  { id: 'design', label: 'Design & UX' },
  { id: 'deploy', label: 'Deploying & infrastructure' },
];

export const LEVELS = [
  { id: 'beginner', label: 'Just starting out' },
  { id: 'some', label: 'Built a few small projects' },
  { id: 'solid', label: 'Comfortable shipping features' },
];

export const GOALS = [
  { id: 'job', label: 'Land a developer job' },
  { id: 'credit', label: 'Complete college training credit' },
  { id: 'portfolio', label: 'Build a standout GitHub portfolio' },
];

export const LANGUAGES = [
  { id: 'js', label: 'JavaScript / TypeScript' },
  { id: 'python', label: 'Python' },
  { id: 'none', label: 'Neither yet' },
];

export const LABS = [
  {
    id: 'fullstack', name: 'Full Stack SaaS Lab', project: 'SprintPulse',
    stack: ['Next.js 15', 'React 19', 'FastAPI', 'PostgreSQL', 'Docker'],
    blurb: 'A Kanban SaaS with drag-and-drop state, JWT auth and real-time updates.',
    tags: { ui: 3, api: 3, deploy: 1, ai: 0, quality: 1, design: 1 },
    langs: { js: 2, python: 1 }, difficulty: 2, goalFit: { job: 2, credit: 1, portfolio: 2 },
    milestones: [
      'Fork SprintPulse, run API and web locally, open your first PR',
      'Reproduce board bugs and cover them with Pytest and Playwright',
      'Ship JWT auth, RBAC and the relational board schema',
      'Add Redis caching and real-time board updates',
      'Dockerize and release through GitHub Actions',
    ],
  },
  {
    id: 'backend', name: 'Python Backend Lab', project: 'PulseServe API',
    stack: ['Python', 'REST APIs', 'Redis', 'Async queues'],
    blurb: 'Production API work: schemas, indexing, caching and concurrency.',
    tags: { api: 3, deploy: 2, quality: 1, ai: 1, ui: 0, design: 0 },
    langs: { python: 2, js: 0 }, difficulty: 2, goalFit: { job: 2, credit: 1, portfolio: 1 },
    milestones: [
      'Set up PulseServe API locally and land your first PR',
      'Reproduce production error logs and cover them with Pytest',
      'Design authentication, RBAC and relational schemas',
      'Add Redis caching, query profiling and background queues',
      'Containerize and ship with a CI/CD pipeline',
    ],
  },
  {
    id: 'ai', name: 'AI & Vector Intelligence Lab', project: 'SupportPulse AI',
    stack: ['LLM apps', 'Vector search', 'Python'],
    blurb: 'Retrieval pipelines: chunking, vector latency and rate limits.',
    tags: { ai: 3, api: 2, deploy: 1, quality: 1, ui: 0, design: 0 },
    langs: { python: 2, js: 0 }, difficulty: 3, goalFit: { job: 1, credit: 0, portfolio: 2 },
    milestones: [
      'Set up SupportPulse AI and land your first PR',
      'Debug failing retrieval and write evaluation tests',
      'Build chunking, embedding and retrieval pipelines',
      'Tune vector-search latency and handle rate limits',
      'Package, secure and release the capstone',
    ],
  },
  {
    id: 'frontend', name: 'Frontend Ops Dashboard Lab', project: 'Next.js 15 dashboard',
    stack: ['Next.js 15', 'React', 'Playwright'],
    blurb: 'A data-heavy dashboard: re-renders, cache tags and memory leaks.',
    tags: { ui: 3, design: 2, quality: 1, api: 1, deploy: 0, ai: 0 },
    langs: { js: 2, python: 0 }, difficulty: 1, goalFit: { job: 1, credit: 1, portfolio: 2 },
    milestones: [
      'Run the dashboard locally and open your first PR',
      'Chase down re-render bugs and cover them with Playwright',
      'Build data tables, auth views and cache-tagged fetching',
      'Profile rendering, fix memory leaks and trim bundles',
      'Containerize, add CI and ship the capstone',
    ],
  },
  {
    id: 'qa', name: 'QA & Test Automation Lab', project: 'ApexCart E2E',
    stack: ['Playwright', 'CI pipelines'],
    blurb: 'End-to-end suites that break builds for the right reasons.',
    tags: { quality: 3, deploy: 2, ui: 1, api: 1, ai: 0, design: 0 },
    langs: { js: 1, python: 1 }, difficulty: 1, goalFit: { job: 1, credit: 2, portfolio: 1 },
    milestones: [
      'Set up the ApexCart suite and land your first PR',
      'Write Playwright flows that catch real defects',
      'Design page objects, fixtures and a test-data strategy',
      'Parallelise runs and stabilise flaky tests',
      'Wire the suite into GitHub Actions as a release gate',
    ],
  },
  {
    id: 'uiux', name: 'UI/UX & Design Systems Lab', project: 'ApexDesign',
    stack: ['Design tokens', 'Component library', 'Accessibility'],
    blurb: 'Reusable components with theming, dark mode and keyboard access.',
    tags: { design: 3, ui: 2, quality: 1, api: 0, ai: 0, deploy: 0 },
    langs: { js: 1, python: 0 }, difficulty: 1, goalFit: { job: 1, credit: 1, portfolio: 2 },
    milestones: [
      'Set up ApexDesign and land your first PR',
      'Audit components for accessibility and visual bugs',
      'Build tokens, theming and dark mode',
      'Optimise performance and document usage',
      'Publish the system with CI checks and a live demo',
    ],
  },
];

export const PHASES = [
  { id: 1, title: 'Environment & setup', weeks: 'Week 1', focus: 'Git and tooling hygiene', days: [1, 7],
    stretch: 'Script your whole setup so a teammate can run it in one command.' },
  { id: 2, title: 'Bug hunting & tests', weeks: 'Week 2', focus: 'Root-cause analysis', days: [8, 14],
    stretch: 'Add a regression test for every bug you fix.' },
  { id: 3, title: 'Core architecture', weeks: 'Weeks 3-4', focus: 'Production feature build', days: [15, 28],
    stretch: 'Write a short design note for one decision you made and why.' },
  { id: 4, title: 'Speed & concurrency', weeks: 'Weeks 5-6', focus: 'Scalability and latency', days: [29, 42],
    stretch: 'Publish before/after numbers for one optimisation.' },
  { id: 5, title: 'Docker & capstone', weeks: 'Weeks 7-8', focus: 'Production graduation', days: [43, 60],
    stretch: 'Add an automated quality gate to your capstone release.' },
];

export const SPRINT_DAYS = 60;
export const FREEZE_DAYS = 14;
