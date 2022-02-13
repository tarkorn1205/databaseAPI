const asyncHandler = require("../middleware/async");
const db = require("../config/connectDB");
const errorResponse = require("../utils/errorResponse");
const util = require("util");
const query = util.promisify(db.query).bind(db);
const { uniqPK } = require("../utils/auth");

// @desc    create Generation
// @route   POST /api/v1/generation/
// @access  Private
exports.createGeneration = asyncHandler(async (req, res, next) => {
  const { generation_name, limits_player } = req.body;


  // console.log(`INSERT INTO \`generation\`(\`generation_uniqid\`, \`generation_name\`, \`limits_player\`, \`created_at\`) VALUES ('${uniqPK}',?,?,?)`)
  try {
    await query(
      "INSERT INTO `generation`(`generation_uniqid`, `generation_name`, `limits_player`, `created_at`) VALUES (?,?,?,?)",
      [uniqPK(), generation_name, limits_player, new Date()]
    );
  } catch (err) {
    return next(new errorResponse(`Insert Failed`, 400));
  }

  res.status(200).json({ success: true });
});

// @desc    get Detail
// @route   GET /api/v1/generation/
// @access  Private
exports.getGeneration = asyncHandler(async (req, res, next) => {
  const user = await query("SELECT * FROM `generation`");

  let userJson = Object.values(JSON.parse(JSON.stringify(user)));

  if (userJson == undefined) {
    return next(new errorResponse("Invalid credentials", 401));
  }

  res.status(200).json({ success: true, data: userJson });
});
