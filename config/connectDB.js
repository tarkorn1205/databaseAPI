const mysql = require("mysql");

let connection = mysql.createConnection({
  host: "itdev.cmtc.ac.th",
  port: "43306",
  user: "tarkorn@2022",
  password: "tarkorn@2022",
  database: "booking_tech",
  multipleStatements: true,
});
connection.connect();

module.exports = connection;
