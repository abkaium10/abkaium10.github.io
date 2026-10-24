'use client';
import { useEffect } from 'react';
// Reading progress bar + copy buttons for code blocks.
export default function Reader() {
  useEffect(() => {
    const bar = document.getElementById('rbar'), sc = () => { const d = document.documentElement; if (bar) bar.style.width = 100 * d.scrollTop / ((d.scrollHeight - d.clientHeight) || 1) + '%'; };
    addEventListener('scroll', sc, { passive: true }); sc();
    const added = [];
    document.querySelectorAll('.md pre').forEach((pre) => {
      const txt = pre.textContent, b = document.createElement('button'); let t;
      b.type = 'button'; b.className = 'cpb'; b.textContent = 'Copy'; b.setAttribute('aria-label', 'Copy code');
      b.onclick = async () => { try { await navigator.clipboard.writeText(txt); b.textContent = 'Copied'; } catch (e) { b.textContent = 'Press Ctrl+C'; } clearTimeout(t); t = setTimeout(() => { b.textContent = 'Copy'; }, 1500); };
      pre.appendChild(b); added.push(b);
    });
    return () => { removeEventListener('scroll', sc); added.forEach((b) => b.remove()); };
  }, []);
  return <div id="rbar" className="pbar" aria-hidden="true" />;
}
