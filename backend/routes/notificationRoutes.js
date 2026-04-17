const express = require("express");
const { attachUserFromRequest, authorizeRoles } = require("../middleware/authMiddleware");
const { getNotifications, markAsRead, markAllAsRead, clearRecentNotifications } = require("../controllers/notificationController");

const router = express.Router();

router.use(attachUserFromRequest);
router.use(authorizeRoles("student", "faculty", "admin"));

router.get("/", getNotifications);
router.patch("/:id/read", markAsRead);
router.patch("/read-all", markAllAsRead);
router.delete("/clear-recent", clearRecentNotifications);

module.exports = router;

