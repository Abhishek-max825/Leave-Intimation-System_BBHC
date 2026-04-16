const Notification = require("../models/Notification");

const createNotification = async ({ recipientUserId, recipientRole, title, message, type = "info", leaveId = null }) => {
  if (!recipientUserId || !recipientRole || !title || !message) return null;
  return Notification.create({
    recipientUserId,
    recipientRole,
    title,
    message,
    type,
    leaveId,
  });
};

module.exports = {
  createNotification,
};

