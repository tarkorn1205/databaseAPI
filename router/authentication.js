const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  update,
  logout,
} = require("../controller/authentication");
const { protect } = require("../utils/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);

module.exports = router;
