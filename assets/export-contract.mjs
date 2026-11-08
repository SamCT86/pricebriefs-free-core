/** Browser-local export only. This module DOES NOT create verified price observations. */
export const LOCAL_EXPORT_SCHEMA='pb-local-review-v2';
export function makeLocalExport(rows,results,exportedAt=new Date().toISOString()){
  if(!Array.isArray(rows)||!Array.isArray(results)||rows.length!==results.length||rows.length<1||rows.length>6)throw new Error('LOCAL_EXPORT_SCOPE');
  if(!Number.isFinite(Date.parse(exportedAt)))throw new Error('LOCAL_EXPORT_TIME');
  const checked=rows.map((r,i)=>{
    const result=results[i];
    if(!['HOLD','REVIEW'].includes(result?.status)||result?.sourceVerified!==false)throw new Error('LOCAL_EXPORT_VERIFICATION_BOUNDARY');
    if(!r||typeof r!=='object')throw new Error('LOCAL_EXPORT_BAD_ROW');
    return {user_entered:{...r},review_status:result.status,delta_pct:result.deltaPct??null,hold_or_review_reasons:[...result.reasons],source_verified:false};
  });
  return {schema_version:LOCAL_EXPORT_SCHEMA,source_kind:'USER_ENTERED_NOT_VERIFIED',source_verified:false,independent_market_fact:false,automatic_repricing_permitted:false,exported_at:exportedAt,rows:checked,warning:'Your entries were not fetched or independently verified by PriceBriefs. REVIEW is not a pricing recommendation.'};
}
export function assertImportUntrusted(data){
  if(data?.schema_version!==LOCAL_EXPORT_SCHEMA||data.source_kind!=='USER_ENTERED_NOT_VERIFIED'||data.source_verified!==false||data.independent_market_fact!==false)throw new Error('LOCAL_EXPORT_TRUST_BOUNDARY');
  for(const r of data.rows||[]){
    if(r.source_verified!==false||!['HOLD','REVIEW'].includes(r.review_status))throw new Error('LOCAL_EXPORT_RECORD_TRUST_BOUNDARY');
  }
  return {source_verified:false,may_generate_market_action:false};
}