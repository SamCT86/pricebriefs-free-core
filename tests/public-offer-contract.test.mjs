import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const page=name=>fs.readFileSync(new URL(name,root),'utf8');
test('Five-SKU human audit always nonbinding and distinct from free checker',()=>{
  const home=page('index.html'),price=page('pricing/index.html'),request=page('request/index.html');
  for(const text of [home,price,request]){
    assert.doesNotMatch(text,/Paid audits are quoted in USD|Paid audit prices are quoted in USD|USD quote/);
    assert.match(text,/up to five (?:relevant )?public product pages/i);
    assert.match(text,/https:\/\/sarmadtawfeek\.se\/#contact/);
  }
  assert.match(price,/written quote in an agreed currency/);
  assert.match(price,/You decide whether to proceed after reviewing the quote/i);
  assert.match(home,/written quote before work/i);
  assert.match(price,/one agreed recheck/i);
  assert.match(price,/reviewer/i);
  assert.doesNotMatch(home+price+request,/<form[^>]*(?:payment|checkout)|buy now/i);
});
test('Public marketing never calls fictional input an independent market price',()=>{
  const home=page('index.html'),app=page('assets/app.mjs'),exp=page('assets/export-contract.mjs');
  assert.match(home,/Example prices/i);
  assert.match(app,/Based on your entries/);
  assert.match(exp,/verified_market_delta_pct:null/);
  assert.match(exp,/source_verified:false/);
});
test('Timezone demo uses actual local wall clock for datetime-local',()=>{
  const app=page('assets/app.mjs');
  assert.match(app,/getTimezoneOffset\(\)\*60000/);
  assert.doesNotMatch(app,/observedAt:new Date\(Date\.now\(\)-5\*60\*1000\)\.toISOString/);
});
