const express = require("express");
const {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
} = require("../controllers/leaveController");

const router = express.Router();

router.post("/apply", applyLeave);
router.get("/", getLeaves);
router.put("/:id", updateLeaveStatus);

module.exports = router;
