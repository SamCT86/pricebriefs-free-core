export function marginImpact(price,cost,cut,units){
 if(![price,cost,cut,units].every(Number.isFinite)||price<=0||cost<0||cut<0||cut>price||units<0||!Number.isInteger(units)||Math.max(price,cost,cut,units)>1e9) return null;
 const before=(price-cost)*units,after=(price-cut-cost)*units,loss=cut*units;
 const breakEven=price-cut-cost>0&&before>0?Math.ceil(before/(price-cut-cost)):null;
 return {before,after,loss,breakEven};
}
if(typeof document!=='undefined'){
 const f=document.querySelector('#margin-form'),out=document.querySelector('#margin-output');
 if(f&&out){const fmt=n=>new Intl.NumberFormat('en',{maximumFractionDigits:2}).format(n);
 const refresh=()=>{const v=['price','cost','cut','units'].map(n=>{const x=f.querySelector('[name='+n+']');return x.value.trim()===''?NaN:Number(x.value)});const r=marginImpact(...v);
 if(!r){out.textContent='Check your inputs: use a positive selling price, a reduction no larger than the price, a nonnegative cost and a whole number of units.';return}
 out.textContent='Gross profit before: '+fmt(r.before)+' | After: '+fmt(r.after)+' | Gross profit reduction: '+fmt(r.loss)+' | Units needed after cut to match prior gross profit: '+(r.breakEven===null?'No meaningful break-even volume at this margin':fmt(r.breakEven));};
 f.querySelector('button').addEventListener('click',refresh);f.addEventListener('input',refresh);refresh();}
}