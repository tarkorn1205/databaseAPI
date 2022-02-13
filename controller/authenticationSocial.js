const asyncHandler = require("../middleware/async");
const db = require("../config/connectDB");
const errorResponse = require("../utils/errorResponse");
const { getSignedJwtToken } = require("../utils/auth");
const util = require("util");
const query = util.promisify(db.query).bind(db);

// @desc    Register
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = asyncHandler(async (req, res, next) => {
  let { uniqid, username, providerId, email, picture } = req.body;

  if (!uniqid) {
    return next(new errorResponse(`Please provide an uniqid`, 400));
  }
  // Check Duplicate
  const rows = await query(
    "SELECT COUNT(*) as total FROM `member_social` WHERE `uniqid` = ?",
    [uniqid]
  );

  let resultArray = Object.values(JSON.parse(JSON.stringify(rows)));
  if (resultArray[0].total > 0) {
    return next(new errorResponse(`Duplicate field value entered`, 400));
  }

  try {
    db.query(
      "INSERT INTO `member_social`( `uniqid`, `username`, `providerId`, `email`, `picture`, `created_at`) VALUES (?,?,?,?,?,?)",
      [uniqid, username, providerId, email, picture, new Date()]
    );
  } catch (err) {
    return next(new errorResponse(`Insert Failed`, 400));
  }

  sendTokenResponse(uniqid, 201, res);
});

// @desc    Login Admin
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = asyncHandler(async (req, res, next) => {
  const { uniqid, providerId } = req.body;

  if (!uniqid || !providerId) {
    return next(
      new errorResponse("Please provide an uniqid and providerId", 400)
    );
  }

  const user = await query(
    "SELECT `uniqid`, `username`, `providerId`, `email` FROM `member_social` WHERE `uniqid` = ? AND `providerId` = ?",
    [uniqid, providerId]
  );

  let userJson = Object.values(JSON.parse(JSON.stringify(user)))[0];

  if (userJson == undefined) {
    return next(new errorResponse("Not Found User", 404));
  }

  sendTokenResponse(userJson.uniqid, 200, res);
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
