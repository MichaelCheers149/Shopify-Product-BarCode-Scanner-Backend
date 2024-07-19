const axios = require("axios");
const detailFields = require("../config/details");
const Shopify = require("shopify-api-node");
const jwt = require("jsonwebtoken");
const Product = require("../models/products");
const User = require("../models/users");
require("dotenv").config();

const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  accessToken: process.env.SHOPIFY_API_TOKEN,
});

const getDetails = async (req, res) => {
  console.log("getting product details request: ", req.body);
  const { upc } = req.body;
  if (!upc) return res.status(400).json({ message: "Incorrect UPC" });

  try {
    const { data } = await axios.default.get(
      `https://api.discogs.com/database/search?barcode=${upc}`,
      {
        headers: {
          Authorization: `Discogs token=${process.env.DISCOGS_API_TOKEN}`,
        },
      }
    );

    if (!data.results) {
      return res.status(500).json({ message: "Server error!" });
    }

    if (data.results.length === 0) {
      res.status(400).json({ message: "Incorrect UPC!" });
    }

    let productDetails = data.results.map((result) => {
      const [artist, title] = result["title"].split(" - ");
      const genre_ = result["genre"].map((genre) =>
        genre === "Rock" || genre === "Pop" ? "Rock & Pop" : genre
      );
      const release_year = result["year"];
      const record_label = result["label"];
      const vendor = result["label"];
      const product_type = result["format"].map((format) =>
        format === "DVD" ? "DVDs" : format === "CD" ? "CDs" : format
      );
      const country_of_manufacture = result["country"];
      const catalog = result["catno"];

      let filteredData = {
        artist,
        title,
        upc_: upc,
        vendor,
        genre_,
        release_year,
        record_label,
        product_type,
        country_of_manufacture,
        catalog,
      };
      let details = {};

      for (let field of detailFields) {
        details[field.name] = field;

        if (Array.isArray(filteredData[field.name])) {
          if (!field.options) {
            if (field.isMultiSelect)
              details[field.name]["value"] = [filteredData[field.name][0]];
            else details[field.name]["value"] = filteredData[field.name][0];
          } else {
            if (field.isMultiSelect)
              details[field.name]["value"] = filteredData[field.name].filter(
                (value) => {
                  return field.options.includes(value);
                }
              );
            else
              details[field.name]["value"] = filteredData[field.name].find(
                (value) => {
                  return field.options.includes(value);
                }
              );
          }
        } else {
          if (!field.options) {
            if (field.isMultiSelect) {
              if (filteredData[field.name])
                details[field.name]["value"] = [filteredData[field.name]];
              else details[field.name]["value"] = [];
            } else details[field.name]["value"] = filteredData[field.name];
          } else {
            let value = field.options.find(
              (option) => option === filteredData[field.name]
            );
            if (field.isMultiSelect) details[field.name]["value"] = [value];
            else details[field.name]["value"] = value;
          }
        }
      }

      return details;
    });

    res.json({
      message: "Successed in getting product details!",
      productDetails,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

const upload = async (req, res) => {
  console.log("uploading product request: ", req.body);
  const productDetailsList = req.body;
  const authHeader = req.get("Authorization");
  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.verify(token, "secret");
  let user = await User.findOne({ username: decodedToken?.username });

  let successed = [];
  let failed = [];

  for (let details of productDetailsList) {
    let creatingData = {
      metafields: [
        {
          key: "uploaded_by",
          value: user.username,
          type: "single_line_text_field",
          namespace: "custom",
        },
      ],
    };

    detailFields.forEach((field) => {
      if (details[field.name]["value"]) {
        let value = details[field.name]["value"];
        if (Array.isArray(value)) {
          value = value.filter((value) => value && value !== "");
          value = JSON.stringify(value);
        }
        if (field["isMetafield"]) {
          creatingData["metafields"] = [
            ...creatingData["metafields"],
            {
              key: details[field.name]["name"],
              value: value,
              type: details[field.name]["type"],
              namespace: "custom",
            },
          ];
        } else {
          creatingData[field.name] = details[field.name]["value"];
        }
      }
    });

    try {
      const response = await shopify.product.create(creatingData);
      await Product.create({ productId: response.id, uploadedBy: user._id });
      successed.push({ ...creatingData, id: response.id });
    } catch (error) {
      console.log("error: ", error);
      failed.push(creatingData);
    }
  }

  res.json({ message: "Successfully uploaded!", successed, failed });
};

const getAllProducts = async (req, res) => {
  const authHeader = req.get("Authorization");
  const token = authHeader.split(" ")[1];
  const decodedToken = jwt.verify(token, "secret");
  let user = await User.findOne({ username: decodedToken?.username });
  let uploadedProducts = await Product.find({ uploadedBy: user._id });
  let ids = uploadedProducts.map((product) => product.productId);

  try {
    const products = await shopify.product.list({ ids: ids.join(",") });
    for (let product of uploadedProducts) {
      if (!products.find((p) => p.id === product.productId)) {
        await Product.findByIdAndDelete(product._id);
      }
    }
    res.json({ message: "Success!", products });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDetails, upload, getAllProducts };
