const mongoose = require("mongoose");

const productsSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
});

const Products = mongoose.model("products", productsSchema);
module.exports = Products;
