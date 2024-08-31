function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Custom Tools')
    .addItem('Copy Sheet to New Spreadsheet', 'copySheetToNewSpreadsheet')
    .addItem('Clear Sensor Data Sheet', 'clearSensorDataSheet')
    .addToUi();
}

function copySheetToNewSpreadsheet() {
  var sourceSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = sourceSpreadsheet.getSheetByName('monitor');

  var newSpreadsheetName = generateSpreadsheetName(sourceSheet);
  var newSpreadsheet = SpreadsheetApp.create(newSpreadsheetName);

  var newSheet = copySheetWithValuesOnly(sourceSheet, newSpreadsheet);
  removeExtraSheets(newSpreadsheet, newSheet.getName());

  Logger.log('A new spreadsheet has been created: ' + newSpreadsheetName);
}

function generateSpreadsheetName(sheet) {
  var title = sheet.getRange('O1').getValue();
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  return 'Roasting Profile: ' + timestamp + ' ' + title;
}

function copySheetWithValuesOnly(sourceSheet, newSpreadsheet) {
  var newSheet = sourceSheet.copyTo(newSpreadsheet);
  newSheet.setName(sourceSheet.getName());

  var range = sourceSheet.getRange('A:F');
  var values = range.getValues();
  newSheet.getRange('A:F').setValues(values);

  return newSheet;
}

function removeExtraSheets(spreadsheet, sheetNameToKeep) {
  spreadsheet.getSheets().forEach(function(sheet) {
    if (sheet.getName() !== sheetNameToKeep) {
      spreadsheet.deleteSheet(sheet);
    }
  });
}

function clearSensorDataSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('sensordata');
  var lastRow = sheet.getLastRow();

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }

  Logger.log('Contents of the sheet "sensordata" (excluding the first row) have been cleared.');
}
