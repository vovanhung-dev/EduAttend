const authController = require("../controllers/authController");
const router = require("express").Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

module.exports = router;