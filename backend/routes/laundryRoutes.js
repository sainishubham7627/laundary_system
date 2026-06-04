const express = require('express');
const router = express.Router();
const {
  createEntry,
  getAllEntries,
  getEntryById,
  updateStatus,
  deleteEntry,
  trackByRegNo,
  getStats,
  notifyStudent,
} = require('../controllers/laundryController');
const { protect } = require('../middleware/auth');

// ── Public (Student) ──────────────────────────────────────────────────────────
router.get('/track/:regNo', trackByRegNo);   // Student tracking

// ── Protected (Admin) ─────────────────────────────────────────────────────────
router.use(protect);                          // All routes below require JWT

router.get('/stats', getStats);
router.route('/').get(getAllEntries).post(createEntry);
router.route('/:id').get(getEntryById).delete(deleteEntry);
router.patch('/:id/status', updateStatus);
router.post('/:id/notify', notifyStudent);

module.exports = router;
