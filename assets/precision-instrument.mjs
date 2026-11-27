/* V5 browser-local entry, explicitly gated public-source evidence, and generated action brief. */
import {checkProductPageUrl,emailDraftForUrl,evaluateFictionalScenario} from './precision-ui-contract.mjs';
// Stage16 FRONTEND ONLY: no source backend, D1, checkout or case API is included.
const PUBLIC_SOURCE_ENABLED=false;
const el=id=>document.querySelector(id);
const input=el('#pi-product-url'),button=el('#pi-check'),status=el('#pi-status');
const options=el('#pi-verified-options'),draft=el('#pi-draft-link');
const sourceUnlock=el('#pi-source-unlock'),runSource=el('#pi-run-source'),sourcePanel=el('#pi-source-result');
const incidentPanel=el('#pi-incident-pack'),recheckButton=el('#pi-incident-recheck');
let lastUrl=null,revision=0,activePack=null,activeMarkdown='',activeReceipt=null,activeExpiry=null;
let activeSourceController=null,activeRecheckController=null;
function cancelStaleRequests(){
  if(activeSourceController)activeSourceController.abort();
  if(activeRecheckController)activeRecheckController.abort();
  activeSourceController=null;activeRecheckController=null;
}
const write=(id,value)=>{const n=el(id);if(n)n.textContent=String(value??'');};
function clearIncident(){
  activePack=null;activeMarkdown='';activeReceipt=null;activeExpiry=null;
  if(incidentPanel)incidentPanel.hidden=true;
  if(recheckButton){recheckButton.hidden=true;recheckButton.disabled=false;}
  const result=el('#pi-incident-recheck-result');if(result){result.hidden=true;result.textContent='';}
}
function resetStatus(){
  cancelStaleRequests();
  revision++;lastUrl=null;clearIncident();
  if(options)options.hidden=true;
  if(sourceUnlock)sourceUnlock.hidden=true;
  if(sourcePanel)sourcePanel.hidden=true;
  if(runSource)runSource.disabled=false;
  if(status)status.textContent='';
  if(input)input.removeAttribute('aria-invalid');
}
async function discoverSourceCapability(url,token){
  // A same-origin capability GET never includes product input or external source fetches.
  try{
    const response=await fetch('/api/precheck',{method:'GET',mode:'same-origin',credentials:'omit',
      cache:'no-store',headers:{Accept:'application/json'}});
    if(!response.ok)return;
    const cap=await response.json();
    if(revision===token&&lastUrl===url&&cap?.enabled===true&&sourceUnlock)sourceUnlock.hidden=false;
  }catch{/* static deployment keeps browser-local checker/quote route */}
}
function check(){
  if(!input||!status||!options||!draft)return;
  cancelStaleRequests();
  if(runSource)runSource.disabled=false;
  const token=++revision;lastUrl=null;clearIncident();
  if(sourcePanel)sourcePanel.hidden=true;
  if(sourceUnlock)sourceUnlock.hidden=true;
  const result=checkProductPageUrl(input.value);
  input.setAttribute('aria-invalid',String(!result.ok));
  status.dataset.state=result.ok?'info':'error';
  status.textContent=result.reason;
  options.hidden=!result.ok;
  if(result.ok){
    const note=el('#pi-verified-options .pi-status-copy');
    if(note)note.textContent='No page was fetched. Use the browser-local checker, or prepare an email request.';
    lastUrl=result.normalized;
    const href=emailDraftForUrl(result.normalized);if(href)draft.href=href;
    if(PUBLIC_SOURCE_ENABLED)void discoverSourceCapability(lastUrl,token);
  }
}
if(input&&button){
  button.addEventListener('click',check);
  input.addEventListener('input',resetStatus);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();check();}});
}
function showIncident(incident){
  const pack=incident?.pack;
  if(!incidentPanel||pack?.schemaVersion!=='pb-incident-pack-v1'||
    !Array.isArray(pack.actions)||pack.actions.length<1||pack.actions.length>4)return;
  activePack=pack;activeMarkdown=typeof incident.markdown==='string'?incident.markdown:'';
  activeReceipt=typeof incident.signedRecheckReceipt==='string'?incident.signedRecheckReceipt:null;
  activeExpiry=incident.receiptExpiresAt||null;
  incidentPanel.hidden=false;
  write('#pi-incident-id',pack.caseId);
  write('#pi-incident-status',pack.caseStatus+' · DECLARED PAGE DATA ONLY');
  write('#pi-incident-summary',pack.statement);
  const list=el('#pi-incident-actions');
  if(list){
    list.replaceChildren();
    for(const action of pack.actions){
      const item=document.createElement('li');
      item.textContent=String(action.action||'')+' Required: '+String(action.requiredEvidence||'UNKNOWN');
      list.appendChild(item);
    }
  }
  const download=el('#pi-incident-download');if(download)download.disabled=!activeMarkdown;
  const receipt=el('#pi-incident-receipt');if(receipt)receipt.disabled=!activePack;
  if(recheckButton){
    recheckButton.hidden=!activeReceipt;
    recheckButton.disabled=false;
  }
  write('#pi-incident-recheck-help',activeReceipt?
    'A signed, limited public-source recheck is available. It can compare page declarations, not confirm a customer fix.':
    'Automatic recheck is unavailable until source and signing permissions are configured.');
}
async function readApprovedSource(){
  if(!lastUrl||!runSource||!status||!sourcePanel)return;
  const token=revision,url=lastUrl;clearIncident();runSource.disabled=true;
  write('#pi-source-summary','Requesting one approved public page. No merchant account access.');
  sourcePanel.hidden=false;write('#pi-source-state','CHECKING');
  write('#pi-source-url','Not fetched');write('#pi-source-time','Not observed');
  write('#pi-source-hash','Unknown');write('#pi-source-prices','Unknown');
  const controller=new AbortController();activeSourceController=controller;
  const timeout=setTimeout(()=>controller.abort(),7500);
  try{
    const response=await fetch('/api/precheck',{method:'POST',mode:'same-origin',
      credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',
      headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({url}),signal:controller.signal});
    const result=await response.json();
    if(token!==revision||url!==lastUrl)return;
    const allowed=new Set(['REVIEW','HOLD','UNKNOWN','NO_FINDING']);
    const state=allowed.has(result?.status)?result.status:'HOLD';
    write('#pi-source-state',state);
    const reason=String(result?.reason||result?.errorCode||
      'No supported source conclusion is available; no price is claimed.').slice(0,350);
    write('#pi-source-summary',reason);
    if(result?.source&&typeof result.source==='object'){
      status.dataset.state='info';
      status.textContent='One approved public page was fetched. Only its price declarations were compared; the visible price and merchant account were not checked.';
      const note=el('#pi-verified-options .pi-status-copy');
      if(note)note.textContent='A bounded public-source observation is shown below. Your local checker and email route remain available.';
      write('#pi-source-url',String(result.source.url||'Not fetched').slice(0,1024));
      write('#pi-source-time',String(result.source.observedAt||'Not observed').slice(0,80));
      write('#pi-source-hash',String(result.source.sha256||'Unknown').slice(0,80));
    }
    const signals=Array.isArray(result?.checks)?result.checks.slice(0,3):[];
    write('#pi-source-prices',signals.length?signals.map(x=>
      String(x.field||'')+': '+String(x.observed??'UNKNOWN')).join(' / ').slice(0,350):'Unknown');
    if(response.ok&&result?.incident?.pack)showIncident(result.incident);
    if(!response.ok){status.dataset.state='error';
      status.textContent='Source access is not approved or available; your local checker remains available.';}
  }catch{
    if(token!==revision||url!==lastUrl)return;
    write('#pi-source-state','HOLD');
    write('#pi-source-summary','The source check did not finish. No live price or case resolution is claimed.');
  }finally{
    clearTimeout(timeout);
    // A completed OLD request must never unlock the button of a NEW request.
    if(activeSourceController===controller)activeSourceController=null;
    if(runSource&&token===revision&&url===lastUrl)runSource.disabled=false;
  }
}
if(runSource)runSource.addEventListener('click',()=>{void readApprovedSource();});
function downloadFile(content,filename,mime){
  if(typeof content!=='string'||content.length>50000)return;
  const blob=new Blob([content],{type:mime});
  const href=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=href;link.download=filename;
  document.body.appendChild(link);link.click();link.remove();
  setTimeout(()=>URL.revokeObjectURL(href),500);
}
const downloadPack=el('#pi-incident-download');
if(downloadPack)downloadPack.addEventListener('click',()=>{
  if(activePack&&activeMarkdown)downloadFile(activeMarkdown,
    'PriceBriefs-'+activePack.caseId+'-Decision-Fix-Pack.md','text/markdown;charset=utf-8');
});
const downloadReceipt=el('#pi-incident-receipt');
if(downloadReceipt)downloadReceipt.addEventListener('click',()=>{
  if(!activePack)return;
  downloadFile(JSON.stringify({schemaVersion:'pb-portable-public-case-v1',
    case:activePack,signedRecheckReceipt:activeReceipt,receiptExpiresAt:activeExpiry,
    warning:'PUBLIC SOURCE ONLY. A downloadable receipt is not customer acceptance, a verified fix or exactly-once billing evidence.'
  },null,2), 'PriceBriefs-'+activePack.caseId+'-Source-Receipt.json','application/json;charset=utf-8');
});
async function performRecheck(){
  if(!activeReceipt||!recheckButton||!activePack)return;
  const token=revision,receipt=activeReceipt;
  recheckButton.disabled=true;
  const display=el('#pi-incident-recheck-result');
  if(display){display.hidden=false;display.textContent='Checking the same approved public page. No merchant account access.';}
  const controller=new AbortController();activeRecheckController=controller;
  const timeout=setTimeout(()=>controller.abort(),7500);
  let success=false;
  try{
    const response=await fetch('/api/recheck',{method:'POST',mode:'same-origin',
      credentials:'omit',cache:'no-store',referrerPolicy:'no-referrer',
      headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({receipt}),signal:controller.signal});
    const result=await response.json();
    if(token!==revision||receipt!==activeReceipt)return;
    if(response.ok&&result?.recheck?.schemaVersion==='pb-incident-recheck-v1'&&
       result.recheck.caseId===activePack.caseId){
      const r=result.recheck;
      if(display){display.textContent='Recheck: '+String(r.comparisonState)+
        '. Original: '+String(r.baselineStatus)+'. Current: '+String(r.currentStatus)+
        '. Source data observed at '+String(r.after?.observedAt||'UNKNOWN')+
        '. Merchant account resolution: UNKNOWN. No actual fix is verified.';}
      success=true;
    }else if(display){display.textContent='Recheck on hold: '+String(result?.errorCode||'SOURCE_UNAVAILABLE')+
      '. This does not prove an account error or resolution.';}
  }catch{
    if(token===revision&&receipt===activeReceipt&&display)
      display.textContent='Recheck could not finish. The earlier source observation remains unchanged.';
  }finally{
    clearTimeout(timeout);
    if(activeRecheckController===controller)activeRecheckController=null;
    if(recheckButton&&token===revision)recheckButton.disabled=success;
  }
}
if(recheckButton)recheckButton.addEventListener('click',()=>{void performRecheck();});

const demo=el('.pi-demo-switch'),card=el('[data-pi-card="primary"]');
const label=el('#pi-evidence-state'),title=el('#pi-evidence-title');
const description=el('#pi-evidence-desc'),reason=el('#pi-demo-reason');
function choose(key){
  if(!demo||!card||!label||!title||!description||!reason)return;
  const result=evaluateFictionalScenario(key);
  demo.querySelectorAll('[data-pi-scenario]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.piScenario===key)));
  card.dataset.state=result.status.toLowerCase();
  card.dataset.sourceVerified='false';
  label.textContent=result.status;
  title.textContent=result.title;
  description.textContent=result.status==='HOLD'?
    'The supplied fields are insufficient or inconsistent; do not compare prices.':
    'Supplied details look comparable. This is a review candidate, not verified market evidence.';
  reason.textContent='FICTIONAL EXAMPLE ONLY. '+result.reasons.join(' ')+
    ' No actual source or merchant account was inspected.';
}
if(demo&&card&&label&&title&&description&&reason){
  demo.addEventListener('click',event=>{
    const b=event.target.closest('[data-pi-scenario]');
    if(b&&demo.contains(b))choose(b.dataset.piScenario);
  });
  choose('match');
}
