const fs=require("fs");let c=fs.readFileSync("pricing/index.html","utf8");let n=0;
const rep=(a,b,l)=>{if(!c.includes(a)){console.log("MISS "+l);return}c=c.replace(a,b);n++;console.log("ok "+l)};
rep("<h1>Start free.<br><em>Get expert help when you need it.</em></h1>","<h1>349 USD.<br><em>One issue, five pages, one recheck.</em></h1>","h1");
rep('<p class="lead">Compare your own product details for free. For a complex price or feed issue, request a human-reviewed audit and a written quote.</p>',
 '<p class="lead">The comparison is free and runs in your browser. The audit is for when the page alone does not settle it.</p><p><b>Included:</b> dated source observation per page, a prioritized fix order, one agreed recheck, and a written quote before any work.</p><p><b>Not included:</b> price changes, feed edits, Merchant Center account access.</p>',"lead-and-scope");fs.writeFileSync("pricing/index.html",c);console.log("n="+n);
