const axios = require("axios");
require("dotenv").config();

const getDetails = async (req, res) => {
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

    if (!data.results.length) {
      res.status(400).json({ message: "Incorrect UPC!" });
    }

    const [artist, title] = data.results[0]["title"].split(" - ");
    const genre = data.results[0]["genre"];
    const year = data.results[0]["year"];
    const recordLabel = data.results[0]["label"];
    const format = data.results[0]["format"];
    const country = data.results[0]["country"];
    const catalog = data.results[0]["catno"];

    console.log("result: ", data.results[0]);

    res.json({
      message: "Success!",
      data: {
        artist,
        title,
        upc,
        genre,
        year,
        recordLabel,
        format,
        country,
        catalog,
      },
    });
  } catch (error) {}
};

module.exports = { getDetails };
