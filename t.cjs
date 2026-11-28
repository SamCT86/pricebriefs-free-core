const c=require("fs").readFileSync("agency/index.html","utf8");const i=c.indexOf("<h1");console.log(JSON.stringify(c.substring(i-60,i+400)));
