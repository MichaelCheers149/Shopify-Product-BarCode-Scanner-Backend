const axios = require("axios");
const metafields = require("../config/metafields");
const Shopify = require("shopify-api-node");
require("dotenv").config();

const getDetails = async (req, res) => {
  const { upc } = req.body;
  if (!upc) return res.status(400).json({ message: "Incorrect UPC" });
  console.log("getting product request for upc: ", upc);
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

    if (!data.results.length) {
      res.status(400).json({ message: "Incorrect UPC!" });
    }

    console.log("result: ", data.results[0]);

    const [artist, title] = data.results[0]["title"].split(" - ");
    const genre = data.results[0]["genre"].map((genre) =>
      genre === "Rock" || genre === "Pop" ? "Rock & Pop" : genre
    );
    const year = data.results[0]["year"];
    const recordLabel = data.results[0]["label"];
    const format = data.results[0]["format"].map((format) =>
      format === "DVD" ? "DVDs" : format === "CD" ? "CDs" : format
    );
    const country = data.results[0]["country"];
    const catalog = data.results[0]["catno"];

    let result = {
      artist,
      title,
      upc,
      genre,
      year,
      recordLabel,
      format,
      country,
      catalog,
    };
    let details = {};

    for (let field of metafields) {
      if (Array.isArray(result[field.name])) {
        if (field.type === "string") {
          details[field.name] = result[field.name][0];
        } else if (field.type === "select") {
          details[field.name] = result[field.name].find((value) => {
            return field.options.includes(value);
          });
        }
      } else {
        details[field.name] = result[field.name];
      }
    }

    console.log("details: ", details);

    res.json({
      message: "Success!",
      details,
      metafields,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

const upload = async (req, res) => {
  const shopify = new Shopify({
    shopName: process.env.SHOP_NAME,
    apiKey: process.env.SHOPIFY_API_KEY,
    password: process.env.SHOPIFY_API_PASSWORD,
  });
  try {
    await shopify.product.create({});
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const getProducts = async (req, res) => {
  const shopify = new Shopify({
    shopName: process.env.SHOP_NAME,
    apiKey: process.env.SHOPIFY_API_KEY,
    password: process.env.SHOPIFY_API_PASSWORD,
  });

  try {
    const products = await shopify.product.list();
    console.log("products: ", products);
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDetails, upload, getProducts };
