'use client';
import { useState } from 'react';

const examples = {
  React: { label: 'React · Component', code: `function ProjectCard({ project }) {\n  const [saved, setSaved] = useState(false);\n\n  return (\n    <article className="project-card">\n      <h3>{project.title}</h3>\n      <p>{project.description}</p>\n      <button onClick={() => setSaved(!saved)}>\n        {saved ? 'Saved ✓' : 'Save project'}\n      </button>\n    </article>\n  );\n}` },
  API: { label: 'Node.js · API', code: `export async function GET() {\n  const projects = await getProjects();\n\n  return Response.json(\n    {\n      data: projects,\n      count: projects.length,\n      success: true,\n    },\n    { headers: { 'Cache-Control': 'no-store' } }\n  );\n}` },
  Types: { label: 'TypeScript · Types', code: `type Project = {\n  id: string;\n  title: string;\n  description: string;\n  stack: string[];\n  status: 'building' | 'shipped';\n};\n\nfunction isShipped(project: Project) {\n  return project.status === 'shipped';\n}` },
};

export default function InteractiveCodeCard() {
  const [active, setActive] = useState('React');
  const [copied, setCopied] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const current = examples[active];
  const move = (e) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    setTilt({ x: ((e.clientY - r.top) / r.height - .5) * -8, y: ((e.clientX - r.left) / r.width - .5) * 10 });
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(current.code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  };
  return <aside className="hero-code-wrap" aria-label="Interactive code example">
    <div className="hero-code-glow" aria-hidden="true" />
    <div className="hero-code-card" onMouseMove={move} onMouseLeave={() => setTilt({ x: 0, y: 0 })} style={{ '--tilt-x': `${tilt.x}deg`, '--tilt-y': `${tilt.y}deg` }}>
      <div className="hero-code-top"><div className="hero-code-lights" aria-hidden="true"><i /><i /><i /></div><span className="hero-code-file">{current.label}</span><button type="button" className="hero-code-copy" onClick={copy} aria-label="Copy code">{copied ? 'Copied ✓' : 'Copy'}</button></div>
      <div className="hero-code-tabs" role="tablist" aria-label="Code examples">{Object.keys(examples).map((key) => <button key={key} type="button" role="tab" aria-selected={active === key} className={active === key ? 'active' : ''} onClick={() => setActive(key)}>{key}</button>)}</div>
      <pre className="hero-code-pre"><code>{current.code.split('\n').map((line, i) => <span className="hero-code-line" key={`${active}-${i}`}><b>{String(i + 1).padStart(2, '0')}</b><span>{line || ' '}</span>{'\n'}</span>)}</code></pre>
      <div className="hero-code-foot"><span><i /> Live snippet</span><span>Interactive preview <b>↗</b></span></div>
    </div>
  </aside>;
}
