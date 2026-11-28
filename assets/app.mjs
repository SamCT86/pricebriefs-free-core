import {evaluateBatch,LIMITS} from './review-engine.mjs';
import {makeLocalExport} from './export-contract.mjs?v=20261123-safe1';
import {parsePriceBriefsCsv,csvTemplate,fictionalCsvSample25} from './csv-review.mjs';
import {explainCsvError} from './csv-diagnostics.mjs';

const form=document.querySelector('#review-form');
const result=document.querySelector('#review-result');
const add=document.querySelector('#add-observation');
const clearOwnButton=document.querySelector('#clear-own-entries');
const list=document.querySelector('#observations');
const exportButton=document.querySelector('#export-results');
const csvButton=document.querySelector('#review-csv');
const csvText=document.querySelector('#csv-text');
const templateButton=document.querySelector('#download-csv-template');
const fictionalCsvButton=document.querySelector('#download-fictional-csv');
const MANUAL_OBSERVATIONS_MAX=6;
const MANUAL_PRODUCTS_MAX=3;
/* Same identity tuple the engine groups on, so the manual cap matches the copy (3 products × 2 rows). */
const productKey=r=>JSON.stringify(['merchantBrand','merchantSku','merchantType','merchantVariant','merchantPack','merchantCondition']
 .map(k=>String(r?.[k]??'').trim().toUpperCase()));
function manualScopeOverflow(rows){
 const distinct=new Set(rows.map(productKey)).size;
 if(distinct<=MANUAL_PRODUCTS_MAX)return null;
 return 'Manual comparisons cover '+MANUAL_PRODUCTS_MAX+' products with 2 competitor observations each (6 rows). Remove '+
  (distinct-MANUAL_PRODUCTS_MAX)+' comparison(s) or review the whole set as CSV.';
}
let lastExport=null;
let reviewMode='manual'; // manual | csv | demo
let reviewSnapshot=null;
let hasReview=false;
let reviewedRows=null;
let reviewedAt=null;
const readFormRows=()=>[...list.querySelectorAll('fieldset')].map(fs=>
  Object.fromEntries([...fs.querySelectorAll('[name]')].map(el=>[el.name,el.value])));
const currentSnapshot=()=>reviewMode==='csv'?'csv:'+String(csvText?.value??''):'form:'+JSON.stringify(readFormRows());
function invalidateCurrentReview(){
  const hadReview=hasReview||lastExport!==null||(result && !result.hidden);
  lastExport=null;reviewSnapshot=null;hasReview=false;reviewedRows=null;reviewedAt=null;
  if(exportButton)exportButton.hidden=true;
  if(hadReview&&result){
    result.hidden=false;result.classList.add('hold');
    result.innerHTML='<h3>Details changed — check again</h3><p>Run the check again to update your results before downloading.</p>';
  }
}
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
/* The same 18 inputs as V2; group for first-time humans, do not guess any comparison-critical field. */
const labels=Object.freeze({
 merchantSku:'Manufacturer product ID on your listing (MPN or GTIN)',
 peerSku:'Manufacturer product ID on the other listing (same ID type)',
 merchantBrand:'Your brand',peerBrand:'Other listing brand',
 merchantType:'Your product category',peerType:'Other listing category',
 merchantVariant:'Your exact variant',peerVariant:'Other listing variant',
 merchantPack:'Your pack count',peerPack:'Other listing pack count',
 merchantPrice:'Your price',peerPrice:'Other listing price',
 sourceUrl:'Other product page URL (HTTPS)',observedAt:'When you observed the other listing'
});
const textInput=name=>{
 const title=labels[name];
 const attrs=name==='sourceUrl'?'type="url" placeholder="https://retailer.se/product"':
 name==='observedAt'?'type="datetime-local"':
 name.includes('Price')?'type="number" min="0.01" step="0.01"':
 name.includes('Pack')?'type="number" min="1" max="1000" step="1"':
 name.includes('Sku')?'type="text" placeholder="Manufacturer MPN or GTIN"':'type="text"';
 return '<label class="field '+(name==='sourceUrl'?'wide':'')+'">'+esc(title)+'<input name="'+name+'" '+attrs+' required></label>';
};
const condition=name=>'<label class="field">'+(name==='merchantCondition'?'Your':'Other listing')+' condition<select name="'+name+'"><option value="unknown">Unknown — HOLD</option><option value="new">New</option><option value="refurbished">Refurbished</option><option value="used">Used</option></select></label>';
const otherField=name=>name==='merchantCondition'||name==='peerCondition'?condition(name):
 name==='stock'?'<label class="field">Stock on the other listing<select name="stock"><option value="unknown">Unknown — HOLD</option><option value="in_stock">In stock (you checked)</option><option value="out_of_stock">Out of stock</option></select></label>':
 name==='currency'?'<label class="field">Currency (same for both prices)<select name="currency" required><option value="" selected disabled>Choose currency</option><option>USD</option><option>EUR</option><option>GBP</option><option>SEK</option></select></label>':
 textInput(name);
const group=(heading,hint,keys)=>
 '<section class="review-group" aria-label="'+esc(heading)+'"><h4>'+esc(heading)+'</h4><p class="review-hint">'+esc(hint)+'</p><div class="form-grid">'+keys.map(otherField).join('')+'</div></section>';
const rowMarkup=i=>'<fieldset class="form"><legend><strong>Comparison '+i+'</strong> · enter the details you collected</legend>'+
 group('1 · Your product','Start with the manufacturer’s product ID (MPN or GTIN), rather than your own store SKU.',
 ['merchantSku','merchantBrand','merchantType','merchantVariant','merchantPack','merchantCondition','merchantPrice'])+
 group('2 · The other listing','Use the same type of manufacturer ID on the other listing. A missing or different ID triggers HOLD.',
 ['peerSku','peerBrand','peerType','peerVariant','peerPack','peerCondition','peerPrice'])+
 group('3 · Source, stock and time','Confirm the other listing’s price, availability, taxes and delivery. The checker validates URL format only.',
 ['sourceUrl','observedAt','stock','currency'])+
 '<div class="row-actions"><button type="button" class="btn ghost" data-remove-comparison>Remove this comparison</button></div></fieldset>';

function showReview(rows){
  const manual=reviewMode!=='csv';
  const out=evaluateBatch(rows);
  result.hidden=false;
  hasReview=true;
  reviewSnapshot=currentSnapshot();
  result.classList.toggle('hold',out.status!=='OK'||out.results.some(r=>r.status==='HOLD'));
  const scopeHold=manual?manualScopeOverflow(rows):null;
  if(scopeHold){
    result.classList.add('hold');
    result.innerHTML='<h3>HOLD — manual limit reached</h3><p>'+esc(scopeHold)+'</p>';
    exportButton.hidden=true;lastExport=null;return;
  }
  if(out.status!=='OK'){
    const scope=manual?'Manual scope: max 3 products with 2 competitor observations each (6 rows).':out.reason;
    result.innerHTML='<h3>HOLD — comparison limit reached</h3><p>'+esc(scope)+'</p>';
    exportButton.hidden=true;lastExport=null;return;
  }
  const valid=out.results.filter(r=>r.status==='REVIEW').length;
  const parts=out.results.map((r,i)=>{
    const difference=r.deltaPct!==null?
      r.deltaPct>0?'Other price is lower by '+r.deltaPct.toFixed(1)+'%':
      r.deltaPct<0?'Other price is higher by '+Math.abs(r.deltaPct).toFixed(1)+'%':'Same listed price':'';
    return '<li><strong>Observation '+(i+1)+' · '+r.status+'</strong> <span class="unverified-label">Based on your entries</span> '+esc(difference)+'<ul>'+r.reasons.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></li>';
  });
  const disclosure=reviewMode==='demo'
    ?'See how the checker evaluates this <strong>sample comparison</strong>.'
    :reviewMode==='csv'
    ?'Your <strong>CSV results</strong> are ready. Confirm the original offers before acting.'
    :'Your <strong>comparison</strong> is ready. Confirm the original offers before acting.';
  result.innerHTML='<h3>'+valid+' reviewable · '+(out.results.length-valid)+' on hold</h3><p>'+disclosure+'</p><ol>'+parts.join('')+'</ol>';
  reviewedRows=rows.map(r=>({...r})); // immutable decision input for expiry recheck
  reviewedAt=new Date().toISOString();
  const data=makeLocalExport(rows,out.results);
  lastExport=reviewMode==='demo'?{
    ...data,source_kind:'FICTIONAL_DEMO_NOT_VERIFIED',synthetic_example:true,
    rows:data.rows.map(r=>({...r,synthetic_example:true})),
    warning:'FICTIONAL DEMO ONLY. These invented values are not independent market evidence.'
  }:data;
  exportButton.textContent=reviewMode==='demo'?'Download sample JSON':'Download JSON';
  exportButton.hidden=false;
}
function saveLocal(text,name,type){
  const blob=new Blob([text],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=name;
  document.body.append(a);a.click();a.remove();
  // Revoking in the same tick can cancel the download in non-Chromium engines.
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
if(form&&list&&result){
  list.innerHTML=rowMarkup(1);
  const demoNotice=document.querySelector('#example-disclaimer');
  const LEGEND_SUFFIX=' · enter the details you collected';
  /* Leaving the sample must also leave the FICTIONAL_DEMO export label, or edited
     values keep downloading as invented sample data. */
  const leaveDemo=()=>{
    if(reviewMode!=='demo')return;
    reviewMode='manual';
    add.disabled=false;
    const clearDemo=document.querySelector('#clear-fictional-example');
    if(clearDemo)clearDemo.hidden=true;
    const legend=list.querySelector('legend');
    if(legend)legend.textContent='Comparison 1'+LEGEND_SUFFIX;
    if(demoNotice)demoNotice.textContent='Editing turns these sample values into your own entries.';
  };
  const resetForm=()=>{
    invalidateCurrentReview();
    list.innerHTML=rowMarkup(1);
    add.disabled=false;
    reviewMode='manual';
    const clearDemo=document.querySelector('#clear-fictional-example');
    if(clearDemo)clearDemo.hidden=true;
    // No stale "check again" box hovering above a now-empty form.
    result.hidden=true;
  };
  const clearOwn=()=>{
    resetForm();
    if(csvText)csvText.value='';
  };
  clearOwnButton?.addEventListener('click',()=>{
    const populated=readFormRows().some(row=>Object.entries(row).some(([k,v])=>
      !['merchantCondition','peerCondition','stock','currency'].includes(k)&&String(v).trim()!==''));
    if((populated||String(csvText?.value??'').trim())&&
      !window.confirm('Clear your comparison entries and CSV text?'))return;
    clearOwn();
  });
  list.addEventListener('click',e=>{
    const button=e.target.closest('[data-remove-comparison]');
    if(!button)return;
    const outer=button.closest('fieldset.form');
    if(!outer)return;
    invalidateCurrentReview();
    if(reviewMode==='demo')leaveDemo();
    if(list.querySelectorAll('fieldset').length===1)list.innerHTML=rowMarkup(1);
    else outer.remove();
    add.disabled=false;
    [...list.querySelectorAll('fieldset')].forEach((fs,i)=>{
      const legend=fs.querySelector('legend');
      if(legend)legend.textContent='Comparison '+(i+1)+LEGEND_SUFFIX;
    });
    add.focus(); // the clicked button is gone; keep the keyboard position predictable
  });
  // A blur/change event can arrive after a CSV Review click; do not invalidate a result
  // whose exact source snapshot was just reviewed. Real edits still fail closed.
  const onChange=e=>{
    const changedCsv=e?.target===csvText;
    if(reviewMode==='demo')leaveDemo();
    // CSV and form are independent acquisition paths. A late form blur/change
    // after clicking "Review CSV" must not invalidate already reviewed CSV rows.
    // Only an edit to the currently reviewed source can stale its result.
    if(reviewMode==='csv'&&!changedCsv)return;
    if(changedCsv && reviewMode!=='csv'){
      // Switching from a demo/form to a CSV is not a valid way to retain old results.
      invalidateCurrentReview();return;
    }
    // A late textarea blur/change must preserve a displayed CSV parse error
    // for the exact same input, even when no successful review was created.
    if(reviewMode==='csv' && changedCsv && reviewSnapshot===currentSnapshot())return;
    if(hasReview && reviewSnapshot===currentSnapshot())return;
    invalidateCurrentReview();
  };
  form.addEventListener('input',onChange);
  form.addEventListener('change',onChange);
  csvText?.addEventListener('input',onChange);
  csvText?.addEventListener('change',onChange);
  add?.addEventListener('click',()=>{
    if(reviewMode==='demo')return;
    invalidateCurrentReview();
    const n=list.querySelectorAll('fieldset').length;
    if(n>=MANUAL_OBSERVATIONS_MAX){add.disabled=true;return;}
    list.insertAdjacentHTML('beforeend',rowMarkup(n+1));
    if(n+1>=MANUAL_OBSERVATIONS_MAX)add.disabled=true;
    const fresh=[...list.querySelectorAll('fieldset')].pop();
    fresh?.querySelector('input,select')?.focus();
  });
  form.addEventListener('submit',e=>{
    e.preventDefault();
    if(reviewMode==='csv')reviewMode='manual';
    showReview(readFormRows());
  });
  csvButton?.addEventListener('click',()=>{
    invalidateCurrentReview();
    if(reviewMode==='demo'){
      list.innerHTML=rowMarkup(1);
      add.disabled=false;
      const clear=document.querySelector('#clear-fictional-example');
      if(clear)clear.hidden=true;
    }
    reviewMode='csv';
    try{showReview(parsePriceBriefsCsv(csvText?.value??''));}
    catch(e){
      result.hidden=false;result.classList.add('hold');
      result.innerHTML='<h3>Fix the CSV and try again</h3><p>'+esc(explainCsvError(e,csvText?.value??''))+'</p><p>Use the 18-column template, then paste 1–500 complete rows. Your data stays in your browser.</p>';
      // Preserve the input snapshot for a failed parse, too. A delayed blur
      // with unchanged input cannot erase the diagnostic; edits still can.
      reviewSnapshot=currentSnapshot();
      exportButton.hidden=true;lastExport=null;
    }
    result.scrollIntoView({block:'nearest',behavior:'smooth'});
  });
  templateButton?.addEventListener('click',()=>saveLocal(csvTemplate(),'pricebriefs-blank-template.csv','text/csv;charset=utf-8'));
  fictionalCsvButton?.addEventListener('click',()=>saveLocal(fictionalCsvSample25(),'pricebriefs-FICTIONAL-25-row-example.csv','text/csv;charset=utf-8'));
  exportButton?.addEventListener('click',()=>{
    if(!lastExport||!reviewedRows)return;
    if(reviewSnapshot!==currentSnapshot()){invalidateCurrentReview();return;}
    // Time passes without input events. A REVIEW can expire before download.
    // Re-evaluate against the current wall clock, fail closed if the finding changed.
    const fresh=evaluateBatch(reviewedRows);
    if(fresh.status!=='OK'||fresh.results.length!==lastExport.rows.length||
      fresh.results.some((r,i)=>r.status!==lastExport.rows[i].review_status||
        r.deltaPct!==lastExport.rows[i].delta_pct)){
      invalidateCurrentReview();
      result.innerHTML='<h3>Review expired — check again</h3><p>The earlier result is no longer current. Update the observation and check again before downloading.</p>';
      return;
    }
    const filename=reviewMode==='demo'?'pricebriefs-FICTIONAL-example.json':'pricebriefs-unverified-local-review.json';
    saveLocal(JSON.stringify({...lastExport,exported_at:new Date().toISOString(),
      reviewed_at:reviewedAt},null,2),filename,'application/json');
  });
}

/* One-click fictional example. User can edit every field; no invented source is fetched. */
const demoButton=document.querySelector('#fill-fictional-example');
const clearDemoButton=document.querySelector('#clear-fictional-example');
demoButton?.addEventListener('click',()=>{
  if(!form||!list||!result)return;
  const filled=readFormRows().some(r=>Object.entries(r).some(([k,v])=>
    !['merchantCondition','peerCondition','stock','currency'].includes(k) && String(v).trim()!==''));
  const hasCsv=String(csvText?.value??'').trim()!=='';
  if(reviewMode!=='demo'&&(filled||hasCsv) &&
    !window.confirm('Replace your current entries with a sample comparison?'))return;
  invalidateCurrentReview();
  list.innerHTML=rowMarkup(1); // never combine a demo with existing rows
  if(csvText)csvText.value='';
  reviewMode='demo';
  add.disabled=true;
  if(clearDemoButton)clearDemoButton.hidden=false;
  const synthetic={
    merchantSku:'PB-FICTION-18V',peerSku:'PB-FICTION-18V',
    merchantBrand:'Northstar Tools',peerBrand:'Northstar Tools',
    merchantType:'Cordless Drill',peerType:'Cordless Drill',
    merchantVariant:'Starter kit',peerVariant:'Starter kit',
    merchantPack:'1',peerPack:'1',
    merchantCondition:'new',peerCondition:'new',
    merchantPrice:'199',peerPrice:'179',
    sourceUrl:'https://pricebriefs.com/demo/fictional-observation',
    observedAt:(()=>{
      const observed=new Date(Date.now()-5*60*1000);
      return new Date(observed.getTime()-observed.getTimezoneOffset()*60000).toISOString().slice(0,16);
    })(),
    stock:'in_stock',currency:'USD'
  };
  const row=list.querySelector('fieldset');
  const legend=row?.querySelector('legend');
  if(legend)legend.textContent='Sample comparison 1';
  for(const [name,value] of Object.entries(synthetic)){
    const field=row?.querySelector('[name="'+name+'"]');
    if(field)field.value=value;
  }
  form.requestSubmit();
  const notice=document.querySelector('#example-disclaimer');
  if(notice)notice.textContent='Sample data loaded. Edit any field, or select “Start with a blank form”.';
  result.scrollIntoView({behavior:'smooth',block:'nearest'});
});
clearDemoButton?.addEventListener('click',()=>{
  if(!form||!list)return;
  invalidateCurrentReview();
  list.innerHTML=rowMarkup(1);
  reviewMode='manual';
  add.disabled=false;
  clearDemoButton.hidden=true;
  result.hidden=true;
  const notice=document.querySelector('#example-disclaimer');
  if(notice)notice.textContent='Ready for your product details.';
});
