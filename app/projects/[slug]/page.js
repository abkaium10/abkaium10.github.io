import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { PROFILE } from '../../../lib/content';
import { slugOf, safeUrl } from '../../../lib/data';
import { canon, ogImages } from '../../../lib/site';
import { Gallery, Actions } from './Detail';
import ArchitectureExplorer from '../../../components/engineering/ArchitectureExplorer';
import { readAdrs } from '../../../lib/adr.mjs';

export const dynamicParams = false;
const read = () => { try { const a = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/projects.json'), 'utf8')); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
const techOf = (p) => String(p.tech || '').split(',').map((t) => t.trim()).filter(Boolean);
export function generateStaticParams() { const a = read(); return a.length ? a.map((p) => ({ slug: slugOf(p) })) : [{ slug: '_' }]; }
export function generateMetadata({ params }) {
  const p = read().find((x) => slugOf(x) === params.slug);
  return p ? { title: `${p.title} | ${PROFILE.name}`, description: p.desc || p.overview || PROFILE.bio, alternates: canon(`/projects/${params.slug}/`), openGraph: { title: p.title, description: p.desc || '', images: ogImages() } } : { title: 'Project not found', robots: { index: false } };
}
const SECTIONS = [['overview', 'Overview'], ['audience', 'Target users'], ['problem', 'Problem and objectives'], ['requirements', 'Requirements and constraints'], ['solution', 'Solution'], ['decisions', 'Design decisions'], ['api', 'API and database design'], ['challenges', 'Implementation challenges'], ['performance', 'Performance'], ['security', 'Security'], ['testing', 'Testing strategy'], ['deployment', 'Deployment architecture'], ['results', 'Results'], ['limitations', 'Current limitations'], ['lessons', 'Lessons learned']];
const Txt = ({ v }) => (Array.isArray(v) ? <ul>{v.map((x, i) => <li key={i}>{String(x)}</li>)}</ul> : String(v).split(/\n\n+/).map((x, i) => <p key={i}>{x}</p>));

export default function ProjectPage({ params }) {
  const all = read(), i = all.findIndex((x) => slugOf(x) === params.slug), p = all[i];
  if (!p) return (<main id="main" className="w pg"><h1>No project here yet</h1><p className="mu">Add projects in the admin editor, export projects.json and rebuild the site.</p><Link className="btn" href="/">Back to home</Link></main>);
  const tech = techOf(p), live = safeUrl(p.live), repo = safeUrl(p.repo), docsUrl = safeUrl(p.docsUrl), shots = Array.isArray(p.shots) ? p.shots : [];
  const related = all.filter((x, k) => k !== i && techOf(x).some((t) => tech.includes(t))).slice(0, 3);
  const prev = all[i - 1], next = all[i + 1], have = SECTIONS.filter(([k]) => p[k]);
  const hasArch = !!(p.architecture && Array.isArray(p.architecture.nodes) && p.architecture.nodes.length), allAdrs = readAdrs().filter((a) => !a.error), adrs = (Array.isArray(p.adr) ? p.adr : []).map((id) => allAdrs.find((a) => a.id === id)).filter(Boolean);
  const hueOf = (s) => [...String(s)].reduce((a, ch) => a + ch.charCodeAt(0), 0) * 37 % 360, ini = String(p.title).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
  const toc = [...(hasArch || (Array.isArray(p.flow) && p.flow.length) ? [['arch', 'Architecture']] : []), ...(Array.isArray(p.benchmarks) && p.benchmarks.length ? [['bm', 'Measured results']] : []), ...have.map(([k, l]) => ['s-' + k, l]), ...(adrs.length ? [['adr', 'Engineering decisions']] : [])];
  const showToc = toc.length >= 4;
  const ld = { '@context': 'https://schema.org', '@type': 'CreativeWork', name: p.title, description: p.desc || '', keywords: tech.join(', '), author: { '@type': 'Person', name: PROFILE.name } };
  return (<main id="main" className="w pg">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    <nav aria-label="Breadcrumb"><ol className="bc"><li><Link href="/">Home</Link></li><li><Link href="/#projects">Projects</Link></li><li aria-current="page">{p.title}</li></ol></nav>
    <h1 className="ph">{p.title}</h1>
    {p.desc && <p className="mu" style={{ maxWidth: '62ch', fontSize: '1.1rem' }}>{p.desc}</p>}
    {p.date && <p className="mu">{p.date}</p>}
    <p className="tags">{tech.map((t) => <span key={t}>{t}</span>)}</p>
    <div className="row">{live && <a className="btn" href={live} target="_blank" rel="noopener noreferrer" data-track="Demo click" data-project={p.title}>Live demo</a>}{repo && <a className="btn o" href={repo} target="_blank" rel="noopener noreferrer" data-track="Repo click" data-project={p.title}>Source code</a>}{docsUrl && <a className="btn o" href={docsUrl} target="_blank" rel="noopener noreferrer">Documentation</a>}</div>
    <div style={{ marginTop: 14 }}><Actions title={p.title} text={p.desc || ''} /></div>
    {!shots.length && <div className="cover" aria-hidden="true" style={{ '--h': hueOf(p.title), maxWidth: 560, borderRadius: 16, margin: '26px 0' }}><span>{ini}</span></div>}
    <Gallery shots={shots} caps={Array.isArray(p.caps) ? p.caps : []} title={p.title} />
    <div className={showToc ? 'pgrid' : ''}><div className="pmain">
    {hasArch && <section className="wide" aria-labelledby="arch"><h2 id="arch">System architecture</h2><ArchitectureExplorer architecture={p.architecture} title={p.title} /></section>}
    {!hasArch && Array.isArray(p.flow) && p.flow.length > 0 && <section aria-labelledby="arch"><h2 id="arch">Architecture</h2><ol className="flow">{p.flow.map((x, k) => <li key={k}>{String(x)}</li>)}</ol></section>}
    {Array.isArray(p.benchmarks) && p.benchmarks.length > 0 && <section aria-labelledby="bm"><h2 id="bm">Measured results</h2><table className="bt"><tbody>{p.benchmarks.map((b, k) => <tr key={k}><th scope="row">{String(b.k)}</th><td>{String(b.v)}</td></tr>)}</tbody></table></section>}
    {have.map(([k, label]) => <section key={k} aria-labelledby={'s-' + k}><h2 id={'s-' + k}>{label}</h2><Txt v={p[k]} /></section>)}
    {adrs.length > 0 && <section aria-labelledby="adr"><h2 id="adr">Engineering decisions</h2><ul>{adrs.map((a) => <li key={a.id}><Link href={'/engineering/#adr-' + a.id}>ADR {a.id}: {a.title}</Link> <span className="mu">({a.status}, {a.date})</span></li>)}</ul></section>}
    {!have.length && <p className="mu" style={{ marginTop: 30 }}>A detailed case study has not been written for this project yet.</p>}
    </div>{showToc && <aside className="paside"><nav className="toc" aria-label="On this page"><b>On this page</b>{toc.map(([id, l]) => <a key={id} href={'#' + id}>{l}</a>)}</nav></aside>}</div>
    {related.length > 0 && <section aria-labelledby="rel"><h2 id="rel">Related projects</h2><div className="grid">{related.map((r) => <Link key={slugOf(r)} className="card" href={'/projects/' + slugOf(r) + '/'}><div><h3>{r.title}</h3><p className="mu">{r.desc}</p></div></Link>)}</div></section>}
    <nav className="row pn" aria-label="More projects">{prev && <Link className="btn o" href={'/projects/' + slugOf(prev) + '/'}>Previous: {prev.title}</Link>}{next && <Link className="btn o" href={'/projects/' + slugOf(next) + '/'}>Next: {next.title}</Link>}<Link className="btn" href="/#projects">All projects</Link></nav>
  </main>);
}
