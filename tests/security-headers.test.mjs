import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=['index.html','app/index.html','pricing/index.html','product/index.html',
'how-it-works/index.html','trust/index.html','sample-brief/index.html','request/index.html'];
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const headers=read('_headers');
test('Cloudflare Pages static _headers exists with exact wildcard route',()=>{
 assert.match(headers,/^\/\*\r?\n/);
 assert.equal(headers.match(/^\s+Content-Security-Policy:/gm)?.length,1);
});
test('CSP protects scripts, connection, objects, framing and base form without external user input',()=>{
 const csp=headers.match(/Content-Security-Policy:\s*(.+)$/m)?.[1];
 assert.ok(csp);
 for(const v of ["default-src 'self'","script-src 'self'","connect-src 'none'",
  "object-src 'none'","base-uri 'self'","form-action 'self'","frame-ancestors 'none'"]){
  assert.ok(csp.includes(v),v);
 }
 assert.doesNotMatch(csp,/script-src[^;]*'unsafe-inline'|script-src[^;]*'unsafe-eval'/);
 assert.match(headers,/^\s+X-Frame-Options: DENY$/m);
 assert.match(headers,/^\s+X-Content-Type-Options: nosniff$/m);
 assert.match(headers,/^\s+Referrer-Policy: strict-origin-when-cross-origin$/m);
});
test('all eight pages use external local script files only, no inline JS or event handlers',()=>{
 for(const p of pages){
  const h=read(p);
  const tags=h.match(/<script\b[^>]*>/gi)||[];
  for(const script of tags){
   assert.match(script,/src="\/assets\/[\w.-]+(?:\?v=\d{8}-[a-z0-9]+)?"/,p);
   assert.doesNotMatch(script,/https?:\/\//i,p);
  }
  assert.doesNotMatch(h,/\s(?:onload|onclick|onerror|onmouseover|onfocus)\s*=/i,p);
 }
});
test('no accidental external credential or webhook tokens in source payloads',()=>{
 for(const f of ['assets/app.mjs','assets/review-engine.mjs','assets/csv-review.mjs','assets/export-contract.mjs']){
  const s=read(f);
  const secretShapes=new RegExp(['sk','live'].join('_')+'_[0-9a-z]+|Bearer\\s+[a-z0-9_.-]{24,}|PRIVATE[_ ]KEY','i');
  assert.doesNotMatch(s,secretShapes,f);
 }
});
