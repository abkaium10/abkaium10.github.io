'use client';
import { useEffect, useRef, useState } from 'react';
import { PROFILE } from '../../../lib/content';
export default function OgMaker() {
  const cv = useRef(null), [title, setTitle] = useState(PROFILE.name), [sub, setSub] = useState(PROFILE.role), [acc, setAcc] = useState('#4f46e5'), [dark, setDark] = useState(true);
  useEffect(() => {
    let dead = false;
    (async () => {
      try { await Promise.all([document.fonts.load('96px "Instrument Serif"'), document.fonts.load('32px Geist')]); } catch (e) {}
      if (dead || !cv.current) return;
      const g = cv.current.getContext('2d'), W = 1200, H = 630;
      g.fillStyle = dark ? '#080a11' : '#f3f5f9'; g.fillRect(0, 0, W, H);
      g.strokeStyle = dark ? '#1f2433' : '#dfe3ec'; g.lineWidth = 1;
      for (let x = 0; x < W; x += 60) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
      for (let y = 0; y < H; y += 60) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
      g.fillStyle = acc; g.fillRect(80, 120, 96, 8);
      g.fillStyle = dark ? '#eceef6' : '#0e1220'; g.font = '120px "Instrument Serif", Georgia, serif'; g.fillText(title, 80, 300, 1040);
      g.fillStyle = dark ? '#a0a7bc' : '#4b5163'; g.font = '40px Geist, system-ui, sans-serif'; g.fillText(sub, 80, 380, 1040);
      g.fillStyle = acc; g.font = '600 30px Geist, system-ui, sans-serif'; g.fillText((PROFILE.github || '').replace(/^https?:\/\//, ''), 80, 540, 1040);
    })();
    return () => { dead = true; };
  }, [title, sub, acc, dark]);
  const dl = () => cv.current.toBlob((b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'og.png'; a.click(); }, 'image/png');
  return (<main className="w pg"><h1 className="ph" style={{ fontSize: '2.2rem' }}>Social share image</h1>
    <div className="note" role="note">Creates a 1200x630 PNG used when your site is shared on LinkedIn, X, WhatsApp and similar. Download it, save it as <code>public/og.png</code>, set <code>NEXT_PUBLIC_SITE_URL</code>, then commit and push. Without this file no share image is added.</div>
    <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} /></label><label>Subtitle<input value={sub} onChange={(e) => setSub(e.target.value)} /></label>
    <div className="row"><label>Accent color <input type="color" value={acc} onChange={(e) => setAcc(e.target.value)} style={{ width: 60, padding: 2 }} /></label>
      <label className="row"><input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} style={{ width: 'auto', margin: 0 }} /> Dark background</label></div>
    <canvas ref={cv} width="1200" height="630" role="img" aria-label="Preview of the social share image" style={{ width: '100%', maxWidth: 800, border: '1px solid var(--bd)', borderRadius: 12 }} />
    <p><button type="button" className="btn" onClick={dl}>Download og.png</button> <a className="btn o" href="../">Back to editor</a></p></main>);
}
