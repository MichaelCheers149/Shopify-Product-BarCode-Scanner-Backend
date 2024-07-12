const User = require("../models/users");
const jwt = require("jsonwebtoken");
const roles = require("../config/role");

const isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "not authenticated" });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "secret");
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "could not decode the token" });
  }
  if (!decodedToken) {
    res.status(401).json({ message: "unauthorized" });
  } else {
    next();
  }
};

const isAdmin = async (req, res, next) => {
  console.log("request: ", req.body);
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "secret");
  } catch (err) {
    return res
      .status(500)
      .json({ message: err.message || "Could not decode the token" });
  }
  if (!decodedToken) {
    res.status(401).json({ message: "Unauthorized!" });
  } else {
    let user = await User.findOne({ username: decodedToken?.username });
    console.log("user: ", user);
    if (user && user.role === roles.admin) {
      return next();
    } else {
      res.status(401).json({ message: "Unauthorized!" });
    }
  }
};

module.exports = { isAuth, isAdmin };
