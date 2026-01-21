import mongoose from 'mongoose';
import { ZodError } from 'zod';

const NODE_ENV = process.env.NODE_ENV || 'development';

function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[ERROR]', err.message, err.stack);

  // Mongoose validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    const errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
    return res.status(400).json({ error: 'Validation failed', details: errors });
  }

  // Duplicate key (unique constraint)
  if (err && err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return res.status(409).json({ error: 'Duplicate field', fields });
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Invalid request', details: err.flatten() });
  }

  // Default
  const status = err.status || 500;
  const payload = { error: err.message || 'Internal Server Error' };
  if (NODE_ENV === 'development') payload.stack = err.stack;
  return res.status(status).json(payload);
}

export default errorHandler;
