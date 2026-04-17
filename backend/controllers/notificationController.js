const mongoose = require("mongoose");
const Notification = require("../models/Notification");

const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ message: "Valid x-user-id is required." });
    }
    if (!role) {
      return res.status(400).json({ message: "x-user-role is required." });
    }

    const notifications = await Notification.find({
      recipientUserId: userId,
      recipientRole: role,
    }).sort({ createdAt: -1 });

    return res.status(200).json(
      notifications.map((n) => ({
        id: n._id,
        title: n.title,
        message: n.message,
        type: n.type,
        leaveId: n.leaveId,
        read: n.isRead,
        timestamp: n.createdAt,
      }))
    );
  } catch (error) {
    return next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(String(id))) {
      return res.status(400).json({ message: "Invalid notification id." });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, recipientUserId: userId, recipientRole: role },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    return res.status(200).json({ message: "Notification marked as read." });
  } catch (error) {
    return next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    await Notification.updateMany(
      { recipientUserId: userId, recipientRole: role, isRead: false },
      { isRead: true }
    );

    return res.status(200).json({ message: "All notifications marked as read." });
  } catch (error) {
    return next(error);
  }
};

const clearRecentNotifications = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const role = req.user?.role;

    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ message: "Valid x-user-id is required." });
    }
    if (!role) {
      return res.status(400).json({ message: "x-user-role is required." });
    }

    // Delete notifications older than 24 hours or all read notifications
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await Notification.deleteMany({
      recipientUserId: userId,
      recipientRole: role,
      $or: [
        { isRead: true },
        { createdAt: { $lt: oneDayAgo } }
      ]
    });

    return res.status(200).json({ message: "Recent notifications cleared." });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  clearRecentNotifications,
};

