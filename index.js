const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const authRouter = require("./routes/authRoutes");
const userRouter = require("./routes/userRoutes");
const productRouter = require("./routes/productRoutes");
const { isAdmin, isAuth } = require("./middleware/auth");

require("dotenv").config();
require("./config/db")();

const app = express();

app.use(bodyParser.json());
app.use(
  cors((data, next) => {
    console.log("ip: ", data.ip);
    next();
  })
);

app.use("/auth", authRouter);
app.use("/user", isAdmin, userRouter);
app.use("/product", isAuth, productRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);
