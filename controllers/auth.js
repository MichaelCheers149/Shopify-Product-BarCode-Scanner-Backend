const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
const roles = require("../config/role");

const signup = async (req, res) => {
  // checks if email already exists
  let dbUser = await User.findOne({
    email: req.body.email,
  });

  if (dbUser) {
    return res.status(409).json({ message: "Email already exists" });
  } else {
    dbUser = await User.findOne({
      username: req.body.username,
    });
    if (dbUser) {
      return res.status(409).json({ message: "Username already exists" });
    } else {
      if (
        req.body.email &&
        req.body.email !== "" &&
        req.body.password &&
        req.body.password !== "" &&
        req.body.username &&
        req.body.username !== ""
      ) {
        // password hash
        bcrypt.hash(req.body.password, 12, (err, passwordHash) => {
          if (err) {
            return res
              .status(500)
              .json({ message: "Couldn't hash the password" });
          } else if (passwordHash) {
            return User.create({
              email: req.body.email,
              username: req.body.username,
              password: passwordHash,
            })
              .then(() => {
                res.status(200).json({ message: "User created" });
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(502)
                  .json({ message: "Error while creating the user" });
              });
          }
        });
      } else if (!req.body.password || req.body.password === "") {
        return res.status(400).json({ message: "Password not provided" });
      } else if (!req.body.email || req.body.email === "") {
        return res.status(400).json({ message: "Email not provided" });
      } else if (!req.body.username || req.body.username === "") {
        return res.status(400).json({ message: "Username not provided" });
      }
    }
  }
};

const login = async (req, res) => {
  try {
    let dbUser = await User.findOne({
      email: req.body.usernameOrEmail,
    });

    if (!dbUser) {
      dbUser = await User.findOne({
        username: req.body.usernameOrEmail,
      });
    }

    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    } else {
      // password hash
      bcrypt.compare(req.body.password, dbUser.password, (err, compareRes) => {
        if (err) {
          // error while comparing
          res
            .status(502)
            .json({ message: "Error while checking user password" });
        } else if (compareRes) {
          // password match
          const token = jwt.sign({ username: dbUser.username }, "secret", {
            expiresIn: "24h",
          });
          res.status(200).json({ message: "User logged in", token: token });
        } else {
          // password doesnt match
          res.status(401).json({ message: "Invalid credentials" });
        }
      });
    }
  } catch (error) {
    console.log("error", error);
  }
  // checks if email exists
};

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
    res.status(401).json({ message: "unauthorized" });
  } else {
    let user = await User.findOne({ username: decodedToken?.username });
    if (user && user.role === roles.admin) {
      return next();
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  }
};

module.exports = { login, signup, isAuth, isAdmin };
