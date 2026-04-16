const predictApproval = ({ attendance, leaveType, pastLeavesCount }) => {
  let score = 0.5;

  if (attendance > 85) {
    score += 0.3;
  } else if (attendance >= 75) {
    score += 0.1;
  } else {
    score -= 0.15;
  }

  if (String(leaveType).toLowerCase() === "medical") {
    score += 0.15;
  }

  if (pastLeavesCount >= 5) {
    score -= 0.2;
  } else if (pastLeavesCount >= 3) {
    score -= 0.1;
  }

  const predictionScore = Math.max(0, Math.min(1, Number(score.toFixed(2))));
  return predictionScore;
};

module.exports = { predictApproval };
