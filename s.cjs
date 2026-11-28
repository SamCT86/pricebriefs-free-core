const fs=require("fs");let n=0;
const patch=(p,pairs)=>{let c=fs.readFileSync(p,"utf8");for(const [a,b,l] of pairs){if(!c.includes(a)){console.log("MISS "+l);continue}c=c.replace(a,b);n++;console.log("ok "+l)}fs.writeFileSync(p,c)};
patch("request/index.html",[
 ["<h1>Get a clear next step for your price or feed issue.</h1>","<h1>Tell us the decision, not the story.</h1>","req-h1"],
 ['<p class="lead">Tell us what happened, what decision you need to make and which public pages are relevant. Get a written quote in an agreed currency before work starts.</p>','<p class="lead">Four things and we can quote: the decision you need to make, the public pages involved, the date the prices were seen and your deadline. Written quote in an agreed currency within one working day.</p>',"req-lead"]]);
console.log("n="+n);
