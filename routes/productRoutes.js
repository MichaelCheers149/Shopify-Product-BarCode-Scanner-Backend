const express = require("express");
const {
  getDetails,
  upload,
  getProducts,
  removeProduct,
} = require("../controllers/product");

const router = express.Router();

router.post("/details", getDetails);
router.post("/upload", upload);
router.get("/", getProducts);
router.delete("/:productId", removeProduct);

module.exports = router;
