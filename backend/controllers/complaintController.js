const Complaint = require('../models/Complaint');
const asyncHandler = require('express-async-handler');

// @desc    Create a new complaint or announcement
// @route   POST /api/complaints
// @access  Public (Student) / Private (Admin)
exports.createComplaint = asyncHandler(async (req, res) => {
  const { senderType, registrationNumber, message } = req.body;

  if (!message || !senderType) {
    res.status(400);
    throw new Error('Message and senderType are required');
  }

  // Admins post "Announcements", Students post "Open" complaints
  const status = senderType === 'Admin' ? 'Announcement' : 'Open';

  const complaint = await Complaint.create({
    senderType,
    registrationNumber,
    message,
    status,
  });

  res.status(201).json({ success: true, data: complaint });
});

// @desc    Get all complaints and announcements
// @route   GET /api/complaints
// @access  Public
exports.getComplaints = asyncHandler(async (req, res) => {
  // Return all, sorted by newest first
  const complaints = await Complaint.find({}).sort({ createdAt: -1 });
  res.json({ success: true, data: complaints });
});

// @desc    Update complaint status (resolve)
// @route   PATCH /api/complaints/:id/resolve
// @access  Private (Admin)
exports.resolveComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  complaint.status = 'Resolved';
  const updatedComplaint = await complaint.save();
  
  res.json({ success: true, data: updatedComplaint });
});

// @desc    Delete a complaint/announcement
// @route   DELETE /api/complaints/:id
// @access  Private (Admin)
exports.deleteComplaint = asyncHandler(async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);

  if (!complaint) {
    res.status(404);
    throw new Error('Complaint not found');
  }

  await complaint.deleteOne();
  res.json({ success: true, message: 'Complaint removed' });
});
