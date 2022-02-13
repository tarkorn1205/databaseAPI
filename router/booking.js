const express = require("express");
const router = express.Router();
const {saveBooking,getState,getCalendar,getonestatus,getid,getupdate,getdelete} = require("../controller/booking");
const { protect } = require("../utils/auth");

router.post("/save",protect,saveBooking);
router.post("/getState",protect, getState);
router.post("/getCalendar", getCalendar);
router.post("/getonestatus",protect, getonestatus);
router.post("/getid",protect, getid);
router.post("/getupdate",protect, getupdate);
router.delete("/getdelete",protect, getdelete);

module.exports = router;
