import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {COLUMNS,parsePriceBriefsCsv} from '../assets/csv-review.mjs';
import {explainCsvError} from '../assets/csv-diagnostics.mjs';
import {evaluate} from '../assets/review-engine.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const good={
 merchantSku:'M-10',peerSku:'M-10',merchantBrand:'Brand',peerBrand:'Brand',
 merchantType:'Drill',peerType:'Drill',merchantVariant:'18V',peerVariant:'18V',
 merchantPack:'1',peerPack:'1',merchantCondition:'new',peerCondition:'new',
 merchantPrice:'100',peerPrice:'92',sourceUrl:'https://retailer.se/product/10',
 observedAt:'2026-11-07T12:00:00Z',stock:'in_stock',currency:'SEK'
};
const now=Date.parse('2026-11-07T12:05:00Z');
test('F3 exact existing CSV fields remain 18',()=>{
 assert.equal(COLUMNS.length,18);assert.ok(COLUMNS.includes('merchantSku'));assert.ok(COLUMNS.includes('peerSku'));
});
test('F3 input grouping retains all mandatory local fields',()=>{
 const source=read('assets/app.mjs');
 assert.match(source,/Your product/);assert.match(source,/The other listing/);assert.match(source,/Source, stock and time/);
 for(const name of COLUMNS)assert.match(source,new RegExp(name),'Missing: '+name);
});
test('F3 unknown header details identify missing and unexpected names',()=>{
 const data='merchantSku,merchantSku,what\nONE,TWO,x',e=assert.throws(()=>parsePriceBriefsCsv(data));
 const text=explainCsvError(e||new Error('CSV_UNKNOWN_OR_DUPLICATE_HEADER'),data);
 assert.match(text,/Missing:/);assert.match(text,/peerSku/);assert.match(text,/Unknown:/);
 assert.doesNotMatch(text,/CSV_UNKNOWN_OR_DUPLICATE_HEADER/);
});
test('F3 row-number mismatch gives human instruction',()=>{
 const e=new Error('CSV_ROW_COLUMN_COUNT_5');
 assert.match(explainCsvError(e,''),/row 5/i);assert.match(explainCsvError(e,''),/18/);
});
test('F3 dangerous CSV NUL remains denied',()=>{
 assert.equal(explainCsvError(new Error('CSV_NUL_DENIED')).includes('control character'),true);
});
test('F3 malformed quotes give repair guidance',()=>{
 assert.match(explainCsvError(new Error('CSV_UNCLOSED_QUOTE')),/quotation/);
});
test('F6 common manufacturer MPN may be REVIEW even with unmodelled different store SKUs',()=>{
 const r=evaluate(good,now);assert.equal(r.status,'REVIEW');assert.equal(r.sourceVerified,false);
});
test('F6 other store SKU cannot substitute for manufacturer MPN',()=>{
 const r=evaluate({...good,peerSku:'SHOP-PRIVATE-22'},now);
 assert.equal(r.status,'HOLD');assert.match(r.reasons.join(' '),/Manufacturer product ID/);
});
test('F6 unknown shared identity is HOLD',()=>{
 const r=evaluate({...good,peerSku:''},now);assert.equal(r.status,'HOLD');
});
test('F5 first paid CTA uses AUREL-approved existing human contact route; free checker remains open',()=>{
 const h=read('index.html');
 assert.match(h,/href="https:\/\/sarmadtawfeek\.se\/#contact">Discuss a five-SKU audit/);
 assert.match(h,/href="\/app\/">Open the free comparison checker/);
 assert.doesNotMatch(h,/<form\b|checkout\.stripe/i);
});
test('F5 separate paid scope is not hosted monitoring, and app is still an unverified preview',()=>{
 assert.match(read('pricing/index.html'),/No automatic retailer crawling or subscription checkout/i);
 assert.match(read('index.html'),/FREE CHECKER OPEN/);
 assert.match(read('app/index.html'),/No account, card or upload/);
});
test('F7 interim privacy note does not claim full terms',()=>{
 const h=read('trust/index.html');assert.match(h,/not a final Privacy Policy or Terms of Service/i);
 assert.match(h,/hosting requests and server logs/i);
});
test('F3 no tracker/network added to local app',()=>{
 const a=read('assets/app.mjs');assert.doesNotMatch(a,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/);
});
