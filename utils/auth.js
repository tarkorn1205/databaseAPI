const uniqid = require("uniqid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../middleware/async");
const db = require("../config/connectDB");
const util = require("util");
const query = util.promisify(db.query).bind(db);

exports.uniqPK = () => {
  return uniqid();
};

exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const newPassword = await bcrypt.hash(password, salt);
  console.log(newPassword)
  return newPassword;
};

exports.matchPassword = async (enteredPassword, hashPassword) => {
  return await bcrypt.compare(enteredPassword, hashPassword);
};

exports.getSignedJwtToken = (uniqid) => {
  return jwt.sign({ uniqid }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookie.token) {
    token = req.cookie.token;
  }

  if (!token) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded.uniqid)
    let user = await query("SELECT * FROM `admin` WHERE `username` = ?", [
      decoded.uniqid,
    ]);


    let userJson = Object.values(JSON.parse(JSON.stringify(user)))[0];
delete userJson.password
    if (userJson != undefined) {
      req.user = userJson;
      next();
    }
  } catch (error) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }
});
