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

// shopify.metafield
//   .list({
//     metafield: {
//       owner_resource: "product",
//       owner_id: "9493177172250",
//     },
//   })
//   .then((res) => console.log("res: ", res))
//   .catch((err) => console.log("err: ", err));

shopify.product
  .create({
    title: "New test product",
    product_type: "Cassettes",
    vendor: "K.I.Z.",
    variants: [{ price: "12.00" }],
  })
  .then((res) => console.log("res: ", res))
  .catch((err) => console.log("err: ", err));
