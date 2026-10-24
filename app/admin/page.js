'use client';
import { useEffect, useState } from 'react';
import { loadProjects, saveProjects, resetDraft, validateProjects } from '../../lib/data';
const okImg = (x) => /^image\/(png|jpe?g|webp|gif)$/.test(x.type) && x.size < 10e6;
const CS = [['slug', 'URL slug (optional: a-z, 0-9, dashes)', 'i'], ['date', 'Date (YYYY-MM-DD, enables Newest sort)', 'i'], ['flow', 'Architecture flow, comma separated (e.g. Browser, Next.js, API, PostgreSQL)', 'i'], ['overview', 'Overview', 't'], ['problem', 'Problem and objectives', 't'], ['solution', 'Solution', 't'], ['decisions', 'Design decisions', 't'], ['challenges', 'Implementation challenges', 't'], ['results', 'Results (only real, measured outcomes)', 't'], ['lessons', 'Lessons learned', 't'], ['audience', 'Target users', 't'], ['requirements', 'Requirements and constraints', 't'], ['api', 'API and database design', 't'], ['testing', 'Testing strategy', 't'], ['deployment', 'Deployment architecture', 't'], ['limitations', 'Current limitations', 't'], ['docsUrl', 'Documentation URL', 'i'], ['adr', 'Related ADR ids, comma separated (example: 0001, 0002)', 'i'], ['architecture', 'Architecture JSON (optional): {"nodes":[{"id","name","lane","desc","tech"}],"edges":[{"from","to","label"}]}', 't'], ['caps', 'Screenshot captions, one per line, same order as the images', 't']];
const E0 = { title: '', desc: '', tech: '', live: '', repo: '', shots: [] };
const shrink = (f) => new Promise((r) => { const i = new Image(); i.onload = () => { const s = Math.min(1, 1000 / i.width), c = document.createElement('canvas'); c.width = i.width * s; c.height = i.height * s; c.getContext('2d').drawImage(i, 0, 0, c.width, c.height); r(c.toDataURL('image/jpeg', 0.72)); }; i.src = URL.createObjectURL(f); });
export default function Admin() {
  const [ps, setPs] = useState([]), [f, setF] = useState(E0), [eid, setEid] = useState(null);
  useEffect(() => { loadProjects(true).then(setPs); }, []);
  useEffect(() => { const h = (e) => { if (f.title || f.desc || f.shots.length) { e.preventDefault(); e.returnValue = ''; } }; addEventListener('beforeunload', h); return () => removeEventListener('beforeunload', h); }, [f]);
  const commit = (n) => { setPs(n); saveProjects(n); };
  const save = () => { if (!f.title) return alert('Title is required'); let arch = f.architecture; if (typeof arch === 'string') { try { arch = arch.trim() ? JSON.parse(arch) : undefined; } catch (er) { return alert('Architecture must be valid JSON.'); } } const p = { ...f, id: eid || Date.now(), flow: typeof f.flow === 'string' ? f.flow.split(',').map((s) => s.trim()).filter(Boolean) : f.flow, caps: typeof f.caps === 'string' ? f.caps.split('\n').map((s) => s.trim()) : f.caps, adr: typeof f.adr === 'string' ? f.adr.split(',').map((s) => s.trim()).filter(Boolean) : f.adr, architecture: arch }; commit(eid ? ps.map((x) => (x.id === eid ? p : x)) : [p, ...ps]); setF(E0); setEid(null); };
  const addShots = async (e) => { const s = await Promise.all([...e.target.files].filter(okImg).map(shrink)); setF({ ...f, shots: [...f.shots, ...s] }); };
  const imp = async (e) => {
    try {
      const j = JSON.parse(await e.target.files[0].text()), er = validateProjects(j);
      if (er) alert('Import failed: ' + er);
      else if (confirm('Replace the current draft with ' + j.length + ' projects? A backup of the current draft will be downloaded first.')) { const b = document.createElement('a'); b.href = URL.createObjectURL(new Blob([JSON.stringify(ps)], { type: 'application/json' })); b.download = 'projects-backup.json'; b.click(); commit(j); }
    } catch (err) { alert('Import failed: this is not valid JSON.'); }
    e.target.value = '';
  };
  const drop = async (e) => { e.preventDefault(); const s = await Promise.all([...e.dataTransfer.files].filter(okImg).map(shrink)); setF({ ...f, shots: [...f.shots, ...s] }); };
  const exp = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(ps)], { type: 'application/json' })); a.download = 'projects.json'; a.click(); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const dup = (p) => commit([{ ...p, id: Date.now(), title: p.title + ' (copy)', featured: false }, ...ps]);
  const mv = (i, d) => { const n = [...ps], j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; commit(n); };
  return (<main className="w"><div className="row" style={{ justifyContent: 'space-between', paddingTop: 30 }}><h1 style={{ fontSize: '2rem' }}>Admin panel</h1>
    <div className="row"><a className="btn o" href="blog/">Blog posts</a><a className="btn o" href="og/">Social image</a><a className="btn o" href="profile/">Profile and content</a><a className="btn o" href="../?preview=1" target="_blank">Preview site</a><label className="btn o" style={{ cursor: 'pointer' }}>Import projects.json<input type="file" accept="application/json" hidden onChange={imp} /></label><button className="btn" onClick={exp}>Export projects.json</button><button className="btn o" onClick={() => { if (confirm('Discard all draft changes saved in this browser?')) { resetDraft(); location.reload(); } }}>Discard draft</button></div></div>
    <div className="note" role="note"><b>Local content editor, not a secure CMS.</b> Drafts are saved in this browser only; the entry gate is not server authentication, and publishing still requires exporting JSON and committing the generated data to GitHub. To publish: 1) edit and review, 2) Export the JSON, 3) replace the matching file in <code>public/data/</code>, 4) commit and push, 5) GitHub Actions rebuilds the site.</div>
    <div className="card"><div><h3>{eid ? 'Edit project' : 'New project'}</h3>
      <label>Title<input value={f.title} onChange={set('title')} /></label>
      <label>Description<textarea rows={3} value={f.desc} onChange={set('desc')} /></label>
      <label>Technologies (comma separated)<input value={f.tech} onChange={set('tech')} placeholder="Next.js, Node.js, PostgreSQL" /></label>
      <label className="row" style={{ marginBottom: 12 }}><input type="checkbox" checked={!!f.featured} onChange={(e) => setF({ ...f, featured: e.target.checked })} style={{ width: 'auto', margin: 0 }} /> Featured project (shown first)</label><label>Live URL<input value={f.live} onChange={set('live')} /></label><label>GitHub URL<input value={f.repo} onChange={set('repo')} /></label>
      <details style={{ margin: '4px 0 14px' }}><summary>Case study and URL options (optional)</summary>{CS.map(([k, l, t]) => { const v = Array.isArray(f[k]) ? f[k].join(k === 'caps' ? '\n' : ', ') : (f[k] && typeof f[k] === 'object' ? JSON.stringify(f[k], null, 2) : (f[k] || '')); return (<label key={k}>{l}{t === 'i' ? <input value={v} onChange={(e) => setF({ ...f, [k]: e.target.value })} /> : <textarea rows={3} value={v} onChange={(e) => setF({ ...f, [k]: e.target.value })} />}</label>); })}</details>
      <div className="drop" onDragOver={(e) => e.preventDefault()} onDrop={drop}>Drag and drop screenshots here, or use the picker below</div>
      <label>Screenshots (click a thumbnail to remove it)<input type="file" accept="image/*" multiple onChange={addShots} /></label>
      <div className="shots">{f.shots.map((s, i) => <img key={i} src={s} alt="" onClick={() => setF({ ...f, shots: f.shots.filter((_, j) => j !== i) })} />)}</div>
      <div className="row"><button className="btn" onClick={save}>{eid ? 'Save changes' : 'Add project'}</button>{eid && <button className="btn o" onClick={() => { setF(E0); setEid(null); }}>Cancel</button>}</div></div></div>
    <h2>Your projects ({ps.length})</h2>
    <div className="grid">{ps.map((p, i) => (<article className="card" key={p.id}>{p.shots[0] && <img src={p.shots[0]} alt="" />}<div><h3>{p.featured ? '★ ' : ''}{p.title}</h3>
      <div className="row"><button className="btn o" onClick={() => dup(p)}>Duplicate</button><button className="btn o" aria-label="Move up" onClick={() => mv(i, -1)}>↑</button><button className="btn o" aria-label="Move down" onClick={() => mv(i, 1)}>↓</button><button className="btn o" onClick={() => { setF(p); setEid(p.id); scrollTo(0, 0); }}>Edit</button><button className="btn d" onClick={() => confirm('Delete this project?') && commit(ps.filter((x) => x.id !== p.id))}>Delete</button></div></div></article>))}</div>
  </main>);
}
