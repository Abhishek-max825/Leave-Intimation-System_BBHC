const mongoose = require("mongoose");

const leaveSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendance: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    leaveType: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    decisionReason: {
      type: String,
      trim: true,
      default: "",
    },
    facultyName: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    applicantRole: {
      type: String,
      enum: ["student", "faculty", "admin"],
      default: "student",
      lowercase: true,
    },
    approverRole: {
      type: String,
      enum: ["faculty", "admin"],
      default: "faculty",
      lowercase: true,
    },
    predictionScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

module.exports = mongoose.model("Leave", leaveSchema);
