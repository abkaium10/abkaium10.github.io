'use client';
import { useEffect, useState } from 'react';
import { loadPosts, savePosts, resetPosts, validatePosts } from '../../../lib/data';
import { md } from '../../../lib/md';
const E0 = { title: '', slug: '', draft: false, tags: '', excerpt: '', body: '' };
export default function BlogAdmin() {
  const [ps, setPs] = useState([]), [f, setF] = useState(E0), [eid, setEid] = useState(null);
  useEffect(() => { loadPosts(true).then(setPs); }, []);
  const commit = (n) => { setPs(n); savePosts(n); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = () => {
    if (!f.title || !f.body) return alert('Title and body are required');
    const old = ps.find((x) => x.id === eid), p = { id: eid || Date.now(), date: old ? old.date : new Date().toISOString().slice(0, 10), title: f.title, tags: f.tags.split(',').map((t) => t.trim()).filter(Boolean), excerpt: f.excerpt, body: f.body, slug: f.slug || undefined, draft: !!f.draft };
    commit(eid ? ps.map((x) => (x.id === eid ? p : x)) : [p, ...ps]); setF(E0); setEid(null);
  };
  const edit = (p) => { setF({ title: p.title, tags: (p.tags || []).join(', '), excerpt: p.excerpt || '', body: p.body, slug: p.slug || '', draft: !!p.draft }); setEid(p.id); scrollTo(0, 0); };
  const exp = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(ps)], { type: 'application/json' })); a.download = 'posts.json'; a.click(); };
  const imp = async (e) => {
    try {
      const j = JSON.parse(await e.target.files[0].text()), er = validatePosts(j);
      if (er) alert('Import failed: ' + er);
      else if (confirm('Replace the current draft with ' + j.length + ' posts? A backup of the current draft will be downloaded first.')) { const k = document.createElement('a'); k.href = URL.createObjectURL(new Blob([JSON.stringify(ps)], { type: 'application/json' })); k.download = 'posts-backup.json'; k.click(); commit(j); }
    } catch (err) { alert('Import failed: this is not valid JSON.'); }
    e.target.value = '';
  };
  return (<main className="w" style={{ paddingBottom: 60 }}>
    <div className="row" style={{ justifyContent: 'space-between', paddingTop: 30 }}><h1 style={{ fontSize: '2rem' }}>Blog posts</h1>
      <div className="row"><a className="btn o" href="../">Projects admin</a><a className="btn o" href="../../?preview=1" target="_blank">Preview site</a>
        <label className="btn o" style={{ cursor: 'pointer' }}>Import posts.json<input type="file" accept="application/json" hidden onChange={imp} /></label>
        <button className="btn" onClick={exp}>Export posts.json</button><button className="btn o" onClick={() => { if (confirm('Discard all draft changes saved in this browser?')) { resetPosts(); location.reload(); } }}>Discard draft</button></div></div>
    <div className="note" role="note"><b>Local content editor, not a secure CMS.</b> Drafts are saved in this browser only; the entry gate is not server authentication, and publishing still requires exporting JSON and committing the generated data to GitHub. To publish: 1) edit and review, 2) Export the JSON, 3) replace the matching file in <code>public/data/</code>, 4) commit and push, 5) GitHub Actions rebuilds the site.</div>
    <div className="card"><div className="cols"><div><h3>{eid ? 'Edit post' : 'New post'}</h3>
      <label>Title<input value={f.title} onChange={set('title')} /></label><label>Tags (comma separated)<input value={f.tags} onChange={set('tags')} /></label>
      <label>Short excerpt<input value={f.excerpt} onChange={set('excerpt')} /></label><label>URL slug (optional: a-z, 0-9, dashes)<input value={f.slug} onChange={set('slug')} /></label><label className="row" style={{ marginBottom: 12 }}><input type="checkbox" checked={!!f.draft} onChange={(e) => setF({ ...f, draft: e.target.checked })} style={{ width: 'auto', margin: 0 }} /> Draft (hidden from the public site, feed and sitemap)</label>
      <label>Body (Markdown: # headings, **bold**, `code`, lists, links, code blocks)<textarea className="mono" rows={16} value={f.body} onChange={set('body')} /></label>
      <div className="row"><button className="btn" onClick={save}>{eid ? 'Save changes' : 'Publish to draft'}</button>{eid && <button className="btn o" onClick={() => { setF(E0); setEid(null); }}>Cancel</button>}</div></div>
      <div><h3>Live preview</h3><div className="md" dangerouslySetInnerHTML={{ __html: md(f.body) || '<p class="mu">Your post will appear here.</p>' }} /></div></div></div>
    <h2>Your posts ({ps.length})</h2>
    <div className="grid">{ps.map((p) => (<article className="card" key={p.id}><div><p className="mu">{p.date}{p.draft ? ' | DRAFT' : ''}</p><h3>{p.title}</h3>
      <div className="row"><button className="btn o" onClick={() => edit(p)}>Edit</button><button className="btn d" onClick={() => confirm('Delete this post?') && commit(ps.filter((x) => x.id !== p.id))}>Delete</button></div></div></article>))}</div>
  </main>);
}
