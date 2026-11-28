const fs = require("fs");
const p = "index.html";
let c = fs.readFileSync(p, "utf8");
const before = c;
const rep = (from, to, label) => {
  if (!c.includes(from)) { console.log("MISS: " + label); return; }
  c = c.replace(from, to);
  console.log("ok: " + label);
};
rep("<title>PriceBriefs | Check the match. Protect your margin.</title>",
    "<title>Price mismatch checker for ecommerce | PriceBriefs</title>", "title");
rep('content="PriceBriefs | Check the match. Protect your margin."',
    'content="Price mismatch checker for ecommerce | PriceBriefs"', "og:title");
rep('content="Compare product details before matching prices. Use the free checker or request a focused product-data audit with a clear fix order."',
    'content="Compare product ID, variant and pack before you match a price. Free in your browser, no account. Five-SKU audit with dated evidence and a fix order, 349 USD."', "description");
rep('content="Check whether offers match. Find the details that matter before you make a price decision."',
    'content="Find the mismatch before it costs margin. Free comparison, paid source audit with evidence."', "og:description");
rep("<h1>Check the match.<br><em>Protect your margin.</em></h1>",
    "<h1>Check the product.<br><em>Before you match the price.</em></h1>", "h1");
rep("Don\u2019t lower your price for the wrong product. Compare the details for free, or request a human-reviewed audit for a pricing or feed issue.",
    "A price that matches the wrong product costs margin. Compare product ID, variant and pack in the browser, free and without an account. If the source needs checking, a five-SKU audit with dated evidence, a fix order and one recheck: 349 USD.", "lede");
rep('<a class="v7-secondary" href="/request/">Request an audit <span aria-hidden="true">&rarr;</span></a>',
    '<a class="v7-text-link" href="/request/">Request an audit <span aria-hidden="true">&rarr;</span></a>', "demote secondary cta");
rep('<p class="v7-note">Start free. No account. Your store stays in your hands.</p>',
    '<p class="v7-note">Runs locally in your browser. Does not touch your store. 349 USD only if you want the source checked.</p>', "note");
fs.writeFileSync(p, c);
console.log("changed=" + (c !== before));
