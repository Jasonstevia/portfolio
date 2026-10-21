// All portfolio content lives here. Each project drives: the strip card, the
// info-card tabs, the code card, the stage demo (demos.js, keyed by id) and
// the callout tags (keys match [data-tag] elements inside the demo).

export const GITHUB = 'https://github.com/Jasonstevia';
export const LINKEDIN = 'https://www.linkedin.com/in/jason-slim-676800229/';
export const EMAIL = 'jasonslim147@gmail.com';
export const CV = 'assets/Jason_Slim_CV.pdf';

// Small line icons (24×24 viewBox) used in feature lists and flyouts
export const ICONS = {
  agent: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c.6-3.6 3.4-6 7-6s6.4 2.4 7 6"/><path d="M18.5 4.5l1.5-1.5M20 8h2"/>',
  doc: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M9 12h6M9 15.5h6"/>',
  check: '<circle cx="12" cy="12" r="8.5"/><path d="m8.2 12.3 2.6 2.6 5-5.4"/>',
  bolt: '<path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12z"/>',
  layers: '<path d="m12 4 8.5 4.5L12 13 3.5 8.5z"/><path d="m3.5 12.5 8.5 4.5 8.5-4.5M3.5 16.5 12 21l8.5-4.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/>',
  term: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="m7 9.5 3 2.5-3 2.5M12.5 15h4"/>',
  chip: '<rect x="7" y="7" width="10" height="10" rx="1.5"/><path d="M10 3.5V7M14 3.5V7M10 17v3.5M14 17v3.5M3.5 10H7M3.5 14H7M17 10h3.5M17 14h3.5"/>',
  globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.6 3.6 5.4 3.6 8.5s-1.1 5.9-3.6 8.5c-2.5-2.6-3.6-5.4-3.6-8.5S9.5 6.1 12 3.5z"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  code: '<path d="m8.5 7-5 5 5 5M15.5 7l5 5-5 5"/>',
  db: '<ellipse cx="12" cy="6" rx="7" ry="2.8"/><path d="M5 6v12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8V6M5 12c0 1.5 3.1 2.8 7 2.8s7-1.3 7-2.8"/>',
  queue: '<rect x="4" y="4.5" width="16" height="4" rx="1"/><rect x="4" y="10" width="16" height="4" rx="1"/><rect x="4" y="15.5" width="10" height="4" rx="1"/>',
  map: '<path d="M9 4.5 3.5 6.5v13l5.5-2 6 2 5.5-2v-13l-5.5 2z"/><path d="M9 4.5v13M15 6.5v13"/>',
  cube: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>',
  github: '<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21"/>',
  mail: '<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="m4.5 7 7.5 6 7.5-6"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M8 10.5V16M8 7.6v.1M11.5 16v-5.5M11.5 13c0-1.6 1-2.6 2.4-2.6s2.1.9 2.1 2.6V16"/>',
  file: '<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4M12 11v6M9.5 14.5 12 17l2.5-2.5"/>',
  arrow: '<path d="M7 17 17 7M9 7h8v8"/>',
};

export const PROFILE = {
  name: 'Jason Kozhaya Slim',
  role: 'AI Engineer Intern @ CMA CGM',
  lede: 'I build AI agents and LLM pipelines, and I learned to code the hard way: C, Unix and memory management at 42 Beirut. Before that I trained as a civil engineer, so I like software that touches real, physical work.',
  focus: [
    ['agent', 'LLM agents, multi-agent pipelines and document AI'],
    ['chip', 'Low-level C / C++: shells, ray tracers, servers'],
    ['lock', 'Security fundamentals from the 42 Cybersecurity Piscine'],
    ['cube', 'Civil & structural engineering background (B.Eng, NDU)'],
  ],
};

export const EXPERIENCE = [
  { when: 'Sep 2026 — Present', title: 'AI Engineer Intern', org: 'CMA CGM · Beirut', text: 'Building LLM-powered automation for shipping operations: document-extraction pipelines that cross-check an LLM against OCR, and AI-generated anomaly reporting on the data platform.' },
  { when: '2025 — 2026', title: 'Founder', org: 'StructurAI', text: 'AI drafting platform for structural engineering (DXF / IFC). Validated with senior structural engineers and selected for ESA Boost2Idea.' },
  { when: '2026', title: 'Boost2Idea Launchpad', org: 'ESA Business School', text: 'Entrepreneurial launchpad program, Beirut.', edu: true },
  { when: '2025 — Present', title: 'Software Development · Level 6', org: '42 Beirut', text: 'Peer-to-peer core curriculum: C, C++, Unix, networking, Docker.', edu: true },
  { when: 'Oct 2025', title: 'Cybersecurity Piscine', org: '42 Beirut', text: 'Scraping, OTP, Tor services, reversing, cryptography.', edu: true },
  { when: 'Oct 2024', title: 'Machine Learning Course', org: 'Google AI', text: '', edu: true },
  { when: 'Nov 2023 — Apr 2024', title: 'Research Team Lead', org: 'NDU College Labs', text: 'Led 6 students testing 80+ samples of low-carbon concrete (fly-ash geopolymer, olive pomace, paper sludge and wood ash).' },
  { when: '2018 — 2024', title: 'B.Eng. Civil Engineering', org: 'Notre Dame University – Louaize', text: '', edu: true },
];

export const SKILLS = [
  ['Languages', ['C', 'C++', 'Python', 'JavaScript', 'TypeScript', 'Bash']],
  ['AI & LLMs', ['LLM APIs', 'Gemini', 'OpenAI', 'Anthropic', 'Multi-agent pipelines', 'llama.cpp', 'Local quantized models', 'NLP extraction', 'OCR']],
  ['Systems', ['Linux / Arch', 'Unix processes & signals', 'Sockets', 'Docker', 'Nginx', 'Make', 'Tor', 'SSH']],
  ['Tools', ['Git', 'GitHub', 'VS Code', 'Cursor', 'Codex', 'Claude Code', 'OpenClaw', 'Antigravity']],
  ['Engineering', ['ETABS', 'AutoCAD', 'Plaxis', 'Epanet', 'Primavera P6']],
];

export const HOME = {
  id: 'home',
  title: 'Jason Slim',
  hint: 'Type <b>help</b> in the terminal, or pick a project below ↓',
  tags: [
    { key: 'whoami', label: 'Who', text: 'AI engineer, 42 Beirut, civil engineer' },
    { key: 'projects', label: 'Projects', text: 'Click any name to open its live demo' },
    { key: 'prompt', label: 'Try it', text: 'This terminal takes commands' },
  ],
  code: {
    lang: 'typescript',
    file: 'jason.ts',
    src: `// who I am, as a type
const jason = {
  role: "AI Engineer Intern @ CMA CGM",
  school: ["42 Beirut", "NDU Civil Eng."],
  builds: ["agents", "LLM pipelines", "C systems"],
  location: "Beirut, Lebanon",
  open_to: ["AI engineering", "founding teams"],
};

console.log(\`hi, I'm \${jason.role}\`);`,
    output: [
      ['dim', '$ ts-node jason.ts'],
      ['', "hi, I'm AI Engineer Intern @ CMA CGM"],
      ['ok', '✓ 9 projects loaded. Pick one below.'],
    ],
  },
};

export const PROJECTS = [
  {
    id: 'structurai',
    title: 'StructurAI',
    short: 'AI · Venture',
    kicker: ['Founder', 'Python · LLMs · DXF / IFC'],
    repo: `${GITHUB}/StructurAI`,
    icon: '<rect x="5" y="5" width="24" height="24" rx="1.5"/><path d="M5 17h24M17 5v24"/><rect class="acc" x="14.5" y="14.5" width="5" height="5"/><rect class="acc" x="3" y="3" width="4" height="4"/><rect class="acc" x="27" y="27" width="4" height="4"/>',
    hint: 'Drafting intent → typed JSON model → validated → DXF / IFC drawing',
    lede: 'A drafting copilot for structural engineers. You describe the structure in plain English. StructurAI compiles it into a strictly typed JSON model, validates it deterministically, then exports professional DXF and IFC drawings.',
    features: [
      ['agent', 'LLM turns drafting intent into a <b>typed structural model</b>'],
      ['check', 'Deterministic validation before anything is drawn'],
      ['layers', 'Plans, sections, rebar details, schedules and material takeoff'],
      ['cube', 'IFC4 BIM geometry alongside 2D DXF output'],
    ],
    stack: [['Core', ['Python', 'LLM API', 'JSON Schema']], ['Output', ['DXF', 'IFC4', 'Schedules']], ['Domain', ['RC design', 'ETABS', 'Revit']]],
    steps: [
      'The engineer describes the job: grid, spans, loads, member sizes.',
      'The LLM compiles it into a strictly typed JSON model (no free-form geometry).',
      'Deterministic validators check grids, spans, covers and schedules.',
      'The exporter draws a full sheet: foundation plan, sections A-A and B-B, footing and column details, BBS.',
      'IFC4 geometry is written for BIM tools.',
    ],
    venture: 'Validated with senior structural engineers and selected for the ESA Boost2Idea launchpad.',
    tags: [
      { key: 'prompt', label: 'Intent', text: 'Plain-English drafting brief' },
      { key: 'json', label: 'Typed model', text: 'Strict JSON, not free text' },
      { key: 'checks', label: 'Validation', text: 'Deterministic rules' },
      { key: 'drawing', label: 'DXF sheet', text: 'Grids, columns, footings, dims' },
    ],
    code: {
      lang: 'python',
      file: 'pipeline.py',
      src: `# simplified: compile → validate → export
def draft(brief: str) -> Package:
    model = llm.compile(brief, schema=StructuralModel)
    report = validate(model)        # deterministic rules
    if not report.ok:
        return llm.repair(model, report.errors)
    sheet = DxfSheet(model)
    sheet.foundation_plan().sections("A-A", "B-B")
    sheet.schedules(bbs=True, takeoff=True)
    return Package(dxf=sheet.save(), ifc=to_ifc4(model))`,
      output: [['dim', '$ python -m structurai draft brief.txt'], ['', 'compiling intent → StructuralModel'], ['ok', '✓ 14/14 validation rules passed'], ['', 'writing sheet: plan, A-A, B-B, details, BBS'], ['hl', '→ outputs/electrical_room.dxf  outputs/electrical_room.ifc']],
    },
  },
  {
    id: 'fieldnote',
    title: 'AI SEO Agent',
    short: 'Multi-agent',
    kicker: ['FieldNote', 'Python · LLM agents · Web scraping'],
    repo: `${GITHUB}/FieldNote`,
    icon: '<circle cx="15" cy="15" r="9"/><path d="m22 22 7 7"/><path class="acc" d="M11 15h8M15 11v8"/>',
    hint: 'Type any URL in the chat and press Analyze',
    lede: 'A chatbot-style app: paste a website URL and a team of agents crawls it, stores the content, and works through on-page SEO, meta tags, schema, internal links and a blog schedule. Fixes can be pushed straight to the CMS.',
    features: [
      ['globe', 'Crawler scrapes and stores the full site context'],
      ['agent', 'An orchestrator routes work to <b>specialist agents</b>'],
      ['code', 'Generates meta tags, JSON-LD schema and internal links'],
      ['layers', 'Publishes through Shopify, Webflow, Wix, WordPress or a Git PR'],
    ],
    stack: [['Core', ['Python', 'LLM agents', 'Orchestrator']], ['Data', ['Web scraping', 'Context store', 'Topical map']], ['Integrations', ['Shopify', 'Webflow', 'Wix', 'WordPress', 'Git PR']]],
    steps: [
      '<code>search_crawl</code> walks the site and saves pages to a context store.',
      'The <code>orchestrator</code> builds a topical map and dispatches agents.',
      'Specialist agents: on-page SEO, meta optimization, schema, internal links, blog automation.',
      'Each change is packaged as a patch for the right CMS adapter or as a Git PR.',
    ],
    tags: [
      { key: 'url', label: 'Input', text: 'Any website URL' },
      { key: 'agents', label: 'Agents', text: 'Orchestrated specialists' },
      { key: 'report', label: 'Findings', text: 'Meta, schema, links' },
      { key: 'publish', label: 'Publish', text: 'CMS adapters or Git PR' },
    ],
    code: {
      lang: 'python',
      file: 'orchestrator.py',
      src: `# simplified orchestrator loop
AGENTS = [OnPageSEO, MetaOptimizer, SchemaAgent,
          InternalLinker, BlogScheduler]

async def run(url: str, cms: CMSAdapter):
    ctx = await crawl(url, depth=3)          # → context store
    topics = build_topical_map(ctx)
    patches = []
    for Agent in AGENTS:
        patches += await Agent(llm).propose(ctx, topics)
    return cms.apply(patches, dry_run=True)`,
      output: [['dim', '$ python orchestrator.py https://example-bakery.com'], ['', 'crawled 38 pages · 412 links'], ['', 'agents: on-page ✓ meta ✓ schema ✓ links ✓ blog ✓'], ['ok', '✓ 27 patches ready (dry run)'], ['hl', '→ shopify_adapter: 27 changes staged']],
    },
  },
  {
    id: 'ai-os',
    title: 'Local AI OS',
    short: 'Offline LLM',
    kicker: ['Arch Linux', 'llama.cpp · Qwen2.5-Coder 3B · Shell'],
    repo: null,
    icon: '<rect x="4" y="6" width="26" height="20" rx="2.5"/><path d="m9 13 4 3-4 3M16 20h6"/><path class="acc" d="M12 30h10M17 26v4"/>',
    hint: 'Watch it boot, then type <b>ai "your question"</b>',
    lede: 'An offline coding workstation on Arch Linux. A quantized Qwen2.5-Coder 3B model runs locally through llama.cpp, wired into the terminal, so I get AI coding help and workflow automation with no internet and no API bill.',
    features: [
      ['chip', 'Built the <b>inference layer</b> on llama.cpp'],
      ['bolt', 'Quantized 3B coder model that runs on modest hardware'],
      ['term', 'Terminal-first: <code>ai</code> command, pipes, shell integration'],
      ['lock', 'Fully offline: code never leaves the machine'],
    ],
    stack: [['Model', ['Qwen2.5-Coder 3B', 'GGUF Q4_K_M', 'llama.cpp']], ['System', ['Arch Linux', 'Bash']], ['Glue', ['Python', 'Shell scripts']]],
    steps: [
      'Arch Linux base with a minimal, scriptable environment.',
      'llama.cpp server loads a 4-bit quantized Qwen2.5-Coder 3B model.',
      'A thin Python/shell client exposes an <code>ai</code> command in the terminal.',
      'Context from files and pipes (<code>cat main.c | ai "explain"</code>) is streamed to the model.',
    ],
    tags: [
      { key: 'boot', label: 'Inference', text: 'llama.cpp server, local' },
      { key: 'model', label: 'Model', text: 'Qwen2.5-Coder 3B, 4-bit' },
      { key: 'answer', label: 'Output', text: 'Streamed tokens, offline' },
    ],
    code: {
      lang: 'bash',
      file: 'ai',
      src: `#!/usr/bin/env bash
# ai — ask the local model, with optional piped context
MODEL=~/models/qwen2.5-coder-3b-instruct-q4_k_m.gguf
pgrep -x llama-server >/dev/null || \\
  llama-server -m "$MODEL" -c 4096 --port 8080 &>/dev/null &

ctx=$( [ -t 0 ] || cat )
jq -n --arg p "$*" --arg c "$ctx" \\
  '{prompt: ($c + "\\n" + $p), n_predict: 512, stream: true}' |
curl -sN localhost:8080/completion -d @- | stream_tokens`,
      output: [['dim', '$ cat list.c | ai "find the bug"'], ['', 'llama-server already running · 3B Q4_K_M'], ['', 'line 14: you free(node) before reading node->next.'], ['', 'store next first, then free.'], ['ok', '✓ answered offline']],
    },
  },
  {
    id: 'smartprompt',
    title: 'SmartPrompt AI',
    short: 'Chrome ext.',
    kicker: ['Prompt optimizer', 'TypeScript · Chrome Extensions · Gemini API'],
    repo: `${GITHUB}/SmartPromptAI`,
    icon: '<rect x="4" y="7" width="26" height="20" rx="2.5"/><path d="M4 12h26"/><path class="acc" d="m17 15 1.3 3 3 1.3-3 1.3L17 24l-1.3-3.4-3-1.3 3-1.3z"/>',
    hint: 'Edit the prompt, then hit <b>Optimize</b> in the extension',
    lede: 'A Chrome extension that sits on top of any AI chat. It takes your rough prompt and uses Gemini to rewrite it with a clear role, task, context, constraints and output format, so you get better answers on the first try.',
    features: [
      ['bolt', 'Works right where you write prompts, in the browser'],
      ['agent', 'Gemini rewrites the prompt for <b>clarity and structure</b>'],
      ['eye', 'Better model responses on the first try'],
      ['globe', 'Extension plus a companion website'],
    ],
    stack: [['Extension', ['TypeScript', 'Manifest V3', 'Content scripts']], ['AI', ['Gemini API']], ['Web', ['Landing site']]],
    steps: [
      'A content script finds the chat input on the current page.',
      'The popup sends the draft prompt to Gemini with an optimizer system prompt.',
      'The result comes back as Role / Task / Context / Constraints / Format.',
      'One click replaces the original text in the page.',
    ],
    tags: [
      { key: 'draft', label: 'Draft', text: 'The rough prompt you typed' },
      { key: 'popup', label: 'Extension', text: 'Popup + Gemini call' },
      { key: 'result', label: 'Result', text: 'Structured, clearer prompt' },
    ],
    code: {
      lang: 'typescript',
      file: 'optimize.ts',
      src: `// popup → Gemini → page
async function optimize(draft: string): Promise<string> {
  const res = await gemini.generateContent({
    systemInstruction: OPTIMIZER_PROMPT,
    contents: [{ role: "user", parts: [{ text: draft }] }],
  });
  return res.response.text();
}

chrome.tabs.sendMessage(tabId, {
  type: "REPLACE_INPUT", text: await optimize(draft),
});`,
      output: [['dim', '> optimize("write me a cover letter for a internship")'], ['', 'Role · Task · Context · Constraints · Format'], ['ok', '✓ optimized prompt returned']],
    },
  },
  {
    id: 'fin-extractor',
    title: 'Financial Doc Extractor',
    short: 'Document AI',
    kicker: ['Extraction', 'Python · LLM API · NLP'],
    repo: null,
    icon: '<path d="M8 4h13l6 6v20H8z"/><path d="M21 4v6h6"/><path class="acc" d="M12 16h11M12 20h11M12 24h7"/>',
    hint: 'Switch between a <b>simple</b> and a <b>complex</b> document',
    lede: 'Pulls structured financial data (parties, dates, totals, line items) out of documents. The pipeline adapts to each document: simple ones go through fast rule-based parsing, messy ones go to LLM-assisted extraction.',
    features: [
      ['eye', 'Scores document complexity first'],
      ['bolt', 'Simple docs: rule-based NLP, fast and free'],
      ['agent', 'Complex docs: LLM extraction against a schema'],
      ['doc', 'Structured JSON output'],
    ],
    stack: [['Core', ['Python', 'Regex / NLP', 'LLM API']], ['Output', ['JSON schema', 'Validation']]],
    steps: [
      'Text and layout are read from the document.',
      'A complexity score routes it to the rule-based or the LLM path.',
      'Fields are extracted against one shared schema.',
      'Results are returned as structured JSON.',
    ],
    tags: [
      { key: 'doc', label: 'Document', text: 'Statement / invoice' },
      { key: 'router', label: 'Router', text: 'Complexity decides the path' },
      { key: 'json', label: 'Output', text: 'Structured JSON' },
    ],
    code: {
      lang: 'python',
      file: 'extract.py',
      src: `def extract(doc: Document) -> Financials:
    score = complexity(doc)   # tables, layout, OCR noise
    if score < 0.4:
        data = rules.parse(doc.text)        # regex + NLP
    else:
        data = llm.extract(doc, schema=Financials)
    return Financials.model_validate(data)`,
      output: [['dim', '$ python extract.py statement.pdf'], ['', 'complexity 0.18 → rule-based'], ['ok', '✓ 7 fields extracted'], ['dim', '$ python extract.py annual_report_scan.pdf'], ['', 'complexity 0.83 → LLM-assisted'], ['ok', '✓ 12 fields extracted']],
    },
  },
  {
    id: 'tweetcraft',
    title: 'tweetcraft.ai',
    short: 'Automation',
    kicker: ['Full-stack', 'TypeScript · Express · Bull · X API'],
    repo: `${GITHUB}/tweetcraft.ai`,
    icon: '<path d="M6 27c9 2 18-3 19-14l3-4-4 1c-2-3-7-2-7 2v1C11 13 8 10 6 7c-1 4 0 7 3 9l-3-1c0 3 2 5 5 6-2 1-3 1-5 1"/>',
    hint: 'A background job queue pulls tweets page by page and stores them',
    lede: 'A full-stack tool that downloads tweets from X on its own. You log in, queue a job for an account, and a background worker pages through the X API and stores the results.',
    features: [
      ['lock', 'Auth with JWT and hashed passwords'],
      ['queue', 'Background jobs with a <b>Bull</b> queue (Redis)'],
      ['globe', 'Pages through account timelines with the X API v2'],
      ['db', 'Stores tweets for later use'],
    ],
    stack: [['Backend', ['TypeScript', 'Express', 'Bull', 'twitter-api-v2']], ['Auth', ['JWT', 'bcrypt', 'sessions']], ['Frontend', ['TypeScript']]],
    steps: [
      'The user signs in (JWT plus a bcrypt-hashed password).',
      'A download job is pushed onto a Bull queue.',
      'A worker pages through the account timeline with the X API.',
      'Tweets are stored and shown in the dashboard.',
    ],
    tags: [
      { key: 'form', label: 'Job', text: 'Account + options' },
      { key: 'queue', label: 'Queue', text: 'Bull background worker' },
      { key: 'list', label: 'Results', text: 'Stored tweets' },
    ],
    code: {
      lang: 'typescript',
      file: 'worker.ts',
      src: `queue.process("download", async (job) => {
  const { handle, max } = job.data;
  const user = await x.v2.userByUsername(handle);
  const pages = x.v2.userTimeline(user.data.id, {
    max_results: 100, exclude: ["replies"],
  });
  let n = 0;
  for await (const tweet of pages) {
    await db.tweets.upsert(tweet);
    job.progress(Math.round((++n / max) * 100));
    if (n >= max) break;
  }
});`,
      output: [['dim', '[queue] job #128 download @demo_account'], ['', 'page 1 · 100 tweets'], ['', 'page 2 · 100 tweets'], ['ok', '✓ 200 tweets stored']],
    },
  },
  {
    id: 'minishell',
    title: 'Minishell',
    short: 'C · Unix',
    kicker: ['42 Beirut', 'C · Unix · Make'],
    repo: null,
    icon: '<rect x="4" y="6" width="26" height="22" rx="2.5"/><path d="m9 13 4 3.5-4 3.5"/><path class="acc" d="M16 21h8"/>',
    hint: 'It\'s live: try <b>ls | grep .c</b> or <b>echo $USER > f && cat f</b>',
    lede: 'A Unix-like shell in C, modeled on bash. It handles parsing, quotes, environment expansion, pipes, redirections, heredocs, built-ins and signals, with careful memory and file-descriptor management.',
    features: [
      ['code', 'Tokenizer and parser with quotes and <code>$VAR</code> / <code>$?</code> expansion'],
      ['layers', 'Pipes, <code>&lt;</code> <code>&gt;</code> <code>&gt;&gt;</code> and heredoc <code>&lt;&lt;</code>'],
      ['term', 'Built-ins: echo, cd, pwd, export, unset, env, exit'],
      ['bolt', 'Signals (Ctrl-C, Ctrl-\\) handled like bash'],
    ],
    stack: [['Core', ['C', 'POSIX', 'readline']], ['Concepts', ['fork / execve', 'pipe / dup2', 'signals', 'fd management']]],
    steps: [
      'readline gets the line, then the lexer splits tokens, respecting quotes.',
      'The expander resolves <code>$VAR</code> and <code>$?</code>.',
      'The parser builds a pipeline of commands with redirections.',
      'The executor forks, wires the pipes with <code>dup2</code> and runs built-ins or <code>execve</code>.',
    ],
    tags: [
      { key: 'term', label: 'Live shell', text: 'This demo takes your commands' },
      { key: 'pipe', label: 'Pipes', text: 'cmd | cmd | cmd' },
    ],
    code: {
      lang: 'c',
      file: 'exec.c',
      src: `/* run a pipeline: cmd1 | cmd2 | ... */
int exec_pipeline(t_cmd *cmd, t_env *env)
{
    int fd[2], in = STDIN_FILENO;
    pid_t pid;

    while (cmd) {
        if (cmd->next && pipe(fd) < 0) return (perror("pipe"), 1);
        if ((pid = fork()) == 0) {
            dup2(in, STDIN_FILENO);
            if (cmd->next) dup2(fd[1], STDOUT_FILENO);
            apply_redirs(cmd->redirs);
            exit(run_cmd(cmd, env));
        }
        if (in != STDIN_FILENO) close(in);
        if (cmd->next) { close(fd[1]); in = fd[0]; }
        cmd = cmd->next;
    }
    return (wait_all(pid));
}`,
      output: [['dim', 'minishell$ ls | grep .c | wc -l'], ['', '6'], ['dim', 'minishell$ echo $?'], ['', '0'], ['ok', '✓ no leaks (valgrind)']],
    },
  },
  {
    id: 'minirt',
    title: 'miniRT',
    short: 'C · Graphics',
    kicker: ['42 Beirut', 'C · miniLibX · Vector math'],
    repo: `${GITHUB}/miniRT`,
    icon: '<circle cx="20" cy="18" r="7"/><path d="M4 28h26"/><path class="acc" d="M5 6l9 7M5 6l3 0M5 6l0 3"/><path d="M13 28c2-2 7-2 9 0" />',
    hint: 'Real ray tracing in your browser: edit the <b>.rt</b> scene, then press Render',
    lede: 'A ray tracer in C with miniLibX. It reads a <code>.rt</code> scene (camera, lights, spheres, planes, cylinders) and renders it with diffuse lighting and hard shadows. This demo is a JavaScript port of the same algorithm, running live.',
    features: [
      ['cube', 'Sphere, plane and finite cylinder with caps'],
      ['sun', 'Ambient and diffuse lighting, hard shadows'],
      ['eye', 'Camera with position, orientation and FOV'],
      ['doc', 'Strict <code>.rt</code> scene parser with error handling'],
    ],
    stack: [['Core', ['C', 'miniLibX', 'Make']], ['Math', ['Vectors', 'Ray-object intersection', 'Lambert shading']]],
    steps: [
      'Parse the <code>.rt</code> file: A (ambient), C (camera), L (light), sp / pl / cy objects.',
      'For each pixel, build a ray from the camera through the viewport.',
      'Find the nearest hit across all objects.',
      'Cast a shadow ray to the light, then shade with ambient + diffuse.',
    ],
    tags: [
      { key: 'scene', label: 'Scene file', text: 'Editable .rt format' },
      { key: 'render', label: 'Render', text: 'Per-pixel ray tracing' },
    ],
    code: {
      lang: 'c',
      file: 'lighting.c',
      src: `t_color shade(t_scene *s, t_hit *h)
{
    t_color c = col_scale(h->color, s->ambient.ratio);
    t_vec   to_l = vec_sub(s->light.pos, h->point);
    double  dist = vec_len(to_l);
    t_ray   shadow = {vec_add(h->point,
                      vec_scale(h->normal, EPS)), vec_norm(to_l)};

    if (hit_any(s, &shadow, dist))      /* in shadow */
        return (c);
    double diff = fmax(0, vec_dot(h->normal, shadow.dir));
    return (col_add(c, col_scale(h->color,
            diff * s->light.ratio)));
}`,
      output: [['dim', '$ ./miniRT scenes/showcase.rt'], ['', 'parsed: 1 camera · 1 light · 6 objects'], ['ok', '✓ rendered 800×600']],
    },
  },
  {
    id: 'security',
    title: 'Cybersecurity Piscine',
    short: 'Security',
    kicker: ['42 Beirut · Oct 2025', 'Python · Tor · Docker · Crypto'],
    repo: `${GITHUB}/Python-Projects`,
    icon: '<path d="M17 4 6 8v8c0 7 5 11.5 11 14 6-2.5 11-7 11-14V8z"/><rect class="acc" x="12.5" y="15" width="9" height="7" rx="1"/><path class="acc" d="M14.5 15v-2a2.5 2.5 0 0 1 5 0v2"/>',
    hint: 'The OTP code is real (RFC 6238). Switch tabs for the other projects',
    lede: 'Five projects from the 42 Beirut Cybersecurity Piscine: a TOTP generator, a recursive image scraper with an EXIF reader, a Tor hidden service, a reverse-engineering challenge, and a controlled ransomware simulation for education.',
    features: [
      ['lock', '<b>ft_otp</b>: TOTP / HOTP from a hex key (RFC 6238)'],
      ['globe', '<b>arachnida</b>: spider (recursive scraper) + scorpion (EXIF)'],
      ['eye', '<b>ft_onion</b>: Nginx site as a Tor hidden service, SSH on 4242'],
      ['code', '<b>reverse me</b> + <b>stockholm</b>: binary reversing, lab-only encryption'],
    ],
    stack: [['Languages', ['Python', 'C']], ['Security', ['HMAC-SHA1', 'TOTP / HOTP', 'Tor', 'EXIF', 'Encryption (lab)']], ['Infra', ['Docker', 'Nginx', 'SSH']]],
    steps: [
      '<b>ft_otp</b>: HMAC-SHA1(key, time / 30), dynamic truncation, 6 digits.',
      '<b>spider</b>: recursive crawl to depth <code>-l N</code>, downloads images. <b>scorpion</b> reads EXIF.',
      '<b>ft_onion</b>: Tor + Nginx in Docker, a hidden-service address, hardened SSH.',
      '<b>stockholm</b>: reversible file encryption in an isolated lab folder only.',
    ],
    tags: [
      { key: 'tabs', label: '5 projects', text: 'Switch between them' },
      { key: 'otp', label: 'Live TOTP', text: 'Real RFC 6238 code' },
    ],
    code: {
      lang: 'python',
      file: 'ft_otp.py',
      src: `import hmac, hashlib, struct, time

def totp(key: bytes, step: int = 30, digits: int = 6) -> str:
    counter = struct.pack(">Q", int(time.time()) // step)
    mac = hmac.new(key, counter, hashlib.sha1).digest()
    off = mac[-1] & 0x0F                    # dynamic truncation
    code = struct.unpack(">I", mac[off:off + 4])[0] & 0x7FFFFFFF
    return str(code % 10 ** digits).zfill(digits)

# ./ft_otp -g key.hex   → saves encrypted ft_otp.key
# ./ft_otp -k ft_otp.key → prints the current code`,
      output: [['dim', '$ ./ft_otp -g key.hex'], ['ok', 'Key was successfully saved in ft_otp.key.'], ['dim', '$ ./ft_otp -k ft_otp.key'], ['hl', '{{otp}}']],
    },
  },
];
