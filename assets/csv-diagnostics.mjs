/** Explain local CSV errors in plain English; parser and 18-column contract remain authoritative. */
import {COLUMNS} from './csv-review.mjs';
export function explainCsvError(error,csvText=''){
 const code=String(error?.message||'');
 if(code==='CSV_UNKNOWN_OR_DUPLICATE_HEADER'){
  const first=String(csvText).replace(/^\uFEFF/,'').split(/\r\n|\n|\r/,1)[0];
  const actual=first.split(',').map(s=>s.trim());
  const missing=COLUMNS.filter(k=>!actual.includes(k)),unknown=[...new Set(actual.filter(k=>!COLUMNS.includes(k)))];
  const repeated=[...new Set(actual.filter((x,i)=>actual.indexOf(x)!==i))];
  return 'The CSV header must contain the exact 18 field names once each. '+
   (missing.length?'Missing: '+missing.join(', ')+'. ':'')+
   (unknown.length?'Unknown: '+unknown.join(', ')+'. ':'')+
   (repeated.length?'Repeated: '+repeated.join(', ')+'. ':'')+
   'Download the blank template and compare your column names.';
 }
 if(code.startsWith('CSV_ROW_COLUMN_COUNT_')){
  const n=code.slice('CSV_ROW_COLUMN_COUNT_'.length);
  return 'CSV row '+n+' has the wrong number of cells. Each row needs 18 columns in the same order as the header. Use quotes for commas inside values.';
 }
 if(code.startsWith('CSV_MISSING_FIELD_'))return 'CSV row is missing the field '+code.slice('CSV_MISSING_FIELD_'.length)+'.';
 const map={
  CSV_EMPTY_OR_TOO_LARGE:'Paste at least one observation and an 18-column header. The maximum CSV size is 2 MB.',
  CSV_NEEDS_HEADER_AND_ROWS:'Include a header row plus at least one product comparison.',
  CSV_SCOPE_NOT_1_TO_1000:'Include between 1 and 1,000 comparison rows.',
  CSV_TOO_MANY_ROWS:'The free checker accepts at most 1,000 comparison rows.',
  CSV_CELL_TOO_LARGE:'One CSV cell is longer than allowed. Check for accidental pasted text.',
  CSV_NUL_DENIED:'The CSV contains an unsupported control character. Export it as plain UTF-8 text.',
  CSV_UNCLOSED_QUOTE:'A quoted CSV value was not closed. Check paired quotation marks.',
  CSV_MALFORMED_QUOTE:'Quotes must surround the entire CSV cell. Put double quotes around text containing commas.'
 };
 return map[code]||'The CSV could not be read. Download the 18-column template and compare your rows.';
}
