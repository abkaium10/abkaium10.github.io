import { md } from './md';
const q1 = (s, r = document) => r.querySelector(s), qa = (s, r = document) => [...r.querySelectorAll(s)];
const ls = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch (e) {} };
const ACC = [['#4f46e5', '#8b97ff'], ['#047857', '#34d399'], ['#be123c', '#fb7185'], ['#b45309', '#fbbf24'], ['#0369a1', '#38bdf8']];
function toast(m) { let t = q1('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); } t.textContent = m; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2200); }
function accent(i) { if (i == null) i = ((+ls('acc') || 0) + 1) % ACC.length; ls('acc', i); const d = document.documentElement.style; d.setProperty('--acl', ACC[i][0]); d.setProperty('--acd', ACC[i][1]); }
function theme(ev) {
  const d = document.documentElement, c = d.dataset.theme || 'dark', n = c === 'dark' ? 'light' : 'dark';
  const apply = () => { d.dataset.theme = n; ls('theme', n); };
  if (!document.startViewTransition || matchMedia('(prefers-reduced-motion:reduce)').matches) return apply();
  const x = ev && ev.clientX != null ? ev.clientX : innerWidth / 2, y = ev && ev.clientY != null ? ev.clientY : 0, R = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
  document.startViewTransition(apply).ready.then(() => d.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${R}px at ${x}px ${y}px)`] }, { duration: 650, easing: 'ease-in', pseudoElement: '::view-transition-new(root)' })).catch(() => {});
}
const go = (id) => () => { const e = document.getElementById(id); e && e.scrollIntoView({ behavior: 'smooth' }); };
function palette(ctx) {
  const el = document.createElement('div'); el.className = 'pal hide'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', 'Command palette');
  el.innerHTML = '<div class="pbox"><input placeholder="Type a command or search" aria-label="Command palette"><ul role="listbox"></ul></div>'; document.body.appendChild(el);
  const inp = q1('input', el), ul = q1('ul', el); let items = [], sel = 0;
  const build = () => [...['about', 'skills', 'projects', 'experience', 'contact', 'terminal'].filter((s) => document.getElementById(s)).map((s) => ({ t: 'Go to ' + s, f: go(s) })),
    { t: 'Toggle light or dark theme', f: theme }, { t: 'Change accent color', f: () => accent() }, { t: 'Download CV as PDF', f: () => cv(ctx) }, { t: 'Play snake game', f: playGame }, { t: 'Toggle sound effects', f: toggleSnd }, { t: 'Cursor effect: spider, snake or off', f: cycleCursor }, { t: 'Keyboard shortcuts', f: () => window.__kbd && window.__kbd() }, ctx.PROFILE.email && { t: 'Download contact card (.vcf)', f: () => vcard(ctx) }, { t: 'Switch language: Bangla or English', f: () => window.__lang && window.__lang() }, { t: 'Accessibility options', f: () => { const b = q1('.a11y'); b && b.click(); } }, ctx.ESTIMATE && { t: 'Go to estimator', f: go('estbox') }, { t: 'Install as app', f: () => { window.__ip ? window.__ip.prompt() : toast('Use your browser menu and choose Install app'); } },
    ctx.PROFILE.email && { t: 'Copy email address', f: () => { try { navigator.clipboard.writeText(ctx.PROFILE.email); } catch (e) {} toast('Email: ' + ctx.PROFILE.email); } },
    ctx.PROFILE.github && { t: 'Open GitHub', f: () => window.open(ctx.PROFILE.github, '_blank', 'noopener') }, ctx.PROFILE.linkedin && { t: 'Open LinkedIn', f: () => window.open(ctx.PROFILE.linkedin, '_blank', 'noopener') },
    ...qa('#projects .card h3').map((h) => ({ t: 'Open project: ' + h.textContent, f: () => { go('projects')(); const b = q1('.btn.o', h.closest('.card')); b && b.click(); } }))];
  const draw = () => { const s = inp.value.toLowerCase(); items = build().filter((i) => i && fz(i.t, s)); sel = Math.min(sel, Math.max(items.length - 1, 0)); ul.innerHTML = items.map((it, i) => `<li role="option" aria-selected="${i === sel}" class="${i === sel ? 'on' : ''}" data-i="${i}">${it.t}</li>`).join('') || '<li class="mu">No results</li>'; };
  let prev; const show = () => { prev = document.activeElement; el.classList.remove('hide'); inp.value = ''; sel = 0; draw(); inp.focus(); }, close = () => { el.classList.add('hide'); if (prev && prev.focus) prev.focus(); };
  const run = (i) => { const it = items[i]; close(); it && it.f(); };
  inp.oninput = () => { sel = 0; draw(); };
  inp.onkeydown = (e) => { if (e.key === 'ArrowDown') { sel = (sel + 1) % items.length; draw(); e.preventDefault(); } else if (e.key === 'ArrowUp') { sel = (sel - 1 + items.length) % items.length; draw(); e.preventDefault(); } else if (e.key === 'Enter') run(sel); else if (e.key === 'Tab') e.preventDefault(); };
  ul.onclick = (e) => { const li = e.target.closest('li[data-i]'); li && run(+li.dataset.i); };
  el.onclick = (e) => { if (e.target === el) close(); };
  document.addEventListener('click', (e) => { if (e.target.closest('#kbtn')) show(); });
  document.addEventListener('keydown', (e) => {
    const typing = /INPUT|TEXTAREA/.test(document.activeElement.tagName);
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); el.classList.contains('hide') ? show() : close(); }
    else if (e.key === '/' && !typing) { e.preventDefault(); show(); }
    else if (e.key === 'Escape') { if (!el.classList.contains('hide')) close(); else { const m = q1('.modal:not(.hide)'); m && m.click(); } }
  });
}
function term(ctx) {
  const root = document.getElementById('term'); if (!root) return;
  root.innerHTML = '<div class="term"><div class="tbar"><i></i><i></i><i></i><span>kaium@portfolio: ~</span></div><div class="tout" aria-live="polite"></div><div class="tchips"></div><label class="tin"><span>$</span><input autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="Terminal command" placeholder="type a command or tap one above"></label></div>';
  const T = q1('.term', root), out = q1('.tout', root), inp = q1('input', root), chips = q1('.tchips', root), P = ctx.PROFILE, hist = []; let hi = 0;
  const say = (t, c) => { const d = document.createElement('div'); d.className = c || ''; d.textContent = t; out.appendChild(d); out.scrollTop = out.scrollHeight; };
  const projs = () => qa('#projects .card h3');
  const C = {
    help: () => say('commands: ' + Object.keys(C).join(', ')),
    about: () => say(P.name + ': ' + P.role + '. ' + P.bio), whoami: () => say('a curious visitor. welcome!'),
    skills: () => Object.entries(ctx.SKILLS).forEach(([k, v]) => say(k + ': ' + v.join(', '))),
    projects: () => { const h = projs().map((x) => '- ' + x.textContent); say(h.length ? h.join('\n') + "\ntip: type 'open <name>'" : 'no projects yet'); },
    open: (a) => { const t = a.join(' '), h = projs().find((x) => x.textContent.toLowerCase().includes(t)); if (!t || !h) return say(t ? 'no project matches: ' + t : 'usage: open <project name>', 'err'); say('opening ' + h.textContent + '...', 'ok'); go('projects')(); const b = q1('.btn.o', h.closest('.card')); b && b.click(); },
    contact: () => say([P.email, P.github, P.linkedin].filter(Boolean).join('\n') || 'No contact details have been added yet.'),
    github: () => { if (!P.github) return say('no GitHub link configured yet', 'err'); say('opening github...', 'ok'); window.open(P.github, '_blank', 'noopener'); }, linkedin: () => { if (!P.linkedin) return say('no LinkedIn link configured yet', 'err'); say('opening linkedin...', 'ok'); window.open(P.linkedin, '_blank', 'noopener'); },
    theme: () => { theme(); say('theme switched', 'ok'); }, accent: () => { accent(); say('accent color changed', 'ok'); },
    date: () => say(new Date().toString()),
    cursor: () => say('cursor effect: ' + cycleCursor(), 'ok'),
    blog: async () => { const ps = ctx.loadPosts ? await ctx.loadPosts(false) : []; say(ps.length ? ps.map((p) => '- ' + p.date + '  ' + p.title).join('\n') : 'No articles published yet.'); },
    visit: (a) => { const t = a.join(' '), h = projs().find((x) => x.textContent.toLowerCase().includes(t)); if (!t || !h) return say(t ? 'no project matches: ' + t : 'usage: visit <project name>', 'err'); const l = q1('.pfoot .go', h.closest('.card')); if (!l) return say('no case study page for that project', 'err'); say('opening ' + h.textContent + '...', 'ok'); location.href = l.getAttribute('href'); },
    experience: () => say((ctx.EXPERIENCE || []).length ? ctx.EXPERIENCE.map((x) => x.y + ': ' + x.t + ', ' + x.o).join('\n') : 'No experience has been added yet.'),
    resume: () => { if (!ctx.CV_AVAILABLE) { say('No attachment: no CV PDF is included. Upload your actual CV as public/cv.pdf and rebuild the site.', 'mid'); return; } say('Opening your attached CV PDF.', 'ok'); cv(ctx); }, language: () => { window.__lang && window.__lang(); say('language switched', 'ok'); },
    neofetch: () => say(P.name + '@portfolio\n----------------\nrole:     ' + P.role + '\nstack:    ' + Object.values(ctx.SKILLS).flat().length + ' technologies\nprojects: ' + projs().length + '\ntheme:    ' + (document.documentElement.dataset.theme || 'auto')),
    play: () => { say('launching snake. Good luck!', 'ok'); playGame(); }, cv: () => { if (!ctx.CV_AVAILABLE) { say('No attachment: no CV PDF is included in this project. Upload your actual CV as public/cv.pdf and rebuild the site.', 'mid'); return; } say('Opening your attached CV PDF.', 'ok'); cv(ctx); },
    clear: () => { out.innerHTML = ''; },
    'sudo hire-me': () => { if (!P.email) return say('no email address configured yet', 'err'); say('permission granted. opening your email app...', 'ok'); try { navigator.clipboard.writeText(P.email); } catch (e) {} toast('Email copied: ' + P.email); setTimeout(() => { location.href = 'mailto:' + P.email + '?subject=Let%27s%20work%20together'; }, 800); },
  };
  const has = (k) => Object.prototype.hasOwnProperty.call(C, k);
  const run = (v) => {
    v = v.trim(); if (!v) return; hist.push(v); hi = hist.length; say('$ ' + v, 'cmd');
    const l = v.toLowerCase(), [n, ...a] = l.split(/\s+/), k = has(l) ? l : n;
    if (has(k)) C[k](a); else { const s = Object.keys(C).find((x) => x.startsWith(n)); say('command not found: ' + n + (s ? ". Did you mean '" + s + "'?" : ". Try 'help'"), 'err'); }
  };
  ['help', 'about', 'skills', 'projects', 'contact', 'neofetch', 'play', 'cv', 'theme', 'sudo hire-me'].forEach((k) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = k; b.onclick = (ev) => { ev.stopPropagation(); run(k); }; chips.appendChild(b); });
  T.onclick = () => { if (!String(getSelection())) inp.focus({ preventScroll: true }); };
  inp.onkeydown = (e) => {
    if (e.key === 'Enter') { const v = inp.value; inp.value = ''; run(v); }
    else if (e.key === 'Tab') { e.preventDefault(); const m = Object.keys(C).filter((x) => x.startsWith(inp.value.toLowerCase())); if (inp.value && m.length === 1) inp.value = m[0]; }
    else if (e.key === 'ArrowUp' && hist.length) { hi = Math.max(0, hi - 1); inp.value = hist[hi]; e.preventDefault(); }
    else if (e.key === 'ArrowDown') { hi = Math.min(hist.length, hi + 1); inp.value = hist[hi] || ''; e.preventDefault(); }
    e.stopPropagation();
  };
  say('Hi, I am ' + P.name + "'s terminal. Click anywhere here and type 'help'. Tab autocompletes.");
}
function fx() {
  document.addEventListener('mousemove', (e) => {
    const c = e.target.closest && e.target.closest('.card');
    if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px'); c.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 10 + 'deg'); c.style.setProperty('--rx', (.5 - (e.clientY - r.top) / r.height) * 10 + 'deg'); }
    const b = e.target.closest && e.target.closest('.hero .btn,.cta .btn');
    if (b) { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .2}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; }
  });
  document.addEventListener('mouseout', (e) => { const c = e.target.closest && e.target.closest('.card,.btn'); if (c && !c.contains(e.relatedTarget)) { c.style.removeProperty('--rx'); c.style.removeProperty('--ry'); if (c.classList.contains('btn')) c.style.transform = ''; } });
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); const hh = e.target.querySelector('h2'); if (hh && !matchMedia('(prefers-reduced-motion:reduce)').matches) scramble(hh); } }), { threshold: .08 });
  qa('.sec').forEach((s) => { s.classList.add('rv'); io.observe(s); });
  const sp = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) qa('.nl').forEach((a) => a.classList.toggle('act', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  qa('section[id]').forEach((s) => sp.observe(s));
  const tp = document.createElement('button'); tp.className = 'btn o top'; tp.textContent = '↑'; tp.setAttribute('aria-label', 'Back to top'); tp.onclick = () => scrollTo({ top: 0, behavior: 'smooth' }); document.body.appendChild(tp);
  addEventListener('scroll', () => { tp.classList.toggle('show', scrollY > 600); const nv = q1('.nav'); if (nv) nv.classList.toggle('scrolled', scrollY > 8); });
  const t = q1('.tst'); if (t) {
    const qs = qa('.q', t), d = document.createElement('div'); d.className = 'dots'; t.after(d); let i = 0;
    const show = (n) => { i = n; qs.forEach((x, j) => x.classList.toggle('on', j === n)); qa('button', d).forEach((b, j) => b.classList.toggle('on', j === n)); };
    qs.forEach((_, j) => { const b = document.createElement('button'); b.setAttribute('aria-label', 'Testimonial ' + (j + 1)); b.onclick = () => show(j); d.appendChild(b); });
    show(0); setInterval(() => show((i + 1) % qs.length), 5500);
  }
}
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function scramble(el) { if (document.documentElement.lang === 'bn') return; const t = el.dataset.t || (el.dataset.t = el.textContent), L = 'abcdefghijklmnopqrstuvwxyz'; let i = 0; const id = setInterval(() => { el.textContent = [...t].map((c, k) => (k < i || c === ' ' ? c : L[Math.random() * 26 | 0])).join(''); if (i++ >= t.length) { clearInterval(id); el.textContent = t; } }, 28); }
function intro(ctx) {
  try { if (sessionStorage.getItem('intro') || matchMedia('(prefers-reduced-motion:reduce)').matches) return; sessionStorage.setItem('intro', '1'); } catch (e) {}
  const el = document.createElement('div'); el.className = 'intro';
  el.innerHTML = '<div>' + [...ctx.PROFILE.name].map((ch, i) => `<span style="animation-delay:${i * 70}ms">${ch === ' ' ? '&nbsp;' : esc(ch)}</span>`).join('') + '</div>';
  document.body.appendChild(el); setTimeout(() => el.classList.add('out'), 1600); setTimeout(() => el.remove(), 2500);
}
async function gh(ctx) {
  const box = document.getElementById('gh'); if (!box) return;
  const u = (ctx.PROFILE.github.match(/github\.com\/([^/?#]+)/) || [])[1]; if (!u) return;
  const card = (x) => `<a class="card rp" href="${esc(x.url)}" target="_blank" rel="noopener noreferrer"><div><h3>${esc(x.name)}</h3><p class="mu">${esc(x.description || 'No description yet')}</p><p class="tags"><span>${esc(x.language || 'Code')}</span><span>★ ${esc(x.stars)}</span><span>${esc(x.forks)} forks</span></p></div></a>`;
  const show = (repos, note) => { box.innerHTML = repos.map(card).join(''); box.closest('section').classList.remove('hide'); box.insertAdjacentHTML('afterend', `<p class="mu" style="margin-top:14px;font-size:.85rem">${esc(note)}</p>`); };
  try { const r = await fetch((ctx.base || '') + '/data/github.json'); if (r.ok) { const s = await r.json(); if (s.ok && s.repos && s.repos.length) { show(s.repos, `Snapshot of public repositories taken at build time, ${new Date(s.generatedAt).toLocaleString()}. Counts can lag behind GitHub.`); return; } } } catch (e) {}
  try {
    const r = await fetch(`https://api.github.com/users/${u}/repos?sort=pushed&per_page=30`); if (!r.ok) return;
    const l = (await r.json()).filter((x) => !x.fork).sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6).map((x) => ({ name: x.name, description: x.description, url: x.html_url, language: x.language, stars: x.stargazers_count, forks: x.forks_count }));
    if (l.length) show(l, `Public data from the GitHub API, retrieved ${new Date().toLocaleString()}. Counts can lag behind GitHub.`);
  } catch (e) {}
}
function extras(ctx) {
  const h1 = q1('.hero h1');
  const kh = q1('.nkbd'); if (kh) kh.textContent = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent || '') ? '⌘K' : 'Ctrl K';
  if (h1 && matchMedia('(pointer:fine)').matches) document.addEventListener('mousemove', (e) => { const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5; h1.style.transform = `translate(${x * -14}px,${y * -8}px)`; h1.style.textShadow = `${x * 12}px ${y * 8}px 34px var(--gl)`; });
  const tm = q1('[data-time]'), tz = ctx.PROFILE.timezone; if (tm && tz) { const u = () => { try { tm.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit' }) + (ctx.PROFILE.location ? ' in ' + ctx.PROFILE.location : ''); } catch (er) { tm.textContent = ''; } }; u(); setInterval(u, 30000); }
  const nv = document.createElement('nav'); nv.className = 'sdots'; nv.setAttribute('aria-label', 'Sections');
  qa('section[id]').filter((s) => !s.classList.contains('hide')).forEach((s) => { const a = document.createElement('a'); a.href = '#' + s.id; a.dataset.id = s.id; a.innerHTML = '<span>' + s.id + '</span>'; nv.appendChild(a); });
  document.body.appendChild(nv);
  const KON = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a']; let ki = 0;
  document.addEventListener('keydown', (e) => { const k = e.key.toLowerCase(); ki = k === KON[ki] ? ki + 1 : (k === KON[0] ? 1 : 0); if (ki === KON.length) { ki = 0; toast('Konami code unlocked'); playGame(); } });
  const so = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) qa('a', nv).forEach((a) => a.classList.toggle('on', a.dataset.id === e.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  qa('section[id]').forEach((s) => so.observe(s));
  document.addEventListener('click', (e) => {
    const cp = e.target.closest('[data-copy]'); if (cp) { track('Copy email'); try { navigator.clipboard.writeText(cp.dataset.copy); toast('Copied: ' + cp.dataset.copy); } catch (er) { toast(cp.dataset.copy); } return; }
    if (e.target.closest('[data-cv]')) { e.preventDefault(); cv(ctx); return; }
    if (e.target.closest('#th')) { theme(e); return; }
    const c = e.target.closest('#skills .chip'); if (!c) return;
    const n = c.lastChild.textContent.trim(), b = qa('#projects .tabs button').find((x) => x.textContent.trim().toLowerCase() === n.toLowerCase());
    if (b) { b.click(); go('projects')(); toast('Projects using ' + n); } else toast('No project uses ' + n + ' yet');
  });
}
let G;
function playGame() {
  if (!G) {
    const el = document.createElement('div'); el.className = 'modal gm hide';
    el.innerHTML = '<div class="pane"><h2>Snake</h2><p class="mu">Arrow keys or WASD, swipe on touch. Score <b class="sc">0</b>, best <b class="bs">0</b>. Esc closes.</p><canvas width="400" height="400"></canvas></div>';
    document.body.appendChild(el);
    const cvs = q1('canvas', el), g = cvs.getContext('2d'), N = 20; let s, d, nd, f, sc, id, over;
    const best = () => +ls('best') || 0, set = (k, v) => { q1(k, el).textContent = v; };
    const food = () => { do { f = { x: Math.random() * N | 0, y: Math.random() * N | 0 }; } while (s.some((p) => p.x === f.x && p.y === f.y)); };
    const reset = () => { s = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]; d = nd = { x: 1, y: 0 }; sc = 0; over = false; food(); set('.sc', 0); set('.bs', best()); };
    const tick = () => {
      if (!over) {
        d = nd; const h = { x: (s[0].x + d.x + N) % N, y: (s[0].y + d.y + N) % N };
        if (s.some((p) => p.x === h.x && p.y === h.y)) { over = true; if (sc > best()) { ls('best', sc); set('.bs', sc); } }
        else { s.unshift(h); if (h.x === f.x && h.y === f.y) { sc++; set('.sc', sc); food(); } else s.pop(); }
      }
      g.fillStyle = '#0b0d14'; g.fillRect(0, 0, 400, 400);
      g.fillStyle = '#ff4d6d'; g.beginPath(); g.arc(f.x * 20 + 10, f.y * 20 + 10, 6, 0, 6.283); g.fill();
      g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim() || '#4f46e5';
      s.forEach((p, i) => { g.globalAlpha = 1 - i / (s.length + 8); g.fillRect(p.x * 20 + 1, p.y * 20 + 1, 18, 18); }); g.globalAlpha = 1;
      if (over) { g.fillStyle = '#fff'; g.font = '20px sans-serif'; g.textAlign = 'center'; g.fillText('Game over. Press Enter', 200, 205); }
    };
    const dir = (x, y) => { if ((!x && !y) || (x === -d.x && y === -d.y)) return; nd = { x, y }; };
    const M = { arrowup: [0, -1], w: [0, -1], arrowdown: [0, 1], s: [0, 1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
    document.addEventListener('keydown', (e) => { if (el.classList.contains('hide')) return; const k = e.key.toLowerCase(); if (M[k]) { e.preventDefault(); dir(...M[k]); } else if (k === 'enter' && over) reset(); });
    let tx, ty; cvs.addEventListener('touchstart', (e) => { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }, { passive: true });
    cvs.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty; Math.abs(dx) > Math.abs(dy) ? dir(Math.sign(dx), 0) : dir(0, Math.sign(dy)); });
    el.onclick = (e) => { if (e.target === el) { el.classList.add('hide'); clearInterval(id); } };
    G = () => { el.classList.remove('hide'); reset(); clearInterval(id); id = setInterval(tick, 110); };
  }
  if (document.activeElement) document.activeElement.blur();
  G();
}
function cv(ctx) {
  track('CV download');
  if (!ctx.CV_AVAILABLE) {
    toast('No attachment: upload your CV PDF as public/cv.pdf and rebuild the site.');
    return false;
  }
  const href = (ctx.BASE_PATH || '') + '/cv.pdf';
  window.open(href, '_blank', 'noopener,noreferrer');
  return true;
}

function net() {
  const hero = q1('.hero'); if (!hero || matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const c = document.createElement('canvas'); c.className = 'net'; c.setAttribute('aria-hidden', 'true'); hero.prepend(c);
  const g = c.getContext('2d'); let W, H, vis = true, mx = -999, my = -999, col = '#4f46e5', f = 0, P = [];
  const fit = () => { const r = hero.getBoundingClientRect(), D = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = r.height; c.width = W * D; c.height = H * D; g.setTransform(D, 0, 0, D, 0, 0); P = Array.from({ length: Math.min(70, W * H / 15000 | 0) }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 })); };
  fit(); addEventListener('resize', fit);
  new IntersectionObserver((es) => { vis = es[0].isIntersecting; }).observe(hero);
  document.addEventListener('mousemove', (e) => { const r = c.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  (function loop() {
    if (vis) {
      if (++f % 60 === 1) col = getComputedStyle(document.documentElement).getPropertyValue('--ac').trim() || col;
      g.clearRect(0, 0, W, H); g.strokeStyle = col; g.fillStyle = col;
      P.forEach((p, i) => {
        const dx = p.x - mx, dy = p.y - my, d = Math.hypot(dx, dy) || 1; if (d < 140) { p.x += dx / d * .6; p.y += dy / d * .6; }
        p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        g.globalAlpha = .5; g.beginPath(); g.arc(p.x, p.y, 1.6, 0, 6.283); g.fill();
        for (let j = i + 1; j < P.length; j++) { const q = P[j], l = Math.hypot(p.x - q.x, p.y - q.y); if (l < 120) { g.globalAlpha = (1 - l / 120) * .35; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(q.x, q.y); g.stroke(); } }
        if (d < 170) { g.globalAlpha = (1 - d / 170) * .6; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(mx, my); g.stroke(); }
      });
    }
    requestAnimationFrame(loop);
  })();
}
function editor(ctx) {
  const root = document.getElementById('editor'); if (!root || !ctx.CODE) return;
  root.innerHTML = '<div class="ed"><div class="etabs"></div><pre><code></code></pre></div>';
  const tabs = q1('.etabs', root), code = q1('code', root), step = matchMedia('(prefers-reduced-motion:reduce)').matches ? 1e6 : 5; let cur = 0, tm;
  const RX = /(\/\/.*)|('[^'\n]*'|&quot;[^\n]*?&quot;|`[^`]*`)|\b(import|from|export|async|await|const|let|return|function|new|model|default|if|else|true|false|null)\b|(@\w+|\b\d+\b)/g;
  const hl = (t) => esc(t).replace(RX, (m, c, s, k) => c ? `<i class="c">${m}</i>` : s ? `<i class="s">${m}</i>` : k ? `<i class="k">${m}</i>` : `<i class="n">${m}</i>`);
  const show = (i) => { cur = i; clearInterval(tm); qa('button.t', tabs).forEach((b, j) => b.classList.toggle('on', j === i)); const t = ctx.CODE[i].c; let n = 0; tm = setInterval(() => { n += step; code.innerHTML = hl(t.slice(0, n)) + (n < t.length ? '<span class="caret2"></span>' : ''); if (n >= t.length) clearInterval(tm); }, 16); };
  ctx.CODE.forEach((x, i) => { const b = document.createElement('button'); b.className = 't'; b.type = 'button'; b.textContent = x.f; b.onclick = () => show(i); tabs.appendChild(b); });
  const cp = document.createElement('button'); cp.className = 'ecopy'; cp.type = 'button'; cp.textContent = 'Copy'; cp.onclick = () => { try { navigator.clipboard.writeText(ctx.CODE[cur].c); } catch (e) {} toast('Code copied'); }; tabs.appendChild(cp);
  let started = false; new IntersectionObserver((es) => { if (es[0].isIntersecting && !started) { started = true; show(0); } }, { threshold: .3 }).observe(root);
}
const fz = (t, s) => { let i = 0; for (const c of t.toLowerCase()) if (c === s[i]) i++; return i >= s.length; };
let AC, snd = ls('snd') === '1';
function beep(f, ms = 60, v = .04) { if (!snd) return; try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + ms / 1000); o.connect(g); g.connect(AC.destination); o.start(); o.stop(t + ms / 1000); } catch (e) {} }
function toggleSnd() { snd = !snd; ls('snd', snd ? '1' : '0'); toast('Sound effects ' + (snd ? 'on' : 'off')); beep(660); }
function sfx() {
  let last;
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.btn,a,.chip,.tchips button')) beep(520, 55); });
  document.addEventListener('mouseover', (e) => { const c = e.target.closest && e.target.closest('.card,.btn'); if (c && c !== last && !c.contains(e.relatedTarget)) { last = c; beep(c.classList.contains('card') ? 660 : 880, 35, .02); } });
  document.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') return; const r = document.createElement('span'); r.className = 'rip'; r.style.left = e.clientX + 'px'; r.style.top = e.clientY + 'px'; document.body.appendChild(r); setTimeout(() => r.remove(), 700); });
}
function pwa(ctx) {
  addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); window.__ip = e; });
  if (ctx.sw && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register((ctx.base || '') + '/sw.js').then((reg) => { reg.addEventListener('updatefound', () => { const w = reg.installing; w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) toast('A new version is available. Refresh to update.'); }); }); }).catch(() => {});
}
function radar(ctx) {
  const root = document.getElementById('radar'); if (!root || !ctx.LEVELS || !ctx.LEVELS.length) return;
  const L = ctx.LEVELS, n = L.length, R = 120, C = 160, pt = (i, r) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; return [C + Math.cos(a) * r, C + Math.sin(a) * r]; };
  const ring = (f) => L.map((_, i) => pt(i, R * f).join(',')).join(' ');
  root.innerHTML = `<div class="rwrap"><h3 class="rh">Skill levels</h3><svg viewBox="0 0 320 320" role="img" aria-label="Skill levels radar chart">${[.25, .5, .75, 1].map((f) => `<polygon class="rg" points="${ring(f)}"/>`).join('')}${L.map((x, i) => { const [a, b] = pt(i, R), [lx, ly] = pt(i, R + 22); return `<line class="rg" x1="${C}" y1="${C}" x2="${a}" y2="${b}"/><text class="rt" x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="middle">${esc(x.k)}</text>`; }).join('')}<polygon class="rpoly" points="${L.map((x, i) => pt(i, R * x.v / 100).join(',')).join(' ')}"/>${L.map((x, i) => { const [a, b] = pt(i, R * x.v / 100); return `<circle class="rd" cx="${a}" cy="${b}" r="5"><title>${esc(x.k)}: ${x.v}%</title></circle>`; }).join('')}</svg><ul class="rbars">${L.map((x) => `<li><span>${esc(x.k)}</span><b>${x.v}%</b><i style="--w:${x.v}%"></i></li>`).join('')}</ul></div>`;
}
const bslug = (p) => p.slug || String(p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'p-' + p.id;
async function blog(ctx) {
  const box = document.getElementById('posts'); if (!box || !ctx.loadPosts) return;
  const posts = (await ctx.loadPosts(location.search.includes('preview'))).sort((a, b) => String(b.date).localeCompare(String(a.date))); if (!posts.length) return;
  const sec = box.closest('section'); sec.classList.remove('hide');
  const mins = (t) => Math.max(1, Math.round(t.split(/\s+/).length / 200)), PAGE = 6, tags = ['All', ...new Set(posts.flatMap((p) => p.tags || []))];
  let q = '', tag = 'All', shown = PAGE;
  box.insertAdjacentHTML('beforebegin', `<div class="bctl"><input id="bq" placeholder="Search articles" aria-label="Search articles">${tags.length > 1 ? `<div class="tabs" id="bt">${tags.map((t) => `<button type="button" class="btn o${t === 'All' ? ' on' : ''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>` : ''}</div>`);
  box.insertAdjacentHTML('afterend', '<p class="row"><button type="button" class="btn o hide" id="bm">Load more</button><span class="mu" id="bn" role="status" aria-live="polite"></span></p>');
  const list = () => posts.filter((p) => (tag === 'All' || (p.tags || []).includes(tag)) && (p.title + ' ' + (p.excerpt || '') + ' ' + p.body).toLowerCase().includes(q.toLowerCase()));
  const draw = () => {
    const l = list(), v = l.slice(0, shown);
    box.innerHTML = v.map((p) => `<article class="card post" tabindex="0" data-id="${esc(p.id)}"><div><p class="mu">${esc(p.date)} | ${mins(p.body)} min read</p><h3>${esc(p.title)}</h3><p class="mu">${esc(p.excerpt || p.body.slice(0, 110) + '...')}</p><p class="tags">${(p.tags || []).map((t) => `<span>${esc(t)}</span>`).join('')}</p></div></article>`).join('') || '<p class="mu">No articles match your search. <button type="button" class="btn o" id="br">Reset filters</button></p>';
    q1('#bm').classList.toggle('hide', l.length <= shown); q1('#bn').textContent = l.length ? `Showing ${v.length} of ${l.length}` : '';
    qa('#bt button').forEach((b) => { b.classList.toggle('on', b.dataset.t === tag); b.setAttribute('aria-pressed', b.dataset.t === tag); });
  };
  const open = (id) => {
    const i = posts.findIndex((x) => String(x.id) === String(id)); if (i < 0) return; const p = posts[i];
    const rel = posts.filter((x) => x.id !== p.id && (x.tags || []).some((t) => (p.tags || []).includes(t))).slice(0, 2);
    const m = document.createElement('div'); m.className = 'modal'; track('Read: ' + p.title);
    m.innerHTML = `<div class="pbar"></div><div class="pane md"><p class="mu">${esc(p.date)} | ${mins(p.body)} min read</p><h2>${esc(p.title)}</h2><div class="toc"></div>${md(p.body)}${p.sources && p.sources.length ? '<h3>Further reading</h3><ul class="article-sources">' + p.sources.map((s) => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)} ↗</a></li>`).join('') + '</ul>' : ''}${rel.length ? '<h3 id="rel-h">Related articles</h3><p class="row">' + rel.map((x) => `<button type="button" class="btn o" data-rel="${esc(x.id)}">${esc(x.title)}</button>`).join('') + '</p>' : ''}<div class="row pf"><button class="btn o" type="button" data-share>Share</button><button class="btn o" type="button" data-next>Next post</button><button class="btn o" type="button" data-x>Close</button></div></div>`;
    const hs = qa('h3:not(#rel-h),h4', m); hs.forEach((h, k) => { h.id = 'h' + k; });
    if (hs.length > 1) q1('.toc', m).innerHTML = '<b>In this post</b>' + hs.map((h) => `<a href="#${h.id}">${esc(h.textContent)}</a>`).join('');
    qa('pre', m).forEach((pre) => { const txt = pre.textContent, b = document.createElement('button'); b.type = 'button'; b.className = 'cpb'; b.textContent = 'Copy'; b.setAttribute('aria-label', 'Copy code'); b.onclick = () => { try { navigator.clipboard.writeText(txt); } catch (er) {} b.textContent = 'Copied'; toast('Code copied'); setTimeout(() => { b.textContent = 'Copy'; }, 1500); }; pre.appendChild(b); });
    const close = () => { m.remove(); try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {} };
    m.onscroll = () => { q1('.pbar', m).style.width = 100 * m.scrollTop / ((m.scrollHeight - m.clientHeight) || 1) + '%'; };
    m.onclick = (e) => {
      const a = e.target.closest('.toc a'); if (a) { e.preventDefault(); q1(a.getAttribute('href'), m).scrollIntoView({ behavior: 'smooth' }); return; }
      const r = e.target.closest('[data-rel]'); if (r) { m.remove(); open(r.dataset.rel); return; }
      if (e.target.closest('[data-share]')) { const u = location.origin + location.pathname + '#post-' + p.id; if (navigator.share) navigator.share({ title: p.title, url: u }).catch(() => {}); else { try { navigator.clipboard.writeText(u); } catch (er) {} toast('Link copied'); } return; }
      if (e.target.closest('[data-next]')) { m.remove(); open(posts[(i + 1) % posts.length].id); return; }
      if (e.target === m || e.target.closest('[data-x]')) close();
    };
    document.body.appendChild(m); try { history.replaceState(null, '', '#post-' + p.id); } catch (e) {} trap(m, p.title);
  };
  sec.addEventListener('click', (e) => {
    const t = e.target.closest('#bt button'); if (t) { tag = t.dataset.t; shown = PAGE; draw(); return; }
    if (e.target.closest('#bm')) { shown += PAGE; draw(); return; }
    if (e.target.closest('#br')) { q = ''; tag = 'All'; shown = PAGE; q1('#bq').value = ''; draw(); return; }
    const c = e.target.closest('[data-id]'); if (c) open(c.dataset.id);
  });
  sec.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const c = e.target.closest('[data-id]'); if (c) open(c.dataset.id); } });
  q1('#bq').oninput = (e) => { q = e.target.value; shown = PAGE; draw(); };
  draw();
  const dl = location.hash.match(/^#post-(.+)/); if (dl) open(dl[1]);
}
function i18n(ctx) {
  const map = { ...(ctx.BN || {}) };
  [ctx.SERVICES, ctx.PROCESS, ctx.EXPERIENCE, ctx.TESTIMONIALS].forEach((a) => (a || []).forEach((x) => x.bn && Object.keys(x.bn).forEach((k) => { map[x[k]] = x.bn[k]; })));
  if (ctx.PROFILE.bn) map[ctx.PROFILE.bio] = ctx.PROFILE.bn.bio;
  const rev = {}; Object.keys(map).forEach((k) => { rev[map[k]] = k; });
  let bn = ls('lang') === 'bn';
  const tr = (s, m) => { const core = s.trim().replace(/^“|”$/g, ''); if (!core) return s; if (m[core]) return s.replace(core, () => m[core]); if (core.includes(', ')) return s.replace(core, () => core.split(', ').map((p) => m[p] || p).join(', ')); return s; };
  const run = (root, m) => {
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let n;
    while ((n = w.nextNode())) { if (n.parentElement && n.parentElement.closest('script,style,.term,.ed,#cv')) continue; const v = tr(n.nodeValue, m); if (v !== n.nodeValue) n.nodeValue = v; }
    qa('[placeholder],[aria-label]', root.nodeType === 1 ? root : document).forEach((el) => ['placeholder', 'aria-label'].forEach((a) => { const t = el.getAttribute(a); if (t && m[t]) el.setAttribute(a, m[t]); }));
  };
  const set = (v) => { bn = v; ls('lang', v ? 'bn' : 'en'); document.documentElement.lang = v ? 'bn' : 'en'; run(document.body, bn ? map : rev); const b = q1('#lang'); if (b) b.setAttribute('aria-pressed', String(v)); };
  new MutationObserver((ms) => { if (!bn) return; ms.forEach((m) => m.addedNodes.forEach((n) => { if (n.nodeType === 1) run(n, map); else if (n.nodeType === 3 && n.parentElement) run(n.parentElement, map); })); }).observe(document.body, { childList: true, subtree: true });
  window.__lang = () => set(!bn);
  document.addEventListener('click', (e) => { if (e.target.closest('#lang')) window.__lang(); });
  if (bn) set(true);
}
const track = (n) => { try { window.plausible && window.plausible(n); } catch (e) {} };
function estimator(ctx) {
  const root = document.getElementById('estbox'), E = ctx.ESTIMATE; if (!root || !E) return;
  let t = 0, sp = 0; const ex = new Set();
  const grp = (g, items, on, fmt) => `<div class="tabs" data-g="${g}">${items.map((x, i) => `<button type="button" class="btn o${on(i) ? ' on' : ''}" aria-pressed="${!!on(i)}" data-i="${i}">${esc(fmt(x))}</button>`).join('')}</div>`;
  root.innerHTML = `<div class="est"><h3>1. What do you need?</h3>${grp('t', E.types, (i) => i === 0, (x) => x.k)}<h3>2. Extras</h3>${grp('x', E.extras, () => false, (x) => x.k + ' (+' + E.currency + x.p + ')')}<h3>3. Timeline</h3>${grp('s', E.speed, (i) => i === 0, (x) => x.k)}<div class="eres"><div><p class="mu">Estimated range</p><b class="ev"></b></div><button class="btn" type="button" data-send>Send this brief</button></div></div>`;
  const calc = () => { const v = (E.types[t].base + [...ex].reduce((a, i) => a + E.extras[i].p, 0)) * E.speed[sp].m; return [Math.round(v * .9 / 50) * 50, Math.round(v * 1.2 / 50) * 50]; };
  const upd = () => { const [a, b] = calc(); q1('.ev', root).textContent = E.currency + a.toLocaleString() + ' to ' + E.currency + b.toLocaleString(); };
  root.onclick = (e) => {
    const b = e.target.closest('button[data-i]');
    if (b) { const g = b.parentElement.dataset.g, i = +b.dataset.i; if (g === 't') t = i; else if (g === 's') sp = i; else if (ex.has(i)) ex.delete(i); else ex.add(i); qa('button', b.parentElement).forEach((x) => { const on = g === 'x' ? ex.has(+x.dataset.i) : +x.dataset.i === (g === 't' ? t : sp); x.classList.toggle('on', on); x.setAttribute('aria-pressed', on); }); upd(); }
    if (e.target.closest('[data-send]')) {
      const m = q1('#contact textarea'), [a, c] = calc(); track('Estimator sent');
      if (m) { m.value = `Project: ${E.types[t].k}\nExtras: ${[...ex].map((i) => E.extras[i].k).join(', ') || 'none'}\nTimeline: ${E.speed[sp].k}\nEstimate: ${E.currency}${a} to ${E.currency}${c}\n\nMore details: `; go('contact')(); m.focus({ preventScroll: true }); toast('Brief added to the contact form'); }
    }
  };
  upd();
}
function a11y() {
  const b = document.createElement('button'); b.className = 'btn o a11y'; b.type = 'button'; b.setAttribute('aria-label', 'Accessibility options'); b.textContent = 'Aa'; document.body.appendChild(b);
  const p = document.createElement('div'); p.className = 'a11p hide'; p.innerHTML = '<b>Accessibility</b><div class="row"><button type="button" class="btn o" data-a="fs-">A-</button><button type="button" class="btn o" data-a="fs+">A+</button><button type="button" class="btn o" data-a="cur">Cursor effect</button></div><label><input type="checkbox" data-a="rm"> Reduce motion</label><label><input type="checkbox" data-a="hc"> High contrast</label><label><input type="checkbox" data-a="ul"> Underline links</label>'; document.body.appendChild(p);
  const d = document.documentElement; let fs = +ls('fs') || 1;
  const apply = () => { d.style.setProperty('--fs', fs); ['rm', 'hc', 'ul'].forEach((k) => { const on = ls('a_' + k) === '1'; d.classList.toggle(k, on); const c = q1(`[data-a=${k}]`, p); if (c) c.checked = on; }); };
  b.onclick = () => p.classList.toggle('hide');
  p.onclick = (e) => { const a = e.target.dataset.a; if (!a) return; if (a === 'cur') { cycleCursor(); return; } if (a === 'fs-') fs = Math.max(.85, fs - .1); else if (a === 'fs+') fs = Math.min(1.4, fs + .1); else ls('a_' + a, e.target.checked ? '1' : '0'); ls('fs', fs); apply(); };
  apply();
}
function trap(m, label) {
  const prev = document.activeElement, pane = q1('.pane', m) || m;
  m.setAttribute('role', 'dialog'); m.setAttribute('aria-modal', 'true'); m.setAttribute('aria-label', label); pane.tabIndex = -1; setTimeout(() => pane.focus({ preventScroll: true }), 0);
  m.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const f = qa('a[href],button,input,textarea,select', m).filter((x) => !x.disabled && x.offsetParent !== null); if (!f.length) return;
    const i = f.indexOf(document.activeElement); f[e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i + 1) % f.length].focus(); e.preventDefault();
  });
  new MutationObserver((_, o) => { if (!document.body.contains(m)) { o.disconnect(); if (prev && prev.focus) prev.focus(); } }).observe(document.body, { childList: true });
}
// <eng>
const rate = (v, g, p) => (v == null ? ['', ''] : v <= g ? ['Good', 'ok'] : v <= p ? ['Needs work', 'mid'] : ['Poor', 'bad']);
function eng(ctx) {
  const root = document.getElementById('eng'); if (!root) return;
  const V = { lcp: null, fcp: null, cls: 0, ttfb: null }, fmt = (v) => (v == null ? 'measuring...' : (v / 1000).toFixed(2) + ' s');
  const obs = (type, fn) => { try { new PerformanceObserver((l) => fn(l.getEntries())).observe({ type, buffered: true }); } catch (e) {} };
  obs('largest-contentful-paint', (es) => { V.lcp = es[es.length - 1].startTime; });
  obs('paint', (es) => es.forEach((x) => { if (x.name === 'first-contentful-paint') V.fcp = x.startTime; }));
  obs('layout-shift', (es) => es.forEach((x) => { if (!x.hadRecentInput) V.cls += x.value; }));
  try { const n = performance.getEntriesByType('navigation')[0]; if (n) V.ttfb = n.responseStart; } catch (e) {}
  let B = null, A = null, lastHtml = '';
  const badge = (r) => (r[0] ? `<span class="badge ${r[1]}">${r[0]}</span>` : '');
  const draw = () => {
    const res = performance.getEntriesByType('resource'), kb = (n) => (n / 1024).toFixed(0) + ' KB', size = (x) => x.transferSize || x.encodedBodySize || 0;
    const js = res.filter((x) => x.initiatorType === 'script' || /\.js(\?|$)/.test(x.name)).reduce((a, x) => a + size(x), 0), all = res.reduce((a, x) => a + size(x), 0);
    const when = B && B.builtAt ? new Date(B.builtAt).toISOString().slice(0, 10) : '';
    const build = B ? `<dl><dt>Commit</dt><dd>${B.commitUrl ? `<a href="${esc(B.commitUrl)}" target="_blank" rel="noopener noreferrer">${esc(B.commit)}</a>` : esc(B.commit || 'local build')}</dd><dt>Built</dt><dd>${esc(when)}</dd><dt>Next.js / React</dt><dd>${esc(B.next)} / ${esc(B.react)}</dd><dt>Runtime dependencies</dt><dd>${esc(B.runtimeDeps)}</dd><dt>Source files / lines</dt><dd>${esc(B.sourceFiles)} / ${Number(B.sourceLines).toLocaleString()}</dd></dl>` : '<p class="mu">Build details (commit, versions, source size) appear on the deployed site, where the CI run generates them.</p>';
    const audits = A && A.length ? '<ul style="margin:0;padding-left:18px">' + A.map((x) => `<li>${esc(x.date)}: ${esc(x.tool)} (${esc(x.profile)}), performance ${esc(x.performance)}, LCP ${esc(x.lcp)}, CLS ${esc(x.cls)}${x.notes ? '. ' + esc(x.notes) : ''}</li>`).join('') + '</ul>' : '<p class="mu">No lab audits are recorded yet. Run Lighthouse on the deployed site and add the result to public/data/perf.json (see docs/PERFORMANCE.md). Numbers on this page are never invented.</p>';
    const html = `<div class="eng"><div class="ec"><h3>Live performance</h3><p class="mu" style="margin:0 0 10px;font-size:.85rem">Measured in your browser, right now.</p><dl><dt>Largest Contentful Paint</dt><dd>${fmt(V.lcp)}${badge(rate(V.lcp, 2500, 4000))}</dd><dt>First Contentful Paint</dt><dd>${fmt(V.fcp)}${badge(rate(V.fcp, 1800, 3000))}</dd><dt>Layout shift (CLS)</dt><dd>${V.cls.toFixed(3)}${badge(rate(V.cls, 0.1, 0.25))}</dd><dt>Time to first byte</dt><dd>${V.ttfb == null ? 'n/a' : Math.round(V.ttfb) + ' ms'}${badge(rate(V.ttfb, 800, 1800))}</dd></dl></div><div class="ec"><h3>This page</h3><dl><dt>Requests</dt><dd>${res.length}</dd><dt>Transferred</dt><dd>${kb(all)}</dd><dt>JavaScript</dt><dd>${kb(js)}</dd><dt>DOM elements</dt><dd>${document.getElementsByTagName('*').length}</dd><dt>Offline support</dt><dd>${'serviceWorker' in navigator && navigator.serviceWorker.controller ? 'Active' : 'Not active yet'}</dd></dl></div><div class="ec"><h3>Build</h3>${build}</div><div class="ec"><h3>Recorded audits</h3>${audits}</div></div><ol class="flow" aria-label="Deployment pipeline"><li>Content JSON</li><li>Next.js static export</li><li>GitHub Actions</li><li>GitHub Pages</li><li>Service worker (offline)</li></ol><p class="mu" style="font-size:.85rem">Ratings use the Core Web Vitals thresholds. Results depend on your device and network.</p>${ctx.articlePages ? '<p><a href="engineering/">Read the engineering decision records</a></p>' : ''}`;
    if (html !== lastHtml) { root.innerHTML = lastHtml = html; }
  };
  try { fetch((ctx.base || '') + '/data/perf.json').then((r) => (r.ok ? r.json() : [])).then((j) => { A = Array.isArray(j) ? j : []; draw(); }).catch(() => {}); } catch (e) {}
  try { fetch((ctx.base || '') + '/data/build.json').then((r) => (r.ok ? r.json() : null)).then((j) => { B = j; draw(); }).catch(() => {}); } catch (e) {}
  draw(); setInterval(draw, 1500);
}
async function techuse(ctx) {
  const root = document.getElementById('techuse'); if (!root || !ctx.loadProjects) return;
  const ps = await ctx.loadProjects(false), m = {};
  ps.forEach((p) => String(p.tech || '').split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => { m[t] = (m[t] || 0) + 1; }));
  const rows = Object.entries(m).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 10); if (!rows.length) return;
  const max = rows[0][1];
  root.innerHTML = `<h3 class="rh">Technologies used across my projects</h3><ul class="tu">${rows.map(([t, n]) => `<li><button type="button" data-tu="${esc(t)}" aria-label="${esc(t)}: used in ${n} project${n > 1 ? 's' : ''}. Show them."><span>${esc(t)}</span><i style="--w:${(n / max * 100).toFixed(0)}%"></i><b>${n}</b></button></li>`).join('')}</ul>`;
  root.onclick = (e) => { const b = e.target.closest('[data-tu]'); if (!b) return; const tb = qa('#projects .tabs button').find((x) => x.textContent.trim().toLowerCase() === b.dataset.tu.toLowerCase()); if (tb) { tb.click(); go('projects')(); } };
}
function shortcuts() {
  const rows = [['Ctrl or Cmd + K', 'Open the command palette'], ['/', 'Open the command palette'], ['?', 'Show this help'], ['Esc', 'Close any dialog'], ['Arrow keys', 'Move through lists and terminal history'], ['Tab', 'Autocomplete in the terminal']];
  const show = () => {
    if (q1('.kbd')) return; const m = document.createElement('div'); m.className = 'modal kbd';
    m.innerHTML = '<div class="pane"><h2>Keyboard shortcuts</h2><table class="bt"><tbody>' + rows.map(([k, d]) => `<tr><th scope="row"><kbd>${esc(k)}</kbd></th><td>${esc(d)}</td></tr>`).join('') + '</tbody></table><p><button class="btn" type="button" data-x>Close</button></p></div>';
    m.onclick = (e) => { if (e.target === m || e.target.closest('[data-x]')) m.remove(); }; document.body.appendChild(m); trap(m, 'Keyboard shortcuts');
  };
  document.addEventListener('keydown', (e) => { if (e.key === '?' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); show(); } });
  window.__kbd = show;
}
function vcard(ctx) {
  const P = ctx.PROFILE, v = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n'), L = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:' + v(P.name), 'TITLE:' + v(P.role)];
  if (P.email) L.push('EMAIL:' + P.email); if (P.github) L.push('URL:' + P.github); if (P.linkedin) L.push('URL:' + P.linkedin); L.push('END:VCARD');
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([L.join('\r\n')], { type: 'text/vcard' })); a.download = P.name.replace(/\s+/g, '-').toLowerCase() + '.vcf'; a.click(); toast('Contact card downloaded');
}
// </eng>
function cycleCursor() { const o = ['snake', 'spider', 'off'], n = o[(o.indexOf(window.__cursor) + 1) % 3]; window.__cursor = n; ls('cursor', n); toast('Cursor effect: ' + n); return n; }
export function init(ctx) { if (window.__enh) return; window.__enh = 1; if (!ls('theme')) document.documentElement.dataset.theme = 'dark'; window.__cursor = ls('cursor') || 'snake'; const a = ls('acc'); if (a != null) accent(+a); intro(ctx); palette(ctx); term(ctx); fx(); extras(ctx); net(); editor(ctx); gh(ctx); sfx(); pwa(ctx); radar(ctx); blog(ctx); estimator(ctx); a11y(); eng(ctx); techuse(ctx); shortcuts(); i18n(ctx); window.__toast = toast; }
