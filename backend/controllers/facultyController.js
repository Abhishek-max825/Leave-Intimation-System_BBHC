const Leave = require("../models/Leave");
const predictApproval = require("../services/predictionService");
const { predictionFromScore, calculateNewAttendance } = require("../utils/leaveMetrics");
const User = require("../models/User");
const { createNotification } = require("../services/notificationService");

const resolveFacultyName = async (req) => {
  if (req.user?.name) return String(req.user.name);
  if (req.user?.userId) {
    const user = await User.findById(req.user.userId).select("name");
    if (user?.name) return String(user.name);
  }
  return null;
};

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

const facultyDashboard = async (req, res, next) => {
  try {
    const facultyName = await resolveFacultyName(req);
    const scope = { approverRole: "faculty", applicantRole: "student" };
    if (facultyName) scope.facultyName = facultyName;
    const pending = await Leave.countDocuments({ ...scope, status: "pending" });
    const approved = await Leave.countDocuments({ ...scope, status: "approved" });
    const rejected = await Leave.countDocuments({ ...scope, status: "rejected" });

    return res.status(200).json({
      stats: { pending, approved, rejected },
      facultyName: facultyName || null,
      message: "Faculty dashboard",
    });
  } catch (error) {
    return next(error);
  }
};

const facultyPending = async (req, res, next) => {
  try {
    const facultyName = await resolveFacultyName(req);
    const filter = {
      status: "pending",
      approverRole: "faculty",
      applicantRole: "student",
    };
    if (facultyName) filter.facultyName = facultyName;
    const leaves = await Leave.find(filter).sort({ createdAt: -1 });
    return res.status(200).json(leaves.map(shapeLeave));
  } catch (error) {
    return next(error);
  }
};

const facultyOwnLeaveSummary = async (req, res, next) => {
  try {
    const facultyId = req.user?.userId || req.header("x-user-id");
    if (!facultyId) {
      return res.status(400).json({ message: "x-user-id is required." });
    }

    const scope = { studentId: facultyId, applicantRole: "faculty" };
    const [total, pending, approved, rejected] = await Promise.all([
      Leave.countDocuments(scope),
      Leave.countDocuments({ ...scope, status: "pending" }),
      Leave.countDocuments({ ...scope, status: "approved" }),
      Leave.countDocuments({ ...scope, status: "rejected" }),
    ]);

    return res.status(200).json({ total, pending, approved, rejected });
  } catch (error) {
    return next(error);
  }
};

const facultyApplyLeave = async (req, res, next) => {
  try {
    const facultyId = req.user?.userId || req.header("x-user-id");
    const { attendance, leaveType, duration, reason } = req.body;
    const facultyName = await resolveFacultyName(req);

    if (!facultyId) {
      return res.status(400).json({ message: "x-user-id is required for faculty leave apply." });
    }

    if (attendance === undefined || !leaveType || !duration || !reason || !facultyName) {
      return res.status(400).json({ message: "attendance, leaveType, duration and reason are required with valid faculty identity." });
    }

    const pastLeaves = await Leave.countDocuments({ studentId: facultyId, applicantRole: "faculty" });
    const pastRejections = await Leave.countDocuments({
      studentId: facultyId,
      applicantRole: "faculty",
      status: "rejected",
    });

    const prediction = predictApproval({
      attendance: Number(attendance),
      leaveType,
      duration: Number(duration),
      pastLeaves,
      pastRejections,
    });

    const leave = await Leave.create({
      studentId: facultyId,
      attendance,
      leaveType,
      duration,
      reason,
      facultyName,
      status: "pending",
      applicantRole: "faculty",
      approverRole: "admin",
      predictionScore: prediction.predictionScore,
    });

    const adminUsers = await User.find({ role: "admin" }).select("_id");
    if (adminUsers.length > 0) {
      await Promise.all(
        adminUsers.map((adminUser) =>
          createNotification({
            recipientUserId: adminUser._id,
            recipientRole: "admin",
            title: "New faculty leave request",
            message: `${facultyName} submitted a leave request (${leave.leaveType}, ${leave.duration} day(s)).`,
            type: "leave_request",
            leaveId: leave._id,
          })
        )
      );
    }

    console.log("Notification: Leave applied/updated");

    return res.status(201).json({
      ...shapeLeave(leave),
      decision: prediction.decision,
      riskLevel: String(prediction.riskLevel || "").toUpperCase() || predictionFromScore(prediction.predictionScore).riskLevel,
      newAttendance: calculateNewAttendance(leave.attendance, leave.duration),
    });
  } catch (error) {
    return next(error);
  }
};

const facultyUpdateLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    const allowed = ["approved", "rejected"];
    if (!status || !allowed.includes(String(status).toLowerCase())) {
      return res.status(400).json({ message: "status must be approved or rejected." });
    }

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found." });
    }
    if (leave.approverRole !== "faculty" || leave.applicantRole !== "student") {
      return res.status(403).json({ message: "Faculty can only process student leave requests." });
    }

    const derived = predictionFromScore(leave.predictionScore);
    const suggestion = derived.decision === "Likely Approved" ? "approved" : "rejected";

    leave.status = String(status).toLowerCase();
    leave.decisionReason = reason ? String(reason).trim() : "";
    await leave.save();

    if (leave.studentId) {
      const action = leave.status === "approved" ? "approved" : "rejected";
      const reasonText = leave.decisionReason ? ` Reason: ${leave.decisionReason}` : "";
      await createNotification({
        recipientUserId: leave.studentId,
        recipientRole: "student",
        title: `Leave ${action} by faculty`,
        message: `Your leave request was ${action} by faculty.${reasonText}`,
        type: "leave_status",
        leaveId: leave._id,
      });
    }

    console.log("Notification: Leave applied/updated");

    return res.status(200).json({
      ...shapeLeave(leave),
      suggestion,
    });
  } catch (error) {
    return next(error);
  }
};

const facultyForwardToAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const facultyName = await resolveFacultyName(req);

    const leave = await Leave.findById(id);
    if (!leave) {
      return res.status(404).json({ message: "Leave not found." });
    }

    // Only allow forwarding if it's a student leave pending with faculty
    if (leave.approverRole !== "faculty" || leave.applicantRole !== "student") {
      return res.status(403).json({ message: "Faculty can only forward student leave requests." });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({ message: "Can only forward pending leave requests." });
    }

    // Update leave to be forwarded to admin
    leave.approverRole = "admin";
    leave.decisionReason = reason ? String(reason).trim() : "Forwarded to admin for review";
    await leave.save();

    // Notify admin users
    const adminUsers = await User.find({ role: "admin" }).select("_id");
    if (adminUsers.length > 0) {
      await Promise.all(
        adminUsers.map((adminUser) =>
          createNotification({
            recipientUserId: adminUser._id,
            recipientRole: "admin",
            title: "Leave forwarded by faculty",
            message: `${facultyName || "Faculty"} forwarded a student leave request (${leave.leaveType}, ${leave.duration} day(s)) for your review.`,
            type: "leave_request",
            leaveId: leave._id,
          })
        )
      );
    }

    // Notify student
    if (leave.studentId) {
      await createNotification({
        recipientUserId: leave.studentId,
        recipientRole: "student",
        title: "Leave forwarded to admin",
        message: `Your leave request has been forwarded to admin by ${facultyName || "faculty"} for further review.`,
        type: "leave_status",
        leaveId: leave._id,
      });
    }

    console.log("Notification: Leave forwarded to admin");

    return res.status(200).json({
      ...shapeLeave(leave),
      message: "Leave forwarded to admin successfully",
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  facultyDashboard,
  facultyPending,
  facultyOwnLeaveSummary,
  facultyApplyLeave,
  facultyUpdateLeave,
  facultyForwardToAdmin,
};

