import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=x=>readFileSync(path.join(root,x),'utf8');
const routes=['index.html','app/index.html','pricing/index.html','product/index.html','how-it-works/index.html','trust/index.html','sample-brief/index.html','request/index.html'];

test('all eight pages use the same local warm design with launch disclaimer',()=>{
 for(const p of routes){const s=read(p);assert.match(s,/href="\/assets\/warm-2027\.css"/,p);if(['index.html','pricing/index.html','request/index.html'].includes(p))assert.match(s,/index,follow/,p);else assert.match(s,/noindex,nofollow/,p);if(p==='index.html')assert.match(s,/Open the free comparison checker/,p);else if(['pricing/index.html','request/index.html'].includes(p))assert.match(s,/FREE CHECKER OPEN/,p);else assert.match(s,/Customer access is not open/,p);}
});
test('human hero specifies a five-page audit and evidence output, without false claims',()=>{
 const home=read('index.html');
 assert.match(home,/Find product-data mismatches/);assert.match(home,/before your next campaign/);
 assert.match(home,/five public product pages/);assert.match(home,/source evidence/);
 assert.doesNotMatch(home,/guaranteed|100% accurate|AI-powered real.time/ig);
});
test('home has one primary product action and clearly labeled sample comparison',()=>{
 const s=read('index.html');
 assert.match(s,/href="\/app\/"/);assert.match(s,/id="try-demo"/);
 assert.match(s,/Sample data \(not live prices\)/i);
});
test('interactive example is accessible and uses real fail-closed engine',()=>{
 const html=read('index.html'),js=read('assets/demo-2027.mjs');
 assert.match(html,/aria-label="Choose a product comparison"/);
 for(const x of ['match','pack','brand'])assert.match(html,new RegExp('data-demo="'+x+'"'));
 assert.match(html,/role="status" aria-live="polite"/);
 assert.match(js,/import \{evaluate\} from '.\/review-engine.mjs'/);
 assert.match(js,/peerPack:input.pack/);assert.match(js,/peerBrand:input.brand/);
 assert.match(js,/sourceVerified/);
});
test('demo has no network or storage',()=>assert.doesNotMatch(read('assets/demo-2027.mjs'),/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|WebSocket/));
test('real app has an ungated reversible fictional one-click path',()=>{
 const html=read('app/index.html'),js=read('assets/app.mjs');
 assert.match(html,/id="fill-fictional-example"/);
 assert.match(js,/fill-fictional-example/);
 assert.match(js,/form\.requestSubmit\(\)/);
 assert.match(js,/invented example details/);
 assert.match(js,/source URL was not opened or verified/);
});
test('new design uses no third-party fonts or scripts',()=>{
 for(const p of routes){const s=read(p);assert.doesNotMatch(s,/<script[^>]+src="https?:/i,p);assert.doesNotMatch(s,/<link(?=[^>]*rel="(?:stylesheet|preload|icon)")(?=[^>]*href="https?:)[^>]*>/i,p);}
 const css=read('assets/warm-2027.css');
 assert.doesNotMatch(css,/@import|url\s*\(\s*['"]?https?:/i);
});
test('warm site remains accessible on reduced-motion and focus',()=>{
 const css=read('assets/warm-2027.css');
 assert.match(css,/prefers-reduced-motion/);
 assert.match(read('assets/site.css'),/:focus-visible/);
 assert.match(read('index.html'),/class="skip"/);
});
test('no checkout, hidden analytics, or fake customer proof in this preview',()=>{
 for(const p of routes){const s=read(p);assert.doesNotMatch(s,/checkout\.stripe\.com|google-analytics|segment\.com|mixpanel\.com|10,000\+ customers|trusted by 5,000/i,p);}
});
test('paid audit requires a separate human scope/quote and is not self-serve checkout',()=>{
 const pricing=read('pricing/index.html'), home=read('index.html');
 assert.match(pricing,/nothing here creates an automatic sale or binding quote/i);
 assert.match(pricing,/cannot take payment or make a binding offer/i);
 assert.match(home,/separately scoped and quoted/i);
 assert.doesNotMatch(pricing,/checkout\.stripe|<form\b/i);
});
