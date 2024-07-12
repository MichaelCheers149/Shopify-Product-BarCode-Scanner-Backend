const express = require("express");
const {
  getUsers,
  changeRoleOfUser,
  removeUser,
} = require("../controllers/user");

const router = express.Router();

router.get("/", getUsers);
router.post("/changeRoleOfUser", changeRoleOfUser);
router.delete("/:userId", removeUser);

module.exports = router;
