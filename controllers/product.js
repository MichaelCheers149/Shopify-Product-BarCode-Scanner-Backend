const axios = require("axios");
const metafields = require("../config/metafields");
const Shopify = require("shopify-api-node");
require("dotenv").config();

const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  accessToken: process.env.SHOPIFY_API_TOKEN,
});

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
  console.log("request: ", req.body);
  let creatingData = {};

  try {
    const response = await shopify.product.create({
      title: req.body.title,
      category: req.body.format,
      metafields: [
        {
          key: "artist",
          value: req.body.artist,
          value_type: "string",
          namespace: "custom",
        },
      ],
    });
    console.log("created: ", response);
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await shopify.product.list({});
    res.json({ message: "Success!", products });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getDetails, upload, getAllProducts };
