const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const DEFAULT_FACULTY_USERS = [
  { name: "Pranam", role: "faculty", department: "Department of Computer Application" },
  { name: "Megha", role: "faculty", department: "Department of Commerce" },
  { name: "Harish Kanchan", role: "faculty", department: "Department of Computer Application" },
  { name: "JayaSheela", role: "faculty", department: "Department of Commerce" },
  { name: "Wilma", role: "faculty", department: "Department of Computer Application" },
];
const DEFAULT_ADMIN_USER = {
  _id: process.env.DEFAULT_ADMIN_USER_ID || "64b000000000000000000001",
  loginUserId: process.env.DEFAULT_ADMIN_LOGIN_ID || "172544",
  name: process.env.DEFAULT_ADMIN_NAME || "Default Admin",
  role: "admin",
  department: process.env.DEFAULT_ADMIN_DEPARTMENT || "Administration",
};
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD || "admin 123";

const normalizeDepartment = (department, customDepartment) => {
  if (String(department).toLowerCase() !== "other") return department;
  return customDepartment || "";
};

const registerUser = async (req, res, next) => {
  try {
    const { name, role, department, customDepartment, password, loginUserId } = req.body;
    const resolvedDepartment = normalizeDepartment(department, customDepartment).trim();
    const normalizedLoginUserId = String(loginUserId || "").trim();

    if (!name || !role || !department || !password || !normalizedLoginUserId) {
      return res.status(400).json({ message: "name, role, department, loginUserId and password are required." });
    }
    if (!resolvedDepartment) {
      return res.status(400).json({ message: "Please provide a valid department." });
    }
    if (String(password).length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters." });
    }
    if (normalizedLoginUserId.length < 4) {
      return res.status(400).json({ message: "Custom userId must be at least 4 characters." });
    }

    const normalizedRole = String(role).toLowerCase();
    const existingUser = await User.findOne({
      name: String(name).trim(),
      role: normalizedRole,
      department: resolvedDepartment,
    });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists for this role and department." });
    }
    const existingLoginId = await User.findOne({ loginUserId: normalizedLoginUserId });
    if (existingLoginId) {
      return res.status(409).json({ message: "Custom userId already exists. Please choose another." });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name,
      role: normalizedRole,
      department: resolvedDepartment,
      loginUserId: normalizedLoginUserId,
      password: hashedPassword,
    });

    return res.status(201).json({
      userId: user._id,
      loginUserId: user.loginUserId || String(user._id),
      name: user.name,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res.status(400).json({ message: "userId and password are required." });
    }

    const normalizedUserId = String(userId).trim();
    const normalizedPassword = String(password);

    // Support a fixed admin login id/password pair even though Mongo _id is ObjectId.
    if (
      normalizedUserId === String(DEFAULT_ADMIN_USER.loginUserId) &&
      normalizedPassword === String(DEFAULT_ADMIN_PASSWORD)
    ) {
      const fixedAdminId = String(DEFAULT_ADMIN_USER._id);
      let admin = mongoose.Types.ObjectId.isValid(fixedAdminId)
        ? await User.findById(fixedAdminId).select("+password")
        : null;

      const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
      if (!admin) {
        admin = await User.create({
          _id: fixedAdminId,
          loginUserId: String(DEFAULT_ADMIN_USER.loginUserId),
          name: DEFAULT_ADMIN_USER.name,
          role: DEFAULT_ADMIN_USER.role,
          department: DEFAULT_ADMIN_USER.department,
          password: hashedPassword,
        });
      } else {
        admin.loginUserId = String(DEFAULT_ADMIN_USER.loginUserId);
        admin.name = DEFAULT_ADMIN_USER.name;
        admin.role = DEFAULT_ADMIN_USER.role;
        admin.department = DEFAULT_ADMIN_USER.department;
        admin.password = hashedPassword;
        await admin.save();
      }

      return res.status(200).json({
        userId: admin._id,
        loginUserId: DEFAULT_ADMIN_USER.loginUserId,
        name: admin.name,
        role: admin.role,
        department: admin.department,
      });
    }

    let user = await User.findOne({ loginUserId: normalizedUserId }).select("+password");
    if (!user && mongoose.Types.ObjectId.isValid(normalizedUserId)) {
      user = await User.findById(normalizedUserId).select("+password");
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const isMatch = await bcrypt.compare(normalizedPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.status(200).json({
      userId: user._id,
      loginUserId: user.loginUserId || String(user._id),
      name: user.name,
      role: user.role,
      department: user.department,
    });
  } catch (error) {
    return next(error);
  }
};

const getMyProfile = async (req, res, next) => {
  try {
    const userId = req.header("x-user-id") || req.query.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(400).json({ message: "Valid x-user-id is required." });
    }

    const user = await User.findById(String(userId)).select("_id loginUserId name role department createdAt updatedAt");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.status(200).json({
      userId: user._id,
      loginUserId: user.loginUserId || String(user._id),
      name: user.name,
      role: user.role,
      department: user.department,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (error) {
    return next(error);
  }
};

const listFacultyUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: "faculty" }).sort({ name: 1 });
    return res.status(200).json(
      users.map((u) => ({
        userId: u._id,
        loginUserId: u.loginUserId || String(u._id),
        name: u.name,
        role: u.role,
        department: u.department,
      }))
    );
  } catch (error) {
    return next(error);
  }
};

const bootstrapFacultyUsers = async (req, res, next) => {
  try {
    const defaultPassword = process.env.DEFAULT_FACULTY_PASSWORD || "faculty123";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const existing = await User.find({ role: "faculty" }).select("name");
    const existingNames = new Set(existing.map((u) => String(u.name).toLowerCase()));

    const toCreate = DEFAULT_FACULTY_USERS.filter((u) => !existingNames.has(u.name.toLowerCase()));
    let created = [];
    if (toCreate.length > 0) {
      created = await User.insertMany(
        toCreate.map((u) => ({
          ...u,
          loginUserId: u.name.toLowerCase().replace(/\s+/g, "."),
          password: hashedPassword,
        }))
      );
    }

    const allFaculty = await User.find({ role: "faculty" }).sort({ name: 1 });

    return res.status(200).json({
      createdCount: created.length,
      defaultPassword: created.length > 0 ? defaultPassword : undefined,
      users: allFaculty.map((u) => ({
        userId: u._id,
        loginUserId: u.loginUserId || String(u._id),
        name: u.name,
        role: u.role,
        department: u.department,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const bootstrapAdminUser = async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

    const fixedAdminId = String(DEFAULT_ADMIN_USER._id);
    let admin = mongoose.Types.ObjectId.isValid(fixedAdminId)
      ? await User.findById(fixedAdminId)
      : null;

    if (!admin) {
      admin = await User.create({
        ...DEFAULT_ADMIN_USER,
        loginUserId: String(DEFAULT_ADMIN_USER.loginUserId),
        password: hashedPassword,
      });
    } else {
      admin.loginUserId = String(DEFAULT_ADMIN_USER.loginUserId);
      admin.name = DEFAULT_ADMIN_USER.name;
      admin.role = DEFAULT_ADMIN_USER.role;
      admin.department = DEFAULT_ADMIN_USER.department;
      admin.password = hashedPassword;
      await admin.save();
    }

    return res.status(200).json({
      userId: admin._id,
      loginUserId: DEFAULT_ADMIN_USER.loginUserId,
      name: admin.name,
      role: admin.role,
      department: admin.department,
      defaultPassword: DEFAULT_ADMIN_PASSWORD,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMyProfile,
  listFacultyUsers,
  bootstrapFacultyUsers,
  bootstrapAdminUser,
};

