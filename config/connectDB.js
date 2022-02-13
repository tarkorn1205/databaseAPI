const mysql = require("mysql");

let connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "booking_tech",
  multipleStatements: true,
});
connection.connect();

module.exports = connection;
