// Error handling middleware

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async handler wrapper to avoid try-catch in every controller
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Global error handler middleware
export const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log all errors with request details
  console.error('ERROR 💥:', {
    url: req.originalUrl,
    method: req.method,
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack
  });

  // Development error response (includes stack trace)
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors,
      stack: err.stack,
      error: err,
    });
  }

  // Production error response
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      errors: err.errors,
    });
  }

  // Programming or unknown error: don't leak error details
  return res.status(500).json({
    success: false,
    status: 'error',
    message: 'Something went wrong on the server',
  });
};

// 404 handler for undefined routes
export const notFoundHandler = (req, res, next) => {
  const err = new AppError(`Cannot find ${req.originalUrl} on this server`, 404);
  next(err);
};

// Validation error formatter
export const validationErrorFormatter = (errors) => {
  if (Array.isArray(errors)) {
    return errors;
  }
  
  if (errors.name === 'ValidationError') {
    return Object.values(errors.errors).map(err => ({
      field: err.path,
      message: err.message,
    }));
  }
  
  return null;
};
