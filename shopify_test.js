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
    metafields: [
      {
        key: "artist",
        value: "K.I.Z.",
        type: "single_line_text_field",
        namespace: "custom",
      },
      {
        key: "title",
        value: "Görlitzer Park",
        type: "single_line_text_field",
        namespace: "custom",
      },
      {
        key: "upc_",
        value: "5021732261274",
        type: "single_line_text_field",
        namespace: "custom",
      },
      {
        key: "genre_",
        value: '["Blues"]',
        type: "list.single_line_text_field",
        namespace: "custom",
      },
    ],
    title: "Görlitzer Park",
    product_type: "Vinyl",
    vendor: "K.I.Z.",
  })
  .then((res) => console.log("res: ", res))
  .catch((err) => console.log("err: ", err));
