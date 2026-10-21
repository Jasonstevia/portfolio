// Live mockups shown on the stage, one per project id.
// Each demo builds its DOM inside `root`, runs an async script through
// `run` (cancellable sleeps/intervals) and may stay interactive afterwards.
// Elements marked data-tag="key" are what the callout tags point at.

import { PROJECTS, GITHUB, LINKEDIN, EMAIL, CV } from './data.js';

export const STOP = Symbol('stop');

export function createRunner() {
  let alive = true;
  const timers = new Set();
  const intervals = new Set();
  return {
    get alive() { return alive; },
    sleep(ms) {
      return new Promise((res, rej) => {
        if (!alive) return rej(STOP);
        const t = setTimeout(() => { timers.delete(t); alive ? res() : rej(STOP); }, ms);
        timers.add(t);
      });
    },
    every(ms, fn) { const i = setInterval(() => alive && fn(), ms); intervals.add(i); return i; },
    frame() {
      return new Promise((res, rej) => requestAnimationFrame(() => (alive ? res() : rej(STOP))));
    },
    stop() { alive = false; timers.forEach(clearTimeout); intervals.forEach(clearInterval); },
  };
}

/* ---------- helpers ---------- */

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const h = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };

function win(root, { title = '', url = '', dark = false } = {}) {
  const el = h(`<div class="win${dark ? ' is-dark' : ''}">
    <div class="win-bar"><span class="win-dots"><i></i><i></i><i></i></span>
      ${url ? `<span class="win-url"><svg viewBox="0 0 24 24"><rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8.5 10.5V7.5a3.5 3.5 0 0 1 7 0v3"/></svg>${esc(url)}</span>`
            : `<span class="win-title">${esc(title)}</span>`}
    </div>
    <div class="win-body"></div></div>`);
  root.append(el);
  return el.querySelector('.win-body');
}

async function typeInto(run, el, text, speed = 26, prop = 'textContent') {
  for (const ch of text) {
    el[prop] += ch;
    await run.sleep(ch === ' ' ? speed * 0.6 : speed + Math.random() * speed * 0.6);
  }
}

// Minimal terminal: printing, typed commands and an optional input line
class Term {
  constructor(body, run, prompt) {
    this.run = run;
    this.prompt = prompt;
    this.el = h('<div class="term"></div>');
    body.append(this.el);
    this.history = [];
    this.hIndex = 0;
    this.el.addEventListener('click', () => this.input?.focus({ preventScroll: true }));
  }
  print(html = '', cls = '') {
    const line = document.createElement('div');
    if (cls) line.className = cls;
    line.innerHTML = html || '&nbsp;';
    (this.inputLine ? this.el.insertBefore(line, this.inputLine) : this.el.append(line));
    this.scroll();
    return line;
  }
  scroll() { this.el.scrollTop = this.el.scrollHeight; }
  async cmd(text, { speed = 34, prompt = this.prompt } = {}) {
    const line = this.print(`${prompt}<span class="typed"></span><span class="caret"></span>`);
    await this.run.sleep(260);
    await typeInto(this.run, line.querySelector('.typed'), text, speed);
    await this.run.sleep(220);
    line.querySelector('.caret').remove();
    return line;
  }
  async lines(list, gap = 70) {
    for (const [cls, html] of list) { this.print(html, cls); await this.run.sleep(gap); }
  }
  // Interactive prompt; onLine(text) may return a promise
  interactive(onLine, { prompt = () => this.prompt } = {}) {
    this.promptFn = prompt;
    this.inputLine = h(`<div class="input-line"><span class="pr"></span><input spellcheck="false" autocomplete="off" aria-label="Terminal input" /></div>`);
    this.inputLine.querySelector('.pr').innerHTML = prompt();
    this.el.append(this.inputLine);
    this.input = this.inputLine.querySelector('input');
    this.input.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const v = this.input.value;
        this.input.value = '';
        this.print(`${this.inputLine.querySelector('.pr').innerHTML}${esc(v)}`);
        if (v.trim()) { this.history.push(v); }
        this.hIndex = this.history.length;
        this.input.disabled = true;
        try { await onLine(v); } catch (err) { if (err !== STOP) throw err; }
        this.input.disabled = false;
        this.inputLine.querySelector('.pr').innerHTML = this.promptFn();
        this.input.focus({ preventScroll: true });
        this.scroll();
      } else if (e.key === 'ArrowUp' && this.history.length) {
        this.hIndex = Math.max(0, this.hIndex - 1);
        this.input.value = this.history[this.hIndex];
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        this.hIndex = Math.min(this.history.length, this.hIndex + 1);
        this.input.value = this.history[this.hIndex] ?? '';
      } else if (e.key === 'c' && e.ctrlKey) {
        this.print(`${this.inputLine.querySelector('.pr').innerHTML}${esc(this.input.value)}^C`);
        this.input.value = '';
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault();
        this.clear();
      }
      e.stopPropagation();
    });
    this.scroll();
  }
  clear() { [...this.el.children].forEach((c) => c !== this.inputLine && c.remove()); }
}

/* ---------- TOTP (RFC 6238), shared with the code card ---------- */

export const DEMO_KEY = '3132333435363738393031323334353637383930313233343536373839303132';

export async function totp(hex = DEMO_KEY, t = Date.now()) {
  if (!crypto?.subtle) return '------';
  const key = new Uint8Array(hex.match(/../g).map((b) => parseInt(b, 16)));
  const counter = new ArrayBuffer(8);
  new DataView(counter).setUint32(4, Math.floor(t / 1000 / 30));
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', k, counter));
  const off = mac[19] & 0x0f;
  const code = ((mac[off] & 0x7f) << 24) | (mac[off + 1] << 16) | (mac[off + 2] << 8) | mac[off + 3];
  return String(code % 1e6).padStart(6, '0');
}

/* =========================================================
   HOME: interactive "whoami" terminal
   ========================================================= */

function home(root, run, ctx) {
  const body = win(root, { title: 'jason@beirut: ~', dark: true });
  const P = '<span class="p">jason<b>@beirut</b></span>:<span class="bl">~</span>$ ';
  const t = new Term(body, run, P);
  t.el.dataset.tag = 'prompt';

  const projectGrid = () => {
    const line = t.print(PROJECTS.map((p) => `<a class="cmd-link" data-open="${p.id}">${p.id}/</a>`).join('   '));
    line.dataset.tag = 'projects';
    line.addEventListener('click', (e) => { const id = e.target.dataset.open; if (id) ctx.open(id); });
  };
  const help = () => t.lines([
    ['', '<span class="hl">commands</span>'],
    ['', '  <span class="cy">ls</span>              list projects'],
    ['', '  <span class="cy">open</span> &lt;project&gt;  open a live demo   <span class="dim">(e.g. open minirt)</span>'],
    ['', '  <span class="cy">experience</span>      where I\'ve worked and studied'],
    ['', '  <span class="cy">skills</span>          languages, AI, systems'],
    ['', '  <span class="cy">contact</span>         email, LinkedIn, GitHub'],
    ['', '  <span class="cy">cv</span>              download my CV'],
    ['', '  <span class="cy">clear</span>           clear the screen'],
  ], 30);

  (async () => {
    await run.sleep(500);
    await t.cmd('whoami');
    const who = t.print('<span class="hl">Jason Kozhaya Slim</span>');
    who.dataset.tag = 'whoami';
    await t.lines([['', 'AI Engineer Intern @ CMA CGM · 42 Beirut · B.Eng Civil Engineering (NDU)']]);
    await run.sleep(300);
    await t.cmd('cat focus.txt');
    await t.lines([
      ['', '<span class="cy">▸</span> AI agents, LLM pipelines and document AI'],
      ['', '<span class="cy">▸</span> low-level C / C++: shells, ray tracers, servers'],
      ['', '<span class="cy">▸</span> security fundamentals (42 Cybersecurity Piscine)'],
      ['', '<span class="cy">▸</span> civil & structural engineering, so software for real-world work'],
    ], 120);
    await run.sleep(300);
    await t.cmd('ls projects/');
    projectGrid();
    await run.sleep(200);
    t.print('');
    t.print('Type <span class="cy">help</span> for commands, or click a project.', 'dim');
    t.interactive(async (raw) => {
      const [cmd, ...args] = raw.trim().split(/\s+/);
      const arg = args.join(' ').toLowerCase();
      switch ((cmd || '').toLowerCase()) {
        case '': return;
        case 'help': return help();
        case 'ls': return projectGrid();
        case 'open': case 'cd': {
          const p = PROJECTS.find((x) => x.id === arg.replace(/\/$/, '') || x.title.toLowerCase().includes(arg));
          if (!arg || !p) return void t.print(`open: no such project: ${esc(arg)}. Try <span class="cy">ls</span>`, 'err');
          t.print(`opening ${p.title}…`, 'ok');
          await run.sleep(350);
          return ctx.open(p.id);
        }
        case 'whoami': return void t.print('Jason Kozhaya Slim, AI engineer, systems programmer, civil engineer');
        case 'experience': return ctx.flyout('experience');
        case 'skills': return ctx.flyout('skills');
        case 'contact': return t.lines([
          ['', `email    <a class="cmd-link" href="mailto:${EMAIL}">${EMAIL}</a>`],
          ['', `linkedin <a class="cmd-link" href="${LINKEDIN}" target="_blank" rel="noopener">linkedin.com/in/jason-slim</a>`],
          ['', `github   <a class="cmd-link" href="${GITHUB}" target="_blank" rel="noopener">github.com/Jasonstevia</a>`],
        ], 40);
        case 'cv': window.open(CV, '_blank'); return void t.print('opening Jason_Slim_CV.pdf', 'ok');
        case 'clear': return t.clear();
        case 'sudo': return void t.print('nice try. this incident will be reported.', 'err');
        case 'exit': return void t.print('there is no escape, only more projects. try <span class="cy">ls</span>', 'dim');
        default: return void t.print(`command not found: ${esc(cmd)}. Try <span class="cy">help</span>`, 'err');
      }
    });
  })().catch(ignore);
}

/* =========================================================
   StructurAI: brief → typed model → checks → drawing
   ========================================================= */

function structurai(root, run) {
  const body = win(root, { title: 'StructurAI: Drafting Copilot' });
  body.innerHTML = `
    <div class="sa-side">
      <div class="sa-chat" data-tag="prompt"></div>
      <div class="sa-json" data-tag="json"></div>
      <div class="sa-checks" data-tag="checks">
        ${['Schema valid', 'Grid closed', 'Spans ≤ 8 m', 'Covers OK', 'Footing ≥ column', 'Schedules built'].map((c) => `<div>${c}</div>`).join('')}
      </div>
    </div>
    <div class="sa-main">
      <div class="sa-toolbar">
        <span class="pill blue">electrical_room</span><span class="pill" id="sa-state">idle</span><span class="sp"></span>
        <button class="btn" data-x>DXF</button><button class="btn" data-x>IFC</button><button class="btn" data-x>BBS</button>
      </div>
      <div class="sa-canvas" data-tag="drawing"><svg viewBox="0 0 560 500" preserveAspectRatio="xMidYMid meet">
        <defs><pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0v8" stroke="#d7c9b4" stroke-width="1.2"/></pattern></defs>
        <g id="sa-draw"></g></svg></div>
    </div>`;
  const chat = body.querySelector('.sa-chat');
  const json = body.querySelector('.sa-json');
  const checks = [...body.querySelectorAll('.sa-checks div')];
  const state = body.querySelector('#sa-state');
  const g = body.querySelector('#sa-draw');
  const NS = 'http://www.w3.org/2000/svg';

  const add = (tag, attrs, cls = 'draw-in', text) => {
    const el = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    el.setAttribute('class', `${attrs.class || ''} ${cls}`.trim());
    if (text) el.textContent = text;
    g.append(el);
    if (cls === 'draw-in' && el.getTotalLength) {
      try { el.style.setProperty('--len', Math.ceil(el.getTotalLength())); } catch { /* text etc. */ }
    }
    return el;
  };

  const JSON_TXT = `{
  "project": "Electrical Room",
  "units": "mm",
  "grid": {
    "x": ["A", "B"], "y": ["1", "2"],
    "spacing": [8000, 6000]
  },
  "columns": [{ "ids": "C1-C4",
    "section": "300x300" }],
  "footings": [{ "type": "F1",
    "size": "1400x1400x500" }],
  "beams": [{ "id": "B1",
    "section": "250x500" }],
  "slab": { "t": 150, "cover": 25 }
}`;

  (async () => {
    await run.sleep(400);
    const u = h('<div class="msg user"></div>');
    chat.append(u);
    await typeInto(run, u, 'Single-storey electrical room, 8 × 6 m. RC columns 300×300 on isolated footings, 150 mm roof slab.', 14);
    await run.sleep(400);
    const b = h('<div class="msg bot fade-in"><span class="spin"></span>&nbsp; Compiling to a typed model…</div>');
    chat.append(b);
    state.textContent = 'compiling'; state.className = 'pill run';
    for (let i = 0; i < JSON_TXT.length; i += 6) { json.textContent = JSON_TXT.slice(0, i + 6); await run.sleep(16); }
    state.textContent = 'validating';
    for (const c of checks) { await run.sleep(230); c.classList.add('ok'); }
    b.innerHTML = 'Model valid ✓ Drawing the foundation plan.';
    state.textContent = 'drafting';

    // drawing: grid 8 m × 6 m at 40 px/m, origin (120,110)
    const X = [120, 440], Y = [110, 350];
    add('rect', { x: X[0], y: Y[0], width: 320, height: 240, class: 'dw hatch' }, 'pop-in');
    for (const x of X) add('line', { x1: x, y1: 60, x2: x, y2: 400, class: 'dw grid' });
    for (const y of Y) add('line', { x1: 70, y1: y, x2: 490, y2: y, class: 'dw grid' });
    await run.sleep(500);
    ['A', 'B'].forEach((l, i) => { add('circle', { cx: X[i], cy: 46, r: 13, class: 'dw' }); add('text', { x: X[i], y: 50, 'text-anchor': 'middle', class: 'dwt' }, 'pop-in', l); });
    ['1', '2'].forEach((l, i) => { add('circle', { cx: 56, cy: Y[i], r: 13, class: 'dw' }); add('text', { x: 56, y: Y[i] + 4, 'text-anchor': 'middle', class: 'dwt' }, 'pop-in', l); });
    await run.sleep(400);
    for (const x of X) for (const y of Y) add('rect', { x: x - 28, y: y - 28, width: 56, height: 56, class: 'dw ftg' });
    await run.sleep(500);
    add('line', { x1: X[0] + 6, y1: Y[0], x2: X[1] - 6, y2: Y[0], class: 'dw beam' });
    add('line', { x1: X[0] + 6, y1: Y[1], x2: X[1] - 6, y2: Y[1], class: 'dw beam' });
    add('line', { x1: X[0], y1: Y[0] + 6, x2: X[0], y2: Y[1] - 6, class: 'dw beam' });
    add('line', { x1: X[1], y1: Y[0] + 6, x2: X[1], y2: Y[1] - 6, class: 'dw beam' });
    await run.sleep(400);
    let n = 1;
    for (const y of Y) for (const x of X) {
      add('rect', { x: x - 6, y: y - 6, width: 12, height: 12, class: 'dw col' }, 'pop-in');
      add('text', { x: x + 10, y: y - 10, class: 'dwt small' }, 'pop-in', `C${n++}`);
      await run.sleep(120);
    }
    // dimensions
    add('path', { d: `M${X[0]} 425v-10M${X[1]} 425v-10M${X[0]} 420H${X[1]}`, class: 'dw dim' });
    add('text', { x: 280, y: 414, 'text-anchor': 'middle', class: 'dwt small' }, 'pop-in', '8000');
    add('path', { d: `M505 ${Y[0]}h-10M505 ${Y[1]}h-10M500 ${Y[0]}V${Y[1]}`, class: 'dw dim' });
    add('text', { x: 512, y: 234, class: 'dwt small', transform: 'rotate(90 512 234)' }, 'pop-in', '6000');
    // section markers
    add('path', { d: 'M280 92v-14l-6 6M280 368v14l6-6', class: 'dw' });
    add('text', { x: 290, y: 86, class: 'dwt' }, 'pop-in', 'A');
    add('text', { x: 159, y: 236, class: 'dwt small' }, 'pop-in', 'F1 1400×1400');
    add('text', { x: 238, y: 236, class: 'dwt small' }, 'pop-in', 'SLAB t=150');
    await run.sleep(300);
    // title block
    add('rect', { x: 330, y: 440, width: 210, height: 48, class: 'dw' });
    add('path', { d: 'M330 458h210M440 458v30', class: 'dw' });
    add('text', { x: 338, y: 453, class: 'dwt' }, 'pop-in', 'STRUCTURAI · FOUNDATION PLAN');
    add('text', { x: 338, y: 477, class: 'dwt small' }, 'pop-in', 'Electrical Room');
    add('text', { x: 448, y: 477, class: 'dwt small' }, 'pop-in', 'SCALE 1:100 · S-101');
    await run.sleep(700);
    state.textContent = 'exporting';
    for (const btn of body.querySelectorAll('[data-x]')) { btn.classList.add('flash'); await run.sleep(260); }
    state.textContent = 'DXF + IFC exported ✓'; state.className = 'pill ok';
  })().catch(ignore);
}

/* =========================================================
   FieldNote: AI SEO agent chat
   ========================================================= */

function fieldnote(root, run) {
  const body = win(root, { url: 'fieldnote.app/agent' });
  body.innerHTML = `
    <div class="fn-wrap">
      <div class="fn-head"><span class="fn-logo">F</span><b>FieldNote</b><span class="pill">SEO agent team</span></div>
      <div class="fn-agents" data-tag="agents">
        ${['Crawler', 'On-page', 'Meta', 'Schema', 'Links', 'Blog'].map((a) => `<span class="agent"><i></i>${a}</span>`).join('')}
      </div>
      <div class="fn-feed"></div>
      <div class="fn-input"><input data-tag="url" value="" placeholder="https://your-site.com" spellcheck="false" aria-label="Website URL" /><button class="btn primary">Analyze</button></div>
    </div>`;
  const feed = body.querySelector('.fn-feed');
  const input = body.querySelector('input');
  const agents = [...body.querySelectorAll('.agent')];
  let token = 0;

  const say = (html, cls = 'msg bot') => { const m = h(`<div class="${cls} fade-in">${html}</div>`); feed.append(m); feed.scrollTop = feed.scrollHeight; return m; };

  async function analyze(url, my) {
    const ok = () => my === token && run.alive;
    let host;
    try { host = new URL(/^https?:/.test(url) ? url : `https://${url}`).hostname; } catch { host = 'example.com'; }
    const brand = host.replace(/^www\./, '').split('.')[0].replace(/[-_]/g, ' ');
    const Brand = brand.replace(/\b\w/g, (c) => c.toUpperCase());
    feed.innerHTML = '';
    agents.forEach((a) => (a.className = 'agent'));
    say(`https://${esc(host)}`, 'msg user');
    await run.sleep(400); if (!ok()) return;
    const crawl = say('<span class="spin"></span>&nbsp; Crawling and storing site context…');
    agents[0].classList.add('run');
    await run.sleep(1100); if (!ok()) return;
    agents[0].className = 'agent done';
    crawl.innerHTML = 'Crawled <b>38 pages</b>, 412 internal links, 9 templates. Dispatching agents…';
    for (let i = 1; i < agents.length; i++) {
      agents[i].classList.add('run');
      await run.sleep(420); if (!ok()) return;
      agents[i].className = 'agent done';
    }
    const grid = h('<div class="fn-grid fade-in" data-tag="report"></div>');
    grid.innerHTML = `
      <div class="fn-card"><h4>On-page score</h4><div class="score">
        <svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15" fill="none" stroke="#e3d8ca" stroke-width="4"/><circle cx="18" cy="18" r="15" fill="none" stroke="#e07b39" stroke-width="4" stroke-dasharray="55 100" stroke-linecap="round" transform="rotate(-90 18 18)"/><text x="18" y="22" text-anchor="middle" font-size="10" font-family="JetBrains Mono" fill="#18213d">58</text></svg>
        <div><b>14 issues</b><br><small>5 missing meta descriptions · 3 duplicate H1 · 6 thin pages</small></div></div></div>
      <div class="fn-card diff"><h4>Meta title <span class="pill ok">rewritten</span></h4>
        <del>Home | ${esc(Brand)}</del><ins>${esc(Brand)}: Fresh, Local &amp; Delivered Daily</ins></div>
      <div class="fn-card"><h4>Schema <span class="pill blue">JSON-LD</span></h4><div class="mini-code">{ "@type": "LocalBusiness",
  "name": "${esc(Brand)}",
  "url": "https://${esc(host)}" }</div></div>
      <div class="fn-card"><h4>Internal links <span class="pill">+11</span></h4>
        /blog/guide → /products/best-seller<br>/about → /contact<br>/faq → /shipping</div>`;
    feed.append(grid); feed.scrollTop = feed.scrollHeight;
    await run.sleep(900); if (!ok()) return;
    say('Blog plan: 8 posts over 4 weeks from the topical map. First draft is ready in <code>drafts/</code>.');
    await run.sleep(700); if (!ok()) return;
    const pub = say(`27 patches ready. Publish with: <span class="pill">Shopify</span> <span class="pill">Webflow</span> <span class="pill">Wix</span> <span class="pill">WordPress</span> <span class="pill blue">Git PR</span>`);
    pub.dataset.tag = 'publish';
  }

  const go = () => { token++; analyze(input.value || 'example-bakery.com', token).catch(ignore); };
  body.querySelector('.btn').addEventListener('click', go);
  input.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') go(); });

  (async () => {
    say('Hi! Paste a website and my agents will audit and fix its SEO.');
    await run.sleep(600);
    await typeInto(run, input, 'https://example-bakery.com', 30, 'value');
    await run.sleep(300);
    go();
  })().catch(ignore);
}

/* =========================================================
   Local AI OS: llama.cpp boot + streaming answer
   ========================================================= */

const AI_ANSWERS = [
  { match: /linked|list|reverse/i, text: `t_node *reverse(t_node *head)
{
    t_node *prev = NULL;
    t_node *next;

    while (head)
    {
        next = head->next;
        head->next = prev;
        prev = head;
        head = next;
    }
    return (prev);
}` },
  { match: /bash|shell|find|file/i, text: `# largest 10 files under the current dir
find . -type f -printf '%s %p\\n' | sort -nr | head -10` },
  { match: /python|json|api/i, text: `import json, urllib.request

def fetch(url: str) -> dict:
    with urllib.request.urlopen(url) as r:
        return json.load(r)` },
];

function aiOs(root, run) {
  const body = win(root, { title: 'jason@arch: ~ (offline)', dark: true });
  const P = '<span class="p">jason<b>@arch</b></span>:<span class="bl">~</span>$ ';
  const t = new Term(body, run, P);

  async function stream(text) {
    const line = t.print('');
    line.textContent = '';
    line.dataset.tag = 'answer';
    line.className = 'cy';
    const toks = text.match(/\s+|[A-Za-z_]+|./g);
    for (const tok of toks) { line.textContent += tok; t.scroll(); await run.sleep(18 + Math.random() * 30); }
    t.print(`<span class="dim">[${toks.length} tokens · local · no network]</span>`);
  }

  (async () => {
    await run.sleep(400);
    await t.cmd('fastfetch --compact');
    await t.lines([
      ['cy', '   /\\      <span class="hl">jason@arch</span>'],
      ['cy', '  /  \\     OS      Arch Linux x86_64'],
      ['cy', ' /\\   \\    Shell   bash 5.2'],
      ['cy', '/  __  \\   Model   Qwen2.5-Coder 3B · Q4_K_M'],
      ['cy', '/_/  \\_\\   Net     <span class="err">offline</span>'],
    ], 60);
    await t.cmd('llama-server -m ~/models/qwen2.5-coder-3b-instruct-q4_k_m.gguf -c 4096 --port 8080 &', { speed: 14 });
    const boot = [
      ['dim', 'llama_model_loader: loaded meta data with 30 key-value pairs'],
      ['dim', 'llm_load_print_meta: model type = 3B · ftype = Q4_K_M'],
      ['dim', 'llm_load_tensors: CPU buffer size = 1834.82 MiB'],
      ['dim', 'llama_new_context_with_model: n_ctx = 4096 · KV self size = 144.00 MiB'],
      ['ok', 'main: server is listening on http://127.0.0.1:8080'],
    ];
    for (const [c, l] of boot) { const el = t.print(l, c); if (l.includes('listening')) el.dataset.tag = 'boot'; if (l.includes('model type')) el.dataset.tag = 'model'; await run.sleep(260); }
    await run.sleep(300);
    await t.cmd('ai "reverse a singly linked list in C"');
    await run.sleep(300);
    await stream(AI_ANSWERS[0].text);
    t.print('');
    t.print('try: <span class="cy">ai "find the biggest files in bash"</span>', 'dim');
    t.interactive(async (raw) => {
      const m = raw.trim().match(/^ai\s+"?(.+?)"?$/);
      if (!raw.trim()) return;
      if (raw.trim() === 'clear') return t.clear();
      if (!m) return void t.print(`bash: ${esc(raw.split(' ')[0])}: this demo only knows the <span class="cy">ai</span> command`, 'err');
      const a = AI_ANSWERS.find((x) => x.match.test(m[1]));
      await run.sleep(400);
      if (!a) return stream(`# (demo) I only have a few cached answers here.\n# Try asking about linked lists, bash or Python.`);
      return stream(a.text);
    });
  })().catch(ignore);
}

/* =========================================================
   SmartPrompt: Chrome extension popup over a chat page
   ========================================================= */

export function restructure(text) {
  const raw = text.trim().replace(/\s+/g, ' ').replace(/\ba ([aeiou])/gi, 'an $1');
  const t = raw.toLowerCase();
  const pick = (pairs, d) => (pairs.find(([re]) => re.test(t)) || [, d])[1];
  const role = pick([[/cover letter|resume|cv|interview|internship|job/, 'an experienced recruiter and career coach'], [/code|function|bug|python|javascript|c\+\+|sql|api/, 'a senior software engineer'], [/email|message|reply/, 'a clear, professional business writer'], [/essay|blog|article|post/, 'an editor and content writer'], [/plan|strategy|startup|business/, 'a startup strategist']], 'a domain expert');
  const format = pick([[/cover letter|letter/, 'A one-page letter: 3 short paragraphs, then a sign-off.'], [/code|function|bug|script/, 'A code block, then a 3-bullet explanation.'], [/email/, 'Subject line + an email body under 150 words.'], [/plan|strategy/, 'Numbered steps with an owner and timeline for each.']], 'Short sections with headings and bullet points.');
  const task = raw.replace(/^(please |can you |could you |write me |make me |i want |i need )+/i, '');
  return `Role: You are ${role}.\n\nTask: ${task.charAt(0).toUpperCase() + task.slice(1).replace(/[.?!]*$/, '.')}\n\nContext: [Who it is for, your background, and any details the answer must reflect.]\n\nConstraints:\n- Be specific; avoid generic filler.\n- Ask one clarifying question if something critical is missing.\n- Match the tone to the audience.\n\nOutput format: ${format}`;
}

function smartprompt(root, run) {
  const body = win(root, { url: 'chat.example.ai' });
  body.innerHTML = `
    <div class="sp-page">
      <div class="ext-popup" data-tag="popup" style="opacity:0;transform:translateY(-6px);transition:all .35s">
        <div class="ext-head">✦ SmartPrompt<span class="gem">Gemini</span></div>
        <div class="ext-body">
          <div class="ext-modes"><span class="on">Balanced</span><span>Detailed</span><span>Code</span></div>
          <button class="btn teal" style="width:100%;justify-content:center" data-opt>✨ Optimize prompt</button>
          <p style="margin:10px 0 0;font-size:11.5px;color:#888;line-height:1.4">Live demo: rewritten with local rules. The real extension calls the Gemini API.</p>
        </div>
      </div>
      <h3>What can I help with?</h3>
      <p>Any AI chat page: the extension works on top of it.</p>
      <div class="sp-box" data-tag="draft">
        <textarea spellcheck="false" aria-label="Prompt"></textarea>
        <div class="row"><span class="pill">+ attach</span><span class="sp"></span><span class="pill" data-st>draft</span><button class="btn primary">Send ↑</button></div>
      </div>
    </div>`;
  const ta = body.querySelector('textarea');
  const popup = body.querySelector('.ext-popup');
  const optBtn = body.querySelector('[data-opt]');
  const st = body.querySelector('[data-st]');
  ta.addEventListener('keydown', (e) => e.stopPropagation());
  body.querySelectorAll('.ext-modes span').forEach((s) => s.addEventListener('click', () => {
    body.querySelectorAll('.ext-modes span').forEach((x) => x.classList.remove('on')); s.classList.add('on');
  }));

  let busy = false;
  async function optimize() {
    if (busy || !ta.value.trim()) return;
    busy = true;
    optBtn.innerHTML = '<span class="spin"></span>&nbsp; Asking Gemini…';
    st.textContent = 'optimizing'; st.className = 'pill run';
    await run.sleep(900);
    const out = restructure(ta.value);
    ta.value = '';
    body.querySelector('.sp-box').dataset.tag = 'result';
    for (let i = 0; i < out.length; i += 3) { ta.value = out.slice(0, i + 3); ta.scrollTop = ta.scrollHeight; await run.sleep(10); }
    optBtn.innerHTML = '✓ Optimized: edit and run again';
    st.textContent = 'optimized'; st.className = 'pill ok';
    busy = false;
  }
  optBtn.addEventListener('click', () => optimize().catch(ignore));
  ta.addEventListener('input', () => { body.querySelector('.sp-box').dataset.tag = 'draft'; optBtn.innerHTML = '✨ Optimize prompt'; st.textContent = 'draft'; st.className = 'pill'; });

  (async () => {
    await run.sleep(500);
    await typeInto(run, ta, 'write me a cover letter for a internship in AI engineering', 32, 'value');
    await run.sleep(400);
    popup.style.opacity = '1'; popup.style.transform = 'none';
    await run.sleep(900);
    optBtn.classList.add('flash');
    await optimize();
  })().catch(ignore);
}

/* =========================================================
   Financial document extractor: complexity router
   ========================================================= */

const FX_DOCS = {
  simple: {
    score: 0.18, path: 'rules',
    html: `<h5>STATEMENT OF ACCOUNT</h5><div style="color:#777">Cedar Trading SAL · Beirut</div>
      <div style="margin-top:8px">Account: <span class="fld" data-f="account">LB-0042-7781</span><br>
      Period: <span class="fld" data-f="period">01 Sep 2026 – 30 Sep 2026</span><br>
      Currency: <span class="fld" data-f="currency">USD</span></div>
      <table><tr><th>Date</th><th>Description</th><th class="r">Amount</th></tr>
      <tr><td>02/09</td><td>Opening balance</td><td class="r"><span class="fld" data-f="opening">12,400.00</span></td></tr>
      <tr><td>09/09</td><td>Invoice #881 paid</td><td class="r">+3,250.00</td></tr>
      <tr><td>17/09</td><td>Supplier transfer</td><td class="r">−1,980.00</td></tr>
      <tr><td>28/09</td><td>Bank fees</td><td class="r">−15.00</td></tr>
      <tr><td></td><td><b>Closing balance</b></td><td class="r"><b><span class="fld" data-f="closing">13,655.00</span></b></td></tr></table>
      <div style="margin-top:10px">Transactions: <span class="fld" data-f="count">3</span></div>`,
    json: [['account', '"LB-0042-7781"'], ['period', '{ "from": "2026-09-01", "to": "2026-09-30" }'], ['currency', '"USD"'], ['opening', '12400.00'], ['closing', '13655.00'], ['count', '3']],
  },
  complex: {
    score: 0.83, path: 'llm', scan: true,
    html: `<h5>ANNUAL REPORT 2025 (EXCERPT)</h5><div style="color:#777">Phoenicia Holdings SAL · consolidated</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:8px;font-size:10.5px">
      <div>Group revenue rose to <span class="fld" data-f="revenue">USD 48.2m</span> (2024: <span class="fld" data-f="revenue_py">41.7m</span>), driven by logistics.</div>
      <div>Net profit attributable to shareholders was <span class="fld" data-f="net">USD 6.1m</span>, after a one-off impairment of 1.3m.</div></div>
      <table><tr><th>(USD m)</th><th class="r">2025</th><th class="r">2024</th></tr>
      <tr><td>Logistics</td><td class="r"><span class="fld" data-f="seg1">29.4</span></td><td class="r">24.0</td></tr>
      <tr><td>Retail</td><td class="r"><span class="fld" data-f="seg2">18.8</span></td><td class="r">17.7</td></tr>
      <tr><td>EBITDA margin</td><td class="r"><span class="fld" data-f="margin">21.4%</span></td><td class="r">19.9%</td></tr></table>
      <div style="margin-top:8px;font-size:10.5px">Note 14: Dividend proposed of <span class="fld" data-f="dividend">USD 0.12</span> per share, payable <span class="fld" data-f="paydate">June 2026</span>.</div>`,
    json: [['revenue', '{ "2025": 48.2, "2024": 41.7, "unit": "USD m" }'], ['net', '6.1'], ['seg1', '{ "logistics": 29.4 }'], ['seg2', '{ "retail": 18.8 }'], ['margin', '0.214'], ['dividend', '{ "per_share": 0.12, "pay": "2026-06" }']],
  },
};

function finExtractor(root, run) {
  const body = win(root, { title: 'extractor: financial documents' });
  body.innerHTML = `
    <div class="fx-doc">
      <div class="fx-switch"><button data-d="simple">Simple statement</button><button data-d="complex">Complex report</button></div>
      <div class="paper" data-tag="doc"></div>
    </div>
    <div class="fx-main">
      <div><p class="panel-h">Complexity</p><div class="gauge"><i></i></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#999"><span>simple</span><span id="fx-score">—</span><span>complex</span></div></div>
      <div class="router" data-tag="router">
        <div class="node" data-n="rules"><b>Rule-based</b>regex + NLP, no LLM call</div>
        <span style="color:#bbb">or</span>
        <div class="node" data-n="llm"><b>LLM-assisted</b>schema-guided extraction</div>
      </div>
      <p class="panel-h" style="margin:4px 0 -4px">Extracted JSON</p>
      <div class="json" data-tag="json"></div>
    </div>`;
  const paper = body.querySelector('.paper');
  const json = body.querySelector('.json');
  const gauge = body.querySelector('.gauge i');
  const score = body.querySelector('#fx-score');
  const nodes = [...body.querySelectorAll('.node')];
  const btns = [...body.querySelectorAll('.fx-switch button')];
  let token = 0;

  async function play(kind) {
    const my = ++token;
    const ok = () => my === token && run.alive;
    const d = FX_DOCS[kind];
    btns.forEach((b) => b.classList.toggle('on', b.dataset.d === kind));
    paper.className = `paper${d.scan ? ' scan' : ''}`;
    paper.innerHTML = d.html + '<div class="scanline"></div>';
    json.innerHTML = '';
    nodes.forEach((n) => (n.className = 'node'));
    gauge.style.left = '0%'; score.textContent = 'reading…';
    await run.sleep(200); if (!ok()) return;
    paper.querySelector('.scanline').classList.add('go');
    await run.sleep(1500); if (!ok()) return;
    gauge.style.left = `calc(${d.score * 100}% - 2px)`;
    score.textContent = `score ${d.score.toFixed(2)}`;
    await run.sleep(900); if (!ok()) return;
    nodes.forEach((n) => (n.className = `node ${n.dataset.n === d.path ? 'on' : 'off'}`));
    await run.sleep(600); if (!ok()) return;
    const lines = [];
    const render = (done) => {
      const color = (v) => v.split(/("[^"]*")/).map((part) => (part.startsWith('"') ? `<span class="s">${part}</span>` : part.replace(/\d+(?:\.\d+)?/g, '<span class="n">$&</span>'))).join('');
      json.innerHTML = `{\n${lines.map(([k, v]) => `  <span class="k">"${k}"</span>: ${color(v)}`).join(',\n')}${done ? `,\n  <span class="k">"_path"</span>: <span class="s">"${d.path === 'llm' ? 'llm-assisted' : 'rule-based'}"</span>` : ''}\n}`;
    };
    for (const [k, v] of d.json) {
      paper.querySelectorAll(`[data-f="${k}"]`).forEach((f) => f.classList.add('hit'));
      lines.push([k, v]); render(false);
      await run.sleep(d.path === 'llm' ? 520 : 300); if (!ok()) return;
    }
    render(true);
  }
  btns.forEach((b) => b.addEventListener('click', () => play(b.dataset.d).catch(ignore)));

  (async () => {
    await play('simple');
    await run.sleep(2600);
    if (token === 1) await play('complex');
  })().catch(ignore);
}

/* =========================================================
   tweetcraft.ai: queue a download job
   ========================================================= */

const TWEETS = [
  'Shipped the new onboarding flow today. Fewer steps, better copy, 2× activation.',
  'Hot take: most "AI features" are just a prompt and a textbox. Make the workflow better instead.',
  'Weekly reminder that rate limits are a feature, not a bug.',
  'Rewrote the worker in TypeScript. Types caught 3 bugs before prod did.',
  'What tools are you using for background jobs in Node? Bull has been rock solid for us.',
  'Small team, big queue. Shipping v0.3 tonight.',
];

function tweetcraft(root, run) {
  const body = win(root, { url: 'tweetcraft.ai/dashboard' });
  body.innerHTML = `
    <div class="tc-app">
      <nav class="tc-nav"><div class="tc-brand">tweetcraft<span>.ai</span></div>
        <a class="on">Downloads</a><a>Jobs</a><a>Library</a><a>Settings</a>
        <div class="tc-user"><i></i>signed in · JWT</div></nav>
      <div class="tc-main">
        <div class="tc-form" data-tag="form">
          <span class="field" data-h></span>
          <span class="field" style="flex:0 0 110px">max 200</span>
          <span class="pill">replies: off</span>
          <button class="btn primary">Start job</button>
        </div>
        <div class="tc-job" data-tag="queue" style="display:none">
          <div class="row"><b style="color:var(--navy)">Job #128</b><span class="mono" style="font-size:12px">download</span><span class="pill" data-st>waiting</span><span style="margin-left:auto" class="mono" data-n>0 / 200</span></div>
          <div class="bar"><span></span></div>
        </div>
        <div class="tc-list" data-tag="list"></div>
      </div>
    </div>`;
  const field = body.querySelector('[data-h]');
  const job = body.querySelector('.tc-job');
  const st = body.querySelector('[data-st]');
  const cnt = body.querySelector('[data-n]');
  const bar = body.querySelector('.bar span');
  const list = body.querySelector('.tc-list');
  const btn = body.querySelector('.btn');

  (async () => {
    await run.sleep(500);
    await typeInto(run, field, '@demo_account', 50);
    await run.sleep(300);
    btn.classList.add('flash');
    await run.sleep(400);
    job.style.display = ''; job.classList.add('fade-in');
    await run.sleep(700);
    st.textContent = 'active'; st.className = 'pill run';
    let n = 0;
    for (let i = 0; i < 20; i++) {
      n += 10;
      cnt.textContent = `${n} / 200 · page ${n <= 100 ? 1 : 2}`;
      bar.style.width = `${(n / 200) * 100}%`;
      if (i % 3 === 0 && i / 3 < TWEETS.length) {
        const tw = h(`<div class="tweet fade-in"><i></i><div><b>Demo Account</b><small>@demo_account · ${i + 1}d</small><div>${TWEETS[i / 3]}</div><div class="meta"><span>♥ ${20 + i * 7}</span><span>↻ ${3 + i}</span><span>id 18${41 + i}…</span></div></div></div>`);
        list.prepend(tw);
      }
      await run.sleep(170);
    }
    st.textContent = 'completed'; st.className = 'pill ok';
    cnt.textContent = '200 / 200 stored';
  })().catch(ignore);
}

/* =========================================================
   Minishell: a small working shell interpreter
   ========================================================= */

function minishell(root, run) {
  const body = win(root, { title: 'minishell (interactive)', dark: true });
  const PROMPT = '<span class="p">minishell</span><span class="dim">$</span> ';
  const t = new Term(body, run, PROMPT);
  t.el.dataset.tag = 'term';

  const HOME_DIR = '/home/jason';
  const fs = {
    '/home/jason/main.c': 'int main(int ac, char **av, char **envp)\n{\n\treturn (shell_loop(envp));\n}\n',
    '/home/jason/lexer.c': '/* splits the line into tokens, honouring quotes */\n',
    '/home/jason/parser.c': '/* builds t_cmd pipelines + redirections */\n',
    '/home/jason/expander.c': '/* $VAR and $? expansion */\n',
    '/home/jason/exec.c': '/* fork, pipe, dup2, execve */\n',
    '/home/jason/builtins.c': '/* echo cd pwd export unset env exit */\n',
    '/home/jason/minishell.h': '#ifndef MINISHELL_H\n# define MINISHELL_H\n#endif\n',
    '/home/jason/Makefile': 'NAME = minishell\nCC = cc\nCFLAGS = -Wall -Wextra -Werror\n',
    '/home/jason/README.md': 'minishell: as beautiful as a shell\nwritten in C at 42 Beirut\n',
  };
  const dirs = new Set(['/', '/home', '/home/jason', '/tmp']);
  const env = { USER: 'jason', HOME: HOME_DIR, PWD: HOME_DIR, SHELL: '/bin/minishell', PATH: '/usr/bin:/bin', LANG: 'en_US.UTF-8' };
  let status = 0;

  const resolve = (p) => {
    if (!p) return env.PWD;
    if (p === '~' || p.startsWith('~/')) p = HOME_DIR + p.slice(1);
    const parts = (p.startsWith('/') ? p : `${env.PWD}/${p}`).split('/');
    const out = [];
    for (const s of parts) { if (!s || s === '.') continue; if (s === '..') out.pop(); else out.push(s); }
    return `/${out.join('/')}`;
  };

  // --- lexer: words (with quotes + expansion) and operators
  function lex(line) {
    const toks = [];
    let i = 0;
    while (i < line.length) {
      const c = line[i];
      if (c === ' ' || c === '\t') { i++; continue; }
      if (c === '|' ) { toks.push({ op: '|' }); i++; continue; }
      if (c === '<' || c === '>') {
        const two = line[i + 1] === c;
        toks.push({ op: two ? c + c : c }); i += two ? 2 : 1; continue;
      }
      let w = '';
      let quoted = false;
      while (i < line.length && !' \t|<>'.includes(line[i])) {
        const q = line[i];
        if (q === "'" || q === '"') {
          const end = line.indexOf(q, i + 1);
          if (end < 0) throw new Error('syntax error: unclosed quote');
          const seg = line.slice(i + 1, end);
          w += q === '"' ? expand(seg) : seg;
          quoted = true;
          i = end + 1;
        } else {
          let j = i;
          while (j < line.length && !' \t|<>\'"'.includes(line[j])) j++;
          w += expand(line.slice(i, j));
          i = j;
        }
      }
      toks.push({ w, quoted });
    }
    return toks;
  }
  const expand = (s) => s.replace(/\$(\?|[A-Za-z_][A-Za-z0-9_]*)/g, (_, v) => (v === '?' ? String(status) : env[v] ?? ''));

  function parse(toks) {
    const cmds = [];
    let cur = { argv: [], redirs: [] };
    for (let i = 0; i < toks.length; i++) {
      const tk = toks[i];
      if (tk.op === '|') {
        if (!cur.argv.length && !cur.redirs.length) throw new Error("syntax error near unexpected token `|'");
        cmds.push(cur); cur = { argv: [], redirs: [] };
      } else if (tk.op) {
        const target = toks[++i];
        if (!target || target.op) throw new Error(`syntax error near unexpected token \`${target?.op || 'newline'}'`);
        cur.redirs.push({ op: tk.op, file: target.w });
      } else if (tk.w !== '' || tk.quoted) cur.argv.push(tk.w);
    }
    if (!cur.argv.length && !cur.redirs.length && cmds.length) throw new Error("syntax error near unexpected token `|'");
    cmds.push(cur);
    return cmds;
  }

  const lines = (s) => s.split('\n').filter((l, i, a) => i < a.length - 1 || l !== '');
  const trRange = (s) => s.replace(/(.)-(.)/g, (_, a, b) => { let r = ''; for (let c = a.charCodeAt(0); c <= b.charCodeAt(0); c++) r += String.fromCharCode(c); return r; });

  // each command: (args, stdin) -> { out, err, code }
  const BIN = {
    echo(a) { let nl = true; while (a[0] && /^-n+$/.test(a[0])) { nl = false; a = a.slice(1); } return { out: a.join(' ') + (nl ? '\n' : '') }; },
    pwd() { return { out: env.PWD + '\n' }; },
    cd(a) {
      const p = resolve(a[0] ?? HOME_DIR);
      if (!dirs.has(p)) return { err: `minishell: cd: ${a[0]}: No such file or directory\n`, code: 1 };
      env.OLDPWD = env.PWD; env.PWD = p; return {};
    },
    export(a) {
      if (!a.length) return { out: Object.entries(env).map(([k, v]) => `declare -x ${k}="${v}"`).join('\n') + '\n' };
      for (const kv of a) {
        const m = kv.match(/^([A-Za-z_][A-Za-z0-9_]*)(=(.*))?$/);
        if (!m) return { err: `minishell: export: \`${kv}': not a valid identifier\n`, code: 1 };
        if (m[2]) env[m[1]] = m[3];
      }
      return {};
    },
    unset(a) { a.forEach((k) => delete env[k]); return {}; },
    env() { return { out: Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n') + '\n' }; },
    exit(a) { return { out: 'exit\n', err: '(demo) the shell stays open so you can keep playing\n', code: Number(a[0]) || 0 }; },
    ls(a) {
      const dir = resolve(a.find((x) => !x.startsWith('-')));
      const names = Object.keys(fs).filter((f) => f.slice(0, f.lastIndexOf('/')) === dir).map((f) => f.slice(f.lastIndexOf('/') + 1));
      names.push(...[...dirs].filter((d) => d !== dir && d.slice(0, d.lastIndexOf('/') || 1) === dir).map((d) => d.slice(d.lastIndexOf('/') + 1)));
      return { out: names.sort().join('\n') + (names.length ? '\n' : '') };
    },
    cat(a, inp) {
      if (!a.length) return { out: inp };
      let out = '';
      for (const f of a) { const p = resolve(f); if (!(p in fs)) return { out, err: `cat: ${f}: No such file or directory\n`, code: 1 }; out += fs[p]; }
      return { out };
    },
    wc(a, inp) {
      const f = a.find((x) => !x.startsWith('-'));
      const s = f ? fs[resolve(f)] ?? '' : inp;
      const l = (s.match(/\n/g) || []).length, w = s.split(/\s+/).filter(Boolean).length, c = new TextEncoder().encode(s).length;
      if (a.includes('-l')) return { out: `${l}\n` };
      if (a.includes('-w')) return { out: `${w}\n` };
      if (a.includes('-c')) return { out: `${c}\n` };
      return { out: `      ${l}      ${w}     ${c}\n` };
    },
    grep(a, inp) {
      const inv = a.includes('-v');
      const [pat, file] = a.filter((x) => x !== '-v');
      if (pat === undefined) return { err: 'usage: grep [-v] pattern [file]\n', code: 2 };
      const src = file ? fs[resolve(file)] ?? '' : inp;
      const hit = lines(src).filter((l) => l.includes(pat) !== inv);
      return { out: hit.map((l) => l + '\n').join(''), code: hit.length ? 0 : 1 };
    },
    tr(a, inp) {
      const [x, y] = [trRange(a[0] ?? ''), trRange(a[1] ?? '')];
      return { out: [...inp].map((c) => { const i = x.indexOf(c); return i < 0 ? c : y[Math.min(i, y.length - 1)] ?? c; }).join('') };
    },
    head(a, inp) { const n = Number(a[a.indexOf('-n') + 1]) || 10; const f = a.find((x, i) => !x.startsWith('-') && a[i - 1] !== '-n'); return { out: lines(f ? fs[resolve(f)] ?? '' : inp).slice(0, n).map((l) => l + '\n').join('') }; },
    sort(a, inp) { const r = lines(inp).sort(); if (a.includes('-r')) r.reverse(); return { out: r.map((l) => l + '\n').join('') }; },
    whoami() { return { out: env.USER + '\n' }; },
    date() { return { out: new Date().toString() + '\n' }; },
    uname() { return { out: 'Linux\n' }; },
    true() { return {}; },
    false() { return { code: 1 }; },
  };

  async function execLine(line, readHeredoc) {
    let cmds;
    try { cmds = parse(lex(line)); } catch (e) { t.print(`minishell: ${esc(e.message)}`, 'err'); status = 2; return; }
    let inp = '';
    for (let idx = 0; idx < cmds.length; idx++) {
      const cmd = cmds[idx];
      let stdin = idx === 0 ? '' : inp;
      let outFile = null;
      let failed = false;
      for (const r of cmd.redirs) {
        if (r.op === '<') {
          const p = resolve(r.file);
          if (!(p in fs)) { t.print(`minishell: ${esc(r.file)}: No such file or directory`, 'err'); failed = true; break; }
          stdin = fs[p];
        } else if (r.op === '<<') {
          stdin = await readHeredoc(r.file);
        } else {
          const p = resolve(r.file);
          if (r.op === '>' || !(p in fs)) fs[p] = '';
          outFile = p;
        }
      }
      if (failed) { status = 1; inp = ''; continue; }
      if (!cmd.argv.length) { inp = ''; continue; }
      const [name, ...args] = cmd.argv;
      if (name === 'clear') { t.clear(); status = 0; return; }
      const fn = BIN[name];
      const res = fn ? fn(args, stdin) : { err: `minishell: ${name}: command not found\n`, code: 127 };
      status = res.code ?? 0;
      if (res.err) res.err.split('\n').filter(Boolean).forEach((l) => t.print(esc(l), 'err'));
      const out = res.out ?? '';
      if (outFile) { fs[outFile] += out; inp = ''; }
      else if (idx < cmds.length - 1) inp = out;
      else if (out) lines(out).forEach((l) => t.print(esc(l)));
    }
  }

  // heredoc lines are typed by the user through the same input
  let heredocWaiter = null;
  const readHeredoc = (delim) => new Promise((res) => {
    const buf = [];
    heredocWaiter = (l) => { if (l === delim) { heredocWaiter = null; res(buf.map((x) => expand(x) + '\n').join('')); return true; } buf.push(l); return false; };
  });

  (async () => {
    await run.sleep(400);
    t.print('<span class="dim">minishell: a bash-like shell in C (42 Beirut). Running live in your browser.</span>');
    t.print('');
    const demo = [
      'echo "hello from minishell" | tr a-z A-Z',
      'export NAME=jason',
      'echo "hi $NAME, last exit: $?" > greet.txt',
      'cat greet.txt | wc -c',
      'ls | grep .c',
    ];
    for (const c of demo) {
      const l = await t.cmd(c, { speed: 30 });
      if (c.includes('|') && !t.el.querySelector('[data-tag="pipe"]')) l.dataset.tag = 'pipe';
      await execLine(c, async () => '');
      await run.sleep(350);
    }
    t.print('');
    t.print('Your turn. Supports pipes, &lt; &gt; &gt;&gt; &lt;&lt;, $VAR, $?, quotes, echo cd pwd export unset env exit, ls cat wc grep tr head sort.', 'dim');
    t.interactive(async (raw) => {
      if (heredocWaiter) { heredocWaiter(raw); return; }
      if (!raw.trim()) return;
      // heredoc: collect lines via the same prompt, switching it to "> "
      const done = execLine(raw, (delim) => { const p = readHeredoc(delim); return p; });
      if (/<<\s*\S+/.test(raw)) {
        t.promptFn = () => (heredocWaiter ? '<span class="dim">&gt;</span> ' : PROMPT);
        t.input.disabled = false;
        t.inputLine.querySelector('.pr').innerHTML = t.promptFn();
        t.input.focus();
      }
      await done;
    }, { prompt: () => PROMPT });
  })().catch(ignore);
}

/* =========================================================
   miniRT: a JS port of the ray tracer
   ========================================================= */

const RT_SCENES = {
  'showcase.rt': `# miniRT scene: edit me and press Render
A  0.22                 255,255,255
C  -1.5,3.2,-15  0.08,-0.16,1  62
L  -9,12,-11     0.8    255,255,255

pl 0,-1,0        0,1,0         232,222,204
pl 0,0,14        0,0,-1        205,218,226

sp 0,1.6,1       5.2           26,163,161
sp 4.2,0.2,-2.6  2.4           224,123,57
sp -4.4,0.4,-1.8 2.8           36,48,74
cy 6.6,1.5,4     0,1,0   2.2  5   240,197,107
cy -6.2,1,4.5    0.35,1,0 1.4 4   173,162,147`,
  'simple.rt': `# one sphere, one plane, one light
A  0.25          255,255,255
C  0,1,-12  0,0,1   60
L  -10,10,-10  0.75  255,255,255

sp 0,1,0     4     220,80,60
pl 0,-1,0    0,1,0 210,205,195`,
};

function parseRT(src) {
  const S = { objs: [] };
  const v3 = (s, l) => { const p = s?.split(',').map(Number); if (!p || p.length !== 3 || p.some(isNaN)) throw new Error(`line ${l}: expected x,y,z`); return p; };
  const num = (s, l) => { const n = Number(s); if (isNaN(n)) throw new Error(`line ${l}: expected a number`); return n; };
  src.split('\n').forEach((raw, i) => {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) return;
    const [id, ...a] = line.split(/\s+/);
    const l = i + 1;
    switch (id) {
      case 'A': S.amb = { r: num(a[0], l), c: v3(a[1], l) }; break;
      case 'C': S.cam = { p: v3(a[0], l), d: norm(v3(a[1], l)), fov: num(a[2], l) }; break;
      case 'L': S.light = { p: v3(a[0], l), r: num(a[1], l), c: a[2] ? v3(a[2], l) : [255, 255, 255] }; break;
      case 'sp': S.objs.push({ t: 'sp', c: v3(a[0], l), r: num(a[1], l) / 2, col: v3(a[2], l) }); break;
      case 'pl': S.objs.push({ t: 'pl', p: v3(a[0], l), n: norm(v3(a[1], l)), col: v3(a[2], l) }); break;
      case 'cy': S.objs.push({ t: 'cy', c: v3(a[0], l), a: norm(v3(a[1], l)), r: num(a[2], l) / 2, h: num(a[3], l), col: v3(a[4], l) }); break;
      default: throw new Error(`line ${l}: unknown identifier "${id}"`);
    }
  });
  if (!S.amb || !S.cam || !S.light) throw new Error('scene needs A, C and L');
  return S;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add3 = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

function intersect(o, ro, rd) {
  if (o.t === 'sp') {
    const oc = sub(ro, o.c);
    const b = dot(oc, rd), c = dot(oc, oc) - o.r * o.r, d = b * b - c;
    if (d < 0) return null;
    const s = Math.sqrt(d);
    const t = -b - s > 1e-4 ? -b - s : -b + s;
    if (t <= 1e-4) return null;
    const p = add3(ro, mul(rd, t));
    return { t, p, n: norm(sub(p, o.c)) };
  }
  if (o.t === 'pl') {
    const den = dot(o.n, rd);
    if (Math.abs(den) < 1e-6) return null;
    const t = dot(sub(o.p, ro), o.n) / den;
    return t > 1e-4 ? { t, p: add3(ro, mul(rd, t)), n: o.n } : null;
  }
  // finite cylinder with caps
  let best = null;
  const oc = sub(ro, o.c);
  const dA = dot(rd, o.a), ocA = dot(oc, o.a);
  const dp = sub(rd, mul(o.a, dA)), op = sub(oc, mul(o.a, ocA));
  const A = dot(dp, dp), B = 2 * dot(dp, op), C = dot(op, op) - o.r * o.r;
  const disc = B * B - 4 * A * C;
  if (A > 1e-9 && disc >= 0) {
    for (const t of [(-B - Math.sqrt(disc)) / (2 * A), (-B + Math.sqrt(disc)) / (2 * A)]) {
      if (t <= 1e-4 || (best && t >= best.t)) continue;
      const y = ocA + t * dA;
      if (Math.abs(y) <= o.h / 2) {
        const p = add3(ro, mul(rd, t));
        const q = sub(p, o.c);
        best = { t, p, n: norm(sub(q, mul(o.a, dot(q, o.a)))) };
      }
    }
  }
  for (const s of [-1, 1]) {
    const cc = add3(o.c, mul(o.a, (s * o.h) / 2));
    const den = dot(o.a, rd);
    if (Math.abs(den) < 1e-6) continue;
    const t = dot(sub(cc, ro), o.a) / den;
    if (t <= 1e-4 || (best && t >= best.t)) continue;
    const p = add3(ro, mul(rd, t));
    const q = sub(p, cc);
    if (dot(q, q) <= o.r * o.r) best = { t, p, n: mul(o.a, s) };
  }
  return best;
}

function trace(S, ro, rd) {
  let hit = null, obj = null;
  for (const o of S.objs) { const r = intersect(o, ro, rd); if (r && (!hit || r.t < hit.t)) { hit = r; obj = o; } }
  if (!hit) return [13, 18, 34];
  let n = hit.n;
  if (dot(n, rd) > 0) n = mul(n, -1);
  const base = obj.col.map((c) => c / 255);
  const amb = S.amb.c.map((c) => (c / 255) * S.amb.r);
  let col = base.map((c, i) => c * amb[i]);
  const toL = sub(S.light.p, hit.p);
  const dist = Math.hypot(...toL);
  const ld = mul(toL, 1 / dist);
  const so = add3(hit.p, mul(n, 1e-3));
  let shadow = false;
  for (const o of S.objs) { const r = intersect(o, so, ld); if (r && r.t < dist) { shadow = true; break; } }
  if (!shadow) {
    const diff = Math.max(0, dot(n, ld)) * S.light.r;
    col = col.map((c, i) => c + base[i] * diff * (S.light.c[i] / 255));
  }
  return col.map((c) => Math.min(255, Math.round(c * 255)));
}

function minirt(root, run) {
  const body = win(root, { title: 'miniRT: scenes/showcase.rt', dark: true });
  body.innerHTML = `
    <div class="rt-side" data-tag="scene">
      <div class="rt-head"><select aria-label="Scene">${Object.keys(RT_SCENES).map((k) => `<option>${k}</option>`).join('')}</select><button class="btn teal" style="height:28px">Render</button></div>
      <textarea spellcheck="false" aria-label="Scene file"></textarea>
      <div class="rt-foot"><span data-st>ready</span></div>
    </div>
    <div class="rt-view" data-tag="render"><canvas width="400" height="300"></canvas><span class="rt-stat" data-stat></span></div>`;
  const ta = body.querySelector('textarea');
  const sel = body.querySelector('select');
  const st = body.querySelector('[data-st]');
  const stat = body.querySelector('[data-stat]');
  const cv = body.querySelector('canvas');
  const g = cv.getContext('2d');
  ta.value = RT_SCENES['showcase.rt'];
  ta.addEventListener('keydown', (e) => e.stopPropagation());
  let token = 0;

  async function render() {
    const my = ++token;
    let S;
    try { S = parseRT(ta.value); } catch (e) { st.innerHTML = `<span style="color:#ff8f7a">Error\n${esc(e.message)}</span>`; return; }
    const W = cv.width, H = cv.height;
    const f = S.cam.d;
    let right = cross(f, [0, 1, 0]);
    if (Math.hypot(...right) < 1e-6) right = [1, 0, 0];
    right = norm(right);
    const up = cross(right, f);
    const hw = Math.tan(((S.cam.fov * Math.PI) / 180) / 2);
    const hh = hw * (H / W);
    const img = g.createImageData(W, 1);
    const t0 = performance.now();
    st.textContent = `parsed: 1 camera · 1 light · ${S.objs.length} objects`;
    let slice = performance.now();
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const px = ((x + 0.5) / W) * 2 - 1, py = 1 - ((y + 0.5) / H) * 2;
        // cross(f, up) points left, so negate px to keep +x on the right of the screen
        const rd = norm(add3(add3(f, mul(right, -px * hw)), mul(up, py * hh)));
        const c = trace(S, S.cam.p, rd);
        img.data.set([c[0], c[1], c[2], 255], x * 4);
      }
      g.putImageData(img, 0, y);
      // yield every ~14 ms so the page stays responsive while rows appear
      if (performance.now() - slice > 14) {
        stat.textContent = `rendering ${Math.round((y / H) * 100)}%`;
        await run.sleep(0);
        if (my !== token) return;
        slice = performance.now();
      }
    }
    stat.textContent = `${W}×${H} · ${Math.round(performance.now() - t0)} ms · ${S.objs.length} objects`;
  }
  body.querySelector('.btn').addEventListener('click', () => render().catch(ignore));
  sel.addEventListener('change', () => { ta.value = RT_SCENES[sel.value]; render().catch(ignore); });
  g.fillStyle = '#0d1222'; g.fillRect(0, 0, cv.width, cv.height);
  run.sleep(450).then(render).catch(ignore);
}

/* =========================================================
   Cybersecurity Piscine: tabs
   ========================================================= */

function security(root, run, ctx) {
  const body = win(root, { title: 'piscine-cybersecurity', dark: true });
  const TABS = ['ft_otp', 'arachnida', 'ft_onion', 'stockholm', 'reverse_me'];
  body.innerHTML = `<div class="sec-app"><div class="sec-tabs" data-tag="tabs">${TABS.map((x) => `<button>${x}</button>`).join('')}</div><div class="sec-body"></div></div>`;
  const sb = body.querySelector('.sec-body');
  const btns = [...body.querySelectorAll('.sec-tabs button')];
  const P = '<span class="p">jason<b>@piscine</b></span>:<span class="bl">~</span>$ ';
  let tabRun = null;

  const show = (name) => {
    tabRun?.stop();
    tabRun = createRunner();
    btns.forEach((b) => b.classList.toggle('on', b.textContent === name));
    sb.innerHTML = '';
    TAB_FN[name](sb, tabRun).catch(ignore);
    ctx.refreshTags();
  };
  btns.forEach((b) => b.addEventListener('click', () => show(b.textContent)));
  const outer = run.stop;
  run.stop = () => { tabRun?.stop(); outer(); };

  const TAB_FN = {
    async ft_otp(el, r) {
      const t = new Term(el, r, P);
      const panel = h(`<div class="otp-panel" data-tag="otp">
        <div class="otp-ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.5" fill="none" stroke="#263055" stroke-width="3"/><circle data-ring cx="18" cy="18" r="15.5" fill="none" stroke="#1aa3a1" stroke-width="3" stroke-linecap="round" stroke-dasharray="97.4" stroke-dashoffset="0"/></svg><span class="t" data-s>30</span></div>
        <div class="otp-code" data-c>------</div>
        <input data-k value="${DEMO_KEY}" aria-label="Hex key" spellcheck="false" />
        <small>HMAC-SHA1 · 30 s step · 6 digits (RFC 6238).<br>Check it: <span class="mono" style="color:#6fd6d4">oathtool --totp &lt;key&gt;</span></small>
      </div>`);
      el.append(panel);
      const codeEl = panel.querySelector('[data-c]'), sEl = panel.querySelector('[data-s]'), ring = panel.querySelector('[data-ring]'), keyIn = panel.querySelector('[data-k]');
      keyIn.addEventListener('keydown', (e) => e.stopPropagation());
      const tick = async () => {
        const left = 30 - (Math.floor(Date.now() / 1000) % 30);
        sEl.textContent = left;
        ring.style.strokeDashoffset = String(97.4 * (1 - left / 30));
        const k = keyIn.value.trim();
        codeEl.textContent = /^([0-9a-fA-F]{2}){32,}$/.test(k) ? await totp(k) : 'bad key';
      };
      tick(); r.every(1000, tick);
      await r.sleep(300);
      await t.cmd('echo -n "3132...3132" > key.hex  # 64 hex chars');
      await t.cmd('./ft_otp -g key.hex');
      t.print('Key was successfully saved in ft_otp.key.', 'ok');
      await t.cmd('./ft_otp -k ft_otp.key');
      t.print(await totp(), 'hl');
      await t.cmd('./ft_otp -g short.hex');
      t.print('./ft_otp: error: key must be 64 hexadecimal characters.', 'err');
    },
    async arachnida(el, r) {
      const t = new Term(el, r, P);
      await r.sleep(300);
      await t.cmd('./spider -r -l 2 -p ./data https://example.com/gallery');
      await t.lines([
        ['dim', '[depth 0] https://example.com/gallery'],
        ['', '  ↓ data/sunset.jpg        212 KB'],
        ['', '  ↓ data/harbour.png       488 KB'],
        ['dim', '[depth 1] https://example.com/gallery/page/2'],
        ['', '  ↓ data/cedars.jpeg       301 KB'],
        ['', '  ↓ data/logo.gif           12 KB'],
        ['dim', '[depth 2] https://example.com/about'],
        ['', '  ↓ data/team.bmp          620 KB'],
        ['ok', '5 images · 3 pages · extensions: jpg jpeg png gif bmp'],
      ], 160);
      await t.cmd('./scorpion data/sunset.jpg');
      t.print(`<table class="exif">${[['File', 'sunset.jpg'], ['Size', '212 KB · 1920×1280'], ['Make', 'Canon'], ['Model', 'EOS 250D'], ['DateTimeOriginal', '2025:08:14 19:42:07'], ['ExposureTime', '1/250'], ['FNumber', 'f/5.6'], ['ISO', '200'], ['GPS', '<span class="hl">present: 33.89 N, 35.50 E</span>']].map(([a, b]) => `<tr><td class="cy">${a}</td><td>${b}</td></tr>`).join('')}</table>`);
    },
    async ft_onion(el, r) {
      const t = new Term(el, r, P);
      const onion = Array.from({ length: 56 }, () => 'abcdefghijklmnopqrstuvwxyz234567'[Math.floor(Math.random() * 32)]).join('');
      await r.sleep(300);
      await t.cmd('docker compose up -d --build');
      await t.lines([['', ' ✔ Container ft_onion-nginx  Started'], ['', ' ✔ Container ft_onion-tor    Started']], 220);
      await t.cmd('docker logs ft_onion-tor | grep Bootstrapped');
      for (const p of [5, 25, 50, 75, 90, 100]) { t.print(`[notice] Bootstrapped ${p}%${p === 100 ? ' (done): Done' : ''}`, p === 100 ? 'ok' : 'dim'); await r.sleep(240); }
      await t.cmd('cat /var/lib/tor/hidden_service/hostname');
      t.print(`${onion}.onion`, 'hl');
      await t.cmd(`torsocks curl -s http://${onion.slice(0, 10)}….onion | head -3`);
      await t.lines([['', '&lt;html&gt;'], ['', '  &lt;h1&gt;ft_onion: served over Tor by nginx&lt;/h1&gt;'], ['', '&lt;/html&gt;']], 80);
      await t.cmd('ssh -p 4242 jason@localhost');
      t.print('Password authentication disabled · key accepted', 'dim');
      t.print('Welcome to ft_onion (Debian) · sshd hardened · port 4242', 'ok');
    },
    async stockholm(el, r) {
      const t = new Term(el, r, P);
      t.print('educational lab simulation · only touches ~/infection · fully reversible', 'hl');
      await r.sleep(300);
      await t.cmd('ls ~/infection');
      t.print('notes.txt   report.docx   photo.jpg   data.csv   backup.zip');
      await t.cmd('./stockholm');
      for (const f of ['notes.txt', 'report.docx', 'photo.jpg', 'data.csv', 'backup.zip']) { t.print(`encrypted ${f} → <span class="mg">${f}.ft</span>`); await r.sleep(170); }
      await t.cmd('ls ~/infection');
      t.print('<span class="mg">notes.txt.ft   report.docx.ft   photo.jpg.ft   data.csv.ft   backup.zip.ft</span>');
      await t.cmd('./stockholm -r 7f3a9c…e21b -s');
      await r.sleep(400);
      t.print('5 files restored', 'ok');
      await t.cmd('./stockholm -v');
      t.print('stockholm 1.0');
    },
    async reverse_me(el, r) {
      const t = new Term(el, r, P);
      await r.sleep(300);
      await t.cmd('./level1');
      t.print('Please enter key: <span class="dim">hello</span>');
      t.print('Nope.', 'err');
      await t.cmd("objdump -d level1 --no-show-raw-insn | grep -A8 '<main>:'");
      await t.lines([
        ['dim', '  1189: push   %rbp'],
        ['dim', '  1194: lea    -0x70(%rbp),%rax'],
        ['dim', '  11a3: call   __isoc99_scanf@plt'],
        ['', '  11a8: lea    0xe55(%rip),%rsi   <span class="hl"># "__stack_check"</span>'],
        ['', '  11b2: call   strcmp@plt'],
        ['dim', '  11b7: test   %eax,%eax'],
        ['dim', '  11b9: jne    11cc &lt;main+0x43&gt;'],
      ], 110);
      await t.cmd('./level1');
      t.print('Please enter key: <span class="cy">__stack_check</span>');
      t.print('Good job.', 'ok');
      await t.cmd('cat source.c');
      t.print(`<span class="cy">int</span> main(<span class="cy">void</span>) {
    <span class="cy">char</span> key[100];
    printf(<span class="ok">"Please enter key: "</span>);
    scanf(<span class="ok">"%s"</span>, key);
    puts(strcmp(key, <span class="ok">"__stack_check"</span>) ? <span class="ok">"Nope."</span> : <span class="ok">"Good job."</span>);
}`);
    },
  };

  show('ft_otp');
}

function ignore(e) { if (e !== STOP) console.error(e); }

export const DEMOS = { home, structurai, fieldnote, 'ai-os': aiOs, smartprompt, 'fin-extractor': finExtractor, tweetcraft, minishell, minirt, security };
