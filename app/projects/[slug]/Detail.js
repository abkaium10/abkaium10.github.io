'use client';
import { useEffect, useRef, useState } from 'react';
import { imgSrc } from '../../../lib/data';

export function Gallery({ shots, caps = [], title }) {
  const [open, setOpen] = useState(-1), ref = useRef(null), back = useRef(null), n = shots.length, on = open >= 0;
  useEffect(() => {
    if (!on) return;
    back.current = document.activeElement; ref.current && ref.current.focus();
    const k = (e) => {
      if (e.key === 'Escape') setOpen(-1);
      else if (e.key === 'ArrowRight') setOpen((i) => (i + 1) % n);
      else if (e.key === 'ArrowLeft') setOpen((i) => (i - 1 + n) % n);
      else if (e.key === 'Tab' && ref.current) { const b = [...ref.current.querySelectorAll('button')], i = b.indexOf(document.activeElement); b[e.shiftKey ? (i <= 0 ? b.length - 1 : i - 1) : (i + 1) % b.length].focus(); e.preventDefault(); }
    };
    addEventListener('keydown', k); document.body.style.overflow = 'hidden';
    return () => { removeEventListener('keydown', k); document.body.style.overflow = ''; back.current && back.current.focus && back.current.focus(); };
  }, [on, n]);
  if (!n) return null;
  return (<>
    <div className="gal">{shots.map((s, i) => (<figure key={i}>
      <button type="button" className="gb" onClick={() => setOpen(i)} aria-label={`Open screenshot ${i + 1} of ${n} in full screen`}>
        <img src={imgSrc(s)} alt={caps[i] || `${title} screenshot ${i + 1}`} width="800" height="500" loading={i ? 'lazy' : 'eager'} decoding="async" /></button>
      {caps[i] && <figcaption className="mu">{caps[i]}</figcaption>}</figure>))}</div>
    {on && (<div className="lb modal" role="dialog" aria-modal="true" aria-label="Screenshot viewer" ref={ref} tabIndex={-1} onClick={(e) => { if (e.target === e.currentTarget) setOpen(-1); }}>
      <div className="lbx"><img src={imgSrc(shots[open])} alt={caps[open] || `${title} screenshot ${open + 1}`} />
        <p className="mu" aria-live="polite">{open + 1} / {n}{caps[open] ? ' | ' + caps[open] : ''}</p>
        <div className="row" style={{ justifyContent: 'center' }}><button type="button" className="btn o" onClick={() => setOpen((open - 1 + n) % n)}>Previous</button><button type="button" className="btn o" onClick={() => setOpen((open + 1) % n)}>Next</button><button type="button" className="btn" onClick={() => setOpen(-1)}>Close</button></div></div></div>)}
  </>);
}

export function Actions({ title, text }) {
  const [msg, setMsg] = useState('');
  const copy = async () => { try { await navigator.clipboard.writeText(location.href); setMsg('Link copied'); } catch (e) { setMsg('Copy this link: ' + location.href); } };
  const share = async () => { try { if (navigator.share) { await navigator.share({ title, text, url: location.href }); return; } } catch (e) { if (e && e.name === 'AbortError') return; } copy(); };
  return (<div className="row"><button type="button" className="btn o" onClick={share}>Share</button><button type="button" className="btn o" onClick={copy}>Copy link</button><span className="mu" role="status" aria-live="polite">{msg}</span></div>);
}
