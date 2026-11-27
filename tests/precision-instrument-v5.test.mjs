import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {checkProductPageUrl,emailDraftForUrl,evaluateFictionalScenario} from '../assets/precision-ui-contract.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const valid='https://www.shopify.com/blog/ecommerce';
test('public HTTPS URL is syntax-only, explicitly not a scanner',()=>{
 const r=checkProductPageUrl(valid);
 assert.equal(r.ok,true);assert.equal(r.normalized,valid);
 assert.match(r.reason,/not fetched/);
 assert.doesNotMatch(read('assets/precision-ui-contract.mjs'),/\bfetch\s*\(|XMLHttpRequest|sendBeacon/i);
});
test('unsafe URL classes fail closed, including login host and local addresses',()=>{
 for(const x of ['','http://shopify.com/product','https://localhost/product','https://127.0.0.1/','https://[::1]/','https://admin.internal/product','https://private.example.com/p','https://user:pass@shopify.com/p','https://shopify.com:8443/p','https://shopify.com/p#fragment','file:///etc/passwd','javascript:alert(1)','https://shopify.com/p\nBcc:bad@x.com','https://shopify.com/\u0000','x'.repeat(1025)]){
   assert.equal(checkProductPageUrl(x).ok,false,'Must deny '+String(x).slice(0,60));
 }
});
test('URL field cannot be described as source evidence or merchant diagnosis',()=>{
 const h=read('index.html');
 assert.match(h,/checks URL syntax locally/);
 assert.match(h,/No page was fetched/);
 assert.match(h,/No source is independently checked/);
 assert.match(h,/public product page does not establish what was submitted to a merchant account/i);
});
test('request link is a user-triggered email draft, never an automatic submission',()=>{
 const u=emailDraftForUrl(valid);
 assert(u.startsWith('mailto:hello@pricebriefs.com?subject='));
 const parsed=new URL(u);
 assert.equal(parsed.searchParams.get('body').includes(valid),true);
 assert.equal([...parsed.searchParams.keys()].length,2);
 assert.equal(emailDraftForUrl('http://localhost/admin'),null);
});
test('injected mail-looking URL data cannot create BCC, attachment, or extra mailto params',()=>{
 const input='https://www.shopify.com/search?q=price%26bcc%3Devil%40invalid.com';
 const u=emailDraftForUrl(input);assert(u);
 const parsed=new URL(u);
 assert.deepEqual([...parsed.searchParams.keys()].sort(),['body','subject']);
 assert.equal(parsed.searchParams.has('bcc'),false);
 assert.equal(parsed.searchParams.has('attach'),false);
});
test('fictional comparable scenario remains REVIEW and source-UNVERIFIED',()=>{
 const r=evaluateFictionalScenario('match',Date.parse('2026-11-26T10:00:00Z'));
 assert.equal(r.status,'REVIEW');assert.equal(r.sourceVerified,false);assert.equal(r.fictional,true);
});
test('fictional multipack and missing source fail closed as HOLD',()=>{
 for(const name of ['pack','missing']){const r=evaluateFictionalScenario(name,Date.parse('2026-11-26T10:00:00Z'));assert.equal(r.status,'HOLD',name);assert.equal(r.sourceVerified,false);}
});
test('unknown scenario falls back to conservative fictional REVIEW',()=>{
 const r=evaluateFictionalScenario('__proto__',Date.parse('2026-11-26T10:00:00Z'));
 assert.equal(r.sourceVerified,false);assert.equal(r.fictional,true);
});
test('public home cannot offer a fake payment or live URL scanner',()=>{
 const h=read('index.html');
 assert.doesNotMatch(h,/href=["'][^"']*(?:checkout|stripe)|<form\b|live scan complete|guaranteed 3 findings/i);
 assert.match(h,/US\$649/);assert.match(h,/written quote in an agreed currency/);
 assert.match(h,/id="pi-check"/);assert.match(h,/role="status" aria-live="polite"/);
});
test('brand home and agency guide have complete canonical destinations',()=>{
 for(const [p,slug] of [['index.html','/'],['agency/index.html','/agency/'],['guides/price-mismatch/index.html','/guides/price-mismatch/']]){
  const h=read(p);
  assert(h.includes('rel="canonical" href="https://pricebriefs.com'+slug+'"'));
  assert.match(h,/href="\/privacy\/"/);
  assert.match(h,/href="\/terms\/"/);
 }
});
test('new route sitemap is consistent with the actual files',()=>{
 const s=read('sitemap.xml');
 for(const slug of ['/agency/','/guides/price-mismatch/']){
  assert(s.includes('<loc>https://pricebriefs.com'+slug+'</loc>'));
 }
});
test('responsive dark console has actual fail-closed and reduced-motion presentation contracts',()=>{
 const s=read('assets/precision-instrument.css');
 for(const token of ['--pi-bg:#FAFAF8','--pi-console:#0F1418','--pi-review:#F5C16B','--pi-hold:#C4B5FD'])assert(s.includes(token));
 assert.match(s,/\[data-state="hold"\]/);assert.match(s,/\[data-state="unknown"\]/);
 assert.match(s,/@media\(max-width:360px\)/);assert.match(s,/@media\(prefers-reduced-motion:reduce\)/);
});
