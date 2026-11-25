import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeLocalExport, assertImportUntrusted} from '../assets/export-contract.mjs';
test('Every displayed comparison is marked NOT VERIFIED',()=>{
  const app=fs.readFileSync(new URL('../assets/app.mjs',import.meta.url),'utf8');
  assert.match(app,/Based on your entries/);
  const guard=fs.readFileSync(new URL('../assets/review-engine.mjs',import.meta.url),'utf8');
  assert.match(guard,/sourceVerified:false/);
  assert.match(app,/fictional example/);
});
test('Export carries explicit unverified delta provenance even when REVIEW',()=>{
  const out=makeLocalExport([{merchantPrice:'199',peerPrice:'179'}],[{status:'REVIEW',deltaPct:10.1,reasons:['typed'],sourceVerified:false}],new Date('2026-11-23T12:00:00Z').toISOString());
  assert.equal(out.source_verified,false);
  assert.equal(out.independent_market_fact,false);
  assert.equal(out.rows[0].source_verified,false);
  assert.equal(out.rows[0].delta_pct,10.1);
  assert.equal(out.rows[0].verified_market_delta_pct,null);
  assert.equal(out.rows[0].delta_pct_provenance,'USER_ENTERED_NOT_VERIFIED');
  assert.match(out.warning,/UNVERIFIED USER INPUTS/);
  assert.equal(assertImportUntrusted(out).may_generate_market_action,false);
});
test('Forged verification is rejected',()=>{
  assert.throws(()=>makeLocalExport([{}],[{status:'REVIEW',deltaPct:1,sourceVerified:true,reasons:[]}]),/VERIFICATION_BOUNDARY/);
});
