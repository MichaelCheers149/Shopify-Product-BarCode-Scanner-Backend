const User = require("../models/users");
const jwt = require("jsonwebtoken");
const roles = require("../config/role");

const isAuth = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication failed!" });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "secret");
  } catch (err) {
    return res.status(401).json({ message: "Authentication failed!" });
  }
  if (!decodedToken) {
    res.status(401).json({ message: "Authentication failed!" });
  } else {
    next();
  }
};

const isAdmin = async (req, res, next) => {
  // console.log("request: ", req.body);
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication failed!" });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "secret");
  } catch (err) {
    return res.status(401).json({ message: "Authentication failed!" });
  }
  if (!decodedToken) {
    res.status(401).json({ message: "Authentication failed!" });
  } else {
    let user = await User.findOne({ username: decodedToken?.username });
    // console.log("user: ", user);
    if (user && user.role === roles.admin) {
      return next();
    } else {
      res.status(401).json({ message: "Authentication failed!" });
    }
  }
};

module.exports = { isAuth, isAdmin };
