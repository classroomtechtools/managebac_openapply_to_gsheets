/**
 * Passes the update procedure to the correct function, depending on passed variables,
 * outputs result
 */
 function updateSpreadsheet_({sheet, jsons, isIncremental=false, useMetadata=true,
    priorityHeaders=[], sortCallback = (a, b) => a.id - b.id})
{
Enforce.named(arguments, {sheet: 'any', jsons: '!array',
isIncremental: 'boolean', priorityHeaders: 'array',
useMetadata: 'boolean', sortCallback: 'any'}, 'updateToSpreadsheet');

const result = useMetadata ? 
sheet.apply({jsons, priorityHeaders, isIncremental, sortCallback}) :
saveToSpreadsheet_({id: sheet.id, sheetName: sheet.sheetName, 
jsons, priorityHeaders, sortCallback
});

Logger.log(result);
}

function saveToSpreadsheet_({id, sheetName, jsons, numHeaderRows=1,
  priorityHeaders = [],
  sortCallback = (a, b) => a.id - b.id}) {
if (jsons.length===0) {
Logger.log("jsons length 0, not updating");
return;
}
const ss = SpreadsheetApp.openById(id);
let sheet = ss.getSheetByName(sheetName);
if (!sheet) {
sheet = ss.insertSheet(sheetName);
}

// clear everything, calculate values
// priority headers
jsons.sort( sortCallback );
const rows = dottie.jsonsToRows(jsons, priorityHeaders);

if (numHeaderRows == 1) {
// simple case
const range = sheet.getRange(1, 1, rows.length, rows[0].length);
range.clear();
range.setValues(rows);
} else {
// respect any header rows that might have been created
const headers = sheet.getRange(1, 1, 1, rows[0].length);
headers.clear();
headers.setValues([rows[0]]);
const values = sheet.getRange(numHeaderRows + 1, 1, rows.length - 1, rows[0].length);
values.clear();
values.setValues(rows.slice(1));
}
}

function updaters_ () {
return {
updateSpreadsheet: updateSpreadsheet_,
saveToSpreadsheet: saveToSpreadsheet_
}
}