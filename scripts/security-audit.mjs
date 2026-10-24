import fs from 'node:fs';
import path from 'node:path';
const findings = [];
const packageJson = JSON.parse(fs.readFileSync('package.json','utf8'));
if (!fs.existsSync('package-lock.json')) findings.push({ severity:'blocked', id:'lockfile-missing', message:'package-lock.json is missing; npm ci cannot provide a reproducible install.' });
const workflowDir = '.github/workflows';
for (const file of fs.existsSync(workflowDir) ? fs.readdirSync(workflowDir).filter((f)=>f.endsWith('.yml')||f.endsWith('.yaml')) : []) {
 const text = fs.readFileSync(path.join(workflowDir,file),'utf8');
 if (!/^permissions:\s*\n\s+contents:\s*read/m.test(text)) findings.push({severity:'review',id:'workflow-permissions',file,message:'Review workflow permissions; explicit least-privilege contents: read was not detected at top level.'});
 if (/pull_request_target/.test(text) && /npm (ci|install)|run:/.test(text)) findings.push({severity:'high',id:'pull-request-target-execution',file,message:'Review untrusted pull request execution under pull_request_target.'});
 if (/uses:\s+[^\s@]+@v\d/.test(text)) findings.push({severity:'review',id:'mutable-action-tag',file,message:'One or more actions use mutable version tags rather than immutable commit SHAs.'});
}
const publicDir = 'public';
function walk(dir) { for (const ent of fs.readdirSync(dir,{withFileTypes:true})) { const p=path.join(dir,ent.name); if(ent.isDirectory()) walk(p); else if(/\.(js|mjs|json|html|yml|yaml|md|env)$/i.test(p)) { const s=fs.readFileSync(p,'utf8'); if(/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(s)) findings.push({severity:'high',id:'private-key-marker',file:p,message:'Private-key marker found; investigate without printing secret contents.'}); if(/(?:ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,})/.test(s)) findings.push({severity:'high',id:'github-token-pattern',file:p,message:'GitHub token-like pattern found; investigate without printing the token.'}); } } }
walk(publicDir);
const result = { schemaVersion:1, generatedAt:new Date().toISOString(), scope:'Heuristic repository configuration scan; not a complete secret scanner or security certification.', dependencies:Object.keys(packageJson.dependencies||{}).length, devDependencies:Object.keys(packageJson.devDependencies||{}).length, findings };
fs.mkdirSync('public/data',{recursive:true}); fs.writeFileSync('public/data/security-report.json',JSON.stringify(result,null,2)+'\n');
console.log(`Security heuristic: ${findings.length} finding(s); see public/data/security-report.json. npm audit and a dedicated secret scanner are separate checks.`);
if (findings.some(f=>f.severity==='high')) process.exitCode=1;
