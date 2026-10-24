import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
// Generates real static files (sitemap.xml, robots.txt, feed.xml) into public/ before every build.
const tmp = path.join(os.tmpdir(), 'content-' + Date.now() + '.mjs');
fs.writeFileSync(tmp, fs.readFileSync('lib/profile.js', 'utf8'));
const { PROFILE } = await import(pathToFileURL(tmp).href);
const site = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
let posts = []; try { posts = JSON.parse(fs.readFileSync('public/data/posts.json', 'utf8')).filter((p) => !p.draft); } catch (e) {}
let projects = []; try { projects = JSON.parse(fs.readFileSync('public/data/projects.json', 'utf8')); } catch (e) {}
const slugOf = (p) => p.slug || String(p.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'p-' + p.id;
const x = (s) => String(s).replace(/[<>&"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]));
if (!site) {
  console.warn('NEXT_PUBLIC_SITE_URL is not set: skipping sitemap.xml and feed.xml.');
  fs.writeFileSync('public/robots.txt', 'User-agent: *\nAllow: /\n');
} else {
  fs.writeFileSync('public/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`);
  fs.writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${x(site)}/</loc></url><url><loc>${x(site)}/engineering/</loc></url>${projects.map((p) => `<url><loc>${x(site)}/projects/${x(slugOf(p))}/</loc></url>`).join('')}${posts.map((p) => `<url><loc>${x(site)}/blog/${x(slugOf(p))}/</loc><lastmod>${x(p.date)}</lastmod></url>`).join('')}</urlset>`);
  const items = posts.map((p) => `<item><title>${x(p.title)}</title><link>${x(site)}/blog/${x(slugOf(p))}/</link><guid isPermaLink="false">${x(site)}/blog/${x(slugOf(p))}/</guid><pubDate>${new Date(p.date).toUTCString()}</pubDate><description>${x(p.excerpt || '')}</description></item>`).join('');
  fs.writeFileSync('public/feed.xml', `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${x(PROFILE.name)}</title><link>${x(site)}/</link><description>${x(PROFILE.bio)}</description>${items}</channel></rss>`);
  console.log('Wrote sitemap.xml, robots.txt and feed.xml for ' + site);
}
