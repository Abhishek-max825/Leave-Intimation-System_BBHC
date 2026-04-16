const express = require("express");
const { attachUserFromRequest, authorizeRoles } = require("../middleware/authMiddleware");
const {
  adminDashboard,
  adminUsers,
  adminLeaves,
  adminPending,
  adminUpdateLeave,
} = require("../controllers/adminController");

const router = express.Router();

router.use(attachUserFromRequest);
router.use(authorizeRoles("admin"));

router.get("/dashboard", adminDashboard);
router.get("/users", adminUsers);
router.get("/leaves", adminLeaves);
router.get("/pending", adminPending);
router.put("/leave/:id", adminUpdateLeave);

module.exports = router;

