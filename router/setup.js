const express = require("express");
const router = express.Router();
const { getAll } = require("../controller/setup");
const { protect } = require("../utils/auth");

router.use(protect);
router.route("/").get(getAll);


module.exports = router;
