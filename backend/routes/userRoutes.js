const express = require("express");
const {
  registerUser,
  loginUser,
  getMyProfile,
  listFacultyUsers,
  bootstrapFacultyUsers,
  bootstrapAdminUser,
} = require("../controllers/userController");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getMyProfile);
router.get("/faculty", listFacultyUsers);
router.post("/faculty/bootstrap", bootstrapFacultyUsers);
router.post("/admin/bootstrap", bootstrapAdminUser);

module.exports = router;

