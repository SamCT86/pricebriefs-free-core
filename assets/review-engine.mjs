/**
 * PriceBriefs 2.0 · Local free-core identity and evidence guard.
 * User-entered observation != independently source-verified evidence.
 * No network, storage, model call, tracking, repricing, or merchant data transfer.
 */
export const LIMITS=Object.freeze({maxRows:6,maxProducts:3,maxPeersPerProduct:2,maxAgeHours:24,maxPack:1000});
const normalize=x=>String(x??'').trim().toUpperCase().replace(/\s+/g,' ');
// Reject JS Number() alternate notations (hex, binary, exponent, >2 decimals).
const num=x=>{
  const s=String(x??'').trim();
  return /^\d+(?:\.\d{1,2})?$/.test(s)?Number(s):NaN;
};
const parseObservedAt=value=>{
  const raw=String(value??'').trim();
  const m=/^([12]\d{3})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d)(?:\.(\d{1,3}))?)?(Z|[+-](?:0\d|1[0-4]):[0-5]\d)?$/.exec(raw);
  if(!m)return NaN;
  const year=Number(m[1]),month=Number(m[2]),day=Number(m[3]);
  const tz=m[8];
  if(tz && tz!=='Z' && Number(tz.slice(1,3))===14 && Number(tz.slice(4,6))!==0)return NaN;
  const date=new Date(Date.UTC(year,month-1,day));
  // Date.parse otherwise rolls invalid days (e.g. 2026-02-30) into next month.
  if(date.getUTCFullYear()!==year||date.getUTCMonth()+1!==month||date.getUTCDate()!==day)return NaN;
  return Date.parse(raw);
};
const pack=x=>/^[1-9]\d{0,3}$/.test(String(x??'').trim())?Number(x):NaN;
export function sourceLooksPublicHttps(value){
  try{
    const u=new URL(String(value??''));
    if(u.protocol!=='https:'||u.username||u.password||u.port||u.hash)return false;
    const h=u.hostname.toLowerCase().replace(/\.$/,'');
    // Syntactic filter only. Never mistake this for DNS/IP/redirect/ToS/source-content verification.
    if(!h.includes('.')||/(^|\.)(?:localhost|local|internal|invalid|test|example)(\.|$)/.test(h)||/(^|\.)example\.(?:com|net|org)$/.test(h)||h.endsWith('.arpa'))return false;
    if(/^\d+(?:\.\d+){3}$/.test(h)||h.includes(':')||h.startsWith('['))return false;
    return !/[^\x21-\x7e]/.test(h) && h.length<=253;
  }catch{return false;}
}
export function evaluate(row,now=Date.now()){
  const reasons=[];
  if(!row||typeof row!=='object')return {status:'HOLD',reasons:['Invalid observation'],deltaPct:null,sourceVerified:false};
  if(!normalize(row.merchantSku)||!normalize(row.peerSku)||normalize(row.merchantSku)!==normalize(row.peerSku))reasons.push('Manufacturer product ID (MPN or GTIN) differs or is missing; internal store SKUs are not comparable identifiers');
  if(!normalize(row.merchantBrand)||!normalize(row.peerBrand)||normalize(row.merchantBrand)!==normalize(row.peerBrand))reasons.push('Brand differs or is missing');
  if(!normalize(row.merchantType)||!normalize(row.peerType)||normalize(row.merchantType)!==normalize(row.peerType))reasons.push('Product type differs or is missing');
  if(!normalize(row.merchantVariant)||!normalize(row.peerVariant)||normalize(row.merchantVariant)!==normalize(row.peerVariant))reasons.push('Product variant differs or is missing');
  const a=pack(row.merchantPack),b=pack(row.peerPack);
  if(!Number.isFinite(a)||!Number.isFinite(b)||a!==b||a>LIMITS.maxPack||b>LIMITS.maxPack)reasons.push('Pack count differs or is missing (single vs multi-pack)');
  if(!['new','refurbished','used'].includes(row.merchantCondition)||row.merchantCondition!==row.peerCondition)reasons.push('Product condition differs or is unknown');
  if(row.stock!=='in_stock')reasons.push('Competitor stock is missing or not confirmed');
  const m=num(row.merchantPrice),p=num(row.peerPrice);
  if(!Number.isFinite(m)||!Number.isFinite(p)||m<=0||p<=0||m>1e8||p>1e8)reasons.push('Prices must be positive decimal amounts (up to two decimals) in one currency');
  if(!sourceLooksPublicHttps(row.sourceUrl))reasons.push('Source must be a syntactically public HTTPS product URL; site contents are not fetched');
  const when=parseObservedAt(row.observedAt);
  if(!Number.isFinite(when)||when>now+5*60000||now-when>LIMITS.maxAgeHours*3600000)reasons.push('Observation must be an ISO date and time within the past 24 hours');
  if(!['SEK','USD','EUR','GBP'].includes(normalize(row.currency)))reasons.push('Select a supported same-price currency');
  if(reasons.length)return {status:'HOLD',reasons,deltaPct:null,sourceVerified:false};
  return {status:'REVIEW',reasons:['User-entered fields look comparable; retailer page, stock, tax, shipping and product identity are NOT independently verified'],deltaPct:Math.round((m-p)/m*1000)/10,sourceVerified:false};
}
export function evaluateBatch(rows,now=Date.now()){
  if(!Array.isArray(rows)||rows.length<1||rows.length>LIMITS.maxRows)return {status:'HOLD',reason:'Use 1–6 observations',results:[]};
  const products=new Map();
  for(const r of rows){
    // JSON tuple encoding prevents attacker-controlled delimiter collisions between fields.
    const key=JSON.stringify([normalize(r?.merchantBrand),normalize(r?.merchantSku),
      normalize(r?.merchantType),normalize(r?.merchantVariant),
      String(pack(r?.merchantPack)),normalize(r?.merchantCondition)]);
    products.set(key,(products.get(key)||0)+1);
  }
  if(products.size>LIMITS.maxProducts||[...products.values()].some(n=>n>LIMITS.maxPeersPerProduct))return {status:'HOLD',reason:'Free preview scope: max 3 distinct products × 2 comparisons each',results:[]};
  return {status:'OK',results:rows.map(x=>evaluate(x,now))};
}