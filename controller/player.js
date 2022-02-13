const asyncHandler = require("../middleware/async");
const db = require("../config/connectDB");
const errorResponse = require("../utils/errorResponse");
const path = require("path");
const util = require("util");
const query = util.promisify(db.query).bind(db);

// @desc    create Player
// @route   POST /api/v1/player/
// @access  Private
exports.createPlayer = asyncHandler(async (req, res, next) => {
  const { generation_uniqid, name, no, position, birthday } = req.body;
  let user;
  
  const allUser = await query(
    "SELECT COUNT(`_id`) as allUser FROM `player` WHERE `member_id` = ? AND `generation_uniqid`= ?  AND`available` = 'true' ",
    [req.user.uniqid , generation_uniqid ]
  ); 

  let allUserJson = Object.values(JSON.parse(JSON.stringify(allUser)))[0].allUser + 1;

  const limitsPlayer = await query(
    "SELECT limits_player FROM `generation` WHERE `generation_uniqid`= ?",
    [generation_uniqid ]
  ); 

  let limitsPlayerJson = Object.values(JSON.parse(JSON.stringify(limitsPlayer)))[0].limits_player;
  
  if(allUserJson > limitsPlayerJson){
    return next(new errorResponse(`Player Limits`, 400));
  }

  try {
    user = await query(
      "INSERT INTO `player`(`member_id`,`generation_uniqid`,`name`,`position`,`no`, `birthday`,`img`,`available`, `created_at`) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        req.user.uniqid,
        generation_uniqid,
        name,
        position,
        no,
        birthday,
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

// @desc    get Single Player
// @route   GET /api/v1/player/:id
// @access  Private
exports.getSingle = asyncHandler(async (req, res, next) => {
  const user = await query(
    "SELECT * FROM `player` WHERE `_id` = ? AND `member_id` = ? AND `available` = 'true' ",
    [req.params.id, req.user.uniqid]
  );

  let userJson = Object.values(JSON.parse(JSON.stringify(user)))[0];

  if (userJson == undefined) {
    return next(new errorResponse("Invalid credentials", 401));
  }

  res.status(200).json({ success: true, data: userJson });
});

exports.getLimitsPlayer = asyncHandler(async (req, res, next) => {
  const allUser = await query(
    "SELECT COUNT(`_id`) as allUser FROM `player` WHERE `member_id` = ? AND `generation_uniqid`= ?  AND`available` = 'true' ",
    [req.user.uniqid , req.params.id]
  ); 

  let allUserJson = Object.values(JSON.parse(JSON.stringify(allUser)))[0].allUser + 1;

  const limitsPlayer = await query(
    "SELECT limits_player FROM `generation` WHERE `generation_uniqid`= ?",
    [req.params.id]
  ); 

  let limitsPlayerJson = Object.values(JSON.parse(JSON.stringify(limitsPlayer)))[0].limits_player;
  
  let isLimits  = allUserJson > limitsPlayerJson;

  res.status(200).json({ success: true, data: isLimits });
});

// @desc    get All Player
// @route   GET /api/v1/player/
// @access  Private
exports.getPlayer = asyncHandler(async (req, res, next) => {
  //select
  if (!req.query.select) {
    req.query.select =
      "`_id`, `member_id`, `name`, `position`, `no`, `birthday`, `img`, `available`, `created_at` ";
  }

  let sql = `SELECT (@row_number:=@row_number + 1) AS num, ${req.query.select} FROM \`player\` WHERE \`member_id\` = ? AND \`available\` = 'true' `;

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

// @desc    Update Player Detail
// @route   PUT /api/v1/player/:id
// @access  Private
exports.updatePlayer = asyncHandler(async (req, res, next) => {
  const { name, position, no, birthday } = req.body;

  try {
    await db.query(
      "UPDATE `player` SET `name`= ?,`position` = ?,`no`= ?,`birthday`= ? WHERE `_id` = ? AND `member_id` = ? ",
      [name, position, no, birthday, req.params.id, req.user.uniqid]
    );
  } catch (err) {
    return next(new errorResponse(`Update Failed`, 400));
  }

  const user = await query("SELECT * FROM `player` WHERE `_id` = ?", [
    req.params.id,
  ]);

  let userJson = Object.values(JSON.parse(JSON.stringify(user)))[0];

  if (userJson == undefined) {
    return next(new errorResponse("Invalid credentials", 401));
  }

  res.status(200).json({ success: true, data: userJson });
});

// @desc    Delete Player Detail
// @route   DELETE /api/v1/player/:id
// @access  Private
exports.deletePlayer = asyncHandler(async (req, res, next) => {
  try {
    db.query(
      "UPDATE `player` SET `available`= 'false' WHERE `_id` = ? AND `member_id` = ? ",
      [req.params.id, req.user.uniqid]
    );
  } catch (err) {
    return next(new errorResponse(`Delete Failed`, 400));
  }

  res.status(200).json({ success: true, data: {} });
});

// @desc    Upload photo for upload
// @route   PUT /api/v1/player/photo/:id
// @access  Private
exports.playerPhotoUpload = asyncHandler(async (req, res, next) => {
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

  file.name = `photoPlayer_${req.params.id}_${req.user.uniqid}${
    path.parse(file.name).ext
  }`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new errorResponse(`Problem with file upload`, 500));
    }

    try {
      db.query(
        "UPDATE `player` SET `img`= ? WHERE `_id` = ? AND `member_id` = ? ",
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
