const fs = require('fs');
const path = require('path');

// Define the log file path and name
const logFilePath = path.join(__dirname, 'app.log');

// Create a writable stream for the log file
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

// Override console.log to write to both the console and the file
console.log = function (message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;

  // Write the log message to the console
  process.stdout.write(logMessage);

  // Write the log message to the file
  logStream.write(logMessage, 'utf8');
};



// The output will be written to the 'app.log' file in addition to the console.
