// Spider cursor: a procedural 8-legged spider chases the pointer and spins silk behind it.
// Silk anchors are stored in PAGE coordinates, so the web stays attached to the content when you scroll.
const TAU = Math.PI * 2;
export function startSpider() {
  if (typeof window === 'undefined' || !matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return () => {};
  const d = document.documentElement, ls = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const c = document.createElement('canvas'); c.className = 'spider'; c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c);
  const g = c.getContext('2d'), D = Math.min(devicePixelRatio || 1, 2), LIFE = 11000;
  let W = 0, H = 0, raf = 0, on = false, mx = 0, my = 0, A = 0, bx = 0, by = 0, vx = 0, vy = 0, trav = 0, idle = 0, lastOrb = 0, f = 0, dark = true, ac = '#4f46e5', cleared = true, last = null;
  const strands = [], anchors = [], orbs = [], mode = () => window.__cursor || ls('cursor') || 'snake';
  const fit = () => { W = innerWidth; H = innerHeight; c.width = W * D; c.height = H * D; g.setTransform(D, 0, 0, D, 0, 0); };
  fit();
  const legs = [];
  for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 4; k++) legs.push({ s, k, rel: s * (0.5 + k * 0.62), R: [30, 36, 36, 31][k], g: (k + (s > 0 ? 1 : 0)) % 2, fx: 0, fy: 0, st: 1, ax: 0, ay: 0, tx: 0, ty: 0 });
  const pg = (x, y) => ({ x: x + scrollX, y: y + scrollY });
  const strand = (a, b, dur = 260) => { strands.push({ a, b, dur, t: performance.now(), ph: Math.random() * TAU, beads: Math.random() < 0.7 ? [0.22 + Math.random() * 0.2, 0.6 + Math.random() * 0.25] : [0.5] }); if (strands.length > 260) strands.shift(); };
  const anchor = () => {
    const p = pg(bx - Math.cos(A) * 10, by - Math.sin(A) * 10);
    if (last) { strand(last, p); anchors.slice(-4, -1).forEach((q) => { if (Math.hypot(q.x - p.x, q.y - p.y) < 230) strand(q, p); }); }
    anchors.push(p); if (anchors.length > 70) anchors.shift(); last = p;
  };
  const orb = (x, y, fast) => {
    const n = 9 + (Math.random() * 4 | 0), rot = Math.random() * TAU, r = 55 + Math.random() * 30, spokes = [], bridges = [];
    for (let k = 0; k < n; k++) spokes.push({ a: rot + (k + (Math.random() - 0.5) * 0.5) / n * TAU, r: r * (0.85 + Math.random() * 0.3) });
    for (let k = 0; k < 3; k++) bridges.push({ k: (Math.random() * n) | 0, L: 50 + Math.random() * 90 });
    if (orbs.length >= 4) orbs.shift();
    orbs.push({ ...pg(x, y), t: performance.now(), n, sp: fast ? 800 : 2000, spokes, bridges, turns: 5, ph: Math.random() * TAU });
  };
  const mm = (e) => { mx = e.clientX; my = e.clientY; if (!on) { on = true; bx = mx; by = my; last = null; legs.forEach((l) => { l.fx = mx; l.fy = my; l.st = 1; }); } };
  const md = (e) => { if (!on || mode() !== 'spider') return; const p = pg(e.clientX, e.clientY); strand(pg(bx, by), p, 170); orb(e.clientX, e.clientY, true); };
  const lv = () => { on = false; };
  document.addEventListener('mousemove', mm, { passive: true }); document.addEventListener('mousedown', md); d.addEventListener('mouseleave', lv); addEventListener('resize', fit);

  const drawSpider = () => {
    const cs = Math.cos(A), sn = Math.sin(A), legC = dark ? '#b9c0d8' : '#14161f', body = dark ? '#262b3d' : '#14161f', rim = dark ? '#cfd5ea' : '#14161f';
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = legC; g.lineWidth = 2; g.globalAlpha = 1;
    legs.forEach((l) => {
      const ba = A + l.rel * 0.5, px = bx + Math.cos(ba) * 5, py = by + Math.sin(ba) * 5, L1 = 17, L2 = 21, mxr = L1 + L2 - 0.5;
      let fx = l.fx, fy = l.fy, dx = fx - px, dy = fy - py, dd = Math.hypot(dx, dy) || 1;
      if (dd > mxr) { fx = px + dx / dd * mxr; fy = py + dy / dd * mxr; dx = fx - px; dy = fy - py; dd = mxr; }
      const lift = l.st < 1 ? Math.sin(l.st * Math.PI) * 5 : 0, th = Math.atan2(dy, dx), aa = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd))));
      const k1 = [px + Math.cos(th + aa) * L1, py + Math.sin(th + aa) * L1], k2 = [px + Math.cos(th - aa) * L1, py + Math.sin(th - aa) * L1];
      const kk = Math.hypot(k1[0] - bx, k1[1] - by) > Math.hypot(k2[0] - bx, k2[1] - by) ? k1 : k2;
      g.beginPath(); g.moveTo(px, py); g.lineTo(kk[0], kk[1] - lift); g.lineTo(fx, fy); g.stroke();
    });
    g.fillStyle = body; g.strokeStyle = rim; g.lineWidth = 1.2;
    const ell = (x, y, rx, ry) => { g.beginPath(); g.ellipse(x, y, rx, ry, A, 0, TAU); g.fill(); g.stroke(); };
    ell(bx - cs * 9, by - sn * 9, 10, 7.5); ell(bx + cs * 3, by + sn * 3, 6.5, 5.5);
    g.fillStyle = ac; g.beginPath(); g.ellipse(bx - cs * 9, by - sn * 9, 4.5, 2.4, A, 0, TAU); g.fill();
    const dm = Math.atan2(my - by, mx - bx);
    [-1, 1].forEach((s) => { const ex = bx + cs * 8 - sn * s * 2.6, ey = by + sn * 8 + cs * s * 2.6; g.fillStyle = '#fff'; g.beginPath(); g.arc(ex, ey, 1.9, 0, TAU); g.fill(); g.fillStyle = '#0b0d14'; g.beginPath(); g.arc(ex + Math.cos(dm) * 0.8, ey + Math.sin(dm) * 0.8, 0.9, 0, TAU); g.fill(); });
  };

  const loop = () => {
    raf = requestAnimationFrame(loop);
    if (mode() !== 'spider' || d.classList.contains('rm')) { if (!cleared) { g.clearRect(0, 0, W, H); strands.length = orbs.length = anchors.length = 0; last = null; cleared = true; } return; }
    if (!on && !strands.length && !orbs.length) { if (!cleared) { g.clearRect(0, 0, W, H); cleared = true; } return; }
    cleared = false; const t = performance.now();
    if (++f % 30 === 1) { dark = d.dataset.theme ? d.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme:dark)').matches; ac = getComputedStyle(d).getPropertyValue('--ac').trim() || ac; }
    let spd = 0;
    if (on) {
      const dx = mx - bx, dy = my - by, dist = Math.hypot(dx, dy), dead = 30;
      if (dist > dead) { const sp = Math.min(16, (dist - dead) * 0.18 + 1.4); vx += (dx / dist * sp - vx) * 0.25; vy += (dy / dist * sp - vy) * 0.25; } else { vx *= 0.8; vy *= 0.8; }
      bx += vx; by += vy; spd = Math.hypot(vx, vy);
      if (spd > 0.6) { let da = Math.atan2(vy, vx) - A; da = Math.atan2(Math.sin(da), Math.cos(da)); A += da * 0.18; idle = 0; } else idle += 16;
      if (!last) anchor();
      trav += spd; if (trav > 75) { trav = 0; anchor(); }
      if (idle > 650 && t - lastOrb > 2600 && orbs.length < 3 && spd < 0.6) { orb(bx, by, false); lastOrb = t; }
      legs.forEach((l) => {
        const a = A + l.rel, rx = bx + Math.cos(a) * l.R, ry = by + Math.sin(a) * l.R;
        if (l.st >= 1 && Math.hypot(l.fx - rx, l.fy - ry) > 24 && !legs.some((o) => o.st < 1 && o.g !== l.g)) { l.st = 0; l.ax = l.fx; l.ay = l.fy; l.tx = rx + vx * 5; l.ty = ry + vy * 5; }
        if (l.st < 1) { l.st = Math.min(1, l.st + 0.16 + spd * 0.012); const e = l.st * l.st * (3 - 2 * l.st); l.fx = l.ax + (l.tx - l.ax) * e; l.fy = l.ay + (l.ty - l.ay) * e; }
      });
    }
    g.clearRect(0, 0, W, H);
    const sx = scrollX, sy = scrollY, core = dark ? 'rgb(236,240,252)' : 'rgb(34,40,64)';
    const fade = (age) => (age < LIFE * 0.6 ? 1 : Math.pow(Math.max(0, 1 - (age - LIFE * 0.6) / (LIFE * 0.4)), 1.3));
    const stroke2 = (w, a) => { g.strokeStyle = ac; g.lineWidth = w * 3; g.globalAlpha = a * 0.16; g.stroke(); g.strokeStyle = core; g.lineWidth = w; g.globalAlpha = a; g.stroke(); };
    const bead = (x, y, a, r) => { g.globalAlpha = a * 0.6; g.fillStyle = dark ? 'rgba(190,215,255,.4)' : 'rgba(70,90,150,.3)'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.globalAlpha = a; g.fillStyle = '#fff'; g.beginPath(); g.arc(x - r * 0.35, y - r * 0.35, r * 0.38, 0, TAU); g.fill(); };
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = strands.length - 1; i >= 0; i--) {
      const s = strands[i], age = t - s.t; if (age > LIFE) { strands.splice(i, 1); continue; }
      const ax = s.a.x - sx, ay = s.a.y - sy, ex = s.b.x - sx, ey = s.b.y - sy;
      if (Math.max(ay, ey) < -40 || Math.min(ay, ey) > H + 40) continue;
      const len = Math.hypot(ex - ax, ey - ay), gp = Math.min(1, age / s.dur), e = 1 - Math.pow(1 - gp, 3), a = fade(age) * 0.7;
      const cx = (ax + ex) / 2 + Math.sin(t / 1300 + s.ph) * len * 0.015, cy = (ay + ey) / 2 + len * 0.08 + Math.sin(t / 900 + s.ph) * len * 0.01;
      g.beginPath(); g.moveTo(ax, ay);
      if (gp >= 1) g.quadraticCurveTo(cx, cy, ex, ey); else for (let k = 1; k <= 10; k++) { const u = e * k / 10, v = 1 - u; g.lineTo(v * v * ax + 2 * v * u * cx + u * u * ex, v * v * ay + 2 * v * u * cy + u * u * ey); }
      stroke2(0.9, a);
      s.beads.forEach((u) => { if (e < u) return; const v = 1 - u; bead(v * v * ax + 2 * v * u * cx + u * u * ex, v * v * ay + 2 * v * u * cy + u * u * ey, a, 1.7 + 0.5 * Math.sin(t / 400 + s.ph + u * 9)); });
      if (gp >= 1) { g.globalAlpha = a * 0.7; g.strokeStyle = core; g.lineWidth = 0.8; g.beginPath(); g.arc(ex, ey, 2.4, 0, TAU); g.stroke(); g.fillStyle = core; g.beginPath(); g.arc(ex, ey, 1.2, 0, TAU); g.fill(); }
    }
    for (let i = orbs.length - 1; i >= 0; i--) {
      const o = orbs[i], age = t - o.t; if (age > LIFE) { orbs.splice(i, 1); continue; }
      const p = Math.min(1, age / o.sp), cx = o.x - sx, cy = o.y - sy, n = o.n, a = fade(age), sp = Math.min(1, p / 0.35);
      const ends = o.spokes.map((q) => [cx + Math.cos(q.a) * q.r * sp, cy + Math.sin(q.a) * q.r * sp]), beads = [];
      const seg = (p1, p2, pull) => { g.quadraticCurveTo((p1[0] + p2[0]) / 2 + (cx - (p1[0] + p2[0]) / 2) * pull, (p1[1] + p2[1]) / 2 + (cy - (p1[1] + p2[1]) / 2) * pull + 1.5, p2[0], p2[1]); };
      g.beginPath();
      ends.forEach((q) => { g.moveTo(cx, cy); g.lineTo(q[0], q[1]); });
      if (p > 0.1) { const bp = Math.min(1, (p - 0.1) / 0.3); o.bridges.forEach((b) => { const q = o.spokes[b.k], x = cx + Math.cos(q.a) * q.r, y = cy + Math.sin(q.a) * q.r; g.moveTo(x, y); g.lineTo(x + Math.cos(q.a) * b.L * bp, y + Math.sin(q.a) * b.L * bp); }); }
      if (p > 0.3) { const fp = Math.min(1, (p - 0.3) / 0.25), cnt = Math.ceil(n * fp); for (let k = 0; k < cnt; k++) { g.moveTo(ends[k][0], ends[k][1]); seg(ends[k], ends[(k + 1) % n], 0.07); } }
      if (p > 0.4) {
        const sf = (p - 0.4) / 0.6, total = n * o.turns, last2 = Math.floor(total * sf); let prev = null;
        for (let j = 0; j <= last2; j++) { const q = o.spokes[j % n], rr = q.r * (0.14 + 0.84 * j / total), pt = [cx + Math.cos(q.a) * rr, cy + Math.sin(q.a) * rr]; if (prev) seg(prev, pt, 0.08); else g.moveTo(pt[0], pt[1]); if (j % 2 === 0 && j > n) beads.push(pt); prev = pt; }
      }
      g.moveTo(cx + 5, cy); g.arc(cx, cy, 5, 0, TAU);
      stroke2(0.9, a * 0.75);
      beads.forEach((b, k) => bead(b[0], b[1], a * 0.8, 1.5 + 0.5 * Math.sin(t / 380 + k + o.ph)));
    }
    if (on && last) {
      const ex = bx - Math.cos(A) * 18, ey = by - Math.sin(A) * 18, lx = last.x - sx, ly = last.y - sy;
      g.beginPath(); g.moveTo(lx, ly); g.quadraticCurveTo((lx + ex) / 2, (ly + ey) / 2 + Math.hypot(ex - lx, ey - ly) * 0.06, ex, ey); stroke2(1, 0.65 + 0.15 * Math.sin(t / 160));
    }
    if (on) drawSpider();
    g.globalAlpha = 1;
  };
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); document.removeEventListener('mousemove', mm); document.removeEventListener('mousedown', md); d.removeEventListener('mouseleave', lv); removeEventListener('resize', fit); c.remove(); };
}
