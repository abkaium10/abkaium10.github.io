'use client';
import { useEffect } from 'react';
// light-theme color, dark-theme color (each checked for readable contrast on its background)
const ACC = [['#4f46e5', '#8b97ff'], ['#047857', '#34d399'], ['#be123c', '#fb7185'], ['#b45309', '#fbbf24'], ['#0369a1', '#38bdf8']];
// Applies saved theme, accent and accessibility settings on every page, and forwards [data-track] clicks to the analytics provider (if any).
export default function Boot() {
  useEffect(() => {
    try {
      const d = document.documentElement, g = (k) => localStorage.getItem(k), t = g('theme'); d.dataset.theme = t === 'light' ? 'light' : 'dark'; window.__cursor = g('cursor') || 'snake';
      const a = g('acc'); if (a != null && ACC[+a]) { d.style.setProperty('--acl', ACC[+a][0]); d.style.setProperty('--acd', ACC[+a][1]); }
      d.style.setProperty('--fs', g('fs') || 1); ['rm', 'hc', 'ul'].forEach((k) => d.classList.toggle(k, g('a_' + k) === '1'));
    } catch (e) {}
    const h = (e) => {
      const t = e.target.closest && e.target.closest('[data-track]'); if (!t || navigator.doNotTrack === '1') return;
      try { window.plausible && window.plausible(t.dataset.track, t.dataset.project ? { props: { project: t.dataset.project } } : undefined); } catch (x) {}
    };
    document.addEventListener('click', h); return () => document.removeEventListener('click', h);
  }, []);
  return null;
}
