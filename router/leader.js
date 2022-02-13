const express = require("express");
const router = express.Router();
const {
  createLeader,
  getSingle,
  getLeader,
  updateLeader,
  deleteLeader,
  leaderPhotoUpload
} = require("../controller/leader");
const { protect } = require("../utils/auth");

router.use(protect);
router.route("/").post(createLeader).get(getLeader);
router.route("/:id").get(getSingle).put(updateLeader).delete(deleteLeader);
router.put("/photo/:id", leaderPhotoUpload)

module.exports = router;
