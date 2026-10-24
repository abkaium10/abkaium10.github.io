import fs from 'node:fs';
const file = 'public/openapi/portfolio-api.json';
const errors=[];
let spec;
try { spec=JSON.parse(fs.readFileSync(file,'utf8')); } catch(e) { console.error(`OpenAPI JSON cannot be parsed: ${e.message}`); process.exit(1); }
if(spec.openapi!=='3.1.0') errors.push('openapi must be 3.1.0');
if(!spec.info?.title || !spec.info?.version) errors.push('info.title and info.version are required');
if(!spec.paths || typeof spec.paths!=='object' || !Object.keys(spec.paths).length) errors.push('at least one path is required');
for(const [route,item] of Object.entries(spec.paths||{})) {
 if(!route.startsWith('/')) errors.push(`path must start with /: ${route}`);
 for(const [method,op] of Object.entries(item||{})) if(['get','post','put','patch','delete','options','head'].includes(method.toLowerCase())) {
   if(!op.operationId) errors.push(`${method.toUpperCase()} ${route} needs operationId`);
   if(!op.responses || !Object.keys(op.responses).length) errors.push(`${method.toUpperCase()} ${route} needs responses`);
 }
}
if(errors.length){console.error(errors.map(x=>`- ${x}`).join('\n'));process.exit(1)}
console.log(`OpenAPI 3.1 structural validation passed: ${Object.keys(spec.paths).length} path(s). This lightweight validator is not a full OpenAPI conformance validator.`);
