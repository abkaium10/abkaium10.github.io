'use client';
import { useEffect } from 'react';
import { startSnake } from '../lib/snake';
import { startSpider } from '../lib/spider';
// Cursor effects on every page. The snake is the default; each effect stays idle unless it is the selected one.
export default function Cursor() { useEffect(() => { const a = startSnake(), b = startSpider(); return () => { a(); b(); }; }, []); return null; }
