const express = require("express");
const { getDetails, upload, getProducts } = require("../controllers/product");

const router = express.Router();

router.post("/details", getDetails);
router.post("/upload", upload);
router.get("/", getProducts);

module.exports = router;
