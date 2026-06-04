const express = require('express');
const {
  createComplaint,
  getComplaints,
  resolveComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.route('/').get(getComplaints).post(createComplaint);
router.route('/:id').delete(protect, deleteComplaint);
router.route('/:id/resolve').patch(protect, resolveComplaint);

module.exports = router;
