const express = require("express");
const { getDetails } = require("../controllers/product");

const router = express.Router();

router.post("/details", getDetails);

module.exports = router;
