const express = require('express');
const router = express.Router();
const { loginAdmin, registerAdmin, getMe, updateAdmin, deleteAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', loginAdmin);
router.post('/register', registerAdmin);
router.get('/me', protect, getMe);
router.put('/settings', protect, updateAdmin);
router.delete('/settings', protect, deleteAdmin);

module.exports = router;
