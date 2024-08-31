function testDoPost() {
  // Create debug POST data
  var testData = {
    "data": [
      {
        "time": 1723806936, // Timestamp for 2024-08-16 20:15:36 (JST)
        "temp": 124.5,
        "ror": 0.2,
        "note": "Room temperature"
      },
      {
        "time": 1723807036, // Timestamp for 2024-08-16 20:17:16 (JST)
        "temp": 125.0,
        "ror": 0.3,
        "note": "Heating up"
      },
      {
        "time": 1723807136, // Timestamp for 2024-08-16 20:18:56 (JST)
        "temp": 130.2,
        "ror": 0.15,
        "note": "Steady temperature"
      }
    ]
  };

  // Convert the debug data to a JSON string
  var jsonData = JSON.stringify(testData);

  // Create a mock event object for testing
  var testEvent = {
    postData: {
      contents: jsonData
    }
  };

  // Call the doPost function with the mock event and get the result
  var result = doPost(testEvent);

  // Log the result to the console
  Logger.log(result.getContent());
}
