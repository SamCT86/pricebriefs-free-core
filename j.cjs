const fs=require("fs");let c=fs.readFileSync("sample-brief/index.html","utf8");
const a='<p class="money-note">Your agreed audit includes';
if(!c.includes(a))console.log("MISS recheck");else{c=c.replace(a,'<p class="money-note" id="recheck">Your agreed audit includes');fs.writeFileSync("sample-brief/index.html",c);console.log("ok recheck-id")}
