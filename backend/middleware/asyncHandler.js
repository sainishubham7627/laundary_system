/**
 * Centralized async error handler wrapper
 * Wraps controller functions to catch async errors and pass to Express error handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
