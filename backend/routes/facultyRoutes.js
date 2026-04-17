const express = require("express");
const { attachUserFromRequest, authorizeRoles } = require("../middleware/authMiddleware");
const {
  facultyDashboard,
  facultyPending,
  facultyOwnLeaveSummary,
  facultyApplyLeave,
  facultyUpdateLeave,
} = require("../controllers/facultyController");

const router = express.Router();

router.use(attachUserFromRequest);
router.use(authorizeRoles("faculty"));

router.get("/dashboard", facultyDashboard);
router.get("/pending", facultyPending);
router.get("/my-leaves/summary", facultyOwnLeaveSummary);
router.post("/apply", facultyApplyLeave);
router.put("/leave/:id", facultyUpdateLeave);

module.exports = router;

