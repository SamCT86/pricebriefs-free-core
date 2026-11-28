const c=require("fs").readFileSync("sample-brief/index.html","utf8");
console.log("ids:", [...c.matchAll(/id="([a-z0-9-]+)"/g)].map(m=>m[1]).join(", "));
console.log("h3:", [...c.matchAll(/<h3[^>]*>([\s\S]{0,70}?)<\/h3>/g)].map(m=>m[1].replace(/<[^>]+>/g,"")).join(" | "));
