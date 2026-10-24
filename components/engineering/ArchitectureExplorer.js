'use client';
import { useState } from 'react';
// Interactive architecture explorer. Renders only data from the project's `architecture` field (nodes and edges); nothing is invented.
// Keyboard: every component is a real button. A text version of the diagram is always available.
export default function ArchitectureExplorer({ architecture, title }) {
  const nodes = architecture.nodes, edges = architecture.edges || [], lanes = [...new Set(nodes.map((n) => n.lane || 'System'))];
  const [sel, setSel] = useState(nodes[0].id);
  const name = (id) => (nodes.find((n) => n.id === id) || {}).name || id, cur = nodes.find((n) => n.id === sel) || nodes[0];
  const out = edges.filter((e) => e.from === cur.id), inc = edges.filter((e) => e.to === cur.id), rel = new Set(edges.filter((e) => e.from === cur.id || e.to === cur.id).flatMap((e) => [e.from, e.to]));
  return (<div className="ax">
    <p className="mu">Select a component to see its responsibility and how data moves in and out of it.</p>
    <div className="axl" role="group" aria-label={`${title} architecture components`}>{lanes.map((l) => (<div className="axc" key={l}><p className="axh">{l}</p>
      {nodes.filter((n) => (n.lane || 'System') === l).map((n) => (<button key={n.id} type="button" className={'axn' + (cur.id === n.id ? ' on' : rel.has(n.id) ? ' rel' : '')} aria-pressed={cur.id === n.id} onClick={() => setSel(n.id)}>{n.name}</button>))}</div>))}</div>
    <div className="axd" aria-live="polite"><h3>{cur.name}</h3><p>{cur.desc}</p>
      {cur.tech && cur.tech.length > 0 && <p className="tags">{cur.tech.map((t) => <span key={t}>{t}</span>)}</p>}
      {cur.notes && <p className="mu">{cur.notes}</p>}
      {(inc.length > 0 || out.length > 0) && <dl>{inc.map((e, i) => [<dt key={'a' + i}>Receives from</dt>, <dd key={'b' + i}>{name(e.from)}{e.label ? `: ${e.label}` : ''}</dd>])}{out.map((e, i) => [<dt key={'c' + i}>Sends to</dt>, <dd key={'d' + i}>{name(e.to)}{e.label ? `: ${e.label}` : ''}</dd>])}</dl>}</div>
    <details><summary>Text version of the diagram</summary><ol>{edges.map((e, i) => <li key={i}>{name(e.from)} to {name(e.to)}{e.label ? `: ${e.label}` : ''}</li>)}</ol></details>
  </div>);
}
