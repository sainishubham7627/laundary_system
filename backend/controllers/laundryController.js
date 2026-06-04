const LaundryOrder = require('../models/LaundryOrder');
const asyncHandler = require('../middleware/asyncHandler');
const { sendEmail } = require('../utils/mailer');

// ─── ADMIN: Create laundry order ──────────────────────────────────────────────
/**
 * @desc  Create a new laundry order (registrationNumber is auto-generated)
 * @route POST /api/laundry
 * @access Private (Admin)
 */
const createEntry = asyncHandler(async (req, res) => {
  const { registrationNumber, clothesCount, customer, notes, changedBy = 'system' } = req.body;

  if (!registrationNumber || !clothesCount || !customer || !customer.phone) {
    return res.status(400).json({
      success: false,
      message: 'registrationNumber, clothesCount, and customer.phone are required',
    });
  }

  const order = await LaundryOrder.create({
    admin: req.admin._id,
    registrationNumber,
    clothesCount,
    customer,
    // Seed statusHistory with the initial 'Submitted' entry
    statusHistory: [
      {
        status:    'Submitted',
        changedAt: new Date(),
        changedBy,
        notes,
      },
    ],
  });

  res.status(201).json({ success: true, data: order });
});

// ─── ADMIN: Get all laundry orders ────────────────────────────────────────────
/**
 * @desc  Get all orders with optional filters: status, regNo, name
 * @route GET /api/laundry
 * @access Private (Admin)
 */
const getAllEntries = asyncHandler(async (req, res) => {
  const filter = { admin: req.admin._id };

  if (req.query.status) filter.status = req.query.status;

  if (req.query.regNo)
    filter.registrationNumber = req.query.regNo.toUpperCase();

  if (req.query.name)
    filter['customer.name'] = { $regex: req.query.name, $options: 'i' };

  const orders = await LaundryOrder.find(filter).sort({ createdAt: -1 });

  res.json({ success: true, count: orders.length, data: orders });
});

// ─── ADMIN: Get a single order by ID ─────────────────────────────────────────
/**
 * @desc  Get a single order by its MongoDB ID
 * @route GET /api/laundry/:id
 * @access Private (Admin)
 */
const getEntryById = asyncHandler(async (req, res) => {
  const order = await LaundryOrder.findOne({ _id: req.params.id, admin: req.admin._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, data: order });
});

// ─── ADMIN: Update status (uses transitionTo instance method) ─────────────────
/**
 * @desc  Transition status and append to statusHistory atomically
 * @route PATCH /api/laundry/:id/status
 * @access Private (Admin)
 * @body  { status, changedBy, notes }
 */
const updateStatus = asyncHandler(async (req, res) => {
  const VALID = ['Submitted', 'Washing', 'Ready', 'Collected'];
  const { status, changedBy = 'system', notes } = req.body;

  if (!status || !VALID.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `status must be one of: ${VALID.join(', ')}`,
    });
  }

  const order = await LaundryOrder.findOne({ _id: req.params.id, admin: req.admin._id });
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Use the model's instance method for atomic status + history update
  await order.transitionTo(status, changedBy, notes);

  res.json({ success: true, data: order });
});

// ─── ADMIN: Delete an order ───────────────────────────────────────────────────
/**
 * @desc  Delete a laundry order
 * @route DELETE /api/laundry/:id
 * @access Private (Admin)
 */
const deleteEntry = asyncHandler(async (req, res) => {
  const order = await LaundryOrder.findOneAndDelete({ _id: req.params.id, admin: req.admin._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  res.json({ success: true, message: 'Order deleted successfully' });
});

// ─── STUDENT: Track by registration number ────────────────────────────────────
/**
 * @desc  Student checks their order status by registration number
 * @route GET /api/laundry/track/:regNo
 * @access Public
 */
const trackByRegNo = asyncHandler(async (req, res) => {
  const regNo = req.params.regNo.toUpperCase();

  const order = await LaundryOrder.findOne({ registrationNumber: regNo });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: `No order found for registration number: ${regNo}`,
    });
  }

  res.json({ success: true, data: order });
});

// ─── ADMIN: Notify Student (Email) ────────────────────────────────────────────
/**
 * @desc  Send email notification to student
 * @route POST /api/laundry/:id/notify
 * @access Private (Admin)
 */
const notifyStudent = asyncHandler(async (req, res) => {
  const order = await LaundryOrder.findOne({ _id: req.params.id, admin: req.admin._id });

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (!order.customer.email) {
    return res.status(400).json({ success: false, message: 'No email associated with this order' });
  }

  const subject = `Laundry Order ${order.status}: ${order.registrationNumber}`;
  const message = `Hello ${order.customer.name || 'Student'},\n\nYour laundry order (Reg No: ${order.registrationNumber}) with ${order.clothesCount} clothes is now ${order.status}.\n\nThank you!`;

  const previewUrl = await sendEmail(order.customer.email, subject, message);

  res.json({ success: true, message: 'Notification sent successfully!', previewUrl });
});

// ─── ADMIN: Dashboard statistics ─────────────────────────────────────────────

/** Helper: safely extract total from aggregate result — defined before use */
const totalCounts = (agg) => (agg.length > 0 ? agg[0].total : 0);

/**
 * @desc  Count of orders grouped by status
 * @route GET /api/laundry/stats
 * @access Private (Admin)
 */
const getStats = asyncHandler(async (req, res) => {
  const [statusCounts, totalClothes] = await Promise.all([
    LaundryOrder.aggregate([
      { $match: { admin: req.admin._id } },
      { $group: { _id: '$status', count: { $sum: 1 }, clothes: { $sum: '$clothesCount' } } },
    ]),
    LaundryOrder.aggregate([
      { $match: { admin: req.admin._id } },
      { $group: { _id: null, total: { $sum: '$clothesCount' } } },
    ]),
  ]);

  const total = await LaundryOrder.countDocuments({ admin: req.admin._id });

  const formatted = {
    total,
    totalClothes: totalCounts(totalClothes),
    Submitted: 0,
    Washing: 0,
    Ready: 0,
    Collected: 0,
  };

  statusCounts.forEach(({ _id, count }) => {
    formatted[_id] = count;
  });

  res.json({ success: true, data: formatted });
});

module.exports = {
  createEntry,
  getAllEntries,
  getEntryById,
  updateStatus,
  deleteEntry,
  trackByRegNo,
  getStats,
  notifyStudent,
};
