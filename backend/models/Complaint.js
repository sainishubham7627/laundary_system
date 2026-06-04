const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    senderType: {
      type: String,
      enum: ['Student', 'Admin'],
      required: true,
    },
    registrationNumber: {
      type: String, // Optional
      trim: true,
      uppercase: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Resolved', 'Announcement'],
      default: 'Open',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);
