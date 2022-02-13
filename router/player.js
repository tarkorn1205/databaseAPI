const express = require("express");
const router = express.Router();
const {
  createPlayer,
  getSingle,
  getPlayer,
  updatePlayer,
  deletePlayer,
  playerPhotoUpload,
  getLimitsPlayer
} = require("../controller/player");
const { protect } = require("../utils/auth");

router.use(protect);
router.route("/").post(createPlayer).get(getPlayer);
router.route("/:id").get(getSingle).put(updatePlayer).delete(deletePlayer)
router.put("/photo/:id", playerPhotoUpload)
router.get("/limitsPlayer/:id",  getLimitsPlayer)

module.exports = router;
