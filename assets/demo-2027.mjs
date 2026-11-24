/* A 10-second, deliberately fictional, product-native PriceBriefs introduction. */
import {evaluate} from './review-engine.mjs';
const group=document.querySelector('.demo-switch');
const mini=document.querySelector('#demo-variant');
const details=document.querySelector('#demo-detail');
const result=document.querySelector('#demo-result');
const title=document.querySelector('#demo-result-title');
const copy=document.querySelector('#demo-result-copy');
const icon=document.querySelector('#demo-icon');
const scenarios=Object.freeze({
  match:{brand:'Northstar Tools',pack:'1',condition:'new',variant:'18V · 1 pack · new',caption:'Same model, brand and pack entered. Still fictional.',heading:'Worth a closer look',body:'The entered details match. You still need to check the retailer source yourself.'},
  pack:{brand:'Northstar Tools',pack:'6',condition:'new',variant:'18V · 6 pack · new',caption:'Oops. Your listing is a single kit, theirs is a six-pack.',heading:'Hold on. Different pack.',body:'A $179 six-pack is not comparable to a $199 single kit. Don’t make a price move from this.'},
  brand:{brand:'Other Brand',pack:'1',condition:'new',variant:'18V · 1 pack · new',caption:'Same-looking item, but a different manufacturer.',heading:'Hold on. Different brand.',body:'The model description looks similar, but the brand does not match. This comparison stays on hold.'}
});
function scenario(input){
  const now=Date.now();const data={
    merchantSku:'N-18V-KIT',peerSku:'N-18V-KIT',merchantBrand:'Northstar Tools',peerBrand:input.brand,
    merchantType:'Cordless Drill',peerType:'Cordless Drill',merchantVariant:'Starter kit',peerVariant:'Starter kit',
    merchantPack:'1',peerPack:input.pack,merchantCondition:'new',peerCondition:input.condition,
    stock:'in_stock',merchantPrice:'199',peerPrice:'179',currency:'USD',
    sourceUrl:'https://pricebriefs.com/demo/fictional-observation',observedAt:new Date(now-60000).toISOString()
  };
  return evaluate(data,now);
}
function show(which){
  const entry=scenarios[which]||scenarios.match;
  const outcome=scenario(entry);
  group.querySelectorAll('[data-demo]').forEach(btn=>btn.setAttribute('aria-pressed',String(btn.dataset.demo===which)));
  mini.textContent=entry.variant;
  details.textContent=entry.caption;
  result.classList.toggle('hold',outcome.status==='HOLD');
  icon.textContent=outcome.status==='HOLD'?'!':'✓';
  title.textContent=entry.heading;
  copy.textContent=entry.body;
  result.dataset.status=outcome.status;
  result.dataset.sourceVerified='false';
  const peer=document.querySelector('#peer-image'),label=document.querySelector('#peer-pack-label');
  if(peer&&label){const image=which==='pack'?'drill-six':which==='brand'?'drill-other':'drill-one';peer.src='/assets/'+image+'.svg';peer.alt=which==='pack'?'Illustrative six drill kits':which==='brand'?'Illustrative different brand drill kit':'Illustrative green drill kit';label.textContent=which==='pack'?'6 kits':which==='brand'?'1 kit · other brand':'1 kit';}
}
if(group&&mini&&details&&result&&title&&copy&&icon){
  group.addEventListener('click',event=>{
    const control=event.target.closest('[data-demo]');
    if(control&&group.contains(control))show(control.dataset.demo);
  });
  show('match');
}

const vol=document.querySelector('#risk-volume'),risk=document.querySelector('#risk-result'),units=document.querySelector('#risk-units'),big=document.querySelector('.pb-risk strong');
if(vol&&risk&&units&&big){const refresh=()=>{const n=Number(vol.value);if(!Number.isInteger(n)||n<100||n>1000)return;const amount=new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(20*n);units.textContent=n+' units';big.textContent=amount;risk.textContent='At '+n+' units: '+amount+' less gross profit.';};vol.addEventListener('input',refresh);refresh();}
