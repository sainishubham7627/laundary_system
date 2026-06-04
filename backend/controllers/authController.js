const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const LaundryOrder = require('../models/LaundryOrder');
const asyncHandler = require('../middleware/asyncHandler');

/**
 * Generate a signed JWT for an admin
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// ─── POST /api/auth/login ────────────────────────────────────────────────────
/**
 * @desc  Admin login
 * @route POST /api/auth/login
 * @access Public
 */
const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide username and password' });
  }

  const admin = await Admin.findOne({ username }).select('+password');
  if (!admin || !(await admin.matchPassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  res.json({
    success: true,
    token: generateToken(admin._id),
    admin: { id: admin._id, username: admin.username, role: admin.role },
  });
});

// ─── POST /api/auth/register ─────────────────────────────────────────────────
/**
 * @desc  Register a new admin (protected by secret password from .env)
 * @route POST /api/auth/register
 * @access Public (guarded by ADMIN_PASSWORD env variable)
 */
const registerAdmin = asyncHandler(async (req, res) => {
  const { username, password, adminSecret } = req.body;

  if (adminSecret !== process.env.ADMIN_PASSWORD) {
    return res.status(403).json({ success: false, message: 'Invalid admin secret' });
  }

  const existingAdmin = await Admin.findOne({ username });
  if (existingAdmin) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }

  const admin = await Admin.create({ username, password });

  res.status(201).json({
    success: true,
    token: generateToken(admin._id),
    admin: { id: admin._id, username: admin.username, role: admin.role },
  });
});

// ─── GET /api/auth/me ────────────────────────────────────────────────────────
/**
 * @desc  Get current logged-in admin
 * @route GET /api/auth/me
 * @access Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, admin: req.admin });
});

// ─── PUT /api/auth/settings ──────────────────────────────────────────────────
/**
 * @desc  Update admin username and/or password
 * @route PUT /api/auth/settings
 * @access Private
 */
const updateAdmin = asyncHandler(async (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password is required to make changes' });
  }

  const admin = await Admin.findById(req.admin._id).select('+password');
  if (!(await admin.matchPassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Incorrect current password' });
  }

  if (newUsername) {
    // Check if new username is taken
    const existing = await Admin.findOne({ username: newUsername });
    if (existing && existing._id.toString() !== admin._id.toString()) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }
    admin.username = newUsername;
  }

  if (newPassword) {
    admin.password = newPassword;
  }

  await admin.save();

  res.json({
    success: true,
    token: generateToken(admin._id), // issue new token in case we need it
    admin: { id: admin._id, username: admin.username, role: admin.role },
  });
});

// ─── DELETE /api/auth/settings ───────────────────────────────────────────────
/**
 * @desc  Delete admin account and all associated orders
 * @route DELETE /api/auth/settings
 * @access Private
 */
const deleteAdmin = asyncHandler(async (req, res) => {
  const { currentPassword } = req.body;

  if (!currentPassword) {
    return res.status(400).json({ success: false, message: 'Current password is required to delete account' });
  }

  const admin = await Admin.findById(req.admin._id).select('+password');
  if (!(await admin.matchPassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Incorrect current password' });
  }

  // Delete all orders belonging to this admin
  await LaundryOrder.deleteMany({ admin: admin._id });

  // Delete the admin
  await admin.deleteOne();

  res.json({ success: true, message: 'Account and associated data deleted successfully' });
});

module.exports = { loginAdmin, registerAdmin, getMe, updateAdmin, deleteAdmin };
