const User = require("../models/users");
const roles = require("../config/role");

const getUsers = async (req, res) => {
  try {
    let users = await User.find({});
    users = users
      .filter((user) => user.role !== roles.admin)
      .map((user) => ({
        id: user._id,
        username: user.username,
        role: user.role,
        email: user.email,
      }));
    res.json({ message: "Success!", users });
  } catch (error) {
    console.log("error", error);
  }
};

const changeRoleOfUser = async (req, res) => {
  const newRole = req.body.role;
  if (!roles[newRole])
    return res.status(404).json({ message: "Please input correct role." });
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
  }
};

const removeUser = async (req, res) => {
  try {
    await User.findOneAndDelete({ username: req.body.username });
    res.json({ message: "Success!" });
  } catch (error) {
    console.log("error", error);
  }
};

module.exports = { getUsers, changeRoleOfUser, removeUser };
