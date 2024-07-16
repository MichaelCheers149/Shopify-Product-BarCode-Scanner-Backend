const Shopify = require("shopify-api-node");
require("dotenv").config();

const shopify = new Shopify({
  shopName: process.env.SHOP_NAME,
  accessToken: process.env.SHOPIFY_API_TOKEN,
});

// shopify.product
//   .list({})
//   .then((res) => console.log("res: ", res))
//   .catch((err) => console.log("err: ", err));

shopify.metafield
  .list({})
  .then((res) => console.log("res: ", res))
  .catch((err) => console.log("err: ", err));
