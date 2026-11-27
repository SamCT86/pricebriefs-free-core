/* Browser-local presentation contract. Syntax-only URL check, never a live scan. */
import {evaluate,sourceLooksPublicHttps} from './review-engine.mjs';
const samples=Object.freeze({
  match:{brand:'Fictional Tools',pack:'1',source:'https://pricebriefs.com/demo/fictional-observation',title:'Product details line up'},
  pack:{brand:'Fictional Tools',pack:'6',source:'https://pricebriefs.com/demo/fictional-observation',title:'Pack sizes differ'},
  missing:{brand:'Fictional Tools',pack:'1',source:'',title:'Source URL missing or invalid'}
});
export function checkProductPageUrl(value){
  if(typeof value!=='string'||value.length>1024||/[\u0000-\u001f\u007f]/.test(value))return {ok:false,reason:'Enter a single public HTTPS product URL, without credentials.'};
  const raw=value.trim();
  if(!sourceLooksPublicHttps(raw))return {ok:false,reason:'Enter a public HTTPS product URL. Private, example and account-only hosts are not supported.'};
  const u=new URL(raw);
  if(u.protocol!=='https:'||u.username||u.password||u.hash||u.port)return {ok:false,reason:'Remove URL credentials, fragments or nonstandard ports.'};
  return {ok:true,normalized:u.href,reason:'Link format accepted. The page was not fetched. Compare your own product details or request an audit.'};
}
export function emailDraftForUrl(raw){
  const check=checkProductPageUrl(raw);
  if(!check.ok)return null;
  const subject='PriceBriefs product evidence request';
  const body=['Hello PriceBriefs,','','I would like help reviewing a product-data or pricing issue.','Public product URL: '+check.normalized,'Store/market: To be agreed','Observed issue: To be described','','Please confirm the sources, scope, reviewer, price and timing in a written quote.','I understand nothing has been submitted until I send this message.'].join('\n');
  return 'mailto:hello@pricebriefs.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
}
export function evaluateFictionalScenario(which,now=Date.now()){
  const sample=Object.hasOwn(samples,which)?samples[which]:samples.match;
  const row={
    merchantSku:'FICTIONAL-DRILL-1',peerSku:'FICTIONAL-DRILL-1',
    merchantBrand:'Fictional Tools',peerBrand:sample.brand,
    merchantType:'Cordless Drill',peerType:'Cordless Drill',
    merchantVariant:'18V black',peerVariant:'18V black',
    merchantPack:'1',peerPack:sample.pack,
    merchantCondition:'new',peerCondition:'new',
    merchantPrice:'199',peerPrice:'179',currency:'USD',
    sourceUrl:sample.source,stock:'in_stock',
    observedAt:new Date(now-60000).toISOString()
  };
  const output=evaluate(row,now);
  return {title:sample.title,status:output.status,reasons:output.reasons,
    sourceVerified:output.sourceVerified,fictional:true};
}
