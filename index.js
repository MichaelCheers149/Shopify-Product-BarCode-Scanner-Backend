const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const { isAuth, isAdmin } = require("./controllers/auth");

require("dotenv").config();
require("./config/db")();

const app = express();

var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use("/auth", authRouter);
app.use("/user", isAdmin, userRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
