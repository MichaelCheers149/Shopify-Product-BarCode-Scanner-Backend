const axios = require("axios");
const detailFields = require("../config/details");
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

    if (data.results.length === 0) {
      res.status(400).json({ message: "Incorrect UPC!" });
    }

    console.log("result: ", data.results[0]);

    const [artist, title] = data.results[0]["title"].split(" - ");
    const genre_ = data.results[0]["genre"].map((genre) =>
      genre === "Rock" || genre === "Pop" ? "Rock & Pop" : genre
    );
    const release_year = data.results[0]["year"];
    const record_label = data.results[0]["label"];
    const vendor = data.results[0]["label"];
    const product_type = data.results[0]["format"].map((format) =>
      format === "DVD" ? "DVDs" : format === "CD" ? "CDs" : format
    );
    const country_of_manufacture = data.results[0]["country"];
    const catalog = data.results[0]["catno"];

    let result = {
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

      if (Array.isArray(result[field.name])) {
        if (!field.options) {
          if (field.isMultiSelect)
            details[field.name]["value"] = [result[field.name][0]];
          else details[field.name]["value"] = result[field.name][0];
        } else {
          if (field.isMultiSelect)
            details[field.name]["value"] = result[field.name].filter(
              (value) => {
                return field.options.includes(value);
              }
            );
          else
            details[field.name]["value"] = result[field.name].find((value) => {
              return field.options.includes(value);
            });
        }
      } else {
        if (!field.options) {
          if (field.isMultiSelect) {
            if (result[field.name])
              details[field.name]["value"] = [result[field.name]];
            else details[field.name]["value"] = [];
          } else details[field.name]["value"] = result[field.name];
        } else {
          let value = field.options.find(
            (option) => option === result[field.name]
          );
          if (field.isMultiSelect) details[field.name]["value"] = [value];
          else details[field.name]["value"] = value;
        }
      }
    }

    console.log("details: ", details);

    res.json({
      message: "Success!",
      details,
    });
  } catch (error) {
    console.log("error: ", error);
    res.status(500).json({ message: "Server error" });
  }
};

const upload = async (req, res) => {
  const details = req.body;
  const authHeader = req.get("Authorization");
  const token = authHeader.split(" ")[1];
  decodedToken = jwt.verify(token, "secret");
  let creatingData = {
    metafields: [
      {
        key: "uploaded_by",
        value: decodedToken.username,
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

  console.log("creatingData: ", creatingData);

  try {
    const response = await shopify.product.create(creatingData);
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
