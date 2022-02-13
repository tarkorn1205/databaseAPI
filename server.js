const express = require("express");
const dotenv = require("dotenv");
const colors = require("colors");
const cors = require("cors");
const path = require("path");
const fileupload = require("express-fileupload");
const errorHandle = require("./middleware/error");
const xss = require("xss-clean");
const helmet = require("helmet");
const hpp = require("hpp");

//-------------- SETUP ---------------
// Load ENV
dotenv.config({ path: "./config/config.env" });

// Router
const auth = require("./router/authentication");
const booking = require("./router/booking");
// const authSocial = require("./router/authenticationSocial");
// const leader = require("./router/leader");
// const player = require("./router/player");
// const detail = require("./router/detail");
// const generation = require("./router/generation");
// const setup = require("./router/setup");

// Setup Express
const app = express();

// middleware
app.use(express.json());
app.use(cors());
app.use(xss());
app.use(hpp());
app.use(helmet());
app.use(express.static(path.join(__dirname, "public")));
app.use(fileupload());
//-----------------------------------------

// --------------- ROUTER -----------------
app.use("/api/v1/auth", auth);
app.use("/api/v1/booking", booking);
// app.use("/api/v1/admin", admin);
// app.use("/api/v1/authsocial", authSocial);
// app.use("/api/v1/leader", leader);
// app.use("/api/v1/player", player);
// app.use("/api/v1/detail", detail);
// app.use("/api/v1/generation", generation);
// app.use("/api/v1/", setup);

app.use(errorHandle);
// ---------------------------------------

// -------------- SERVER ----------------
const PORT = 5000;

const server = app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`.black.bgGreen);
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.bgRed);
  server.close(() => process.exit(1));
});
// --------------------------------------
