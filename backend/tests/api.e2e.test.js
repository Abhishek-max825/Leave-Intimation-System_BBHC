const request = require("supertest");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const app = require("../app");

const api = request(app);

let userId;
let leaveId;

beforeAll(async () => {
  if (!mongoose.connection.readyState) {
    await connectDB();
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Health check", () => {
  it("GET /api/health should return OK", async () => {
    const res = await api.get("/api/health").expect(200);
    expect(res.body).toMatchObject({
      status: "OK",
      message: "Server running",
    });
  });
});

describe("User flow", () => {
  it("POST /api/users/register should create a user", async () => {
    const payload = {
      name: "Test User",
      role: "student",
      department: "CSE",
    };

    const res = await api.post("/api/users/register").send(payload).expect(201);

    expect(res.body).toHaveProperty("userId");
    expect(res.body).toMatchObject({
      name: payload.name,
      role: payload.role,
      department: payload.department,
    });

    userId = res.body.userId;
  });

  it("POST /api/users/login should return user details", async () => {
    const res = await api.post("/api/users/login").send({ userId }).expect(200);

    expect(res.body).toMatchObject({
      userId,
      name: "Test User",
      role: "student",
      department: "CSE",
    });
  });
});

describe("Leave flow", () => {
  it("POST /api/leaves/apply should create a leave with prediction", async () => {
    const payload = {
      studentId: userId,
      attendance: 90,
      leaveType: "medical",
      duration: 2,
      reason: "Fever and rest",
    };

    const res = await api.post("/api/leaves/apply").send(payload).expect(201);

    expect(res.body).toHaveProperty("leaveId");
    expect(res.body).toMatchObject({
      studentId: userId,
      attendance: payload.attendance,
      leaveType: payload.leaveType,
      duration: payload.duration,
      status: "pending",
    });
    expect(typeof res.body.predictionScore).toBe("number");
    expect(typeof res.body.decision).toBe("string");
    expect(typeof res.body.reason).toBe("string");

    leaveId = res.body.leaveId;
  });

  it("PUT /api/leaves/:id should update status", async () => {
    const res = await api
      .put(`/api/leaves/${leaveId}`)
      .send({ status: "approved" })
      .expect(200);

    expect(res.body).toMatchObject({
      leaveId,
      status: "approved",
    });
  });

  it("GET /api/leaves should list leaves and support filters", async () => {
    const res = await api
      .get("/api/leaves")
      .query({ role: "student", status: "approved", leaveType: "medical" })
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    const first = res.body[0];
    expect(first).toHaveProperty("leaveId");
    expect(first).toHaveProperty("studentId");
    expect(first).toHaveProperty("status");
  });
}
);

