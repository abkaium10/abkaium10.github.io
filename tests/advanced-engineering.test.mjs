import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { runBenchmarks } from '../scripts/run-benchmarks.mjs';
import { validateEvidence } from '../scripts/validate-evidence.mjs';
import { simulateApiRequest } from '../lib/api-sim.mjs';
import { checkInternalPaths } from '../scripts/check-export.mjs';
import { estimateBreakEven } from '../lib/benchmarks/break-even.mjs';
import { compareHistory } from '../scripts/compare-quality-history.mjs';

test('benchmark runner returns repeatable scenario metadata and valid measurements', () => {
 const a=runBenchmarks({samples:3,warmups:1,size:300}), b=runBenchmarks({samples:3,warmups:1,size:300});
 assert.deepEqual(a.results.map(x=>x.id),['linear-lookup','indexed-lookup']);
 for(const r of a.results){assert.equal(r.datasetSize,300);assert.equal(r.sampleCount,3);assert.ok(r.medianMs>=0);assert.ok(r.p95Ms>=r.medianMs);assert.ok(r.implementation&&r.scenario&&r.measuredAt);}
 assert.deepEqual(a.results.map(x=>x.id),b.results.map(x=>x.id));
});
test('benchmark runner rejects unsafe parameters',()=>{assert.throws(()=>runBenchmarks({samples:0}),/samples/);assert.throws(()=>runBenchmarks({size:1}),/size/)});
test('evidence validator accepts current datasets including an empty benchmark set',()=>{assert.deepEqual(validateEvidence({root:process.cwd()}),[])});
test('evidence validator names malformed fields and duplicate ids',()=>{const errors=validateEvidence({root:process.cwd(),projects:[],quality:{schemaVersion:1,checks:[{id:'x',tool:'t',status:'green',summary:'s',timestamp:'bad'},{id:'x',tool:'t',status:'pass',summary:'s',timestamp:null}]},benchmarks:{schemaVersion:1,results:[{id:'b',datasetSize:-1,medianMs:-3,unit:'days'}]},apiExamples:[{id:'x',method:'PUT',path:'https://evil.example',body:[]}]});assert.ok(errors.some(x=>x.includes('status')));assert.ok(errors.some(x=>x.includes('timestamp')));assert.ok(errors.some(x=>x.includes('datasetSize')));assert.ok(errors.some(x=>x.includes('unit')));assert.ok(errors.some(x=>x.includes('method')));assert.ok(errors.some(x=>x.includes('path')))});
test('API playground mock supports pagination and never mutates persistent data',()=>{const r=simulateApiRequest({method:'GET',path:'/api/projects?page=1&limit=1',identity:'anonymous',body:null});assert.equal(r.status,200);assert.equal(r.body.data.length,1);assert.equal(r.body.pagination.total,2);assert.equal(r.body.simulation,true);assert.equal(simulateApiRequest({method:'GET',path:'/api/projects?simulate=rate-limit'}).status,429);assert.equal(simulateApiRequest({method:'GET',path:'/api/projects?simulate=server-error'}).status,503);assert.equal(simulateApiRequest({method:'GET',path:'/api/projects?sort=-title'}).body.sort,'-title')});
test('API playground validates auth, body and mock deletes',()=>{assert.equal(simulateApiRequest({method:'POST',path:'/api/projects',identity:'anonymous',body:{title:'x'}}).status,401);assert.equal(simulateApiRequest({method:'POST',path:'/api/projects',identity:'editor',body:{}}).status,422);assert.equal(simulateApiRequest({method:'DELETE',path:'/api/projects/1',identity:'editor'}).status,403);assert.equal(simulateApiRequest({method:'DELETE',path:'/api/projects/1',identity:'admin'}).status,204);assert.equal(simulateApiRequest({method:'GET',path:'https://evil.example'}).status,400)});

test('static internal path checker respects basePath and catches missing files',()=>{const dir=fs.mkdtempSync(path.join(os.tmpdir(),'export-check-'));fs.mkdirSync(path.join(dir,'engineering','quality'),{recursive:true});fs.writeFileSync(path.join(dir,'engineering','quality','index.html'),'ok');assert.deepEqual(checkInternalPaths('x.html','<a href="/repo/engineering/quality/">ok</a>',{outDir:dir,basePath:'/repo'}),[]);assert.ok(checkInternalPaths('x.html','<a href="/repo/missing/">bad</a>',{outDir:dir,basePath:'/repo'}).some(x=>x.includes('not found')));assert.ok(checkInternalPaths('x.html','<a href="/missing/">bad</a>',{outDir:dir,basePath:'/repo'}).some(x=>x.includes('does not respect basePath')));fs.rmSync(dir,{recursive:true,force:true});});

test('break-even analysis estimates crossover only from valid measured inputs',()=>{assert.deepEqual(estimateBreakEven({mapSetupMs:10,arrayPerOperationMs:0.02,mapPerOperationMs:0.01}),{status:'estimated',operations:1000,setupDifferenceMs:10,savedPerOperationMs:0.01,caveat:'Approximation from measured medians; workload, cache, runtime and host changes can shift the crossover.'});assert.equal(estimateBreakEven({mapSetupMs:10,arrayPerOperationMs:0.01,mapPerOperationMs:0.02}).status,'no-crossover');assert.equal(estimateBreakEven({mapSetupMs:NaN,arrayPerOperationMs:1,mapPerOperationMs:0}).status,'unavailable');assert.equal(estimateBreakEven({mapSetupMs:10,arrayPerOperationMs:1,mapPerOperationMs:0,noisy:true}).status,'unavailable')});
test('quality history refuses to compare one record and only compares metrics present in both records',()=>{assert.equal(compareHistory([{commitSha:'a',timestamp:'2026-01-01'}]).available,false);const c=compareHistory([{commitSha:'a',timestamp:'2026-01-02',metrics:{testFailures:0}},{commitSha:'b',timestamp:'2026-01-01',metrics:{testFailures:2,bundleBytes:100}}]);assert.equal(c.available,true);assert.equal(c.changes.length,1);assert.equal(c.changes[0].direction,'improved')});
