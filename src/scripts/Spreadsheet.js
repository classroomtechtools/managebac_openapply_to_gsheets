function saveToSpreadsheet_({id, sheetName, jsons, numHeaderRows,
                            priorityHeaders = []}) {
  const ss = SpreadsheetApp.openById(id);
  const sheet = ss.getSheetByName(sheetName);

  // clear everything, calculate values
  // priority headers
  jsons.sort( (a, b) => a.id - b.id );
  const rows = dottie.jsonsToRows(jsons, priorityHeaders);

  //
  if (numHeaderRows == 1) {
    // simple case
    const range = sheet.getRange(1, 1, rows.length, rows[0].length);
    range.clear();
    range.setValues(rows);
  } else {
    // respect any header rows that might have been created
    const headers = sheet.getRange(1, 1, 1, rows[0].length);
    headers.clear();
    headers.setValues(rows[0]);
    const values = sheet.getRange(numHeaderRows + 1, 1, rows.length - 1, rows[0].length);
    values.clear();
    values.setValues(rows.slice(1));
  }
}
