/**
 * Lightweight leave-approval prediction engine.
 * No ML libraries — pure rule-based scoring.
 *
 * @param {Object} data
 * @param {number}  data.attendance      - Student attendance percentage (0-100)
 * @param {string}  data.leaveType       - "medical" | "emergency" | "personal" | …
 * @param {number}  data.duration        - Requested leave duration in days
 * @param {number}  data.pastLeaves      - Total past leave count
 * @param {number}  data.pastRejections  - Total past rejected leave count
 *
 * @returns {{
 *   predictionScore: number,
 *   decision: string,
 *   reason: string,
 *   riskLevel: string,
 *   riskColor: string
 * }}
 */
function predictApproval({ attendance, leaveType, duration, pastLeaves, pastRejections }) {
  let score = 0;
  const factors = []; // tracks dominant factors for the reason string

  // ── Attendance ──────────────────────────────────────────────
  const att = Number(attendance) || 0;
  if (att > 85) {
    score += 40;
    factors.push("strong attendance (" + att + "%)");
  } else if (att >= 70) {
    score += 25;
    factors.push("moderate attendance (" + att + "%)");
  } else {
    score += 10;
    factors.push("low attendance (" + att + "%)");
  }

  // ── Leave Type ─────────────────────────────────────────────
  const type = String(leaveType).toLowerCase().trim();
  if (type === "medical") {
    score += 30;
    factors.push("medical leave type");
  } else if (type === "emergency") {
    score += 20;
    factors.push("emergency leave type");
  } else {
    score += 10;
    factors.push(type + " leave type");
  }

  // ── Past Leaves ────────────────────────────────────────────
  const pl = Number(pastLeaves) || 0;
  if (pl < 5) {
    score += 20;
    factors.push("few past leaves (" + pl + ")");
  } else if (pl <= 10) {
    score += 10;
    factors.push("moderate past leaves (" + pl + ")");
  } else {
    score -= 20;
    factors.push("excessive past leaves (" + pl + ")");
  }

  // ── Past Rejections ────────────────────────────────────────
  const pr = Number(pastRejections) || 0;
  if (pr > 2) {
    score -= 30;
    factors.push("high past rejections (" + pr + ")");
  }

  // ── Duration ───────────────────────────────────────────────
  const dur = Number(duration) || 1;
  if (dur <= 2) {
    score += 10;
    factors.push("short duration (" + dur + " day" + (dur === 1 ? "" : "s") + ")");
  } else if (dur > 5) {
    score -= 10;
    factors.push("long duration (" + dur + " days)");
  }

  // ── Clamp to 0-100, then normalise to 0-1 ─────────────────
  const clamped = Math.max(0, Math.min(100, score));
  const predictionScore = Number((clamped / 100).toFixed(2));

  // ── Decision ───────────────────────────────────────────────
  let decision;
  if (predictionScore >= 0.7) {
    decision = "Likely Approved";
  } else if (predictionScore >= 0.4) {
    decision = "Borderline";
  } else {
    decision = "Likely Rejected";
  }

  // ── Risk Level & Color ─────────────────────────────────────
  let riskLevel, riskColor;
  if (predictionScore >= 0.7) {
    riskLevel = "Low";
    riskColor = "green";
  } else if (predictionScore >= 0.4) {
    riskLevel = "Medium";
    riskColor = "yellow";
  } else {
    riskLevel = "High";
    riskColor = "red";
  }

  // ── Dynamic Reason ─────────────────────────────────────────
  // Pick the top contributing / detracting factors to build a human-readable reason.
  const reason =
    decision === "Likely Approved"
      ? "Approval likely due to " + factors.slice(0, 3).join(", ") + "."
      : decision === "Likely Rejected"
        ? "Rejection likely due to " + factors.filter(f => /low|excessive|high|long/.test(f)).join(", ") + "."
        : "Borderline case — positive factors: " +
          factors.filter(f => /strong|medical|emergency|few|short/.test(f)).join(", ") +
          "; concerns: " +
          factors.filter(f => /low|excessive|high|long|moderate/.test(f)).join(", ") +
          ".";

  return { predictionScore, decision, reason, riskLevel, riskColor };
}

module.exports = predictApproval;
module.exports.predictApproval = predictApproval;
