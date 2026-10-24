'use client';
import { useEffect, useState } from 'react';
import { PROFILE, STATS, EXPERIENCE, TESTIMONIALS, LEVELS, ESTIMATE } from '../../../lib/content';
import { validateProfile, genProfileSource } from '../../../lib/profilegen';
const K = 'profile_draft';
const { bn: _bn, ...BASE } = PROFILE;
const start = () => ({ P: { ...BASE }, STATS: STATS.map((x) => ({ ...x })), EXPERIENCE: EXPERIENCE.map((x) => ({ ...x, tags: (x.tags || []).join(', ') })), TESTIMONIALS: TESTIMONIALS.map((x) => ({ ...x })), LEVELS: LEVELS.map((x) => ({ ...x })), est: ESTIMATE ? JSON.stringify(ESTIMATE, null, 2) : '' });
function List({ title, items, cols, blank, set }) {
  const upd = (i, k, v) => set(items.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  return (<fieldset className="card" style={{ marginBottom: 18 }}><div><legend><h3>{title}</h3></legend>
    {items.map((it, i) => (<div className="row" key={i} style={{ alignItems: 'flex-start' }}>
      {cols.map(([k, l, t]) => (<label key={k} style={{ flex: t === 'area' ? '2 1 260px' : '1 1 120px' }}>{l}{t === 'area' ? <textarea rows={2} value={it[k] ?? ''} onChange={(e) => upd(i, k, e.target.value)} /> : <input value={it[k] ?? ''} onChange={(e) => upd(i, k, e.target.value)} />}</label>))}
      <button type="button" className="btn d" onClick={() => set(items.filter((_, j) => j !== i))} aria-label={`Remove ${title} item ${i + 1}`}>Remove</button></div>))}
    <button type="button" className="btn o" onClick={() => set([...items, blank])}>Add {title.toLowerCase()}</button></div></fieldset>);
}
export default function ProfileEditor() {
  const [d, setD] = useState(start), [msg, setMsg] = useState('');
  useEffect(() => { try { const s = localStorage.getItem(K); if (s) setD(JSON.parse(s)); } catch (e) {} }, []);
  useEffect(() => { try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {} }, [d]);
  let est = null, estErr = ''; if (d.est.trim()) { try { est = JSON.parse(d.est); } catch (e) { estErr = 'Estimator JSON is not valid.'; } }
  const data = { PROFILE: d.P, STATS: d.STATS, EXPERIENCE: d.EXPERIENCE, TESTIMONIALS: d.TESTIMONIALS, LEVELS: d.LEVELS, ESTIMATE: est };
  const errors = [...validateProfile(data), ...(estErr ? [estErr] : [])], src = errors.length ? '' : genProfileSource(data);
  const f = (k, l, props) => (<label>{l}<input value={d.P[k] || ''} onChange={(e) => setD({ ...d, P: { ...d.P, [k]: e.target.value } })} {...props} /></label>);
  const dl = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([src], { type: 'text/javascript' })); a.download = 'profile.js'; a.click(); setMsg('Downloaded profile.js'); };
  const copy = async () => { try { await navigator.clipboard.writeText(src); setMsg('Copied to clipboard'); } catch (e) { setMsg('Copy failed. Use Download instead.'); } };
  return (<main className="w pg"><div className="row" style={{ justifyContent: 'space-between' }}><h1 className="ph" style={{ fontSize: '2.2rem' }}>Profile and content</h1><a className="btn o" href="../">Back to editor</a></div>
    <div className="note" role="note"><b>Local editor, not a secure CMS.</b> Fill in your real details. Nothing is sent anywhere. When it validates, download <code>profile.js</code>, replace <code>lib/profile.js</code> with it, commit and push. Empty fields and empty lists are hidden from your site.</div>
    <div className="card" style={{ marginBottom: 18 }}><div><h3>Profile</h3>
      {f('name', 'Name')}{f('role', 'Role')}<label>Short bio<textarea rows={3} value={d.P.bio || ''} onChange={(e) => setD({ ...d, P: { ...d.P, bio: e.target.value } })} /></label>
      {f('availability', 'Availability line (example: Open to new projects)')}{f('location', 'Location')}{f('timezone', 'Timezone (example: Asia/Dhaka, shows your local time)')}
      {f('email', 'Email', { type: 'email' })}{f('github', 'GitHub URL')}{f('linkedin', 'LinkedIn URL')}</div></div>
    <List title="Stats" items={d.STATS} cols={[['n', 'Number'], ['s', 'Suffix (+, %)'], ['l', 'Label']]} blank={{ n: '', s: '', l: '' }} set={(v) => setD({ ...d, STATS: v })} />
    <List title="Experience" items={d.EXPERIENCE} cols={[['y', 'Years'], ['t', 'Title'], ['o', 'Company'], ['d', 'What you did', 'area'], ['tags', 'Tech tags, comma separated']]} blank={{ y: '', t: '', o: '', d: '', tags: '' }} set={(v) => setD({ ...d, EXPERIENCE: v })} />
    <List title="Testimonials" items={d.TESTIMONIALS} cols={[['q', 'Quote (real, with permission)', 'area'], ['n', 'Name'], ['r', 'Role and company']]} blank={{ q: '', n: '', r: '' }} set={(v) => setD({ ...d, TESTIMONIALS: v })} />
    <List title="Skill levels" items={d.LEVELS} cols={[['k', 'Area'], ['v', 'Level 0 to 100 (your honest view)']]} blank={{ k: '', v: '' }} set={(v) => setD({ ...d, LEVELS: v })} />
    <div className="card" style={{ marginBottom: 18 }}><div><h3>Project estimator (optional)</h3><label>JSON with your real rates, or leave empty to hide the estimator
      <textarea className="mono" rows={6} value={d.est} placeholder={'{"currency":"$","types":[{"k":"Landing page","base":300}],"extras":[{"k":"Admin panel","p":600}],"speed":[{"k":"Standard","m":1}]}'} onChange={(e) => setD({ ...d, est: e.target.value })} /></label></div></div>
    {errors.length > 0 && <div className="note" role="alert"><b>Fix these before exporting:</b><ul>{errors.map((x) => <li key={x}>{x}</li>)}</ul></div>}
    <div className="row"><button type="button" className="btn" disabled={!src} onClick={dl}>Download profile.js</button><button type="button" className="btn o" disabled={!src} onClick={copy}>Copy code</button>
      <button type="button" className="btn d" onClick={() => { if (confirm('Discard this draft and reload the current values?')) { localStorage.removeItem(K); setD(start()); } }}>Discard draft</button><span className="mu" role="status" aria-live="polite">{msg}</span></div>
    {src && <details style={{ marginTop: 16 }}><summary>Preview generated code</summary><pre className="md" style={{ overflow: 'auto' }}><code>{src}</code></pre></details>}
  </main>);
}
