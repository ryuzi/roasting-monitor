function doPost(e) {
  try {
    // Specify the ID of the Google Spreadsheet
    var sheetId = 'YOUR_SPREADSHEET_ID_HERE';

    // Specify the name of the sheet where the data will be added
    var sheetName = 'YOUR_SHEET_NAME_HERE'; // Example: 'DataSheet'

    // Get the specified sheet from the spreadsheet
    var sheet = SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);

    // Throw an error if the specified sheet is not found
    if (!sheet) {
      throw new Error('Sheet not found: ' + sheetName);
    }

    // Parse the data sent in the web request (convert JSON to an object)
    var data = JSON.parse(e.postData.contents);

    // Check if the data structure is valid
    if (data && data.data && Array.isArray(data.data)) {
      var rows = []; // Array to store the rows to be added to the sheet

      // Process each entry in the data array
      data.data.forEach(function(entry) {
        // Validate the presence of required fields
        if (typeof entry.time === 'number' && entry.temp !== undefined && entry.ror !== undefined && entry.note !== undefined) {

          // Convert UNIX timestamp to a formatted date string
          // Example: Convert to a format like "2024-08-15 10:45:00"
          var date = new Date(entry.time * 1000);
          var formattedDate = Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');

          // Prepare the row to be inserted into the sheet
          rows.push([formattedDate, entry.temp, entry.ror, entry.note]);
        }
      });

      // If there are valid entries, insert the rows into the sheet
      if (rows.length > 0) {
        // Add data starting from the row after the last row
        sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
      }

      // Return a success response
      return ContentService.createTextOutput('Success');
    } else {
      // Log an error if the data structure is invalid
      Logger.log('Invalid data received: ' + e.postData.contents);
      return ContentService.createTextOutput('Invalid Data');
    }

  } catch (error) {
    // Log any errors that occur during processing
    Logger.log('Error in doPost: ' + error.message);
    return ContentService.createTextOutput('Error: ' + error.message);
  }
}
