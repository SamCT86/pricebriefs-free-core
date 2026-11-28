const fs=require("fs");const p="app/index.html";let c=fs.readFileSync(p,"utf8");let n=0;
const rep=(a,b,l)=>{if(!c.includes(a)){console.log("MISS "+l);return}c=c.replace(a,b);n++;console.log("ok "+l)};
rep("<h1>Compare product details.<br><em>Before you act.</em></h1>","<h1>Catch the mismatch.<br><em>Before you act on the price.</em></h1>","h1");
rep('<p class="lead">Check whether the two offers match before you change a price. Start with your own product details or try an example. Free to use, with no account needed.</p>','<p class="lead">Compare product ID, variant and pack before a price change. Start with the example: the verdict appears in ten seconds. Free, no account.</p>',"lead");
rep("<h2>Try a comparison first.</h2>","<h2>See a verdict in ten seconds.</h2>","h2");
rep("<p>Load sample data and see the result straight away.</p>","<p>One click loads a pack-size conflict. Then swap in your own details.</p>","strip-note");
rep('>Use my own details</button>','>Start with a blank form</button>',"ghost-label");
rep('<p class="form-help" id="example-disclaimer">Sample product details and prices. No live prices are fetched.</p>','<p class="form-help" id="example-disclaimer">Sample product details and prices. No live prices are fetched. Most first checks end in HOLD on pack size or product ID — that is the tool working, not failing.</p>',"disclaimer");
fs.writeFileSync(p,c);console.log("edits="+n);
