const _e = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section';
const inl = (s) => _e(s).replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/\*([^*]+)\*/g, '<em>$1</em>').replace(/!\[([^\]]*)\]\((https?:[^)\s]+|data:image[^)\s]+)\)/g, '<img src="$2" alt="$1" loading="lazy">').replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
// Accessible syntax highlighting: all input is HTML-escaped first, then wrapped in <i class="c|s|k|n"> spans.
const RX = /(\/\/.*|(?:^|\s)#.*)|('[^'\n]*'|&quot;[^\n]*?&quot;|`[^`]*`)|\b(import|from|export|default|async|await|const|let|var|return|function|new|class|extends|if|else|for|while|try|catch|throw|true|false|null|undefined|def|SELECT|FROM|WHERE|INSERT|INTO|UPDATE|DELETE|CREATE|TABLE|INDEX|ORDER|BY|LIMIT|JOIN|model)\b|(@\w+|\b\d+\b)/gm;
export function hlCode(t) { return _e(t).replace(RX, (m, c, s, k) => c ? `<i class="c">${m}</i>` : s ? `<i class="s">${m}</i>` : k ? `<i class="k">${m}</i>` : `<i class="n">${m}</i>`); }
export function md(src) {
  const out = [], seen = {}; let list = null, code = null;
  const flush = () => { if (list) { out.push(`<${list.t}>${list.i.join('')}</${list.t}>`); list = null; } };
  const pre = (c) => { const h = c.lang && c.lang !== 'text'; return `<pre><code${h ? ' class="hl"' : ''}>${h ? hlCode(c.l.join('\n')) : _e(c.l.join('\n'))}</code></pre>`; };
  for (const line of String(src).split('\n')) {
    if (code) { if (line.startsWith('```')) { out.push(pre(code)); code = null; } else code.l.push(line); continue; }
    if (line.startsWith('```')) { flush(); code = { lang: line.slice(3).trim().toLowerCase(), l: [] }; continue; }
    let m;
    if ((m = line.match(/^(#{1,3})\s+(.*)/))) { flush(); const n = m[1].length + 1; let id = slug(m[2]); seen[id] = (seen[id] || 0) + 1; if (seen[id] > 1) id += '-' + seen[id]; out.push(`<h${n} id="${id}">${inl(m[2])}</h${n}>`); }
    else if ((m = line.match(/^\s*[-*]\s+(.*)/))) { if (!list || list.t !== 'ul') { flush(); list = { t: 'ul', i: [] }; } list.i.push(`<li>${inl(m[1])}</li>`); }
    else if ((m = line.match(/^\s*\d+\.\s+(.*)/))) { if (!list || list.t !== 'ol') { flush(); list = { t: 'ol', i: [] }; } list.i.push(`<li>${inl(m[1])}</li>`); }
    else if ((m = line.match(/^>\s?(.*)/))) { flush(); out.push(`<blockquote>${inl(m[1])}</blockquote>`); }
    else if (!line.trim()) flush();
    else { flush(); out.push(`<p>${inl(line)}</p>`); }
  }
  flush(); if (code) out.push(pre(code)); return out.join('');
}
export function mdToc(html) {
  const d = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
  return [...html.matchAll(/<h([34]) id="([^"]+)">(.*?)<\/h\1>/g)].map((m) => ({ level: +m[1], id: m[2], text: d(m[3].replace(/<[^>]+>/g, '')) }));
}
