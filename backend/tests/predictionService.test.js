/**
 * Comprehensive test suite for predictionService.js
 * Run: node tests/predictionService.test.js
 */

const predictApproval = require("../services/predictionService");

let passed = 0;
let failed = 0;

function assert(condition, testName, actual, expected) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL: ${testName}`);
    console.log(`     Expected: ${JSON.stringify(expected)}`);
    console.log(`     Actual:   ${JSON.stringify(actual)}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${"═".repeat(60)}`);
}

// ─────────────────────────────────────────────────────────────
// 1. OUTPUT SHAPE
// ─────────────────────────────────────────────────────────────
section("1. Output Shape & Types");

const sample = predictApproval({
  attendance: 80, leaveType: "medical", duration: 2, pastLeaves: 3, pastRejections: 0,
});

assert(typeof sample === "object", "Returns an object", typeof sample, "object");
assert("predictionScore" in sample, "Has predictionScore", Object.keys(sample), "predictionScore");
assert("decision" in sample, "Has decision", Object.keys(sample), "decision");
assert("reason" in sample, "Has reason", Object.keys(sample), "reason");
assert("riskLevel" in sample, "Has riskLevel", Object.keys(sample), "riskLevel");
assert("riskColor" in sample, "Has riskColor", Object.keys(sample), "riskColor");
assert(typeof sample.predictionScore === "number", "predictionScore is number", typeof sample.predictionScore, "number");
assert(typeof sample.decision === "string", "decision is string", typeof sample.decision, "string");
assert(typeof sample.reason === "string", "reason is string", typeof sample.reason, "string");

// ─────────────────────────────────────────────────────────────
// 2. SCORE CLAMPING (0-1)
// ─────────────────────────────────────────────────────────────
section("2. Score Clamping (0 to 1)");

const bestCase = predictApproval({
  attendance: 100, leaveType: "medical", duration: 1, pastLeaves: 0, pastRejections: 0,
});
assert(bestCase.predictionScore <= 1, "Max score clamped to 1", bestCase.predictionScore, "<=1");
assert(bestCase.predictionScore >= 0, "Max score >= 0", bestCase.predictionScore, ">=0");

const worstCase = predictApproval({
  attendance: 10, leaveType: "personal", duration: 10, pastLeaves: 20, pastRejections: 5,
});
assert(worstCase.predictionScore >= 0, "Min score clamped to 0", worstCase.predictionScore, ">=0");
assert(worstCase.predictionScore <= 1, "Min score <= 1", worstCase.predictionScore, "<=1");

// ─────────────────────────────────────────────────────────────
// 3. ATTENDANCE SCORING
// ─────────────────────────────────────────────────────────────
section("3. Attendance Scoring Rules");

const base = { leaveType: "personal", duration: 3, pastLeaves: 6, pastRejections: 0 };

const highAtt = predictApproval({ ...base, attendance: 90 });   // +40
const midAtt  = predictApproval({ ...base, attendance: 78 });   // +25
const lowAtt  = predictApproval({ ...base, attendance: 60 });   // +10

assert(highAtt.predictionScore > midAtt.predictionScore, "Attendance >85 scores higher than 70-85", 
  { high: highAtt.predictionScore, mid: midAtt.predictionScore }, "high > mid");
assert(midAtt.predictionScore > lowAtt.predictionScore, "Attendance 70-85 scores higher than <70",
  { mid: midAtt.predictionScore, low: lowAtt.predictionScore }, "mid > low");

// Verify exact deltas: high - mid should be 15 points (40-25 = 15 → 0.15)
assert(
  Math.abs((highAtt.predictionScore - midAtt.predictionScore) - 0.15) < 0.01,
  "Attendance >85 vs 70-85 difference is +15 pts",
  highAtt.predictionScore - midAtt.predictionScore, 0.15
);

// ─────────────────────────────────────────────────────────────
// 4. LEAVE TYPE SCORING
// ─────────────────────────────────────────────────────────────
section("4. Leave Type Scoring Rules");

const typeBase = { attendance: 80, duration: 3, pastLeaves: 6, pastRejections: 0 };

const medical   = predictApproval({ ...typeBase, leaveType: "medical" });    // +30
const emergency = predictApproval({ ...typeBase, leaveType: "emergency" });  // +20
const personal  = predictApproval({ ...typeBase, leaveType: "personal" });   // +10

assert(medical.predictionScore > emergency.predictionScore, "Medical > Emergency",
  { medical: medical.predictionScore, emergency: emergency.predictionScore }, "medical > emergency");
assert(emergency.predictionScore > personal.predictionScore, "Emergency > Personal",
  { emergency: emergency.predictionScore, personal: personal.predictionScore }, "emergency > personal");

// Verify exact deltas
assert(
  Math.abs((medical.predictionScore - emergency.predictionScore) - 0.10) < 0.01,
  "Medical vs Emergency difference is +10 pts",
  medical.predictionScore - emergency.predictionScore, 0.10
);
assert(
  Math.abs((emergency.predictionScore - personal.predictionScore) - 0.10) < 0.01,
  "Emergency vs Personal difference is +10 pts",
  emergency.predictionScore - personal.predictionScore, 0.10
);

// Case insensitivity
const medUpper = predictApproval({ ...typeBase, leaveType: "MEDICAL" });
assert(medUpper.predictionScore === medical.predictionScore, "Leave type is case-insensitive",
  medUpper.predictionScore, medical.predictionScore);

// ─────────────────────────────────────────────────────────────
// 5. PAST LEAVES SCORING
// ─────────────────────────────────────────────────────────────
section("5. Past Leaves Scoring Rules");

const plBase = { attendance: 80, leaveType: "personal", duration: 3, pastRejections: 0 };

const fewLeaves  = predictApproval({ ...plBase, pastLeaves: 3 });   // +20
const midLeaves  = predictApproval({ ...plBase, pastLeaves: 7 });   // +10
const manyLeaves = predictApproval({ ...plBase, pastLeaves: 12 });  // -20

assert(fewLeaves.predictionScore > midLeaves.predictionScore, "pastLeaves <5 scores higher than 5-10",
  { few: fewLeaves.predictionScore, mid: midLeaves.predictionScore }, "few > mid");
assert(midLeaves.predictionScore > manyLeaves.predictionScore, "pastLeaves 5-10 scores higher than >10",
  { mid: midLeaves.predictionScore, many: manyLeaves.predictionScore }, "mid > many");

// ─────────────────────────────────────────────────────────────
// 6. PAST REJECTIONS SCORING
// ─────────────────────────────────────────────────────────────
section("6. Past Rejections Scoring Rules");

const prBase = { attendance: 80, leaveType: "personal", duration: 3, pastLeaves: 3 };

const noRej  = predictApproval({ ...prBase, pastRejections: 0 });
const someRej = predictApproval({ ...prBase, pastRejections: 2 });
const manyRej = predictApproval({ ...prBase, pastRejections: 4 });  // -30

assert(noRej.predictionScore === someRej.predictionScore, "pastRejections ≤2 has no penalty",
  { noRej: noRej.predictionScore, someRej: someRej.predictionScore }, "equal");
assert(noRej.predictionScore > manyRej.predictionScore, "pastRejections >2 applies -30 penalty",
  { noRej: noRej.predictionScore, manyRej: manyRej.predictionScore }, "noRej > manyRej");
assert(
  Math.abs((noRej.predictionScore - manyRej.predictionScore) - 0.30) < 0.01,
  "Rejection penalty is exactly 30 pts",
  noRej.predictionScore - manyRej.predictionScore, 0.30
);

// ─────────────────────────────────────────────────────────────
// 7. DURATION SCORING
// ─────────────────────────────────────────────────────────────
section("7. Duration Scoring Rules");

const durBase = { attendance: 80, leaveType: "personal", pastLeaves: 3, pastRejections: 0 };

const shortDur = predictApproval({ ...durBase, duration: 1 });   // +10
const midDur   = predictApproval({ ...durBase, duration: 4 });   // 0
const longDur  = predictApproval({ ...durBase, duration: 7 });   // -10

assert(shortDur.predictionScore > midDur.predictionScore, "Duration ≤2 gets +10 bonus",
  { short: shortDur.predictionScore, mid: midDur.predictionScore }, "short > mid");
assert(midDur.predictionScore > longDur.predictionScore, "Duration >5 gets -10 penalty",
  { mid: midDur.predictionScore, long: longDur.predictionScore }, "mid > long");
assert(
  Math.abs((shortDur.predictionScore - longDur.predictionScore) - 0.20) < 0.01,
  "Short vs Long duration difference is 20 pts",
  shortDur.predictionScore - longDur.predictionScore, 0.20
);

// ─────────────────────────────────────────────────────────────
// 8. DECISION THRESHOLDS
// ─────────────────────────────────────────────────────────────
section("8. Decision Thresholds");

// Likely Approved: score >= 0.7
const approved = predictApproval({
  attendance: 90, leaveType: "medical", duration: 1, pastLeaves: 2, pastRejections: 0,
});
assert(approved.decision === "Likely Approved", "High score → Likely Approved",
  approved.decision, "Likely Approved");
assert(approved.predictionScore >= 0.7, "Approved score >= 0.7",
  approved.predictionScore, ">=0.7");

// Likely Rejected: score < 0.4
const rejected = predictApproval({
  attendance: 50, leaveType: "personal", duration: 8, pastLeaves: 15, pastRejections: 5,
});
assert(rejected.decision === "Likely Rejected", "Low score → Likely Rejected",
  rejected.decision, "Likely Rejected");
assert(rejected.predictionScore < 0.4, "Rejected score < 0.4",
  rejected.predictionScore, "<0.4");

// Borderline: 0.4 ≤ score < 0.7
const borderline = predictApproval({
  attendance: 78, leaveType: "emergency", duration: 3, pastLeaves: 6, pastRejections: 1,
});
assert(borderline.decision === "Borderline", "Mid score → Borderline",
  borderline.decision, "Borderline");
assert(borderline.predictionScore >= 0.4 && borderline.predictionScore < 0.7, "Borderline score in [0.4, 0.7)",
  borderline.predictionScore, "[0.4, 0.7)");

// ─────────────────────────────────────────────────────────────
// 9. RISK LEVEL & COLOR
// ─────────────────────────────────────────────────────────────
section("9. Risk Level & Color Mapping");

assert(approved.riskLevel === "Low", "High score → Low risk", approved.riskLevel, "Low");
assert(approved.riskColor === "green", "High score → green", approved.riskColor, "green");

assert(borderline.riskLevel === "Medium", "Mid score → Medium risk", borderline.riskLevel, "Medium");
assert(borderline.riskColor === "yellow", "Mid score → yellow", borderline.riskColor, "yellow");

assert(rejected.riskLevel === "High", "Low score → High risk", rejected.riskLevel, "High");
assert(rejected.riskColor === "red", "Low score → red", rejected.riskColor, "red");

// ─────────────────────────────────────────────────────────────
// 10. DYNAMIC REASON (references actual input factors)
// ─────────────────────────────────────────────────────────────
section("10. Dynamic Reason Strings");

assert(approved.reason.includes("90%"), "Reason includes attendance value",
  approved.reason, "contains 90%");
assert(approved.reason.includes("medical"), "Reason includes leave type",
  approved.reason, "contains medical");
assert(rejected.reason.includes("50%"), "Rejected reason includes attendance",
  rejected.reason, "contains 50%");
assert(rejected.reason.includes("15"), "Rejected reason includes past leaves count",
  rejected.reason, "contains 15");
assert(rejected.reason.length > 20, "Reason is a meaningful sentence",
  rejected.reason.length, ">20");

// ─────────────────────────────────────────────────────────────
// 11. EDGE CASES
// ─────────────────────────────────────────────────────────────
section("11. Edge Cases");

// Boundary: attendance exactly 85 (should be 70-85 bracket)
const att85 = predictApproval({ attendance: 85, leaveType: "personal", duration: 3, pastLeaves: 6, pastRejections: 0 });
const att86 = predictApproval({ attendance: 86, leaveType: "personal", duration: 3, pastLeaves: 6, pastRejections: 0 });
assert(att86.predictionScore > att85.predictionScore, "85 is in 70-85 bracket, 86 is in >85 bracket",
  { att85: att85.predictionScore, att86: att86.predictionScore }, "86 > 85");

// Boundary: attendance exactly 70 (should be 70-85 bracket)
const att70 = predictApproval({ attendance: 70, leaveType: "personal", duration: 3, pastLeaves: 6, pastRejections: 0 });
const att69 = predictApproval({ attendance: 69, leaveType: "personal", duration: 3, pastLeaves: 6, pastRejections: 0 });
assert(att70.predictionScore > att69.predictionScore, "70 is in 70-85 bracket, 69 is in <70 bracket",
  { att70: att70.predictionScore, att69: att69.predictionScore }, "70 > 69");

// Boundary: pastLeaves exactly 5 (should be 5-10 bracket)
const pl5 = predictApproval({ attendance: 80, leaveType: "personal", duration: 3, pastLeaves: 5, pastRejections: 0 });
const pl4 = predictApproval({ attendance: 80, leaveType: "personal", duration: 3, pastLeaves: 4, pastRejections: 0 });
assert(pl4.predictionScore > pl5.predictionScore, "pastLeaves 4 (<5 bracket) > pastLeaves 5 (5-10 bracket)",
  { pl4: pl4.predictionScore, pl5: pl5.predictionScore }, "4 > 5");

// Boundary: duration exactly 2 (should get +10)
const dur2 = predictApproval({ attendance: 80, leaveType: "personal", pastLeaves: 3, pastRejections: 0, duration: 2 });
const dur3 = predictApproval({ attendance: 80, leaveType: "personal", pastLeaves: 3, pastRejections: 0, duration: 3 });
assert(dur2.predictionScore > dur3.predictionScore, "Duration 2 (≤2 bracket) > Duration 3 (neutral)",
  { dur2: dur2.predictionScore, dur3: dur3.predictionScore }, "2 > 3");

// Missing/undefined inputs gracefully handled
const missingInputs = predictApproval({});
assert(typeof missingInputs.predictionScore === "number", "Handles missing inputs without crashing",
  typeof missingInputs.predictionScore, "number");
assert(missingInputs.predictionScore >= 0 && missingInputs.predictionScore <= 1, "Missing inputs still clamps properly",
  missingInputs.predictionScore, "[0,1]");

// ─────────────────────────────────────────────────────────────
// 12. EXPORT FORMAT
// ─────────────────────────────────────────────────────────────
section("12. Export Format");

const mod = require("../services/predictionService");
assert(typeof mod === "function", "Default export is a function", typeof mod, "function");
assert(typeof mod.predictApproval === "function", "Named export predictApproval exists", typeof mod.predictApproval, "function");

// ─────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────
console.log(`\n${"═".repeat(60)}`);
console.log(`  TEST SUMMARY`);
console.log(`${"═".repeat(60)}`);
console.log(`  Total:  ${passed + failed}`);
console.log(`  Passed: ${passed} ✅`);
console.log(`  Failed: ${failed} ❌`);
console.log(`${"═".repeat(60)}\n`);

process.exit(failed > 0 ? 1 : 0);
