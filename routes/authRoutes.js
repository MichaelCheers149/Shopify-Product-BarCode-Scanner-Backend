const express = require("express");
const { signup, login, isAuth, getRole } = require("../controllers/auth");

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/isAuth", isAuth);
router.get("/getRole", getRole);

module.exports = router;
