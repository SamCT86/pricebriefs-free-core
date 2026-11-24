import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=['index.html','pricing/index.html','product/index.html','how-it-works/index.html','trust/index.html','app/index.html','sample-brief/index.html','request/index.html'];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
test('all eight website routes exist with one main and prelaunch disclosure',()=>{for(const p of pages){const h=read(p);assert.equal((h.match(/<main(?:\s|>)/g)||[]).length,1,p);assert.equal((h.match(/<\/main>/g)||[]).length,1,p);if(p==='index.html')assert.match(h,/Open the free comparison checker/,p);else if(['pricing/index.html','request/index.html'].includes(p))assert.match(h,/FREE CHECKER OPEN/,p);else assert.match(h,/Customer access is not open/,p);if(['index.html','pricing/index.html','request/index.html'].includes(p))assert.match(h,/index,follow/,p);else assert.match(h,/noindex,nofollow/,p);assert.match(h,/href="\/assets\/site.css"/,p)}});
test('no legacy compulsory $29 or $249 subscription copy',()=>{for(const p of pages)assert.doesNotMatch(read(p),/\$(?:29|249)(?:[^\d]|$)/,p)});
test('no active checkout, signup form or Stripe in rendered pages',()=>{for(const p of pages)assert.doesNotMatch(read(p),/checkout\.stripe|stripe\.com|href="\/checkout\/"|<script[^>]+src="https?:\/\//i,p)});
test('home CTA leads to actual free local checker',()=>{assert.match(read('index.html'),/href="\/app\/"/);assert.match(read('app/index.html'),/id="review-form"/);assert.match(read('app/index.html'),/src="\/assets\/app\.mjs(?:\?v=\d{8}-[a-z0-9]+)?"/)});
test('source transparency and data ownership available',()=>{assert.match(read('trust/index.html'),/does not transmit/i);assert.match(read('pricing/index.html'),/separately scoped/i);assert.match(read('product/index.html'),/review status means/i)});
test('no fabricated customer counts or current monitoring claims',()=>{for(const p of pages)assert.doesNotMatch(read(p),/10,000\+|guaranteed savings|live tracking|real-time monitoring is live/i,p)});
test('only local assets for fonts/images/js',()=>{for(const p of pages)assert.doesNotMatch(read(p),/(?:src|href)="https?:\/\/(?:cdn|fonts|analytics|google)/i,p)});
test('real user inputs are not sent to API, tracker or storage',()=>{const app=read('assets/app.mjs');assert.doesNotMatch(app,/\bfetch\s*\(|XMLHttpRequest|localStorage|sessionStorage|sendBeacon/);assert.match(app,/new Blob/);assert.doesNotMatch(app,/new FormData\(fs\)/)});
test('app JS and engine files exist and are ESM',()=>{assert.match(read('assets/app.mjs'),/import \{evaluateBatch,LIMITS\}/);assert.match(read('assets/review-engine.mjs'),/export function evaluate/);});
test('responsive and accessible styles included',()=>{const css=read('assets/site.css');assert.match(css,/@media\(max-width:760px\)/);assert.match(css,/prefers-reduced-motion/);assert.match(css,/:focus-visible/);assert.match(read('app/index.html'),/aria-live="polite"/)});
test('CSV intake and local JSON export exist without any upload or secret side channel',()=>{
 const html=read('app/index.html'),app=read('assets/app.mjs');
 assert.match(html,/id="csv-workflow"/);assert.match(html,/id="csv-text"/);assert.match(html,/id="review-csv"/);
 assert.match(app,/parsePriceBriefsCsv/);assert.match(app,/makeLocalExport/);
 assert.doesNotMatch(app,/\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|localStorage|sessionStorage/);
 assert.doesNotMatch(read('assets/csv-review.mjs'),/\bfetch\s*\(|XMLHttpRequest|sendBeacon/);
});
test('price and product claims include brand, pack and honest local review boundaries',()=>{
 assert.match(read('product/index.html'),/brand, category, variant, pack size and condition/);
 assert.match(read('pricing/index.html'),/Manual entry or local CSV import/);
 assert.match(read('app/index.html'),/This runs locally/);
 assert.match(read('README.md'),/124 tests/);
});
