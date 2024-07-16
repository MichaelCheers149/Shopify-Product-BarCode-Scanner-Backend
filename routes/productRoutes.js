const express = require("express");
const {
  getDetails,
  upload,
  getAllProducts,
} = require("../controllers/product");

const router = express.Router();

router.post("/details", getDetails);
router.post("/upload", upload);
router.get("/all", getAllProducts);

module.exports = router;
