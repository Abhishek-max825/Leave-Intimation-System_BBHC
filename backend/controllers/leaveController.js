const mongoose = require("mongoose");
const Leave = require("../models/Leave");
const User = require("../models/User");
const predictApproval = require("../services/predictionService");

const formatLeaveResponse = (leave) => ({
  leaveId: leave._id,
  studentId: leave.studentId?._id || leave.studentId,
  attendance: leave.attendance,
  leaveType: leave.leaveType,
  duration: leave.duration,
  status: leave.status,
  predictionScore: leave.predictionScore,
});

const applyLeave = async (req, res, next) => {
  try {
    const { studentId, attendance, leaveType, duration, reason } = req.body;

    if (!studentId || attendance === undefined || !leaveType || !duration || !reason) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({ message: "Invalid studentId." });
    }

    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const pastLeaves = await Leave.countDocuments({ studentId });
    const pastRejections = await Leave.countDocuments({ studentId, status: "rejected" });

    const prediction = predictApproval({
      attendance: Number(attendance),
      leaveType,
      duration: Number(duration),
      pastLeaves,
      pastRejections,
    });

    const leave = await Leave.create({
      studentId,
      attendance,
      leaveType,
      duration,
      reason,
      status: "pending",
      predictionScore: prediction.predictionScore,
    });

    console.log("Notification: Leave applied");

    return res.status(201).json({
      ...formatLeaveResponse(leave),
      predictionScore: prediction.predictionScore,
      decision: prediction.decision,
      reason: prediction.reason,
    });
  } catch (error) {
    return next(error);
  }
};

const getLeaves = async (req, res, next) => {
  try {
    const {
      role,
      status,
      studentId,
      leaveType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const leaveFilter = {};

    if (status) {
      leaveFilter.status = status;
    }

    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return res.status(400).json({ message: "Invalid studentId." });
      }
      leaveFilter.studentId = studentId;
    }

    if (role) {
      const users = await User.find({ role: String(role).toLowerCase() }).select("_id");
      leaveFilter.studentId = { $in: users.map((user) => user._id) };
    }

    if (leaveType) {
      leaveFilter.leaveType = String(leaveType).toLowerCase();
    }

    if (startDate || endDate) {
      leaveFilter.createdAt = {};
      if (startDate) {
        leaveFilter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        leaveFilter.createdAt.$lte = new Date(endDate);
      }
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (pageNumber - 1) * pageSize;

    const leaves = await Leave.find(leaveFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    return res.status(200).json(leaves.map(formatLeaveResponse));
  } catch (error) {
    return next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid leave id." });
    }

    const allowedStatuses = ["approved", "rejected"];
    if (!status || !allowedStatuses.includes(String(status).toLowerCase())) {
      return res.status(400).json({ message: "Status must be approved or rejected." });
    }

    const leave = await Leave.findByIdAndUpdate(
      id,
      { status: String(status).toLowerCase() },
      { new: true, runValidators: true }
    );

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found." });
    }

    console.log("Notification: Leave updated");

    return res.status(200).json(formatLeaveResponse(leave));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  applyLeave,
  getLeaves,
  updateLeaveStatus,
};
