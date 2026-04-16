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

const normalizeDepartment = (department, customDepartment) => {
  if (String(department).toLowerCase() !== "other") return department;
  return customDepartment || "";
};

const registerUser = async (req, res, next) => {
  try {
    const { name, role, department, customDepartment, password } = req.body;
    const resolvedDepartment = normalizeDepartment(department, customDepartment).trim();

    if (!name || !role || !department || !password) {
      return res.status(400).json({ message: "name, role, department and password are required." });
    }
    if (!resolvedDepartment) {
      return res.status(400).json({ message: "Please provide a valid department." });
    }
    if (String(password).length < 4) {
      return res.status(400).json({ message: "Password must be at least 4 characters." });
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

    const hashedPassword = await bcrypt.hash(String(password), 10);
    const user = await User.create({
      name,
      role: normalizedRole,
      department: resolvedDepartment,
      password: hashedPassword,
    });

    return res.status(201).json({
      userId: user._id,
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

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId." });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    const isMatch = await bcrypt.compare(String(password), user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    return res.status(200).json({
      userId: user._id,
      name: user.name,
      role: user.role,
      department: user.department,
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
        name: u.name,
        role: u.role,
        department: u.department,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  listFacultyUsers,
  bootstrapFacultyUsers,
};

