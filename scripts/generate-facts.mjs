import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
// Writes public/data/build.json and public/humans.txt from the REAL build environment (CI sets GITHUB_SHA and GITHUB_REPOSITORY).
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const walk = (d, out = []) => { for (const f of fs.readdirSync(d, { withFileTypes: true })) { if (['node_modules', '.next', 'out', '.git'].includes(f.name)) continue; const p = path.join(d, f.name); if (f.isDirectory()) walk(p, out); else out.push(p); } return out; };
const src = ['app', 'lib', 'scripts'].flatMap((d) => (fs.existsSync(d) ? walk(d) : [])).filter((p) => /\.(js|mjs|css)$/.test(p));
const sourceLines = src.reduce((n, p) => n + fs.readFileSync(p, 'utf8').split('\n').length, 0);
let sha = process.env.GITHUB_SHA || ''; if (!sha) { try { sha = execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch (e) {} }
const repo = process.env.GITHUB_REPOSITORY || '', ver = (v) => String(v || '').replace(/^[^\d]*/, '');
const count = (f) => { try { const a = JSON.parse(fs.readFileSync(f, 'utf8')); return Array.isArray(a) ? a.length : 0; } catch (e) { return 0; } };
const facts = { builtAt: new Date().toISOString(), commit: sha.slice(0, 7), commitUrl: sha && repo ? `https://github.com/${repo}/commit/${sha}` : '', repo, node: process.version, next: ver(pkg.dependencies.next), react: ver(pkg.dependencies.react), runtimeDeps: Object.keys(pkg.dependencies || {}).length, sourceFiles: src.length, sourceLines, projects: count('public/data/projects.json'), posts: count('public/data/posts.json') };
fs.mkdirSync('public/data', { recursive: true });
fs.writeFileSync('public/data/build.json', JSON.stringify(facts));
fs.writeFileSync('public/humans.txt', `/* SITE */\nBuilt with: Next.js ${facts.next} (static export), React ${facts.react}\nRuntime dependencies: ${facts.runtimeDeps}\nLast build: ${facts.builtAt}\n${facts.commit ? 'Commit: ' + facts.commit + '\n' : ''}`);
console.log('Wrote build.json:', JSON.stringify(facts));
// Every deployment gets its own service-worker cache name, so the activate step removes the previous deployment's cache.
fs.writeFileSync('public/sw-version.js', `self.__BUILD__ = ${JSON.stringify(facts.commit || facts.builtAt.replace(/\D/g, '').slice(0, 14))};\n`);
