const mysql = require("mysql");

let connection = mysql.createConnection({
  host: "134.209.101.110",
  port: "33062",
  user: "root",
  password: "itcmtc",
  database: "booking_tech",
  multipleStatements: true,
});
connection.connect();
// host: "134.209.101.110",
//   port: "33062",
//   user: "root",
//   password: "itcmtc",
//   database: "booking_tech",
module.exports = connection;
// host: "itdev.cmtc.ac.th",
//   port: "43306",
//   user: "tarkorn@2022",
//   password: "tarkorn@2022",
//   database: "booking_tech",
