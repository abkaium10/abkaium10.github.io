'use client';
import { useMemo, useState } from 'react';
// Maps technologies to the projects that really use them. A skill with no project using it is labelled "self-assessed". No proficiency percentages.
const norm = (s) => String(s).trim().toLowerCase();
// Keep route generation local to this Client Component. Passing a function prop
// from a Server Component breaks Next.js static rendering because functions are not serializable.
const projectSlug = (p) => p.slug || String(p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'p-' + p.id;
export default function TechnologyGraph({ skills, projects }) {
  const [sel, setSel] = useState('');
  const used = useMemo(() => { const m = {}; projects.forEach((p) => String(p.tech || '').split(',').map((t) => t.trim()).filter(Boolean).forEach((t) => { (m[norm(t)] = m[norm(t)] || []).push(p); })); return m; }, [projects]);
  const groups = Object.entries(skills), listed = new Set(groups.flatMap(([, l]) => l.map(norm)));
  const extra = Object.keys(used).filter((k) => !listed.has(k)).map((k) => used[k][0].tech.split(',').map((t) => t.trim()).find((t) => norm(t) === k));
  const proj = sel ? used[norm(sel)] || [] : [];
  const btn = (t) => { const n = (used[norm(t)] || []).length, on = norm(sel) === norm(t); return (<button key={t} type="button" className={'tgb' + (n ? ' ev' : '') + (on ? ' on' : '')} aria-pressed={on} onClick={() => setSel(on ? '' : t)}><span>{t}</span><small>{n ? `used in ${n} project${n > 1 ? 's' : ''}` : 'self-assessed'}</small></button>); };
  return (<div className="tg">
    <h3 className="rh">Technology to project map</h3>
    <p className="mu">Select a technology. Solid outline means a project here really uses it. Dashed outline means it is a skill I list, but no project here uses it yet (self-assessed).</p>
    {groups.map(([g, list]) => (<div key={g} className="tgg"><p className="axh">{g}</p><div className="chips">{list.map(btn)}</div></div>))}
    {extra.length > 0 && <div className="tgg"><p className="axh">Used in projects, not in my skills list</p><div className="chips">{extra.map(btn)}</div></div>}
    <div className="tgd" aria-live="polite">{sel ? (proj.length ? (<><p>{sel} is used in:</p><ul>{proj.map((p) => <li key={p.id}><a href={'projects/' + projectSlug(p) + '/'}>{p.title}</a></li>)}</ul></>) : <p>{sel} is listed as a skill, but none of the projects here use it yet. That is self-assessed, not verified by a project.</p>) : <p className="mu">No technology selected.</p>}</div>
    <noscript><ul>{groups.map(([g, l]) => <li key={g}>{g}: {l.join(', ')}</li>)}</ul></noscript>
  </div>);
}
