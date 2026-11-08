import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluate,evaluateBatch} from '../assets/review-engine.mjs';
import {COLUMNS,parsePriceBriefsCsv} from '../assets/csv-review.mjs';

const clock=Date.parse('2026-11-07T12:00:00Z');
const good={
  merchantSku:'MANUF-101',peerSku:'MANUF-101',
  merchantBrand:'Brand',peerBrand:'Brand',merchantType:'Drill',peerType:'Drill',
  merchantVariant:'v1',peerVariant:'v1',
  merchantPack:'1',peerPack:'1',merchantCondition:'new',peerCondition:'new',
  merchantPrice:'100',peerPrice:'90',
  sourceUrl:'https://retailer.se/product/101',observedAt:'2026-11-07T11:55:00Z',
  stock:'in_stock',currency:'SEK'
};
test('BASELINE comparison is REVIEW and never verified',()=>{
  const a=evaluate(good,clock);assert.equal(a.status,'REVIEW');assert.equal(a.sourceVerified,false);
});
test('BAD: four actual products may not collapse to three on delimiter collisions',()=>{
  const a={...good,merchantBrand:'A|B',peerBrand:'A|B',merchantSku:'C',peerSku:'C'};
  const b={...good,merchantBrand:'A',peerBrand:'A',merchantSku:'B|C',peerSku:'B|C'};
  const c={...good,merchantBrand:'Z',peerBrand:'Z',merchantSku:'K',peerSku:'K'};
  const e={...good,merchantBrand:'Z',peerBrand:'Z',merchantSku:'L',peerSku:'L'};
  assert.equal(evaluateBatch([a,b,c,e],clock).status,'HOLD');
});
test('BAD: three distinct products still accepted',()=>{
 const a={...good,merchantSku:'100',peerSku:'100'};
 const b={...good,merchantSku:'101',peerSku:'101'};
 const c={...good,merchantSku:'102',peerSku:'102'};
 const r=evaluateBatch([a,b,c],clock);assert.equal(r.status,'OK');assert.equal(r.results.length,3);
});
test('BAD: duplicate fourth observation per product is denied',()=>{
 const a=[0,1,2].map(()=>({...good}));
 assert.equal(evaluateBatch(a,clock).status,'HOLD');
});
test('CSV reject characters following closing quote',()=>{
 const values=COLUMNS.map(k=>String(good[k]));
 values[0]='"MANUF-101"x';
 assert.throws(()=>parsePriceBriefsCsv(COLUMNS.join(',')+'\n'+values.join(',')),/CSV_MALFORMED_QUOTE/);
});
test('CSV reject quote in unquoted field',()=>{
 const values=COLUMNS.map(k=>String(good[k]));values[0]='MA"NUF-101';
 assert.throws(()=>parsePriceBriefsCsv(COLUMNS.join(',')+'\n'+values.join(',')),/CSV_MALFORMED_QUOTE/);
});
test('CSV accept quoted comma and escaped quotes',()=>{
 const values=COLUMNS.map(k=>String(good[k]));values[0]='"AB, ""123"""';values[1]='"AB, ""123"""';
 const parsed=parsePriceBriefsCsv(COLUMNS.join(',')+'\r\n'+values.join(','));
 assert.equal(parsed[0].merchantSku,'AB, "123"');assert.equal(parsed[0].peerSku,'AB, "123"');
});

test('PRICE numeric hexadecimal and scientific notation are not human-entered decimal prices',()=>{
 for(const raw of ['0x10','0b100','1e3','1e-1']){
  const actual=evaluate({...good,peerPrice:raw},clock);
  assert.equal(actual.status,'HOLD','FAIL format '+raw);
 }
});
test('PRICE rejects more than two decimal digits in supported currencies',()=>{
 for(const raw of ['10.123','0.001','20.']){
  assert.equal(evaluate({...good,peerPrice:raw},clock).status,'HOLD','FAIL format '+raw);
 }
 assert.equal(evaluate({...good,peerPrice:'10.50'},clock).status,'REVIEW');
});
test('TIME rejected if ambiguous non-ISO date string',()=>{
 const actual=evaluate({...good,observedAt:'11/07/2026'},clock);
 assert.equal(actual.status,'HOLD');
});
test('TIME rejected if invalid day rolled over by Date.parse',()=>{
 const march=Date.parse('2026-03-02T13:00:00Z');
 assert.equal(evaluate({...good,observedAt:'2026-02-30T12:00:00Z'},march).status,'HOLD');
});
test('TIME ISO with explicit offset accepted and still unverified',()=>{
 const n=Date.parse('2026-11-07T12:00:00Z');
 assert.equal(evaluate({...good,observedAt:'2026-11-07T12:55:00+01:00'},n).status,'REVIEW');
});

test('PRODUCT SCOPE: different category with same brand and MPN is not the same product',()=>{
 const p1={...good,merchantSku:'A',peerSku:'A',merchantType:'Drill',peerType:'Drill'};
 const p2={...good,merchantSku:'A',peerSku:'A',merchantType:'Saw',peerType:'Saw'};
 const p3={...good,merchantSku:'B',peerSku:'B'};
 const p4={...good,merchantSku:'C',peerSku:'C'};
 assert.equal(evaluateBatch([p1,p2,p3,p4],clock).status,'HOLD');
});
test('PRODUCT SCOPE: distinct condition of own product must not collapse into one identifier',()=>{
 const p1={...good,merchantSku:'A',peerSku:'A',merchantCondition:'new',peerCondition:'new'};
 const p2={...good,merchantSku:'A',peerSku:'A',merchantCondition:'used',peerCondition:'used'};
 const p3={...good,merchantSku:'B',peerSku:'B'};
 const p4={...good,merchantSku:'C',peerSku:'C'};
 assert.equal(evaluateBatch([p1,p2,p3,p4],clock).status,'HOLD');
});
test('PRODUCT SCOPE: two comparison peers per exact identical product still allowed',()=>{
 const r=evaluateBatch([{...good},{...good}],clock);
 assert.equal(r.status,'OK');assert.deepEqual(r.results.map(x=>x.status),['REVIEW','REVIEW']);
});
test('TIMESTAMP: invalid offset beyond ISO 8601 legal UTC+14:00 rejected',()=>{
 assert.equal(evaluate({...good,observedAt:'2026-11-07T11:55:00+14:59'},clock).status,'HOLD');
});
test('TIMESTAMP: 00:00 UTC offset and leap day valid',()=>{
 const leap=Date.parse('2028-02-29T12:02:00Z');
 assert.equal(evaluate({...good,observedAt:'2028-02-29T13:00:00+01:00'},leap).status,'REVIEW');
});
