# Google Apps Script: Data Insertion and Processing in Google Spreadsheet

This project uses Google Apps Script to manage data in a Google Spreadsheet. It processes POST request data and merges it with existing data in the spreadsheet, ensuring that the data is correctly updated and organized.

## Table of Contents

- [Setup](#setup)
- [Usage](#usage)
- [Example POST Request](#example-post-request)
- [Error Handling](#error-handling)
- [License](#license)

## Setup

### 1. Create a Google Spreadsheet

1. Create a new Google Spreadsheet.
2. Note the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/your-spreadsheet-id/edit
   ```
3. Create or rename two sheets in the spreadsheet:
   - `sensordata` for storing processed data.
   - `formdata` for additional data.

### 2. Create and Configure Google Apps Script

1. In the Google Spreadsheet, go to `Extensions > Apps Script`.
2. Replace any existing code in the script editor with the provided Google Apps Script code.
3. Create a new file named `secrets.gs` in the script project.
4. Define your spreadsheet ID in `secrets.gs`:
   ```javascript
   var SHEET_ID = 'your-google-sheet-id';
   ```
5. Save your project.

### 3. Deploy the Script as a Web App

1. In the Apps Script editor, go to `Deploy > Manage Deployments`.
2. Click `New Deployment`.
3. Select `Web App`.
4. Set `Execute as` to `Me`.
5. Set `Who has access` to `Anyone` (or adjust according to your needs).
6. Click `Deploy` and copy the Web App URL.

## Usage

To insert and process data in the Google Spreadsheet, send a POST request to the Web App URL. The request should contain JSON data that will be processed and combined with data from the `formdata` sheet.

### Data Format

The JSON object sent in the POST request should look like this:

```json
{
  "data": [
    {
      "time": 1723620204,
      "temp": 25.75,
      "ror": 0.1,
      "note": "Example note"
    },
    {
      "time": 1723620205,
      "temp": 25.625,
      "ror": 0.2,
      "note": "Another note"
    }
  ]
}
```

- `time`: UNIX timestamp (in seconds).
- `temp`: Temperature value (number).
- `ror`: Rate of rise (number).
- `note`: Additional information (string).

### How It Works

1. **Receive POST Data**: The script receives data via a POST request and processes it.
2. **Process Form Data**: It also reads additional data from the `formdata` sheet and combines it with the POST data.
3. **Merge and Sort**: Data from both sources is merged and sorted by timestamp.
4. **Fill Missing Values**: Missing temperature and rate of rise (ror) values are filled in using averages.
5. **Update Sheet**: Processed data is written to the `sensordata` sheet.
6. **Mark Lowest Temperature**: The row with the lowest temperature is marked with 'Bottom'. If 'Bottom' already exists, it is cleared before applying the new mark.

## Example POST Request

Here is an example of how to send a POST request using Python:

```python
import urequests
import ujson

url = 'YOUR_WEB_APP_URL_HERE'  # Replace with your Web App URL
data = {
    "data": [
        {"time": 1723620204, "temp": 25.75, "ror": 0.1, "note": "Example note"},
        {"time": 1723620205, "temp": 25.625, "ror": 0.2, "note": "Another note"}
    ]
}

response = urequests.post(url, data=ujson.dumps(data), headers={'Content-Type': 'application/json'})
print(response.text)
```

## Error Handling

- **Invalid Data**: If the POST data is incorrect or missing required fields, the script will return an "Invalid Data" response and log the issue.
- **Sheet Not Found**: If a sheet cannot be found, the script will return an error message and log the issue.
- **Other Errors**: Any other issues encountered will be logged, and an appropriate error message will be returned.
