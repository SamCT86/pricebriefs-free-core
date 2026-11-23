/**
 * Browser-only PriceBriefs V2 CSV input contract.
 * Parser never fetches or uploads. Every row remains USER_ENTERED_UNVERIFIED.
 */
export const COLUMNS=Object.freeze([
  'merchantSku','peerSku','merchantBrand','peerBrand','merchantType','peerType',
  'merchantVariant','peerVariant','merchantPack','peerPack','merchantCondition',
  'peerCondition','merchantPrice','peerPrice','sourceUrl','observedAt','stock','currency'
]);
const MAX_BYTES=2_097_152,MAX_ROWS=500,MAX_CELL=2048;
export function parsePriceBriefsCsv(text){
  if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_BYTES||text.trim().length===0)throw new Error('CSV_EMPTY_OR_TOO_LARGE');
  const rows=[];let row=[],field='',quoted=false,justClosedQuote=false;
  const finishField=()=>{if(field.length>MAX_CELL)throw new Error('CSV_CELL_TOO_LARGE');row.push(field.trim());field='';justClosedQuote=false;};
  const finishRow=()=>{finishField();if(row.some(v=>v.length>0)){rows.push(row);}row=[];if(rows.length>MAX_ROWS+1)throw new Error('CSV_TOO_MANY_ROWS');};
  const s=text.charCodeAt(0)===0xFEFF?text.slice(1):text;
  for(let i=0;i<s.length;i++){
    const c=s[i];
    if(c==='\0')throw new Error('CSV_NUL_DENIED');
    if(quoted){
      if(c==='"'){if(s[i+1]==='"'){field+='"';i++;}else{quoted=false;justClosedQuote=true;}}
      else{field+=c;}
    }else{
      if(c==='"'){if(field.length||justClosedQuote)throw new Error('CSV_MALFORMED_QUOTE');quoted=true;}
      else if(c===','){finishField();}
      else if(c==='\n'){finishRow();}
      else if(c==='\r'){if(s[i+1]==='\n')i++;finishRow();}
      else{if(justClosedQuote)throw new Error('CSV_MALFORMED_QUOTE');field+=c;}
    }
    if(field.length>MAX_CELL)throw new Error('CSV_CELL_TOO_LARGE');
  }
  if(quoted)throw new Error('CSV_UNCLOSED_QUOTE');
  if(field.length||row.length)finishRow();
  if(rows.length<2)throw new Error('CSV_NEEDS_HEADER_AND_ROWS');
  const hdr=rows.shift();
  if(hdr.length!==COLUMNS.length||new Set(hdr).size!==hdr.length||hdr.some(x=>!COLUMNS.includes(x)))throw new Error('CSV_UNKNOWN_OR_DUPLICATE_HEADER');
  if(rows.length<1||rows.length>MAX_ROWS)throw new Error('CSV_SCOPE_NOT_1_TO_500');
  return rows.map((values,i)=>{
    if(values.length!==hdr.length)throw new Error('CSV_ROW_COLUMN_COUNT_'+(i+2));
    const row=Object.fromEntries(hdr.map((k,j)=>[k,values[j]]));
    for(const key of COLUMNS)if(typeof row[key]!=='string')throw new Error('CSV_MISSING_FIELD_'+key);
    return row;
  });
}
export function csvTemplate(){
  return COLUMNS.join(',')+'\n';
}
/** Every row here is invented synthetic demo data, not observed retailer evidence. */
export function fictionalCsvSample25(now=Date.now()){
 const stamp=new Date(now-5*60_000).toISOString();
 const output=[COLUMNS.join(',')];
 const csv=v=>{const x=String(v??'');return /[",\r\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x};
 for(let i=1;i<=25;i++){
   const id='FICTIONAL-PB-'+String(i).padStart(3,'0');
   const row={
     merchantSku:id,peerSku:id,merchantBrand:'Imaginary Tools',peerBrand:'Imaginary Tools',
     merchantType:'Demo Drill',peerType:'Demo Drill',merchantVariant:'Invented Variant',peerVariant:'Invented Variant',
     merchantPack:'1',peerPack:i%6===0?'2':'1',
     merchantCondition:'new',peerCondition:i%7===0?'used':'new',
     merchantPrice:'199',peerPrice:'179',
     sourceUrl:'https://pricebriefs.com/demo/fictional-observation/'+id,
     observedAt:stamp,stock:i%9===0?'unknown':'in_stock',currency:'USD'
   };
   output.push(COLUMNS.map(k=>csv(row[k])).join(','));
 }
 return output.join('\n')+'\n';
}
