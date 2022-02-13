const asyncHandler = require("../middleware/async");
const db = require("../config/connectDB");
const errorResponse = require("../utils/errorResponse");
const util = require("util");

const query = util.promisify(db.query).bind(db);

// @desc    create Candidate
// @route   POST /api/v1/candidate/
// @access  Private
exports.saveBooking = asyncHandler(async (req, res, next) => {
  const {
    id_room,
    id_class,
    number_people,
    toping,
    bookingname,
    number,
    start_date,
    start_time,
    end_date,
    end_time,
    etc,
  } = req.body;
  let user;

  try {
    user = await query(
      "INSERT INTO `room_booking`(`id_admin`, `id_room`, `number_people`, `topic`, `id_class`,`bookingname`,`number`, `start_date`, `start_time`, `end_date`, `end_time`, `etc`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      [
        req.user.id,
        id_room,
        number_people,
        toping,
        id_class,
        bookingname,
        number,
        start_date,
        start_time,
        end_date,
        end_time,
        etc,
      ]
    );
  } catch (err) {
    console.log(err);
    return next(new errorResponse(`Insert Failed`, 400));
  }
  res.status(200).json({ success: true, room_booking_id: user.insertId });
});

// @desc    Register
exports.statustime = asyncHandler(async (req, res, next) => {
  const {
    id_room,
    id_class,
    number_people,
    toping,
    start_date,
    start_time,
    end_date,
    end_time,
    etc,
  } = req.body;

  try {
    let querySQL = "SELECT * FROM `room_booking`";
    let id_user = req.user.id;
    console.log(querySQL);
    let q = await query(querySQL, [
      id_user,
      id_room,
      id_class,
      number_people,
      toping,
      start_date,
      start_time,
      end_date,
      end_time,
      etc,
    ]);
    // console.log(q)
  } catch (err) {
    return next(new errorResponse(`Insert Failed`, 400));
  }

  res.status(200).json({ success: true });
});
// @route   POST /api/v1/auth/register
// @access  Public

// @desc    Register
// @route   POST /api/v1/auth/register
// @access  Public
exports.getonestatus = asyncHandler(async (req, res, next) => {
  const { start_date } = req.body;

  let querySQL = `SELECT
        room_listname.id,
          room_listname.name as room_listname,
          room_booking.number_people,
          room_booking.topic,
          class_listname.name as class_listname,
          room_booking.bookingname,
          room_booking.number,
          room_booking.start_date,
          room_booking.start_time,
          room_booking.end_date,
          room_booking.end_time
      FROM
          room_booking
      JOIN class_listname ON class_listname.id = room_booking.id_class
      JOIN room_listname ON room_listname.id = room_booking.id_room
      WHERE
          start_date = ?`;
  const user = await query(querySQL, [start_date]);
  let userJson = Object.values(JSON.parse(JSON.stringify(user)));

  res.status(200).json({ success: true, data: userJson });
});

exports.getState = asyncHandler(async (req, res, next) => {
  const { start_date } = req.body;

  let querySQL = `SELECT
        room_listname.id,
          room_listname.name as room_listname,
          room_booking.number_people,
          room_booking.topic,
          class_listname.name as class_listname,
          room_booking.bookingname,
          room_booking.start_date,
          room_booking.start_time,
          room_booking.end_date,
          room_booking.end_time
      FROM
          room_booking
      JOIN class_listname ON class_listname.id = room_booking.id_class
      JOIN room_listname ON room_listname.id = room_booking.id_room
      WHERE
          start_date = ?`;
  const user = await query(querySQL, [start_date]);
  let userJson = Object.values(JSON.parse(JSON.stringify(user)));

  let emtyRoom = [];
  userJson.forEach((val) => {
    if (!emtyRoom.includes(val.id)) {
      emtyRoom.push(val.id);
    }
  });

  let roomQuerySQL = `SELECT * ,null as room_listname , null as number_people , null as topic , null as class_listname , null as start_date , null as start_time , null as end_date , null as end_time FROM room_listname`;
  const room = await query(roomQuerySQL);
  let roomJson = Object.values(JSON.parse(JSON.stringify(room)));

  let result = roomJson.filter((val) => {
    return !emtyRoom.includes(val.id);
  });
  res.status(200).json({ success: true, data: userJson.concat(result) });
});

exports.getid = asyncHandler(async (req, res, next) => {
  const { start_id } = req.body;

  let querySQL = `SELECT
        room_listname.id,
          room_listname.name as room_listname,
          room_booking.number_people,
          room_booking.topic,
          class_listname.name as class_listname,
          room_booking.bookingname,
          room_booking.number,
          room_booking.start_date,
          room_booking.start_time,
          room_booking.end_date,
          room_booking.end_time
      FROM
          room_booking
      JOIN class_listname ON class_listname.id = room_booking.id_class
      JOIN room_listname ON room_listname.id = room_booking.id_room
      WHERE
      room_booking.id_room = ?`;
  const user = await query(querySQL, [start_id]);
  let userJson = Object.values(JSON.parse(JSON.stringify(user)));

  res.status(200).json({ success: true, data: userJson });
});

exports.getupdate = asyncHandler(async (req, res, next) => {
  const {
    
    id_room,
    id_class,
    number_people,
    toping,
    bookingname,
    number,
    start_date,
    start_time,
    end_date,
    end_time,
    etc,
    start_id,
  } = req.body;
  let user;
  try {
    user = await query(
      "UPDATE room_booking SET id_room=?,number_people=?,topic=?,id_class=?,bookingname=?,number=?,start_date=?,start_time=?,end_date=?,end_time=?,etc=? WHERE id=?",
      [
        
        id_room,
        number_people,
        toping,
        id_class,
        bookingname,
        number,
        start_date,
        start_time,
        end_date,
        end_time,
        etc,
        start_id,
      ]
    );
  } catch (err) {
    console.log(err);
    return next(new errorResponse(`Insert Failed`, 400));
  }
  
  // let userJson = Object.values(JSON.parse(JSON.stringify(user)));

  res.status(200).json({ success: true, data: 'successfully' });
});

exports.getdelete = asyncHandler(async (req, res, next) => {
  const {
    start_id,
  } = req.body;
  let user;
  try {
    user = await query(
      "DELETE FROM `room_booking` WHERE `id_room`= ?;",
      [
        start_id,
      ]
    );
  } catch (err) {
    console.log(err);
    return next(new errorResponse(`Error`, 400));
  }
  
  // let userJson = Object.values(JSON.parse(JSON.stringify(user)));

  res.status(200).json({ success: true, data: 'successfully' });
});
// @desc    Register
// @route   POST /api/v1/auth/register
// @access  Public
exports.getCalendar = asyncHandler(async (req, res, next) => {
  let querySQL =
    "SELECT room_listname.name AS 'name', room_booking.start_date, room_booking.start_time, room_booking.end_date, room_booking.end_time FROM `room_booking` JOIN room_listname ON room_listname.id=room_booking.id_room;";
  const user = await query(querySQL);
  let userJson = Object.values(JSON.parse(JSON.stringify(user)));

  let userJson2 = [];
  userJson.forEach((item) => {
    userJson2.push({
      name: item.name,
      start: new Date(`${item.start_date} ${item.start_time}`),
      end: new Date(`${item.end_date} ${item.end_time}`),
    });
  });

  res.status(200).json({ success: true, data: userJson2 });
});
