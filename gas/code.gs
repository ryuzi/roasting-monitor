function doPost(e) {
  try {
    // Define the names of the sheets we will work with
    var dataSheetName = 'sensordata';
    var formSheetName = 'formdata';

    // Get the sheet ID from secrets.gs
    var sheetId = SHEET_ID; // The sheet ID should be defined in secrets.gs
    var dataSheet = getSheet(sheetId, dataSheetName);
    var formSheet = getSheet(sheetId, formSheetName);

    // Check if both sheets are found
    if (!dataSheet || !formSheet) {
      return handleError('Sheet not found.');
    }

    // Parse the POST data from the request
    var postData = JSON.parse(e.postData.contents);
    var { rows: postRows, minTimestamp, maxTimestamp } = processPostData(postData);

    // Process form data to match the timestamp range of POST data
    var formData = formSheet.getDataRange().getValues();
    var formRows = processFormData(formData, minTimestamp, maxTimestamp);

    // Combine POST data and form data, then sort and fill in missing values
    var combinedRows = combineAndSortRows(postRows, formRows);
    var finalRows = fillMissingValues(combinedRows);

    // Write the combined data into the 'data' sheet
    if (finalRows.length > 0) {
      dataSheet.getRange(dataSheet.getLastRow() + 1, 1, finalRows.length, 5).setValues(finalRows);
    }

    // Update the note of the row with the lowest temperature to 'Bottom'
    markBottomTemperature(dataSheet);

    return ContentService.createTextOutput('Success');

  } catch (error) {
    // Handle errors and return an error message
    return handleError(error, 'doPost');
  }
}

// Function to get a sheet by its name
function getSheet(sheetId, sheetName) {
  return SpreadsheetApp.openById(sheetId).getSheetByName(sheetName);
}

// Function to process POST data
function processPostData(postData) {
  var rows = [];
  var minTimestamp = Infinity;
  var maxTimestamp = -Infinity;

  if (postData && postData.data && Array.isArray(postData.data)) {
    for (let entry of postData.data) {
      if (validatePostEntry(entry)) {
        var timestamp = entry.time;
        minTimestamp = Math.min(minTimestamp, timestamp);
        maxTimestamp = Math.max(maxTimestamp, timestamp);

        var formattedDate = formatTimestamp(timestamp);
        rows.push([formattedDate, entry.temp, entry.ror, '', entry.note]);
      }
    }
  } else {
    throw new Error('Invalid POST data.');
  }

  return { rows, minTimestamp, maxTimestamp };
}

// Function to validate if POST data entry has all required fields
function validatePostEntry(entry) {
  return typeof entry.time === 'number' && entry.temp !== undefined && entry.ror !== undefined && entry.note !== undefined;
}

// Function to format a UNIX timestamp into a readable date string
function formatTimestamp(timestamp) {
  var date = new Date(timestamp * 1000);
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

// Function to process form data and filter by timestamp range
function processFormData(formData, minTimestamp, maxTimestamp) {
  var rows = [];
  for (let i = 1; i < formData.length; i++) {
    let entry = formData[i];
    var formTimestamp = entry[0];
    var gasPressure = entry[6];

    if (!(formTimestamp instanceof Date)) continue;

    formTimestamp = formTimestamp.getTime() / 1000; // Convert to UNIX timestamp

    if (formTimestamp < minTimestamp || formTimestamp > maxTimestamp) continue;

    var formattedDate = formatTimestamp(formTimestamp);

    rows.push([formattedDate, '', '', gasPressure, '']);
  }
  return rows;
}

// Function to combine POST data and form data, then sort by timestamp
function combineAndSortRows(postRows, formRows) {
  var allRows = postRows.concat(formRows);
  return allRows.sort((a, b) => new Date(a[0]) - new Date(b[0]));
}

// Function to fill missing temperature and ror values with averages
function fillMissingValues(rows) {
  var resultRows = [];
  var previousRow = null;

  for (let i = 0; i < rows.length; i++) {
    let currentRow = rows[i];
    let formattedDate = currentRow[0];
    let temp = currentRow[1];
    let ror = currentRow[2];
    let gasPressure = currentRow[3];
    let note = currentRow[4];

    if (temp === '' || ror === '') {
      if (previousRow) {
        let prevTemp = previousRow[1];
        let prevRor = previousRow[2];
        let nextTemp = null;
        let nextRor = null;

        // Look ahead for the next available values
        if (i < rows.length - 1) {
          let nextRow = rows[i + 1];
          nextTemp = nextRow[1];
          nextRor = nextRow[2];
        }

        if (temp === '' && ror === '') {
          temp = (prevTemp !== null && nextTemp !== null) ? (prevTemp + nextTemp) / 2 : (prevTemp || nextTemp);
          ror = (prevRor !== null && nextRor !== null) ? (prevRor + nextRor) / 2 : (prevRor || nextRor);
        } else if (temp === '') {
          temp = (prevTemp !== null && nextTemp !== null) ? (prevTemp + nextTemp) / 2 : (prevTemp || nextTemp);
        } else if (ror === '') {
          ror = (prevRor !== null && nextRor !== null) ? (prevRor + nextRor) / 2 : (prevRor || nextRor);
        }
      }
    }

    resultRows.push([formattedDate, temp, ror, gasPressure, note]);
    previousRow = currentRow;
  }

  return resultRows;
}

// Function to find the row with the lowest temperature and set its note to 'Bottom'
function markBottomTemperature(sheet) {
  var data = sheet.getDataRange().getValues();
  var minTemp = Infinity;
  var minTempIndex = -1;

  // First, clear any existing 'Bottom' notes
  for (let i = 1; i < data.length; i++) {
    if (data[i][4] === 'Bottom') { // Note column is the 5th column (E)
      sheet.getRange(i + 1, 5).setValue(''); // Clear the note
    }
  }

  // Find the row with the minimum temperature
  for (let i = 1; i < data.length; i++) {
    let temp = data[i][1];
    if (temp !== '' && temp < minTemp) {
      minTemp = temp;
      minTempIndex = i;
    }
  }

  // Set the note of the row with the minimum temperature to 'Bottom'
  if (minTempIndex > -1) {
    sheet.getRange(minTempIndex + 1, 5).setValue('Bottom'); // Note column is the 5th column (E)
  }
}

// Function to handle errors and log them
function handleError(error, context) {
  Logger.log(`Error in ${context}: ${error.message}`);
  return ContentService.createTextOutput('Error: ' + error.message);
}

