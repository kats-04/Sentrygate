/**
 * Async Error Handler Wrapper
 * Wraps async route handlers to properly catch errors and pass them to Express error handler
 */
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

export default asyncHandler;
