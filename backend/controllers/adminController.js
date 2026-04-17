const User = require("../models/User");
const Leave = require("../models/Leave");
const { predictionFromScore, calculateNewAttendance } = require("../utils/leaveMetrics");
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

const adminDashboard = async (req, res, next) => {
  try {
    const [
      totalLeaves,
      approvedLeaves,
      pendingFacultyRequests,
      totalUsers,
      totalStudents,
      totalFaculty,
      totalAdmins,
      studentLeaves,
      facultyLeaves,
    ] = await Promise.all([
      Leave.countDocuments({}),
      Leave.countDocuments({ status: "approved" }),
      Leave.countDocuments({
        status: "pending",
        approverRole: "admin",
        applicantRole: "faculty",
      }),
      User.countDocuments({}),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      User.countDocuments({ role: "admin" }),
      Leave.countDocuments({ applicantRole: "student" }),
      Leave.countDocuments({ applicantRole: "faculty" }),
    ]);
    const approvalRate = totalLeaves === 0 ? 0 : Number(((approvedLeaves / totalLeaves) * 100).toFixed(2));

    return res.status(200).json({
      analytics: {
        totalUsers,
        totalStudents,
        totalFaculty,
        totalAdmins,
        totalLeaves,
        studentLeaves,
        facultyLeaves,
        approvalRate,
        pendingFacultyRequests,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const adminUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.status(200).json(
      users.map((u) => ({
        userId: u._id,
        loginUserId: u.loginUserId || String(u._id),
        name: u.name,
        role: u.role,
        department: u.department,
        createdAt: u.createdAt,
      }))
    );
  } catch (error) {
    return next(error);
  }
};

const adminLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({}).sort({ createdAt: -1 });
    return res.status(200).json(leaves.map(shapeLeave));
  } catch (error) {
    return next(error);
  }
};

const adminPending = async (req, res, next) => {
  try {
    const leaves = await Leave.find({
      status: "pending",
      approverRole: "admin",
      applicantRole: "faculty",
    }).sort({ createdAt: -1 });
    return res.status(200).json(leaves.map(shapeLeave));
  } catch (error) {
    return next(error);
  }
};

const adminUpdateLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const allowed = ["approved", "rejected"];
    if (!status || !allowed.includes(String(status).toLowerCase())) {
      return res.status(400).json({ message: "status must be approved or rejected." });
    }

    const leave = await Leave.findById(id);
    if (!leave) return res.status(404).json({ message: "Leave not found." });
    if (leave.approverRole !== "admin" || leave.applicantRole !== "faculty") {
      return res.status(403).json({ message: "Admin can only process faculty leave requests." });
    }

    leave.status = String(status).toLowerCase();
    leave.decisionReason = reason ? String(reason).trim() : "";
    await leave.save();

    if (leave.studentId) {
      const action = leave.status === "approved" ? "approved" : "rejected";
      const reasonText = leave.decisionReason ? ` Reason: ${leave.decisionReason}` : "";
      await createNotification({
        recipientUserId: leave.studentId,
        recipientRole: "faculty",
        title: `Leave ${action} by admin`,
        message: `Your leave request was ${action} by admin.${reasonText}`,
        type: "leave_status",
        leaveId: leave._id,
      });
    }

    console.log("Notification: Leave applied/updated");

    return res.status(200).json(shapeLeave(leave));
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  adminDashboard,
  adminUsers,
  adminLeaves,
  adminPending,
  adminUpdateLeave,
};

