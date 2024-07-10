const express = require("express");
const { signup, login, isAuth } = require("../controllers/auth");

const router = express.Router();

router.post("/login", login);
router.post("/signup", signup);
router.get("/isAuth", isAuth);

module.exports = router;
