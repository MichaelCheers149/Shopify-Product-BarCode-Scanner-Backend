const User = require("../models/users");
const roles = require("../config/role");
const Product = require("../models/products");

const getUsers = async (_, res) => {
  try {
    let users = await User.find({});
    let products = await Product.find({});

    users = users

      .map((user) => {
        let productsCount = 0;
        let i = 0;
        while (true) {
          if (i === products.length) break;
          if (products[i].uploadedBy.equals(user._id)) {
            productsCount++;
            products.splice(i, 1);
          } else {
            i++;
          }
        }

        return {
          id: user._id,
          username: user.username,
          role: user.role,
          email: user.email,
          products: productsCount,
        };
      })
      .filter((user) => user.role !== roles.admin);

    res.json({ message: "Success!", users });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server error" });
  }
};

const changeRoleOfUser = async (req, res) => {
  const newRole = req.body.role;
  console.log("changing request: ", req.body);
  try {
    let user = await User.findById(req.body.id);
    if (user && user.role !== roles.admin) {
      user.set({ role: newRole });
      await user.save();
      res.json({ message: "Successfully changed!" });
    } else {
      res.status(404).json({ message: "There is not such a user." });
    }
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server error" });
  }
};

const removeUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: "Successfully removed!" });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getUsers, changeRoleOfUser, removeUser };
