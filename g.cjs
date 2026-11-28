const c=require("fs").readFileSync("sample-brief/index.html","utf8");
console.log("A:", JSON.stringify(c.substring(3840,3930)));
console.log("B:", JSON.stringify(c.substring(4840,4930)));
