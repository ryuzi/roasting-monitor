# Google Apps Script for Coffee Roasting Data Logging

This Google Apps Script is designed to receive data from a Raspberry Pi Pico W during a coffee roasting process. The data is sent via HTTP POST requests and logged into a Google Spreadsheet. The script processes the incoming data, validates it, and records the timestamp, temperature, rate of rise (RoR), and additional notes into the spreadsheet.

## Features

- **Data Reception**: Receives JSON data via HTTP POST requests from a Raspberry Pi Pico W.
- **Data Validation**: Validates the structure and content of the incoming data.
- **Timestamp Conversion**: Converts UNIX timestamps to human-readable date and time format.
- **Google Spreadsheet Logging**: Logs the validated data into a Google Spreadsheet for analysis and record-keeping.

## Prerequisites

- **Google Account**: You need a Google account to create and deploy Google Apps Script.
- **Google Spreadsheet**: Create a Google Spreadsheet where the data will be logged.
- **Google Apps Script**: Access to the Google Apps Script editor to paste and deploy the script.

## Setup

### 1. Create a Google Spreadsheet

- Create a new Google Spreadsheet in your Google Drive.
- Rename the first sheet to "Data" (or your preferred name).

### 2. Open Google Apps Script

- In your Google Spreadsheet, click on `Extensions > Apps Script`.
- This will open the Google Apps Script editor.

### 3. Copy and Paste the Script

- Copy the provided GAS code and paste it into the script editor, replacing any existing code.
- Make sure the script is named appropriately (e.g., `Code.gs`).

### 4. Deploy as a Web App

- Click on `Deploy > Test deployments` to ensure the script works as expected.
- Once tested, click on `Deploy > Manage deployments`.
- Select `New Deployment` and choose `Web app` as the deployment type.
- Set the `Who has access` option to `Anyone` (or as required for your use case).
- Click `Deploy` and copy the URL provided. This will be used in your Raspberry Pi Pico W project.

### 5. Update Raspberry Pi Pico W Code

- Update the Raspberry Pi Pico W project with the deployment URL from the previous step.
- The Pico W will send data to this URL using HTTP POST requests.

## Usage

- **Receiving Data**: The script listens for HTTP POST requests containing JSON data from the Raspberry Pi Pico W.
- **Logging Data**: Once data is received and validated, it is automatically logged into the specified Google Spreadsheet.
- **Data Format**: The script expects data in the following format:

```json
{
  "data": [
    {
      "time": 1697231231,
      "temp": 200.5,
      "ror": 5.2,
      "note": "First Crack"
    },
    ...
  ]
}
```

- **Spreadsheet Columns**:
  - **Column A**: Timestamp (formatted as `yyyy-MM-dd HH:mm:ss`)
  - **Column B**: Temperature (°C)
  - **Column C**: Rate of Rise (RoR)
  - **Column D**: Note

## Troubleshooting

- **Invalid Data**: If the data structure doesn't match the expected format, the script will return `Invalid Data`.
- **Error Handling**: Any errors during the script execution are logged in the Google Apps Script Logger.
- **No Data Logged**: Ensure that the data sent from the Raspberry Pi Pico W matches the expected JSON format.
