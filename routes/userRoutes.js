const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/registration", authController.signup);
router.post("/login", authController.login);
router.post("/refresh", authController.protect, authController.refreshUser);
router.post("/logout", authController.protect, authController.logout);

module.exports = router;
