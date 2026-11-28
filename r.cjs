const fs=require("fs");const c=fs.readFileSync("request/index.html","utf8");
const i=c.indexOf("<h1");console.log(JSON.stringify(c.substring(i-40,i+420)));
