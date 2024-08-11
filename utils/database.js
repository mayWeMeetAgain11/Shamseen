require("dotenv").config();
const { Sequelize } = require("sequelize");
const fs = require("fs");

/// Function to log queries with timestamps
const logQueryWithTimestamp = (msg) => (sql, timing) => {
  const timestamp = new Date().toISOString();
  const logMessage = `${msg}\nTimestamp: ${timestamp}\nSQL Query: ${sql}\nExecution Time: ${timing} ms\n\n`;

  fs.appendFile("./query.log", logMessage, (err) => {
    if (err) {
      console.error("Error writing to log file:", err);
    }
  });
};

const sequelize = new Sequelize(
  process.env.DBNAME,
  process.env.DBUSER,
  process.env.DBPASS,
  {
    host: process.env.DBHOST,
    dialect: "mysql",
    timezone: "+00:00",
    benchmark: true,

    logging: logQueryWithTimestamp("log: "),
    logQueryParameters: true,
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database:", error);
  });

module.exports = {
  sequelize,
  Sequelize,
};
