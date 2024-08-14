# Google Apps Script: Data Insertion into Google Spreadsheet

This project allows data to be sent to a specified Google Spreadsheet via a POST request. The data includes a timestamp, temperature, rate of rise (ror), and a note, which are inserted into a specific sheet within the spreadsheet.

## Table of Contents

- [Setup](#setup)
- [Usage](#usage)
- [Example POST Request](#example-post-request)
- [Error Handling](#error-handling)
- [License](#license)

## Setup

### 1. Create a Google Spreadsheet

1. Create a new Google Spreadsheet.
2. Note the spreadsheet ID, which is found in the URL:
   ```
   https://docs.google.com/spreadsheets/d/your-spreadsheet-id/edit
   ```
3. Rename or create a sheet within the spreadsheet where data will be added (e.g., `DataSheet`).

### 2. Create a Google Apps Script

1. In the Google Spreadsheet, go to `Extensions > Apps Script`.
2. Replace any code in the script editor with the provided Google Apps Script code.
3. Set the `sheetId` variable in the script to your spreadsheet ID.
4. Set the `sheetName` variable to the name of the sheet where data will be added.
5. Save your project.

### 3. Deploy the Script as a Web App

1. In the Apps Script editor, go to `Deploy > Manage Deployments`.
2. Choose `New Deployment`.
3. Select `Web App`.
4. Set `Execute as` to `Me`.
5. Set `Who has access` to `Anyone` (or the appropriate level of access).
6. Click `Deploy` and copy the Web App URL.

## Usage

To send data to the Google Spreadsheet, make a POST request to the Web App URL. The request should contain a JSON object with the data to be inserted.

### Data Format

The JSON object should have the following structure:

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
- `note`: Any additional information (string).

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

- **Invalid Data**: If the data structure is incorrect or required fields are missing, the script will return an "Invalid Data" response and log the issue.
- **Sheet Not Found**: If the specified sheet is not found in the spreadsheet, the script will return an error message and log the issue.
- **Other Errors**: Any other errors that occur during the execution of the script will be logged, and a corresponding error message will be returned.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
