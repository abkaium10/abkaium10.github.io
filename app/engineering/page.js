import Link from 'next/link';
import { readAdrs } from '../../lib/adr.mjs';
import { md } from '../../lib/md';
import { canon } from '../../lib/site';
import { PROFILE } from '../../lib/content';
export const metadata = { title: `Engineering decisions | ${PROFILE.name}`, description: 'Architecture decision records for this portfolio: context, alternatives, trade-offs and consequences.', alternates: canon('/engineering/') };
export default function Engineering() {
  const adrs = readAdrs().filter((a) => !a.error);
  return (<main id="main" className="w pg">
    <nav aria-label="Breadcrumb"><ol className="bc"><li><Link href="/">Home</Link></li><li aria-current="page">Engineering decisions</li></ol></nav>
    <h1 className="ph">Engineering decisions</h1>
    <p className="mu" style={{ maxWidth: '62ch' }}>Short architecture decision records for this portfolio: what was decided, what else was considered, and what it costs. Each record describes a decision that exists in this codebase.</p>
    <section aria-labelledby="engineering-labs"><h2 id="engineering-labs">Engineering labs</h2><div className="eng"><article className="ec"><h3><Link href="/engineering/quality/">Quality Center</Link></h3><p className="mu">Versioned CI results with explicit unavailable and failing states.</p></article><article className="ec"><h3><Link href="/engineering/benchmarks/">Benchmark Lab</Link></h3><p className="mu">Reproduce local measurements and inspect raw JSON.</p></article><article className="ec"><h3><Link href="/engineering/api-lab/">API Contract Playground</Link></h3><p className="mu">Validate requests against controlled mock endpoints.</p></article><article className="ec"><h3><Link href="/engineering/system-design/">System Design Simulator</Link></h3><p className="mu">Explore deterministic architecture trade-offs.</p></article></div></section>
    {adrs.length === 0 && <p className="mu">No decision records have been added yet. Add Markdown files to content/engineering/adr/.</p>}
    {adrs.map((a) => (<section key={a.id} id={'adr-' + a.id} aria-labelledby={'t-' + a.id}>
      <p className="mu">ADR {a.id} | {a.date} | <span className="badge ok">{a.status}</span></p>
      <h2 id={'t-' + a.id}>{a.title}</h2>
      {/* md() escapes all HTML and only allows https links/images */}
      <article className="md" dangerouslySetInnerHTML={{ __html: md(a.body) }} /></section>))}
    <nav className="row pn" aria-label="More"><Link className="btn" href="/">Back to home</Link></nav>
  </main>);
}
