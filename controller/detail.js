const asyncHandler = require("../middleware/async");
const db = require("../config/connectDB");
const errorResponse = require("../utils/errorResponse");
const util = require("util");
const query = util.promisify(db.query).bind(db);

// @desc    create Detail
// @route   POST /api/v1/detail/
// @access  Private
exports.createDetail = asyncHandler(async (req, res, next) => {
  const {
    team_name,
    competition_name,
    generation,
    theme_1,
    theme_2,
  } = req.body;

  // Check Duplicate
  const rows = await query(
    "SELECT COUNT(*) as total FROM `detail` WHERE `member_id` = ? AND `generation_uniqid` = ? ",
    [req.user.uniqid, generation]
  );

  let resultArray = Object.values(JSON.parse(JSON.stringify(rows)));
  if (resultArray[0].total > 0) {
    return next(new errorResponse(`Duplicate user entered`, 400));
  }

  try {
    await query(
      "INSERT INTO `detail`(`member_id`, `team_name`, `competition_name`,`generation_uniqid`, `theme_1`, `theme_2`, `created_at`) VALUES (?,?,?,?,?,?,?)",
      [
        req.user.uniqid,
        team_name,
        competition_name,
        generation,
        JSON.stringify(theme_1),
        JSON.stringify(theme_2),
        new Date(),
      ]
    );
  } catch (err) {
    return next(new errorResponse(`Insert Failed`, 400));
  }

  res.status(200).json({ success: true });
});

// @desc    get Single Detail
// @route   GET /api/v1/detail/
// @access  Private
exports.getDetail = asyncHandler(async (req, res, next) => {
  let querySQL = "SELECT * FROM `detail` WHERE `member_id` = ?";

  if (req.query.generation_uniqid) {
    querySQL += ` AND generation_uniqid = '${req.query.generation_uniqid}'`;
  }

  const user = await query(querySQL, [req.user.uniqid]);

  let userJson = Object.values(JSON.parse(JSON.stringify(user)));

  if (userJson == undefined) {
    return next(new errorResponse("Invalid credentials", 401));
  }

  res.status(200).json({ success: true, data: userJson });
});

// @desc    Update detail
// @route   PUT /api/v1/detail/
// @access  Private
exports.updateDetail = asyncHandler(async (req, res, next) => {
  let { team_name, competition_name, theme_1, theme_2 } = req.body;

  try {
    await query(
      `UPDATE \`detail\` SET \`team_name\` = ? ,\`competition_name\` = ? ,\`theme_1\` = ?,\`theme_2\` = ? WHERE  \`member_id\` = ? AND \`generation_uniqid\` = ? `,
      [
        team_name,
        competition_name,
        theme_1,
        theme_2,
        req.user.uniqid,
        req.params.id
      ]
    );
  } catch (err) {
    return next(new errorResponse(`Update Failed`, 400));
  }

  let querySQL = "SELECT * FROM `detail` WHERE `member_id` = ?";

  if (req.params.id) {
    querySQL += ` AND generation_uniqid = '${req.params.id}'`;
  }

  const user = await query(querySQL, [req.user.uniqid]);

  let userJson = Object.values(JSON.parse(JSON.stringify(user)))[0];

  if (userJson == undefined) {
    return next(new errorResponse("Invalid credentials", 401));
  }

  res.status(200).json({ success: true, data: user });
});
