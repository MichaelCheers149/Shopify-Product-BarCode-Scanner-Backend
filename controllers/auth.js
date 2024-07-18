const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");

const signup = async (req, res) => {
  // checks if email already exists
  console.log("signup request: ", req.body);
  let dbUser = await User.findOne({
    email: req.body.email,
  });

  if (dbUser) {
    return res.status(409).json({ message: "Email already exists!" });
  } else {
    dbUser = await User.findOne({
      username: req.body.username,
    });
    if (dbUser) {
      return res.status(409).json({ message: "Username already exists!" });
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
            return res.status(500).json({ message: "Please try again!" });
          } else if (passwordHash) {
            return User.create({
              email: req.body.email,
              username: req.body.username,
              password: passwordHash,
            })
              .then(() => {
                const token = jwt.sign(
                  { username: req.body.username },
                  "secret",
                  {
                    expiresIn: "24h",
                  }
                );
                res
                  .status(200)
                  .json({ message: "Successfully created!", token: token });
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(502)
                  .json({ message: "Error while creating the user!" });
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
  console.log("login request: ", req.body);
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
          res.status(502).json({ message: "Please try again!" });
        } else if (compareRes) {
          // password match
          const token = jwt.sign({ username: dbUser.username }, "secret", {
            expiresIn: "24h",
          });
          res
            .status(200)
            .json({ message: "Successfully logged in", token: token });
        } else {
          // password doesnt match
          res.status(401).json({ message: "Incorrect Password" });
        }
      });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server error" });
  }
  // checks if email exists
};

const isAuth = (req, res) => {
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
  if (!decodedToken || !decodedToken.username) {
    res.status(401).json({ message: "Authentication failed!" });
  } else {
    res.json({ message: "Success!" });
  }
};

const getRole = async (req, res) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication failed!" });
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, "secret");
  } catch (err) {
    return res.status(500).json({ message: "Authentication failed!" });
  }
  if (!decodedToken) {
    res.status(401).json({ message: "Authentication failed!" });
  } else {
    let user = await User.findOne({ username: decodedToken?.username });
    res.json({ message: "Success!", role: user.role });
  }
};

module.exports = { login, signup, isAuth, getRole };
