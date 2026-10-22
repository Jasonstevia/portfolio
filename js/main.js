import { PROJECTS, HOME, PROFILE, EXPERIENCE, SKILLS, ICONS, GITHUB, LINKEDIN, EMAIL, CV } from './data.js';
import { DEMOS, createRunner, totp } from './demos.js';

const O = (s, r = document) => r.querySelector(s);
const A = (s, r = document) => [...r.querySelectorAll(s)];
const icon = (name, cls = '') => `<svg viewBox="0 0 24 24" class="${cls}">${ICONS[name] || ''}</svg>`;

const BASE_W = 1672, BASE_H = 941, MIN_W = 1400;
const app = O('#app');
let scale = 1;
let compact = false;
let phone = false; // compact + narrow: mockups use their own mobile layout instead of being scaled
let current = null; // project object or HOME
let runner = null;

/* ---------- Artboard: fixed design size, scaled to the window ---------- */

function fit() {
  const vw = window.innerWidth, vh = window.innerHeight;
  let n = Math.min(vw / BASE_W, vh / BASE_H);
  if (n < vh / BASE_H) n = Math.min(vh / BASE_H, vw / MIN_W); // narrow: let the artboard shrink to MIN_W first
  compact = n < 0.5 || vw / vh < 0.95;
  phone = compact && vw < 700;
  document.documentElement.classList.toggle('compact', compact);
  document.documentElement.classList.toggle('phone', phone);
  if (compact) {
    scale = 1;
    app.style.width = app.style.height = app.style.transform = '';
  } else {
    scale = n;
    app.style.width = `${vw / n}px`;
    app.style.height = `${vh / n}px`;
    app.style.transform = `scale(${n})`;
    drawTraces(vw / n, vh / n);
  }
  fitDevice();
}

/* ---------- Decorative PCB traces (negative coords anchor to right/bottom) ---------- */

const TRACES = [
  { p: [[470, 46], [540, 46], [566, 20], [860, 20], [884, 44], [1040, 44]], end: 1, pulse: 1 },
  { p: [[-500, 60], [-520, 60], [-540, 40], [-600, 40]], start: 1 },
  { p: [[600, 72], [760, 72], [776, 88]], end: 1 },
  { p: [[-506, 140], [-506, 470], [-498, 478], [-498, 512]], start: 1, end: 1, pulse: 1 },
  { p: [[-506, 540], [-506, 760]], start: 1, end: 1 },
  { p: [[84, 96], [84, 300], [72, 312]], start: 1 },
  { p: [[84, 560], [84, 720], [92, 728]], end: 1 },
  { p: [[120, -180], [120, -230], [140, -250], [230, -250]], start: 1, end: 1, pulse: 1 },
  { p: [[-22, 110], [-10, 110], [0, 100]], start: 1 },
  { p: [[-30, -6], [-10, -6]], start: 1 },
  { p: [[96, 26], [80, 26], [72, 18]], start: 1 },
];

function drawTraces(w, h) {
  const X = (x) => (x < 0 ? w + x : x), Y = (y) => (y < 0 ? h + y : y);
  let out = '';
  for (const t of TRACES) {
    const pts = t.p.map(([x, y]) => [X(x), Y(y)]);
    const d = `M${pts.map((q) => q.join(' ')).join('L')}`;
    out += `<path d="${d}"/>`;
    if (t.pulse) out += `<path class="pulse" d="${d}" style="animation-delay:${(-Math.random() * 7).toFixed(2)}s"/>`;
    if (t.start) out += `<circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="3.5"/>`;
    if (t.end) { const e = pts[pts.length - 1]; out += `<circle cx="${e[0]}" cy="${e[1]}" r="3.5"/>`; }
  }
  O('#traces').innerHTML = out;
}

/* ---------- Clock (Beirut) ---------- */

function startClock() {
  const dEl = O('#clock-date'), tEl = O('#clock-time');
  const df = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Beirut', month: 'short', day: '2-digit', year: 'numeric' });
  const tf = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Beirut', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const tick = () => { const now = new Date(); dEl.textContent = df.format(now).toUpperCase(); tEl.textContent = tf.format(now); };
  tick();
  setInterval(tick, 1000);
}

/* ---------- Progress (explored projects, persisted) ---------- */

const STORE = 'jslim-explored';
const explored = new Set(JSON.parse(localStorage.getItem(STORE) || '[]').filter((id) => PROJECTS.some((p) => p.id === id)));

function markExplored(id) {
  if (!PROJECTS.some((p) => p.id === id) || explored.has(id)) return;
  explored.add(id);
  try { localStorage.setItem(STORE, JSON.stringify([...explored])); } catch { /* private mode */ }
  paintProgress(id);
}

function paintProgress(justDone) {
  const n = explored.size, total = PROJECTS.length;
  O('#progress-fill').style.width = `${(n / total) * 100}%`;
  O('#progress-count').textContent = `${n}/${total}`;
  O('.progress-track').setAttribute('aria-valuenow', n);
  for (const card of A('.project-card')) {
    card.classList.toggle('is-done', explored.has(card.dataset.id));
    if (card.dataset.id === justDone) { card.classList.remove('just-done'); void card.offsetWidth; card.classList.add('just-done'); }
  }
}

/* ---------- Projects strip ---------- */

function buildStrip() {
  O('#project-list').innerHTML = PROJECTS.map((p, i) => `
    <li><button class="project-card" data-id="${p.id}" aria-label="${p.title}">
      <span class="pc-top"><span class="pc-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="pc-check"><svg viewBox="0 0 12 12"><path d="m2.5 6.2 2.3 2.3 4.7-5"/></svg></span></span>
      <svg class="pc-icon" viewBox="0 0 34 34">${p.icon}</svg>
      <b>${p.title}</b><small>${p.short}</small>
    </button></li>`).join('');
  O('#project-list').addEventListener('click', (e) => {
    const card = e.target.closest('.project-card');
    if (card) go(card.dataset.id);
  });
  // vertical wheel scrolls the strip sideways when it overflows
  const sc = O('.strip-scroll');
  sc.addEventListener('wheel', (e) => {
    if (sc.scrollWidth <= sc.clientWidth) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (d) { e.preventDefault(); sc.scrollLeft += d; }
  }, { passive: false });
}

/* ---------- Info card ---------- */

const linkRow = (href, ic, title, sub, ext = true) => `
  <a class="link-row" href="${href}" ${ext ? 'target="_blank" rel="noopener noreferrer"' : ''}>
    ${icon(ic)}<span><b>${title}</b><small>${sub}</small></span>${icon('arrow', 'arrow')}</a>`;

const contactRows = () => `<div class="links-list">
  ${linkRow(`mailto:${EMAIL}`, 'mail', 'Email', EMAIL, false)}
  ${linkRow(LINKEDIN, 'linkedin', 'LinkedIn', 'linkedin.com/in/jason-slim-676800229')}
  ${linkRow(GITHUB, 'github', 'GitHub', 'github.com/Jasonstevia')}
  ${linkRow(CV, 'file', 'Download CV', 'Jason_Slim_CV.pdf')}
</div>`;

const timelineHtml = (items) => `<ul class="timeline">${items.map((e) => `
  <li class="${e.edu ? 'is-edu' : ''}"><time>${e.when}</time><b>${e.title}</b><em>${e.org}</em>${e.text ? `<p>${e.text}</p>` : ''}</li>`).join('')}</ul>`;

const skillsHtml = () => SKILLS.map(([g, list], i) => `<div class="stack-group"><span>${g}</span><div class="chips">${list.map((s) => `<span class="chip${i === 1 ? ' is-teal' : ''}">${s}</span>`).join('')}</div></div>`).join('');

const featureList = (items) => `<ul class="features">${items.map(([ic, t]) => `<li class="feature">${icon(ic)}<span>${t}</span></li>`).join('')}</ul>`;

function infoTabs(p) {
  if (p === HOME) {
    return [
      ['About', () => `<p class="info-kicker">${PROFILE.role}<span class="sep">·</span>Beirut</p><h3>${PROFILE.name}</h3><p class="info-lede">${PROFILE.lede}</p>${featureList(PROFILE.focus)}`],
      ['Experience', () => timelineHtml(EXPERIENCE)],
      ['Skills', skillsHtml],
      ['Contact', () => `${contactRows()}<p class="note">Open to AI engineering roles and founding-team conversations.</p>`],
    ];
  }
  return [
    ['Overview', () => `<p class="info-kicker">${p.kicker[0]}<span class="sep">·</span>${p.kicker[1]}</p><h3>${p.title}</h3><p class="info-lede">${p.lede}</p>${featureList(p.features)}`],
    ['Stack', () => p.stack.map(([g, list], i) => `<div class="stack-group"><span>${g}</span><div class="chips">${list.map((s) => `<span class="chip${i === 0 ? ' is-teal' : ''}">${s}</span>`).join('')}</div></div>`).join('')],
    ['How it works', () => `<ol class="steps">${p.steps.map((s) => `<li><span>${s}</span></li>`).join('')}</ol>`],
    ['Links', () => `<div class="links-list">
        ${p.repo ? linkRow(p.repo, 'github', 'Source code', p.repo.replace('https://', '')) : `<div class="link-row">${icon('lock')}<span><b>Source available on request</b><small>school / private repository</small></span></div>`}
        ${linkRow(`mailto:${EMAIL}?subject=${encodeURIComponent(`About ${p.title}`)}`, 'mail', 'Ask me about it', EMAIL, false)}
        ${p.repo ? '' : linkRow(GITHUB, 'github', 'More on GitHub', 'github.com/Jasonstevia')}
      </div>${p.venture ? `<p class="note">${p.venture}</p>` : ''}`],
  ];
}

function renderInfo(p, tabIndex = 0) {
  const tabs = infoTabs(p);
  O('#tabs').innerHTML = tabs.map(([name], i) => `<button role="tab" aria-selected="${i === tabIndex}" class="${i === tabIndex ? 'is-active' : ''}" data-i="${i}">${name}</button>`).join('');
  const content = O('#info-content');
  content.innerHTML = tabs[tabIndex][1]();
  content.style.animation = 'none'; void content.offsetWidth; content.style.animation = '';
  O('.info-body').scrollTop = 0;
}
O('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (b) renderInfo(current, Number(b.dataset.i));
});

/* ---------- Code card ---------- */

const KW = {
  python: 'def|return|if|else|elif|for|in|while|import|from|as|async|await|not|and|or|None|True|False|class|with|try|except',
  bash: 'if|then|fi|for|do|done|while|case|esac|function|export|local',
  c: 'int|char|void|double|float|return|if|else|while|for|struct|const|static|unsigned|sizeof|NULL|pid_t',
  javascript: 'function|const|let|var|return|if|else|for|of|in|while|async|await|new|class|import|export|from|null|true|false',
};
KW.typescript = `${KW.javascript}|type|interface|Promise|string|number`;

function highlight(src, lang) {
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const com = lang === 'python' || lang === 'bash' ? '#[^\\n]*' : '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/';
  const re = new RegExp(`(${com})|("(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\`(?:\\\\.|[^\`\\\\])*\`)|\\b(${KW[lang] || KW.javascript})\\b|\\b(\\d+(?:\\.\\d+)?)\\b|([A-Za-z_]\\w*)(?=\\()`, 'g');
  let out = '', last = 0, m;
  while ((m = re.exec(src))) {
    out += esc(src.slice(last, m.index));
    const cls = m[1] ? 'com' : m[2] ? 'str' : m[3] ? 'kw' : m[4] ? 'num' : 'fn';
    out += `<span class="tk-${cls}">${esc(m[0])}</span>`;
    last = re.lastIndex;
  }
  out += esc(src.slice(last));
  // wrap lines for the gutter (keeps spans intact since tokens never cross lines except block comments)
  return out.split('\n').map((l) => `<span class="ln">${l || ' '}</span>`).join('');
}

const codeCard = O('.code-card');
let consoleRun = null;

function renderCode(p) {
  consoleRun?.stop();
  codeCard.dataset.state = 'idle';
  O('.console-status').textContent = 'Idle';
  O('.console-lines').innerHTML = '';
  O('#code-lang').textContent = `${p.code.file} · simplified`;
  O('#code').innerHTML = highlight(p.code.src, p.code.lang);
  O('.code').scrollTop = 0;
}

async function runCode() {
  if (codeCard.dataset.state === 'running') return;
  consoleRun?.stop();
  consoleRun = createRunner();
  const r = consoleRun;
  const box = O('.console-lines');
  box.innerHTML = '';
  codeCard.dataset.state = 'running';
  O('.console-status').textContent = 'Running';
  if (current !== HOME) replay();
  try {
    for (const [cls, text] of current.code.output) {
      await r.sleep(380);
      const line = document.createElement('div');
      if (cls) line.className = cls;
      line.textContent = text.includes('{{otp}}') ? text.replace('{{otp}}', await totp()) : text;
      box.append(line);
      box.scrollTop = box.scrollHeight;
    }
    codeCard.dataset.state = 'done';
    O('.console-status').textContent = 'Done';
  } catch { /* stopped */ }
}
O('.btn-run').addEventListener('click', runCode);
O('.btn-copy').addEventListener('click', async (e) => {
  const btn = e.currentTarget;
  try { await navigator.clipboard.writeText(current.code.src); btn.classList.add('is-done'); setTimeout(() => btn.classList.remove('is-done'), 1200); } catch { /* blocked */ }
});

/* ---------- Stage: device + tags ---------- */

const device = O('#device');
const holder = O('#device-holder');
const stage = O('#stage');

function fitDevice() {
  if (phone) {
    // native size: the CSS under html.phone lays each mockup out for a narrow screen
    holder.style.removeProperty('--dev-h');
    device.style.transform = device.style.position = device.style.left = device.style.top = device.style.transformOrigin = '';
  } else if (compact) {
    const s = Math.min(1, holder.clientWidth / 880);
    holder.style.setProperty('--dev-h', `${Math.round(600 * s)}px`);
    device.style.transform = `scale(${s})`;
    device.style.position = 'absolute';
    device.style.left = `${(holder.clientWidth - 880 * s) / 2}px`;
    device.style.top = '0';
    device.style.transformOrigin = '0 0';
  } else {
    device.style.position = device.style.left = device.style.top = device.style.transformOrigin = '';
    const s = Math.min(holder.clientWidth / 880, holder.clientHeight / 600, 1.25);
    device.style.transform = `scale(${s})`;
  }
  refreshTags();
}

function mount(p) {
  runner?.stop();
  runner = createRunner();
  device.innerHTML = '';
  device.dataset.demo = p.id;
  O('#tags').innerHTML = (p.tags || []).map((t, i) => `<div class="tag" data-key="${t.key}"><b><i>${String(i + 1).padStart(2, '0')}</i>${t.label}</b><span>${t.text}</span></div>`).join('');
  O('#leaders').innerHTML = '';
  DEMOS[p.id](device, runner, { open: go, flyout: openFlyoutByName, refreshTags });
}

function replay() { if (current) mount(current); }

function refreshTags() {
  if (compact || !current) return;
  const sr = stage.getBoundingClientRect();
  const dr = device.getBoundingClientRect();
  const toLocal = (x, y) => [(x - sr.left) / scale, (y - sr.top) / scale];
  const tags = A('.tag', O('#tags'));
  const items = [];
  for (const tag of tags) {
    const target = device.querySelector(`[data-tag="${tag.dataset.key}"]`);
    const r = target?.getBoundingClientRect();
    if (!r || !r.width || !r.height) { tag.classList.remove('is-on'); continue; }
    const top = Math.max(r.top, dr.top + 4), bottom = Math.min(r.bottom, dr.bottom - 4);
    if (bottom - top < 4) { tag.classList.remove('is-on'); continue; }
    const [ax, ay] = toLocal(Math.max(r.left, dr.left) + 2, (top + bottom) / 2);
    items.push({ tag, ax, ay, h: tag.offsetHeight || 52 });
  }
  // stack tags near their targets without overlapping
  items.sort((a, b) => a.ay - b.ay);
  const maxY = O('#tags').offsetHeight;
  let y = 0;
  for (const it of items) { it.y = Math.max(it.ay - it.h / 2, y); y = it.y + it.h + 12; }
  for (let i = items.length - 1, lim = maxY; i >= 0; i--) { const it = items[i]; it.y = Math.min(it.y, lim - it.h); lim = it.y - 12; }
  let svg = '';
  for (const it of items) {
    it.tag.style.top = `${Math.round(it.y)}px`;
    it.tag.classList.add('is-on');
    const ty = it.y + it.h / 2;
    svg += `<path d="M160 ${ty}H174L${it.ax - 12} ${it.ay}H${it.ax}"/><circle cx="${it.ax}" cy="${it.ay}" r="3.5"/>`;
  }
  O('#leaders').innerHTML = svg;
}
setInterval(refreshTags, 450);

/* ---------- Sidebar + flyouts ---------- */

const flyout = O('#flyout');
let openNav = null;

const FLY = {
  projects: () => {
    const groups = [['AI & agents', ['structurai', 'fieldnote', 'ai-os', 'smartprompt', 'fin-extractor']], ['Full-stack', ['tweetcraft']], ['Systems & security', ['minishell', 'minirt', 'security']]];
    return `<h3>Projects</h3>${groups.map(([g, ids]) => `<div class="fly-group"><span>${g}</span>${ids.map((id) => {
      const i = PROJECTS.findIndex((p) => p.id === id), p = PROJECTS[i];
      return `<button class="fly-item${current?.id === id ? ' is-current' : ''}" data-go="${id}"><span class="num">${String(i + 1).padStart(2, '0')}</span><span><b>${p.title}</b><small>${p.kicker[1]}</small></span></button>`;
    }).join('')}</div>`).join('')}`;
  },
  experience: () => `<h3>Experience & education</h3>${timelineHtml(EXPERIENCE)}`,
  skills: () => `<h3>Skills</h3>${skillsHtml()}`,
  contact: () => `<h3>Get in touch</h3>${contactRows()}`,
};

function openFlyout(name, anchor) {
  if (openNav === name) return closeFlyout();
  openNav = name;
  A('.side-nav a').forEach((a) => a.classList.toggle('is-open', a.dataset.nav === name));
  flyout.innerHTML = FLY[name]();
  if (!compact) {
    const top = anchor.closest('li').offsetTop - 8;
    flyout.style.setProperty('--top', `${Math.max(16, Math.min(top, app.offsetHeight - flyout.offsetHeight - 20))}px`);
  }
  flyout.classList.add('is-open');
}
function openFlyoutByName(name) { openFlyout(name, O(`[data-nav="${name}"]`)); }
function closeFlyout() {
  openNav = null;
  flyout.classList.remove('is-open');
  A('.side-nav a').forEach((a) => a.classList.remove('is-open'));
}

A('[data-nav]').forEach((a) => a.addEventListener('click', (e) => {
  const nav = a.dataset.nav;
  if (nav === 'cv') return; // real link
  e.preventDefault();
  if (nav === 'home') { closeFlyout(); go('home'); } else openFlyout(nav, a);
}));
flyout.addEventListener('click', (e) => {
  const b = e.target.closest('[data-go]');
  if (b) { closeFlyout(); go(b.dataset.go); }
});
document.addEventListener('pointerdown', (e) => {
  if (openNav && !e.target.closest('.flyout') && !e.target.closest('[data-nav]')) closeFlyout();
});

/* ---------- Routing ---------- */

function go(id) {
  const hash = id === 'home' ? '' : `#/${id}`;
  if (location.hash !== hash) history.pushState(null, '', hash || location.pathname);
  show(id);
}

function show(id) {
  const p = PROJECTS.find((x) => x.id === id) || HOME;
  current = p;
  A('.project-card').forEach((c) => c.classList.toggle('is-active', c.dataset.id === p.id));
  A('.side-nav li').forEach((li) => li.classList.toggle('is-active', p === HOME && li.querySelector('[data-nav="home"]')));
  O(`.project-card[data-id="${p.id}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
  O('#demo-hint').innerHTML = p.hint;
  const repo = O('#demo-repo');
  repo.href = p.repo || GITHUB;
  repo.classList.toggle('is-private', p !== HOME && !p.repo);
  repo.querySelector('span').textContent = p === HOME ? 'GitHub' : p.repo ? 'View code' : 'Private repo';
  document.title = p === HOME ? 'Jason Slim — AI engineer & systems builder' : `${p.title} · Jason Slim`;
  renderInfo(p);
  renderCode(p);
  mount(p);
  if (p !== HOME) markExplored(p.id);
}

window.addEventListener('popstate', () => show(location.hash.replace('#/', '') || 'home'));

/* ---------- Keyboard ---------- */

document.addEventListener('keydown', (e) => {
  if (e.target.closest('input, textarea, select, [contenteditable]') || e.metaKey || e.ctrlKey || e.altKey) return;
  const ids = ['home', ...PROJECTS.map((p) => p.id)];
  const i = ids.indexOf(current?.id ?? 'home');
  if (e.key === 'ArrowRight') go(ids[(i + 1) % ids.length]);
  else if (e.key === 'ArrowLeft') go(ids[(i - 1 + ids.length) % ids.length]);
  else if (e.key === 'r' || e.key === 'R') replay();
  else if (e.key === ' ') { e.preventDefault(); runCode(); }
  else if (e.key === 'Escape') closeFlyout();
});

/* ---------- Boot ---------- */

async function boot() {
  const fill = O('.loader-fill'), step = O('.loader-step');
  fill.style.width = '30%';
  buildStrip();
  paintProgress();
  startClock();
  fit();
  window.addEventListener('resize', fit);
  new ResizeObserver(fitDevice).observe(holder);
  step.textContent = 'Loading fonts';
  fill.style.width = '65%';
  await Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 2500))]);
  fit();
  step.textContent = 'Starting demos';
  fill.style.width = '100%';
  show(location.hash.replace('#/', '') || 'home');
  await new Promise((r) => setTimeout(r, 450));
  O('#loader').classList.add('is-done');
  app.inert = false;
  app.removeAttribute('inert');
}

boot();
