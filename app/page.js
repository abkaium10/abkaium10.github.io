'use client';
import { useEffect, useState } from 'react';
import { PROFILE, SKILLS, ROLES, STATS, SERVICES, EXPERIENCE, PROCESS, TESTIMONIALS, CODE, BN, LEVELS, ESTIMATE, base, loadProjects, loadPosts, slugOf, safeUrl, imgSrc } from '../lib/data';
import TechnologyGraph from '../components/engineering/TechnologyGraph';
import InteractiveCodeCard from '../components/hero/InteractiveCodeCard';
import CV_STATUS from '../lib/cv-status.js';
const hue = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) * 37 % 360;
const Chip = ({ t, btn }) => { const C = btn ? 'button' : 'span'; return (<C className="chip" {...(btn ? { type: 'button' } : {})}><i aria-hidden="true" style={{ background: `hsl(${hue(t)} 60% 45%)` }}>{t.slice(0, 2)}</i>{t}</C>); };
const ICONS = ['<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>', '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>', '<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'];
const initials = (t) => String(t).split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase();
const tagsOf = (p) => p.tech.split(',').map((t) => t.trim()).filter(Boolean);
const spot = (e) => { const r = e.currentTarget.getBoundingClientRect(); e.currentTarget.style.setProperty('--mx', e.clientX - r.left + 'px'); e.currentTarget.style.setProperty('--my', e.clientY - r.top + 'px'); };
function Count({ n, s }) {
  const [v, set] = useState(0);
  useEffect(() => { let t0, r; const f = (t) => { t0 = t0 || t; const p = Math.min(1, (t - t0) / 1400); set(Math.round(n * p)); if (p < 1) r = requestAnimationFrame(f); }; r = requestAnimationFrame(f); return () => cancelAnimationFrame(r); }, [n]);
  return <b>{v}{s}</b>;
}
function Typed() {
  const [i, setI] = useState(0), [t, setT] = useState('');
  useEffect(() => {
    const w = ROLES[i % ROLES.length]; let k = 0, up = true, h;
    const tick = () => { if (up) { k++; setT(w.slice(0, k)); if (k === w.length) { up = false; h = setTimeout(tick, 1600); return; } } else { k--; setT(w.slice(0, k)); if (!k) { setI(i + 1); return; } } h = setTimeout(tick, up ? 70 : 35); };
    tick(); return () => clearTimeout(h);
  }, [i]);
  return <p className="role"><span className="sr">I am a {ROLES.join(', ')}.</span><span aria-hidden="true">I am a <em>{t}</em><span className="caret" /></span></p>;
}
// Static-hosting compatible email delivery via FormSubmit; first submission requires inbox activation.
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT || 'https://formsubmit.co/ajax/kaiumabd10@gmail.com';
function ContactForm() {
  const [err, setErr] = useState({}), [st, setSt] = useState('');
  const send = async (e) => {
    e.preventDefault(); const f = e.target, d = new FormData(f); if (d.get('_gotcha')) return;
    const v = {};
    if (!String(d.get('_subject') || '').trim()) d.set('_subject', 'Portfolio contact: ' + String(d.get('subject') || d.get('name') || 'New message').trim());
    if (!String(d.get('name')).trim()) v.name = 'Please enter your name.';
    if (!/^\S+@\S+\.\S+$/.test(String(d.get('email')))) v.email = 'Please enter a valid email address.';
    if (String(d.get('msg')).trim().length < 10) v.msg = 'Please write at least 10 characters.';
    setErr(v); if (Object.keys(v).length) { setSt(''); return; }
    if (ENDPOINT) {
      setSt('sending');
      try { const r = await fetch(ENDPOINT, { method: 'POST', headers: { Accept: 'application/json' }, body: d }); if (r.ok) { f.reset(); setSt('sent'); try { window.plausible && navigator.doNotTrack !== '1' && window.plausible('Contact submitted'); } catch (z) {} return; } } catch (x) {}
      setSt('failed'); return;
    }
    location.href = `mailto:${PROFILE.email}?subject=${encodeURIComponent(d.get('subject') || 'Hello from ' + d.get('name'))}&body=${encodeURIComponent(d.get('msg') + '\n\n' + d.get('email'))}`; setSt('mailto');
  };
  const fld = (n, label, props) => (<label>{label}<input name={n} aria-invalid={!!err[n]} aria-describedby={err[n] ? n + '-e' : undefined} {...props} />{err[n] && <span id={n + '-e'} className="ferr" role="alert">{err[n]}</span>}</label>);
  return (<form onSubmit={send} noValidate>
    <input name="_gotcha" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: 'absolute', left: '-9999px' }} />
    <input type="hidden" name="_subject" value="Portfolio contact form" />
    {fld('name', 'Your name', { autoComplete: 'name' })}{fld('email', 'Your email', { type: 'email', autoComplete: 'email' })}{fld('subject', 'Subject (optional)', {})}
    <label>Message<textarea name="msg" rows={4} aria-invalid={!!err.msg} aria-describedby={err.msg ? 'msg-e' : undefined} />{err.msg && <span id="msg-e" className="ferr" role="alert">{err.msg}</span>}</label>
    <button className="btn" disabled={st === 'sending'} aria-busy={st === 'sending'}>{st === 'sending' ? 'Sending...' : 'Send message'}</button>
    <p className="mu" role="status" aria-live="polite">{st === 'sent' && 'Message sent. The form provider confirmed delivery.'}{st === 'failed' && 'Sending failed. Please try again or use the email link.'}{st === 'mailto' && 'Your email app should open. If nothing happens, copy the address instead.'}</p></form>);
}
export default function Home() {
  const [ps, setPs] = useState([]), [q, setQ] = useState(''), [tag, setTag] = useState('All'), [sort, setSort] = useState('featured'), [sel, setSel] = useState(null), [g, setG] = useState(Object.keys(SKILLS)[0]);
  useEffect(() => {
    loadProjects(location.search.includes('preview')).then(setPs);
    import('../lib/enhance').then((m) => m.init({ PROFILE, SKILLS, EXPERIENCE, CODE, SERVICES, PROCESS, TESTIMONIALS, BN, LEVELS, ESTIMATE, loadPosts, loadProjects, base, CV_AVAILABLE: CV_STATUS.available, BASE_PATH: base || '', sw: true, articlePages: true }));
    const t = localStorage.getItem('theme'); if (t) document.documentElement.dataset.theme = t;
    const mm = (e) => { const s = document.documentElement.style; s.setProperty('--x', e.clientX + 'px'); s.setProperty('--y', e.clientY + 'px'); };
    const sc = () => { const d = document.documentElement; document.getElementById('bar').style.width = (100 * d.scrollTop / ((d.scrollHeight - d.clientHeight) || 1)) + '%'; };
    addEventListener('mousemove', mm); addEventListener('scroll', sc);
    return () => { removeEventListener('mousemove', mm); removeEventListener('scroll', sc); };
  }, []);
  const toggle = () => { const d = document.documentElement, cur = d.dataset.theme || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light'), n = cur === 'dark' ? 'light' : 'dark'; d.dataset.theme = n; localStorage.setItem('theme', n); };
  useEffect(() => { const u = new URLSearchParams(location.search); setQ(u.get('q') || ''); setTag(u.get('tag') || 'All'); setSort(u.get('sort') || 'featured'); }, []);
  useEffect(() => {
    const u = new URLSearchParams(location.search); q ? u.set('q', q) : u.delete('q'); tag !== 'All' ? u.set('tag', tag) : u.delete('tag'); sort !== 'featured' ? u.set('sort', sort) : u.delete('sort');
    const s = u.toString(); history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
  }, [q, tag, sort]);
  useEffect(() => {
    if (!sel) return;
    const back = document.activeElement, pane = document.querySelector('.modal .pane'); if (pane) pane.focus({ preventScroll: true });
    const k = (e) => { if (e.key !== 'Tab') return; const f = [...document.querySelectorAll('.modal a[href],.modal button')].filter((x) => !x.disabled); if (!f.length) return; const i = f.indexOf(document.activeElement); f[e.shiftKey ? (i <= 0 ? f.length - 1 : i - 1) : (i + 1) % f.length].focus(); e.preventDefault(); };
    document.addEventListener('keydown', k); return () => { document.removeEventListener('keydown', k); if (back && back.focus) back.focus(); };
  }, [sel]);
  const sorter = (a, b) => (sort === 'az' ? a.title.localeCompare(b.title) : sort === 'newest' ? String(b.date || '').localeCompare(String(a.date || '')) : (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  const tags = ['All', ...new Set(ps.flatMap(tagsOf))];
  const list = ps.filter((p) => (tag === 'All' || tagsOf(p).includes(tag)) && (p.title + p.desc + p.tech).toLowerCase().includes(q.toLowerCase())).sort(sorter);
  const footerProjects = ps.filter((project) => slugOf(project) !== 'portfolio-website').slice(0, 2);
  return (<>
    <header className="nav"><div className="w"><a className="logo" href="#main" aria-label={PROFILE.name + ", back to top"}><img src={(base || "") + "/profile.jpg"} alt={PROFILE.name + " profile"} onError={(e) => { e.currentTarget.style.display = "none"; }} /><span aria-hidden="true">{initials(PROFILE.name)}</span></a>
      <nav aria-label="Primary" style={{ display: 'contents' }}>{['About', 'Skills', 'Projects', EXPERIENCE.length ? 'Experience' : null, 'Contact'].filter(Boolean).map((s) => <a key={s} className="nl" href={'#' + s.toLowerCase()}>{s}</a>)}</nav>
      <div className="nact"><button type="button" className="nb nsearch" id="kbtn" aria-label="Open command palette" aria-keyshortcuts="Control+K Meta+K"><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg><span className="nst">Search</span><kbd className="nkbd">Ctrl K</kbd></button><button type="button" className="nb" id="lang" aria-label="Switch language, English or Bangla" aria-pressed="false"><span data-l="en">EN</span><span data-l="bn">বাং</span></button><button type="button" className="nb nicon" id="th" aria-label="Toggle light or dark theme" title="Toggle theme"><svg className="i-moon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg><svg className="i-sun" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg></button></div></div></header>
    <main id="main">
      <section className="w hero"><InteractiveCodeCard />{PROFILE.availability && <span className="pill"><i />{PROFILE.availability}<b className="mu" data-time /></span>}
        <h1 style={{ marginTop: 26 }}>{PROFILE.name}</h1><Typed />
        <p className="mu" style={{ maxWidth: 540 }}>{PROFILE.bio}</p>
        <div className="row"><a className="btn" href="#projects" data-track="CTA: View work">View my work</a>{CV_STATUS.available ? <a className="btn o" href={(base || "") + CV_STATUS.path} target="_blank" rel="noopener noreferrer" data-track="CV download">Download CV</a> : <span className="btn o" aria-label="CV attachment not yet provided">CV</span>}{PROFILE.github && <a className="btn o" href={PROFILE.github} target="_blank" rel="noopener noreferrer" data-track="Click: GitHub">GitHub</a>}{PROFILE.linkedin && <a className="btn o" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" data-track="Click: LinkedIn">LinkedIn</a>}</div>
        {STATS.length > 0 && <div className="stats">{STATS.map((s) => <div key={s.l}><Count n={s.n} s={s.s} /><span className="mu">{s.l}</span></div>)}</div>}
        <div className="mq" aria-hidden="true"><div>{[...Object.values(SKILLS).flat(), ...Object.values(SKILLS).flat()].map((t, i) => <Chip key={i} t={t} />)}</div></div></section>
      <section className="w sec" id="about"><h2>What I do</h2><div className="svc">{SERVICES.map((s, i) => <div className="sc" key={s.t}><svg className="ic" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: ICONS[i % 3] }} /><h3>{s.t}</h3><p className="mu">{s.d}</p><p className="tags">{s.stack.map((x) => <span key={x}>{x}</span>)}</p></div>)}</div></section>
      <section className="w sec" id="process"><h2>How I work</h2><div className="proc">{PROCESS.map((s, i) => <div key={s.t}><b>{i + 1}.</b><h3>{s.t}</h3><p className="mu">{s.d}</p></div>)}</div></section>
      <section className="w sec" id="skills"><h2>Skills</h2>
        <div className="tabs">{Object.keys(SKILLS).map((k) => <button key={k} className={'btn o' + (g === k ? ' on' : '')} aria-pressed={g === k} onClick={() => setG(k)}>{k}</button>)}</div>
        <div className="chips">{SKILLS[g].map((t) => <Chip key={t} t={t} btn />)}</div><div id="radar" /><div id="techuse" /><TechnologyGraph skills={SKILLS} projects={ps} slugOf={slugOf} /></section>
      <section className="w sec" id="code"><h2>Code I write</h2><p className="mu">Example patterns for the stack I work with. Click a tab to switch, or copy the snippet.</p><div id="editor" /></section>
      <section className="w sec" id="projects"><h2>Selected projects</h2>
        <div className="row"><input style={{ flex: 1, minWidth: 200 }} placeholder="Search projects" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search projects" /><select aria-label="Sort projects" value={sort} onChange={(e) => setSort(e.target.value)}><option value="featured">Featured first</option><option value="newest">Newest first</option><option value="az">A to Z</option></select></div>
        <div className="tabs">{tags.map((t) => <button key={t} className={'btn o' + (tag === t ? ' on' : '')} aria-pressed={tag === t} onClick={() => setTag(t)}>{t}</button>)}</div>
        {!list.length && <p className="mu">{ps.length ? 'No projects match your search. ' : 'No projects published yet. '}{ps.length ? <button className="btn o" onClick={() => { setQ(''); setTag('All'); }}>Reset filters</button> : <a href="admin/">Add your first project</a>}</p>}
        <div className="grid">{list.map((p) => (<article className="card pc" key={p.id} onMouseMove={spot}>
          <div className="pimg">{p.shots?.[0] ? <img src={imgSrc(p.shots[0])} alt={p.title} width="800" height="500" loading="lazy" decoding="async" onClick={() => setSel(p)} /> : <div className="cover" aria-hidden="true" style={{ '--h': hue(p.title) }}><span>{initials(p.title)}</span></div>}{p.featured && <span className="fbadge">Featured</span>}</div>
          <div className="pbody">
            {p.date && <p className="pmeta mu">{p.date}</p>}
            <h3>{p.title}</h3>
            <p className="mu clamp">{p.desc}</p>
            <p className="tags">{tagsOf(p).slice(0, 4).map((t) => <span key={t}>{t}</span>)}{tagsOf(p).length > 4 && <span>+{tagsOf(p).length - 4}</span>}</p>
            <div className="pfoot"><a className="go" href={'projects/' + slugOf(p) + '/'}>Case study</a><button type="button" className="btn o sm" onClick={() => setSel(p)}>Quick view</button>{safeUrl(p.live) && <a href={safeUrl(p.live)} target="_blank" rel="noopener noreferrer" data-track="Demo click" data-project={p.title}>Live site</a>}</div>
          </div></article>))}</div></section>
      <section className="w sec hide" id="writing"><h2>Writing</h2><div className="grid" id="posts" /></section>
      {EXPERIENCE.length > 0 && <section className="w sec" id="experience"><h2>Experience</h2><div className="tl">{EXPERIENCE.map((x) => <div key={x.t}><span className="mu">{x.y}</span><h3>{x.t}, {x.o}</h3><p className="mu">{x.d}</p><p className="tags">{(x.tags || []).map((t) => <span key={t}>{t}</span>)}</p></div>)}</div></section>}
      <section className="w sec" id="engineering"><h2>Under the hood</h2><p className="mu">This site is a statically exported Next.js app. The numbers below are measured live in your browser; the build facts come from the CI run that produced this page.</p><div id="eng" /></section>
      {ESTIMATE && <section className="w sec" id="estimator"><h2>Project estimator</h2><p className="mu">Get a rough price range in 20 seconds. Final quotes depend on the exact scope.</p><div id="estbox" /></section>}
      {TESTIMONIALS.length > 0 && <section className="w sec" id="testimonials"><h2>Kind words</h2><p className="mu testimonial-note">Illustrative portfolio examples. Names and quotes are fictional and are not presented as verified client endorsements.</p><div className="tst">{TESTIMONIALS.map((x) => <blockquote className="q" key={x.n + x.q}>“{x.q}”<cite>{x.n}, {x.r}</cite></blockquote>)}</div></section>}
      <section className="w sec" id="terminal"><h2>Ask my terminal</h2><p className="mu">Try help, skills or sudo hire-me. Press Ctrl+K anywhere for the command palette.</p><div id="term" /></section>
      <section className="w sec cta" id="contact"><div><h2>Have a project in mind?</h2><p className="mu">Send a message and I will get back to you.</p>{PROFILE.email && <p className="row"><a href={'mailto:' + PROFILE.email}>{PROFILE.email}</a><button type="button" className="btn o" data-copy={PROFILE.email}>Copy email</button></p>}{PROFILE.location && <p className="mu">Based in {PROFILE.location}.</p>}</div>{(ENDPOINT || PROFILE.email) ? <ContactForm /> : <p className="mu">Contact details have not been added yet. Set your email in lib/content.js.</p>}</section>
      <footer className="w sf">
        <div className="sfg">
          <div className="sf-brand">
            <a className="sf-avatar" href="#main" aria-label={PROFILE.name + ", back to top"}>
              <img src={(base || "") + "/profile.jpg"} alt={PROFILE.name + " profile"} onError={(e) => { e.currentTarget.style.display = "none"; }} />
              <span aria-hidden="true">{initials(PROFILE.name)}</span>
            </a>
            <h2 className="sf-name">{PROFILE.name}</h2>
            <p className="sf-role">{PROFILE.role}{PROFILE.location ? ' · ' + PROFILE.location : ''}</p><p className="sf-bio" style={{ marginTop: -7 }}>CSE @ BUET</p>
            <p className="sf-bio">Building thoughtful digital experiences.</p><p className="sf-bio">Focused on accessible UI, reliable APIs, and maintainable systems.</p>
            <div className="sf-socials">
              {PROFILE.github && <a href={PROFILE.github} aria-label="GitHub" target="_blank" rel="noopener noreferrer" data-track="Click: GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg></a>}
              {PROFILE.linkedin && <a href={PROFILE.linkedin} aria-label="LinkedIn" target="_blank" rel="noopener noreferrer" data-track="Click: LinkedIn"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6ZM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>}
            </div>
          </div>
          <nav aria-label="Explore" className="sf-col"><p className="sfh"><i/>Explore</p><ul>{['About', 'Skills', 'Projects', 'Writing', EXPERIENCE.length ? 'Experience' : null, 'Under the hood', 'Project estimator', 'Kind words', 'Contact'].filter(Boolean).map((s) => <li key={s}><a href={'#' + ({'Under the hood':'engineering','Project estimator':'estimator','Kind words':'testimonials'}[s] || s.toLowerCase())}>{s}<span aria-hidden="true">→</span></a></li>)}</ul></nav>
          {footerProjects.length > 0 ? <div className="sf-col"><p className="sfh"><i/>Selected work</p><ul className="sf-work">{footerProjects.map((project) => <li key={project.id || project.title}><a href={'projects/' + slugOf(project) + '/'}><b>{project.title}</b><small>{project.desc || 'Featured project'}</small></a></li>)}</ul><a className="sf-all" href="#projects">View all projects <span aria-hidden="true">↗</span></a></div> : <div className="sf-col"><p className="sfh"><i/>Engineering</p><ul><li><a href="#engineering">Technical approach <span aria-hidden="true">→</span></a></li><li><a href="#estimator">Project estimator <span aria-hidden="true">→</span></a></li><li><a href="#testimonials">Kind words <span aria-hidden="true">→</span></a></li><li><a href="#terminal">Interactive terminal <span aria-hidden="true">→</span></a></li><li><a href="admin/">Content workspace <span aria-hidden="true">↗</span></a></li></ul></div>}
          <div className="sf-col sf-connect"><p className="sfh"><i/>Let’s connect</p><p className="sf-invite">Have an idea or want to collaborate?</p><p className="sf-bio">Available for web applications, frontend engineering, and API-focused projects.</p><a className="sf-contact" href="#contact"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>Get in touch <span aria-hidden="true">↗</span></a>{PROFILE.location && <p className="sf-location"><span aria-hidden="true">♧</span>{PROFILE.location}</p>}</div>
        </div>
        <div className="sf-bottom"><p className="mu">© {new Date().getFullYear()} {PROFILE.name}. Crafted with care and Next.js. All rights reserved.</p><div className="sf-bottom-links">{PROFILE.github && <a href={PROFILE.github} target="_blank" rel="noopener noreferrer">GitHub</a>}{PROFILE.linkedin && <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>}{PROFILE.email && <a href={'mailto:' + PROFILE.email}>Email</a>}<a className="sf-top" href="#main" aria-label="Back to top">↑</a></div></div>
      </footer>
    </main>
    {sel && <div className="modal" role="dialog" aria-modal="true" aria-label={sel.title} onClick={() => setSel(null)}><div className="pane" tabIndex={-1} onClick={(e) => e.stopPropagation()}><h2>{sel.title}</h2><p className="mu">{sel.desc}</p>
      <div className="chips">{tagsOf(sel).map((t) => <Chip key={t} t={t} />)}</div><p className="row"><a href={'projects/' + slugOf(sel) + '/'}>Full case study</a>{safeUrl(sel.live) && <a href={safeUrl(sel.live)} target="_blank" rel="noopener noreferrer" data-track="Demo click" data-project={sel.title}>Live site</a>}{safeUrl(sel.repo) && <a href={safeUrl(sel.repo)} target="_blank" rel="noopener noreferrer" data-track="Repo click" data-project={sel.title}>Source code</a>}</p>
      {sel.shots.map((s, i) => <div className="bw" key={i}><div className="bb"><i /><i /><i /></div><img src={imgSrc(s)} alt="" /></div>)}<button className="btn o" onClick={() => setSel(null)}>Close</button></div></div>}
  </>);
}
