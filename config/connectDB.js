const mysql = require("mysql");

let connection = mysql.createConnection({
  host: "localhost",
  port: "3306",
  user: "root",
  password: "",
  database: "booking_tech",
  multipleStatements: true,
});
connection.connect();
// host: "128.199.245.64",
//   port: "33061",
//   user: "root",
//   password: "itcmtcdev",
//   database: "booking_tech",
module.exports = connection;
// host: "itdev.cmtc.ac.th",
//   port: "43306",
//   user: "tarkorn@2022",
//   password: "tarkorn@2022",
//   database: "booking_tech",
