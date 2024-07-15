const express = require("express");
const { getDetails, upload } = require("../controllers/product");

const router = express.Router();

router.post("/details", getDetails);
router.post("/upload", upload);

module.exports = router;
