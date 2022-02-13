const express = require("express");
const router = express.Router();
const {
  createDetail,
  getDetail,
  updateDetail,
} = require("../controller/detail");
const { protect } = require("../utils/auth");

router.use(protect);

router.route("/").post(createDetail).get(getDetail)
router.route("/:id").put(updateDetail);
module.exports = router;
