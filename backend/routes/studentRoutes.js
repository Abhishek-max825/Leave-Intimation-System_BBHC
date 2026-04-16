const express = require("express");
const { attachUserFromRequest, authorizeRoles } = require("../middleware/authMiddleware");
const {
  studentDashboard,
  studentLeaves,
  studentApplyLeave,
} = require("../controllers/studentController");

const router = express.Router();

router.use(attachUserFromRequest);
router.use(authorizeRoles("student"));

router.get("/dashboard", studentDashboard);
router.get("/leaves", studentLeaves);
router.post("/apply", studentApplyLeave);

module.exports = router;

