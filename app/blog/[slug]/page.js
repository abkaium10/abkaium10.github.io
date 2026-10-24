import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import { PROFILE } from '../../../lib/content';
import { slugOf } from '../../../lib/data';
import { md, mdToc } from '../../../lib/md';
import { canon, ogImages } from '../../../lib/site';
import { Actions } from '../../projects/[slug]/Detail';
import Reader from './Reader';

export const dynamicParams = false;
const read = () => { try { const a = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/posts.json'), 'utf8')); return Array.isArray(a) ? a.filter((p) => !p.draft).sort((x, y) => String(y.date).localeCompare(String(x.date))) : []; } catch (e) { return []; } };
const mins = (t) => Math.max(1, Math.round(String(t).split(/\s+/).length / 200));
export function generateStaticParams() { const a = read(); return a.length ? a.map((p) => ({ slug: slugOf(p) })) : [{ slug: '_' }]; }
export function generateMetadata({ params }) {
  const p = read().find((x) => slugOf(x) === params.slug);
  return p ? { title: `${p.title} | ${PROFILE.name}`, description: p.excerpt || String(p.body).slice(0, 150), alternates: canon(`/blog/${params.slug}/`), openGraph: { images: ogImages(), type: 'article', title: p.title, description: p.excerpt || '', publishedTime: p.date } } : { title: 'Article not found', robots: { index: false } };
}
export default function Article({ params }) {
  const all = read(), i = all.findIndex((x) => slugOf(x) === params.slug), p = all[i];
  if (!p) return (<main id="main" className="w pg"><h1>No article here yet</h1><p className="mu">Add posts in the blog editor, export posts.json and rebuild the site.</p><Link className="btn" href="/">Back to home</Link></main>);
  const html = md(p.body), toc = mdToc(html), tags = p.tags || [];
  const related = all.filter((x, k) => k !== i && (x.tags || []).some((t) => tags.includes(t))).slice(0, 3);
  const ld = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.excerpt || '', datePublished: p.date, keywords: tags.join(', '), author: { '@type': 'Person', name: PROFILE.name } };
  return (<main id="main" className="w pg"><Reader />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, '\\u003c') }} />
    <nav aria-label="Breadcrumb"><ol className="bc"><li><Link href="/">Home</Link></li><li><Link href="/#writing">Writing</Link></li><li aria-current="page">{p.title}</li></ol></nav>
    <h1 className="ph">{p.title}</h1>
    <p className="mu">{p.date} | {mins(p.body)} min read</p>
    {tags.length > 0 && <p className="tags">{tags.map((t) => <span key={t}>{t}</span>)}</p>}
    <Actions title={p.title} text={p.excerpt || ''} />
    {toc.length > 1 && <nav className="toc" aria-label="Table of contents" style={{ maxWidth: '70ch', marginTop: 20 }}><b>In this article</b>{toc.map((t) => <a key={t.id} href={'#' + t.id}>{t.text}</a>)}</nav>}
    {/* md() escapes all HTML and only allows https links/images, so this output is safe to inject */}
    <article className="md" style={{ maxWidth: '70ch', marginTop: 24 }} dangerouslySetInnerHTML={{ __html: html }} />
    {related.length > 0 && <section aria-labelledby="rel"><h2 id="rel">Related articles</h2><div className="grid">{related.map((r) => <Link key={slugOf(r)} className="card" href={'/blog/' + slugOf(r) + '/'}><div><h3>{r.title}</h3><p className="mu">{r.excerpt || ''}</p></div></Link>)}</div></section>}
    <nav className="row pn" aria-label="More articles">{all[i - 1] && <Link className="btn o" href={'/blog/' + slugOf(all[i - 1]) + '/'}>Newer: {all[i - 1].title}</Link>}{all[i + 1] && <Link className="btn o" href={'/blog/' + slugOf(all[i + 1]) + '/'}>Older: {all[i + 1].title}</Link>}<Link className="btn" href="/#writing">All articles</Link></nav>
  </main>);
}
