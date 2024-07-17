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
        key: "uploaded_by",
        value: "admin",
        type: "single_line_text_field",
        namespace: "custom",
      },
      {
        key: "artist",
        value: "K.I.Z.",
        type: "single_line_text_field",
        namespace: "custom",
      },
      {
        key: "author",
        value: "Author",
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
        value: '["Hip Hop","R & B"]',
        type: "list.single_line_text_field",
        namespace: "custom",
      },
      {
        key: "vinyl_grade",
        value: '["Sealed","NM"]',
        type: "list.single_line_text_field",
        namespace: "custom",
      },
      {
        key: "product_size",
        value: '7"',
        type: "single_line_text_field",
        namespace: "custom",
      },
      {
        key: "catalog",
        value: "5021732261298",
        type: "single_line_text_field",
        namespace: "custom",
      },
      {
        key: "record_label",
        value: "K.I.Z.",
        type: "single_line_text_field",
        namespace: "custom",
      },
      {
        key: "release_year",
        value: '["2024","2023"]',
        type: "list.number_integer",
        namespace: "custom",
      },
      {
        key: "cover_type",
        value: "Softcover",
        type: "single_line_text_field",
        namespace: "custom",
      },
      {
        key: "edition",
        value: "Edition",
        type: "single_line_text_field",
        namespace: "custom",
      },
      {
        key: "country_of_manufacture",
        value: "Germany, Austria, & Switzerland",
        type: "single_line_text_field",
        namespace: "custom",
      },
      {
        key: "autographed",
        value: "No",
        type: "single_line_text_field",
        namespace: "custom",
      },
    ],
    title: "Görlitzer Park",
    product_type: "Cassettes",
    vendor: "K.I.Z.",
  })
  .then((res) => console.log("res: ", res))
  .catch((err) => console.log("err: ", err));
