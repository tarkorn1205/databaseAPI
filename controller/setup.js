const asyncHandler = require("../middleware/async");
const db = require("../config/connectDB");
const errorResponse = require("../utils/errorResponse");
const util = require("util");
const query = util.promisify(db.query).bind(db);

// @desc    get All Date
// @route   GET /api/v1/
// @access  Private
exports.getAll = asyncHandler(async (req, res, next) => {
  const player = await query(
    "SELECT * FROM `player` WHERE  `member_id` = ? AND `available` = 'true' ",
    [req.user.uniqid]
  );
  let playerJson = Object.values(JSON.parse(JSON.stringify(player)));

  const leader = await query(
    "SELECT * FROM `leader` WHERE `member_id` = ? AND `available` = 'true' ",
    [req.user.uniqid]
  );

  let leaderJson = Object.values(JSON.parse(JSON.stringify(leader)));

  const detail = await query("SELECT * FROM `detail` WHERE `member_id` = ?", [
    req.user.uniqid,
  ]);

  let detailJson = Object.values(JSON.parse(JSON.stringify(detail)));

  res
    .status(200)
    .json({
      success: true,
      data: { player: playerJson, leader: leaderJson, detail: detailJson },
    });
});
