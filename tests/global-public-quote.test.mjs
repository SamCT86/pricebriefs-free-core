import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const pages=['index.html','pricing/index.html','request/index.html'].map(x=>fs.readFileSync(new URL('../'+x,import.meta.url),'utf8'));
test('Global audit offer: USD indicative reference, no binding price, written quote and scope',()=>{
  for(const s of pages){
    assert.match(s,/\$49/);
    assert.match(s,/indicative/i);
    assert.match(s,/excl\. applicable taxes/);
    assert.doesNotMatch(s,/quoted in USD|USD quote/);
    assert.match(s,/written quote in an agreed currency/i);
    assert.match(s,/scope/i);
    assert.match(s,/https:\/\/sarmadtawfeek\.se\/#contact/);
    assert.doesNotMatch(s,/href=['"][^'"]*checkout/);
  }
});
test('Free checker is live, not preview',()=>{
  assert.doesNotMatch(pages[1],/available in this preview/);
  assert.match(pages[1],/Free checker, no account\./);
});
test('Currency picker is global-choice first, with region-specific currencies still available',()=>{
 const s=fs.readFileSync(new URL('../assets/app.mjs',import.meta.url),'utf8');
 assert.match(s,/<option value="" selected disabled>Choose currency<\/option>/);
 for(const code of ['USD','EUR','GBP','SEK'])assert.ok(s.includes('<option>'+code+'</option>'));
});
