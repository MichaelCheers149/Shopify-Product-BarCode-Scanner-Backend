const axios = require("axios");

axios.default
  .get("https://api.discogs.com/database/search?barcode=801341100127", {
    headers: {
      Authorization: "Discogs token=ecKgPlvZYvaKDQORiWShesQqEQavkfHHiezplLhP",
    },
  })
  .then((res) => {
    console.log(JSON.stringify(res.data));
  })
  .catch((err) => console.log("error: ", err));
