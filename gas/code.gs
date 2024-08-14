function doPost(e) {
  try {
    var sheetId = 'YOUR_SPREADSHEET_ID_HERE';
    var sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();

    // Parse the incoming JSON data
    var data = JSON.parse(e.postData.contents);

    if (data && data.data && Array.isArray(data.data)) {
      var rows = [];

      // Iterate through each entry in the data array
      data.data.forEach(function(entry) {
        // Validate the presence of required fields
        if (typeof entry.time === 'number' && entry.temp !== undefined && entry.ror !== undefined && entry.note !== undefined) {

          // Convert UNIX timestamp to a formatted date string
          var date = new Date(entry.time * 1000);
          var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

          // Prepare the row to be inserted into the sheet
          rows.push([formattedDate, entry.temp, entry.ror, entry.note]);
        }
      });

      // Insert rows into the spreadsheet if there are valid entries
      if (rows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
      }

      return ContentService.createTextOutput('Success');
    } else {
      // Handle the case of invalid data structure
      Logger.log('Invalid data received: ' + e.postData.contents);
      return ContentService.createTextOutput('Invalid Data');
    }

  } catch (error) {
    // Log any errors that occur during processing
    Logger.log('Error in doPost: ' + error.message);
    return ContentService.createTextOutput('Error: ' + error.message);
  }
}
