const express = require("express");
const {
  registerUser,
  loginUser,
  listFacultyUsers,
  bootstrapFacultyUsers,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/faculty", listFacultyUsers);
router.post("/faculty/bootstrap", bootstrapFacultyUsers);

module.exports = router;

