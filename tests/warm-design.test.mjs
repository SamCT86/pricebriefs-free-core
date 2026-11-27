import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const original=['index.html','app/index.html','pricing/index.html','product/index.html','how-it-works/index.html','trust/index.html','sample-brief/index.html','request/index.html'];
const precision=['index.html','agency/index.html','guides/price-mismatch/index.html'];
test('existing eight routes retain public and local checker boundaries',()=>{
  for(const p of original){
    const s=read(p);
    assert.match(s,/href="\/assets\/site\.css"/,p);
    if(p==='app/index.html')assert.match(s,/noindex,nofollow/);
    else assert.match(s,/index,follow/);
    if(p==='index.html')assert.match(s,/Open the free comparison checker/);
    else if(['pricing/index.html','request/index.html'].includes(p))assert.match(s,/href="\/app\/"/);
    else assert.match(s,/href="\/request\/"/);
  }
});
test('Precision Instrument replaces generic audit hero with honest problem-led entry',()=>{
  const s=read('index.html');
  assert.match(s,/Don’t lower your price for the wrong product\./);
  assert.match(s,/id="pi-product-url"/);
  assert.match(s,/Check URL format/);
  assert.match(s,/does not visit your store or inspect live prices/);
  assert.match(s,/FICTIONAL EXAMPLE/);
  assert.match(s,/Open the free comparison checker/);
  assert.match(s,/US\$349/);
  assert.match(s,/written quote in an agreed currency/);
  assert.doesNotMatch(s,/guaranteed savings|AI-powered real.time|three verified findings|100% accurate/i);
});
test('evidence console shows only unverified fictional states, never paid hidden facts',()=>{
  const h=read('index.html'),js=read('assets/precision-instrument.mjs'),contract=read('assets/precision-ui-contract.mjs');
  assert.match(h,/aria-label="Choose a fictional evidence scenario"/);
  for(const key of ['match','pack','missing'])assert.match(h,new RegExp('data-pi-scenario="'+key+'"'));
  assert.match(h,/role="status" aria-live="polite"/);
  assert.match(js,/evaluateFictionalScenario/);
  assert.match(contract,/import \{evaluate,sourceLooksPublicHttps\}/);
  assert.match(contract,/sourceVerified:output\.sourceVerified/);
  assert.doesNotMatch(h,/blur\(4px\)|Unlock the hidden|guaranteed/i);
});
test('free local checker and inquiry still have functional navigation',()=>{
  assert.match(read('index.html'),/href="\/app\/"/);
  assert.match(read('index.html'),/href="\/request\/"/);
  assert.match(read('app/index.html'),/id="review-form"/);
  assert.match(read('request/index.html'),/mailto:hello@pricebriefs\.com/);
});
test('agency and price mismatch entries are standalone truthful pages',()=>{
  const a=read('agency/index.html'),g=read('guides/price-mismatch/index.html');
  assert.match(a,/client issue your usual tools cannot explain/i);
  assert.match(a,/we first agree the scope, rights, pricing and capacity/i);
  assert.match(g,/public price difference alone does not establish a Google Merchant Center rejection/i);
  assert.match(g,/Merchant Center rejection/);
  for(const p of precision){
    const s=read(p);
    assert.match(s,/href="\/assets\/precision-instrument\.css\?v=20261126-v5"/,p);
    assert.match(s,/href="\/request\/"/,p);
    assert.match(s,/href="\/assets\/site\.css"/,p);
  }
});
test('no third party scripts, web analytics, checkout, fictional client testimonials or data exfiltration',()=>{
  for(const p of [...new Set([...original,...precision])]){
    const s=read(p);
    assert.doesNotMatch(s,/<script[^>]+src="https?:/i,p);
    assert.doesNotMatch(s,/(?:checkout\.stripe|trusted by 5,000|10,000\+ customers|google-analytics|mixpanel)/i,p);
  }
  for(const p of ['assets/precision-ui-contract.mjs']){
    const s=read(p);
    assert.doesNotMatch(s,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|WebSocket/i,p);
  assert.doesNotMatch(read('assets/precision-instrument.mjs'),/XMLHttpRequest|localStorage|sessionStorage|sendBeacon|WebSocket|fetch\(['"]https?:/i);
  assert.match(read('assets/precision-instrument.mjs'),/fetch\(['"]\/api\/precheck/);
  }
  assert.doesNotMatch(read('assets/precision-instrument.css'),/@import|url\s*\(\s*['"]?https?:/i);
});
test('keyboard navigation, live announcements and reduced motion supported',()=>{
  const h=read('index.html'),css=read('assets/precision-instrument.css');
  assert.match(h,/class="skip"/);
  assert.match(h,/for="pi-product-url"/);
  assert.match(h,/aria-describedby="pi-url-help pi-status"/);
  assert.match(h,/role="status" aria-live="polite"/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/prefers-reduced-motion/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/@media\(max-width:760px\)/);
});
test('existing free checker retains existing fictional one-click path',()=>{
  const h=read('app/index.html'),js=read('assets/app.mjs');
  assert.match(h,/id="fill-fictional-example"/);
  assert.match(js,/form\.requestSubmit\(\)/);
  assert.match(js,/FICTIONAL_DEMO_NOT_VERIFIED/);
});
test('price scope remains a human-reviewed written quote, not self-serve purchase',()=>{
  const h=read('index.html'),p=read('pricing/index.html'),req=read('request/index.html');
  assert.match(h,/US\$349/);
  assert.match(h,/five-SKU/i);
  assert.match(h,/written quote in an agreed currency/);
  assert.match(p,/You decide whether to proceed after reviewing the quote/i);
  assert.match(req,/Nothing is sent until you send it/);
  assert.doesNotMatch(h+req,/<form\b|checkout\.stripe/i);
});

test('V10 customer-facing copy leads with value without implying a verified source or completed enquiry',()=>{const h=read('index.html'),a=read('agency/index.html'),t=read('thanks/index.html');assert.match(h,/Check the match\.<br><em>Protect your margin\.<\/em>/);assert.match(h,/No page was fetched/);assert.match(h,/human-reviewed audit/);assert.match(a,/we first agree the scope, rights, pricing and capacity/i);assert.match(t,/Ready to send your audit request\?/);assert.match(t,/not proof of delivery/);assert.match(t,/After we receive your request/);assert.doesNotMatch(t,/Thank you for your inquiry/);});
