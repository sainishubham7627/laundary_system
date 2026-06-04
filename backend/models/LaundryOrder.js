const mongoose = require('mongoose');
const { Schema } = mongoose;

// ─── Sub-schemas ───────────────────────────────────────────────────────────────

const STATUS_ENUM = ['Submitted', 'Washing', 'Ready', 'Collected'];

const statusEntrySchema = new Schema(
  {
    status:    { type: String, enum: STATUS_ENUM, required: true },
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, default: 'system' },
    notes:     { type: String, trim: true },
  },
  { _id: false }
);

const customerSchema = new Schema(
  {
    name:  { type: String, trim: true },
    phone: { 
      type: String, 
      required: [true, 'Customer phone is required'],
      match: [/^\d{10}$/, 'Phone number must be exactly 10 digits']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
  },
  { _id: false }
);

// ─── Main schema ───────────────────────────────────────────────────────────────

const laundryOrderSchema = new Schema(
  {
    admin: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: [true, 'Order must belong to an admin'],
    },
    registrationNumber: {
      type:     String,
      unique:   true,
      required: [true, 'Registration number is required'],
      minlength: [5, 'Registration number must be at least 5 characters'],
      trim:     true,
    },
    clothesCount: {
      type:     Number,
      required: [true, 'Clothes count is required'],
      min:      [1, 'At least 1 item required'],
    },
    status: {
      type:    String,
      enum:    STATUS_ENUM,
      default: 'Submitted',
    },
    customer:      { type: customerSchema, required: [true, 'Customer info is required'] },
    statusHistory: { type: [statusEntrySchema], default: [] },
  },
  { timestamps: true }   // auto-manages createdAt + updatedAt
);

// ─── Indexes ───────────────────────────────────────────────────────────────────

// Note: registrationNumber index is auto-created by unique:true on the field above.

// 1. Filter by admin (dashboard queries)
laundryOrderSchema.index({ admin: 1 });

// 2. Filter by current status (dashboard queries)
laundryOrderSchema.index({ status: 1 });

// 3. Sort by submission time
laundryOrderSchema.index({ createdAt: -1 });

// 4. Compound — status board sorted by time
laundryOrderSchema.index({ status: 1, createdAt: -1 });

// 5. TTL — auto-delete Collected orders after 90 days (7,776,000 seconds)
laundryOrderSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: 7_776_000,
    partialFilterExpression: { status: 'Collected' },
    name: 'ttl_collected_orders',
  }
);

// ─── Instance method ───────────────────────────────────────────────────────────

/**
 * Atomically transition to a new status and append to statusHistory.
 * @param {string} newStatus  - one of the STATUS_ENUM values
 * @param {string} changedBy  - staff ID or identifier (defaults to 'system')
 * @param {string} [notes]    - optional remarks
 */
laundryOrderSchema.methods.transitionTo = async function (newStatus, changedBy = 'system', notes) {
  this.status = newStatus;
  this.statusHistory.push({
    status:    newStatus,
    changedAt: new Date(),
    changedBy,
    notes,
  });
  return this.save();
};

// ─── Export ────────────────────────────────────────────────────────────────────

const LaundryOrder = mongoose.model('LaundryOrder', laundryOrderSchema);

module.exports = LaundryOrder;
