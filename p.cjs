const c=require("fs").readFileSync("pricing/index.html","utf8");
for (const a of ["<h1","Start free.","indicative","One-time"]) { const i=c.indexOf(a); console.log("### "+a+" @"+i); if(i>=0) console.log(JSON.stringify(c.substring(i-80,i+220))); }
