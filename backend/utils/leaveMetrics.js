const predictionFromScore = (predictionScore) => {
  const score = Number(predictionScore) || 0;
  let decision;
  if (score >= 0.7) decision = "Likely Approved";
  else if (score >= 0.4) decision = "Borderline";
  else decision = "Likely Rejected";

  let riskLevel;
  if (score >= 0.7) riskLevel = "LOW";
  else if (score >= 0.4) riskLevel = "MEDIUM";
  else riskLevel = "HIGH";

  return { decision, riskLevel };
};

const calculateNewAttendance = (attendance, duration) => {
  // Simple heuristic: each leave day reduces attendance by 1.5%
  const att = Number(attendance) || 0;
  const dur = Number(duration) || 0;
  const newAttendance = Math.max(0, Math.min(100, Number((att - dur * 1.5).toFixed(2))));
  return newAttendance;
};

module.exports = {
  predictionFromScore,
  calculateNewAttendance,
};

