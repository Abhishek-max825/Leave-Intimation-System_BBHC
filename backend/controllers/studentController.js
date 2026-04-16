const Leave = require("../models/Leave");
const predictApproval = require("../services/predictionService");
const { predictionFromScore, calculateNewAttendance } = require("../utils/leaveMetrics");
const User = require("../models/User");
const { createNotification } = require("../services/notificationService");

const shapeLeave = (leave) => {
  const derived = predictionFromScore(leave.predictionScore);
  return {
    leaveId: leave._id,
    studentId: leave.studentId,
    applicantRole: leave.applicantRole,
    approverRole: leave.approverRole,
    facultyName: leave.facultyName,
    attendance: leave.attendance,
    leaveType: leave.leaveType,
    duration: leave.duration,
    status: leave.status,
    predictionScore: leave.predictionScore,
    decision: derived.decision,
    riskLevel: derived.riskLevel,
    newAttendance: calculateNewAttendance(leave.attendance, leave.duration),
    decisionReason: leave.decisionReason || "",
  };
};

const studentDashboard = async (req, res, next) => {
  try {
    const studentId = req.user.userId;
    const filter = { studentId, applicantRole: "student" };
    const total = await Leave.countDocuments(filter);
    const pending = await Leave.countDocuments({ ...filter, status: "pending" });
    const approved = await Leave.countDocuments({ ...filter, status: "approved" });
    const rejected = await Leave.countDocuments({ ...filter, status: "rejected" });

    const latest = await Leave.find(filter).sort({ createdAt: -1 }).limit(5);

    return res.status(200).json({
      studentId,
      stats: { total, pending, approved, rejected },
      recentLeaves: latest.map(shapeLeave),
    });
  } catch (error) {
    return next(error);
  }
};

const studentLeaves = async (req, res, next) => {
  try {
    const studentId = req.user.userId;
    const leaves = await Leave.find({ studentId, applicantRole: "student" }).sort({ createdAt: -1 });
    return res.status(200).json(leaves.map(shapeLeave));
  } catch (error) {
    return next(error);
  }
};

const studentApplyLeave = async (req, res, next) => {
  try {
    const studentId = req.user.userId;
    const { attendance, leaveType, duration, reason, facultyName } = req.body;

    if (attendance === undefined || !leaveType || !duration || !reason || !facultyName) {
      return res.status(400).json({ message: "attendance, leaveType, duration, reason and facultyName are required." });
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

    const normalizedFacultyName = String(facultyName || "").trim();
    const escapedFacultyName = normalizedFacultyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const facultyUser = await User.findOne({
      role: "faculty",
      name: { $regex: new RegExp(`^${escapedFacultyName}$`, "i") },
    }).select("_id name");

    if (!facultyUser?._id) {
      return res.status(400).json({ message: "Selected faculty account not found." });
    }

    const leave = await Leave.create({
      studentId,
      attendance,
      leaveType,
      duration,
      reason,
      facultyName: facultyUser.name,
      status: "pending",
      applicantRole: "student",
      approverRole: "faculty",
      predictionScore: prediction.predictionScore,
    });

    await createNotification({
      recipientUserId: facultyUser._id,
      recipientRole: "faculty",
      title: "New student leave request",
      message: `A student leave request is assigned to you (${leave.leaveType}, ${leave.duration} day(s)).`,
      type: "leave_request",
      leaveId: leave._id,
    });

    console.log("Notification: Leave applied/updated");

    return res.status(201).json({
      leaveId: leave._id,
      studentId: leave.studentId,
      attendance: leave.attendance,
      leaveType: leave.leaveType,
      duration: leave.duration,
      facultyName: leave.facultyName,
      status: leave.status,
      predictionScore: prediction.predictionScore,
      decision: prediction.decision,
      riskLevel: String(prediction.riskLevel || "").toUpperCase() || predictionFromScore(prediction.predictionScore).riskLevel,
      newAttendance: calculateNewAttendance(leave.attendance, leave.duration),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  studentDashboard,
  studentLeaves,
  studentApplyLeave,
};

