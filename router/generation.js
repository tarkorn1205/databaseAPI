const express = require("express");
const router = express.Router();
const { createGeneration , getGeneration } = require("../controller/generation");
const { protect } = require("../utils/auth");

router.use(protect);

router.route("/").post(createGeneration).get(getGeneration)
module.exports = router;
