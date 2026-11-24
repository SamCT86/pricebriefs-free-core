import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const r=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');const h=r('index.html'),g=r('guides/price-match-checklist/index.html'),p=r('pricing/index.html');
test('home is focused; optional heavy media and calculator stay off primary journey',()=>{assert.equal((h.match(/<section\b/g)||[]).length,5);assert.doesNotMatch(h,/<video\b|<fieldset\b/);assert.match(g,/<video\b/);assert.match(g,/id="margin-form"/);});
test('paid service is first on pricing and free checker stays available',()=>{assert.ok(p.indexOf('pricing-card pricing-paid')<p.indexOf('<article class="pricing-card">'));assert.match(p,/href="\/app\/"/);});
test('mobile grid explicitly uses zero min track and media max width',()=>{const c=r('assets/buyer-journey.css');assert.match(c,/grid-template-columns:minmax\(0,1fr\)/);assert.match(c,/max-width:100%/);});
