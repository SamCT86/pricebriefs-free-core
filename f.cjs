const c=require("fs").readFileSync("sample-brief/index.html","utf8");
const re=/fix order|recheck|Recheck/gi; let m;
while((m=re.exec(c))) console.log(m.index, "::", c.substring(m.index-90,m.index+90).replace(/<[^>]+>/g," ").replace(/\s+/g," "));
