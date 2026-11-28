const fs=require("fs");let c=fs.readFileSync("sample-brief/index.html","utf8");let n=0;
const rep=(a,b,l)=>{if(!c.includes(a)){console.log("MISS "+l);return}c=c.replace(a,b);n++;console.log("ok "+l)};
rep('<h2 class="section-title">Five product pages. One practical fix order.</h2>','<h2 class="section-title" id="fix-order">Five product pages. One practical fix order.</h2>',"fix-order-id");
rep('details to confirm and one agreed recheck.</p>','details to confirm and one agreed recheck.</p>',"noop");
fs.writeFileSync("sample-brief/index.html",c);console.log("n="+n);
