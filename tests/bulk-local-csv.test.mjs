import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {parsePriceBriefsCsv,COLUMNS,fictionalCsvSample25} from '../assets/csv-review.mjs';
import {evaluateBatch} from '../assets/review-engine.mjs';import {makeLocalExport} from '../assets/export-contract.mjs';
const now=Date.parse('2026-11-23T20:00:00Z');
const row=()=>parsePriceBriefsCsv(fictionalCsvSample25(now))[0];
test('25 synthetic rows are clearly fictional with both hold and review',()=>{
 const csv=fictionalCsvSample25(now);const r=parsePriceBriefsCsv(csv);assert.equal(r.length,25);assert.ok(csv.includes('FICTIONAL-PB-'));
 const o=evaluateBatch(r,now);assert.equal(o.status,'OK');assert.ok(o.results.some(x=>x.status==='HOLD'));assert.ok(o.results.some(x=>x.status==='REVIEW'));assert.ok(o.results.every(x=>x.sourceVerified===false));
});
test('1000 rows parse -> evaluate -> export without source verification',()=>{
 const rows=Array.from({length:1000},(_,i)=>({...row(),merchantSku:'FICTIONAL-BULK-'+i,peerSku:'FICTIONAL-BULK-'+i}));
 const csv=COLUMNS.join(',')+'\n'+rows.map(r=>COLUMNS.map(k=>r[k]).join(',')).join('\n');
 const parsed=parsePriceBriefsCsv(csv);assert.equal(parsed.length,1000);
 const batch=evaluateBatch(parsed,now);assert.equal(batch.status,'OK');assert.equal(batch.results.length,1000);
 const exportData=makeLocalExport(parsed,batch.results,new Date(now).toISOString());assert.equal(exportData.rows.length,1000);
 assert.ok(exportData.rows.every(r=>r.source_verified===false&&r.verified_market_delta_pct===null));
});
test('1001 rows rejected by parser, evaluator and exporter',()=>{
 const rows=Array.from({length:1001},(_,i)=>({...row(),merchantSku:'X'+i,peerSku:'X'+i}));
 const csv=COLUMNS.join(',')+'\n'+rows.map(r=>COLUMNS.map(k=>r[k]).join(',')).join('\n');
 assert.throws(()=>parsePriceBriefsCsv(csv),/CSV_TOO_MANY_ROWS/);assert.equal(evaluateBatch(rows,now).status,'HOLD');
 assert.throws(()=>makeLocalExport(rows,rows.map(()=>({status:'HOLD',reasons:[],sourceVerified:false,deltaPct:null}))),/SCOPE/);
});
test('Manual UI remains capped at six; no network egress in parser/engine',()=>{
 const app=fs.readFileSync(new URL('../assets/app.mjs',import.meta.url),'utf8');
 const csv=fs.readFileSync(new URL('../assets/csv-review.mjs',import.meta.url),'utf8');
 const eng=fs.readFileSync(new URL('../assets/review-engine.mjs',import.meta.url),'utf8');
 assert.match(app,/MANUAL_OBSERVATIONS_MAX=6/);for(const s of [app,csv,eng])assert.doesNotMatch(s,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/);
});
test('International SEO and honest public boundary',()=>{
 const home=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
 const app=fs.readFileSync(new URL('../app/index.html',import.meta.url),'utf8');
 const robots=fs.readFileSync(new URL('../robots.txt',import.meta.url),'utf8');
 assert.match(home,/twitter:card/);assert.match(home,/Contact Sam Tawfeek/);assert.doesNotMatch(home+app,/PriceBriefs k&ouml;rs|FREE BROWSER PREVIEW/);
 assert.match(app,/id="download-fictional-csv"/);assert.match(robots,/Allow: \//);
});
