const fs=require("fs");let c=fs.readFileSync("sample-brief/index.html","utf8");
const a='details to confirm and one agreed recheck.</p>';
const i=c.indexOf(a); console.log(JSON.stringify(c.substring(i-300,i)));
