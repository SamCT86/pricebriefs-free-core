import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const r=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const h=r('index.html'),g=r('guides/price-match-checklist/index.html'),p=r('pricing/index.html');
test('Current home has eight including bounded source observation, no autoplay media or calculator, and a truthful console',()=>{
 assert.equal((h.match(/<section\b/g)||[]).length,8);
 assert.doesNotMatch(h,/<fieldset\b|<video[^>]*autoplay/i); assert.equal((h.match(/<video\b/g)||[]).length,1); assert.match(h,/id="pb-v8-video" controls playsinline preload="none"/); assert.match(h,/pricebriefs-v8\.webm/); assert.match(h,/kind="captions"/);
 assert.match(h,/id="evidence-console"/);
 assert.match(h,/does not visit your store or inspect live prices/);
 assert.match(g,/<video\b/);
 assert.match(g,/id="margin-form"/);
});
test('paid service is first on pricing and free checker stays available',()=>{
 assert.ok(p.indexOf('pricing-card pricing-paid')<p.indexOf('<article class="pricing-card">'));
 assert.match(p,/href="\/app\/"/);
});
test('existing grid remains responsive and V5 mobile layout is explicitly stacked',()=>{
 const c=r('assets/buyer-journey.css'),v=r('assets/precision-instrument.css');
 assert.match(c,/grid-template-columns:minmax\(0,1fr\)/);
 assert.match(c,/max-width:100%/);
 assert.match(v,/@media\(max-width:760px\)/);
 assert.match(v,/grid-template-columns:1fr/);
});
