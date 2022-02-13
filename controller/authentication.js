const asyncHandler = require("../middleware/async");
const db = require("../config/connectDB");
const errorResponse = require("../utils/errorResponse");
const {
  uniqPK,
  hashPassword,
  matchPassword,
  getSignedJwtToken,
} = require("../utils/auth");
const util = require("util");

const query = util.promisify(db.query).bind(db);

// @desc    Register
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  let { username, password, name, phone } = req.body;
  const uniqid = uniqPK();

  // Check Duplicate
  const rows = await query(
    "SELECT COUNT(*) as total FROM `admin` WHERE `username` = ?",
    [username]
  );

  let resultArray = Object.values(JSON.parse(JSON.stringify(rows)));
  if (resultArray[0].total > 0) {
    return next(new errorResponse(`Duplicate field value entered`, 400));
  }

  try {
    password = await hashPassword(password);
    db.query(
      "INSERT INTO `admin`(`name`,`username`, `password`, `phone`) VALUES (?,?,?,?)",
      [name, username, password, phone]
    );
  } catch (err) {
    return next(new errorResponse(`Insert Failed`, 400));
  }

  sendTokenResponse(username, 200, res);
});

// @desc    Login Admin
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return next(new errorResponse("Please provide an username and password", 400));
  }

  const user = await query(
    "SELECT `username`, `password` FROM `admin` WHERE `username` = ?",
    [username]
  );

  let userJson = Object.values(JSON.parse(JSON.stringify(user)))[0];

  if (userJson == undefined) {
    return next(new errorResponse("Not Found User", 404));
  } console.log(userJson)

  const isMatch = await matchPassword(password,userJson.password);
  console.log(isMatch,password,userJson.password)
  if (isMatch === false) {
    return next(new errorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(userJson.username, 200, res);
});

// @desc    Logout User
// @route   GET /api/v1/auth/logout
// @access  Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, data: {} });
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
exports.getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({ success: true, data: req.user });
});

// @desc    Update user Detail
// @route   PUT /api/v1/auth/update
// @access  Private
exports.update = asyncHandler(async (req, res, next) => {
  const { username, tel } = req.body;

  try {
    db.query(
      "UPDATE `member_form` SET `username`= ?, `tel`= ? WHERE `_id` = ? ",
      [username , tel, req.user._id ]
    );
  } catch (err) {
    return next(new errorResponse(`Update Failed`, 400));
  }

  const user = await query("SELECT * FROM `member_form` WHERE `_id` = ?", [
    req.user._id,
  ]);

  let userJson = Object.values(JSON.parse(JSON.stringify(user)))[0];

  if (userJson == undefined) {
    return next(new errorResponse("Invalid credentials", 401));
  }

  res.status(200).json({ success: true, data: userJson });
});

// @desc  sendTokenResponse
const sendTokenResponse = (uniqid, statusCode, res) => {
  const token = getSignedJwtToken(uniqid);

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ success: true, token });
};
