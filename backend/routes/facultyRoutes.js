const express = require("express");
const { attachUserFromRequest, authorizeRoles } = require("../middleware/authMiddleware");
const {
  facultyDashboard,
  facultyPending,
  facultyApplyLeave,
  facultyUpdateLeave,
} = require("../controllers/facultyController");

const router = express.Router();

router.use(attachUserFromRequest);
router.use(authorizeRoles("faculty"));

router.get("/dashboard", facultyDashboard);
router.get("/pending", facultyPending);
router.post("/apply", facultyApplyLeave);
router.put("/leave/:id", facultyUpdateLeave);

module.exports = router;

