// Default cursor effect. Switch with Ctrl+K > Cursor effect, the terminal command `cursor`, or the Aa panel.
let started = false;
// Snake cursor: lives for the whole page lifetime (singleton), so React strict-mode double mounts never create two.
export function startSnake() {
  if (started) return () => {};
  if (!matchMedia('(pointer:fine)').matches || matchMedia('(prefers-reduced-motion:reduce)').matches) return () => {};
  const c = document.createElement('canvas'); c.className = 'snake'; c.setAttribute('aria-hidden', 'true'); document.body.appendChild(c); started = true;
  const g = c.getContext('2d'), D = Math.min(devicePixelRatio || 1, 2), N = 40, SEG = 7, P = Array.from({ length: N }, () => ({ x: 0, y: 0 }));
  let W, H, mx = 0, my = 0, on = 0, big = 0, f = 0, bh = 235, S = [];
  const toHue = (hex) => { const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(hex.trim()); if (!m) return bh; const [r, gr, b] = m.slice(1).map((v) => parseInt(v, 16) / 255), mxv = Math.max(r, gr, b), d = mxv - Math.min(r, gr, b); if (!d) return bh; const h = mxv === r ? ((gr - b) / d) % 6 : mxv === gr ? (b - r) / d + 2 : (r - gr) / d + 4; return (h * 60 + 360) % 360; };
  const fit = () => { W = innerWidth; H = innerHeight; c.width = W * D; c.height = H * D; g.setTransform(D, 0, 0, D, 0, 0); }; fit(); addEventListener('resize', fit);
  const burst = (x, y, n, v) => { for (let i = 0; i < n; i++) { const a = Math.random() * 6.283, s = Math.random() * v + .5; S.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 1, h: bh + Math.random() * 70 }); } };
  document.addEventListener('mousemove', (e) => { if (!on) { P.forEach((p) => { p.x = e.clientX; p.y = e.clientY; }); on = 1; } mx = e.clientX; my = e.clientY; big = e.target.closest && e.target.closest('a,button,.card,input,textarea,li') ? 1 : 0; });
  document.addEventListener('mousedown', () => on && burst(P[0].x, P[0].y, 18, 4));
  document.documentElement.addEventListener('mouseleave', () => { on = 0; g.clearRect(0, 0, W, H); });
  const ls = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const mode = () => window.__cursor || ls('cursor') || 'snake';
  const loop = (t) => {
    if (mode() !== 'snake' || document.documentElement.classList.contains('rm')) { if (on) { g.clearRect(0, 0, W, H); on = 0; } }
    else if (on) {
      if (++f % 30 === 1) bh = toHue(getComputedStyle(document.documentElement).getPropertyValue('--ac'));
      const h = P[0], ox = h.x, oy = h.y; h.x += (mx - h.x) * .35; h.y += (my - h.y) * .35; const sp = Math.hypot(h.x - ox, h.y - oy);
      for (let i = 1; i < N; i++) { const a = P[i - 1], b = P[i], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy); if (d > SEG) { const k = (d - SEG) / d; b.x += dx * k; b.y += dy * k; } }
      if (sp > 5 && Math.random() < .6 && S.length < 140) burst(P[N - 1].x, P[N - 1].y, 1, 1);
      g.clearRect(0, 0, W, H); g.shadowBlur = 0;
      S.forEach((s) => { s.x += s.vx; s.y += s.vy; s.l -= .025; g.globalAlpha = Math.max(s.l, 0); g.fillStyle = `hsl(${s.h} 90% 65%)`; g.beginPath(); g.arc(s.x, s.y, 1 + s.l * 2.2, 0, 6.283); g.fill(); });
      S = S.filter((s) => s.l > 0); g.globalAlpha = 1;
      const a = Math.atan2(P[0].y - P[2].y, P[0].x - P[2].x), r0 = 2 + (big ? 9 : 6.5), amp = Math.min(sp, 10) * .45;
      if (big) { const L = 13 + Math.sin(t * .03) * 3, tx = h.x + Math.cos(a) * (r0 + L), ty = h.y + Math.sin(a) * (r0 + L); g.strokeStyle = '#ff4d6d'; g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(h.x + Math.cos(a) * r0, h.y + Math.sin(a) * r0); g.lineTo(tx, ty); [.5, -.5].forEach((s) => { g.moveTo(tx, ty); g.lineTo(tx + Math.cos(a + s) * 4, ty + Math.sin(a + s) * 4); }); g.stroke(); }
      for (let i = N - 1; i >= 0; i--) {
        const p = P[Math.max(i - 1, 0)], q = P[Math.min(i + 1, N - 1)], an = Math.atan2(q.y - p.y, q.x - p.x) + 1.5708, w = Math.sin(t * .012 - i * .55) * amp * (i / N);
        const x = P[i].x + Math.cos(an) * w, y = P[i].y + Math.sin(an) * w, k = 1 - i / N, r = 2 + Math.pow(k, .7) * (big ? 9 : 6.5);
        g.shadowColor = `hsl(${bh} 90% 60%)`; g.shadowBlur = 16; g.fillStyle = `hsl(${bh + i * 1.6} 85% ${46 + k * 16}%)`; g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
        if (i % 3 === 0) { g.shadowBlur = 0; g.fillStyle = '#ffffff26'; g.beginPath(); g.arc(x - r * .25, y - r * .3, r * .45, 0, 6.283); g.fill(); }
      }
      g.shadowBlur = 0; const dm = Math.atan2(my - h.y, mx - h.x);
      [-1, 1].forEach((s) => { const ex = h.x + Math.cos(a + s * .8) * r0 * .55, ey = h.y + Math.sin(a + s * .8) * r0 * .55; g.fillStyle = '#fff'; g.beginPath(); g.arc(ex, ey, 2.6, 0, 6.283); g.fill(); g.fillStyle = '#0b0d14'; g.beginPath(); g.arc(ex + Math.cos(dm) * 1, ey + Math.sin(dm) * 1, 1.3, 0, 6.283); g.fill(); });
    }
    requestAnimationFrame(loop);
  };
  loop(0);
  return () => {};
}
