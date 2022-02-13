const asyncHandler = require("../middleware/async");
const db = require("../config/connectDB");
const errorResponse = require("../utils/errorResponse");
const path = require("path");
const util = require("util");
const query = util.promisify(db.query).bind(db);

// @desc    create Leader
// @route   POST /api/v1/leader/
// @access  Private
exports.createLeader = asyncHandler(async (req, res, next) => {
  const { generation_uniqid, name, position, tel } = req.body;
  let user;
  try {
    user = await query(
      "INSERT INTO `leader`(`member_id`,`generation_uniqid`, `name`, `position`, `tel`,`img`, `available`, `created_at`) VALUES (?,?,?,?,?,?,?,?)",
      [
        req.user.uniqid,
        generation_uniqid,
        name,
        position,
        tel,
        "no-photo.jpg",
        "true",
        new Date(),
      ]
    );
  } catch (err) {
    return next(new errorResponse(`Insert Failed`, 400));
  }

  res.status(200).json({ success: true, userId: user.insertId });
});

// @desc    get Single Leader
// @route   GET /api/v1/leader/:id
// @access  Private
exports.getSingle = asyncHandler(async (req, res, next) => {
  const user = await query(
    "SELECT * FROM `leader` WHERE `_id` = ? AND `member_id` = ? AND `available` = 'true' ",
    [req.params.id, req.user.uniqid]
  );

  let userJson = Object.values(JSON.parse(JSON.stringify(user)))[0];

  if (userJson == undefined) {
    return next(new errorResponse("Invalid credentials", 401));
  }

  res.status(200).json({ success: true, data: userJson });
});

// @desc    get All Leader
// @route   GET /api/v1/leader/
// @access  Private
exports.getLeader = asyncHandler(async (req, res, next) => {
  //select
  if (!req.query.select) {
    req.query.select =
      "`_id`, `member_id`,`generation_uniqid`,`name`, `position`, `tel`, `img`, `available`, `created_at`";
  }

  let sql = `SELECT (@row_number:=@row_number + 1) AS num, ${req.query.select} FROM \`leader\` WHERE \`member_id\` = ? AND \`available\` = 'true' `;

  if (req.query.generation_uniqid) {
    sql += ` AND generation_uniqid = '${req.query.generation_uniqid}'`;
  }

  // sort
  if (req.query.sort) {
    sql += `ORDER BY ${req.query.sort} DESC`;
  }
  await query("set @row_number := 0;");

  const user = await query(sql, [req.user.uniqid]);

  let userJson = Object.values(JSON.parse(JSON.stringify(user)));

  if (userJson == undefined) {
    return next(new errorResponse("Invalid credentials", 401));
  }

  res.status(200).json({ success: true, data: userJson });
});

// @desc    Update Leader Detail
// @route   PUT /api/v1/leader/:id
// @access  Private
exports.updateLeader = asyncHandler(async (req, res, next) => {
  const { name, position, tel } = req.body;

  try {
    db.query(
      "UPDATE `leader` SET `name`= ?,`position`= ?,`tel`= ? WHERE `_id` = ? AND `member_id` = ? ",
      [name, position, tel, req.params.id, req.user.uniqid]
    );
  } catch (err) {
    return next(new errorResponse(`Update Failed`, 400));
  }

  const user = await query("SELECT * FROM `leader` WHERE `_id` = ?", [
    req.params.id,
  ]);

  let userJson = Object.values(JSON.parse(JSON.stringify(user)))[0];

  if (userJson == undefined) {
    return next(new errorResponse("Invalid credentials", 401));
  }

  res.status(200).json({ success: true, data: userJson });
});

// @desc    Delete Leader Detail
// @route   DELETE /api/v1/leader/:id
// @access  Private
exports.deleteLeader = asyncHandler(async (req, res, next) => {
  try {
    db.query(
      "UPDATE `leader` SET `available`= 'false' WHERE `_id` = ? AND `member_id` = ? ",
      [req.params.id, req.user.uniqid]
    );
  } catch (err) {
    return next(new errorResponse(`Delete Failed`, 400));
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc    Upload photo for upload
// @route   PUT /api/v1/leader/photo/:id
// @access  Private
exports.leaderPhotoUpload = asyncHandler(async (req, res, next) => {
  if (!req.files) {
    return next(new errorResponse(`Please upload a file`, 400));
  }

  const file = req.files.files;

  if (!file.mimetype.startsWith("image")) {
    return next(new errorResponse(`Please upload an image file`, 400));
  }

  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new errorResponse(
        `Please upload an image less then ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  file.name = `photoLeader_${req.params.id}_${req.user.uniqid}${
    path.parse(file.name).ext
  }`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new errorResponse(`Problem with file upload`, 500));
    }

    try {
      db.query(
        "UPDATE `leader` SET `img`= ? WHERE `_id` = ? AND `member_id` = ? ",
        [file.name, req.params.id, req.user.uniqid]
      );
    } catch (err) {
      return next(new errorResponse(`UPDATE Phone Failed`, 400));
    }
  });

  res.status(200).json({
    success: true,
  });
});
