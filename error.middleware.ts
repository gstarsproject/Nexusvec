import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const errorMiddleware = (err: any, req: Request, res: Response, next: NextFunction) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errorCode = err.code || 'UNKNOWN_ERROR';

  // Handle Prisma Database Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 409;
      message = 'Unique constraint violation. Resource already exists.';
      errorCode = 'DUPLICATE_RECORD';
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Record not found.';
      errorCode = 'NOT_FOUND';
    } else {
      statusCode = 400;
      message = 'Database operation failed.';
      errorCode = 'DB_ERROR';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided.';
    errorCode = 'VALIDATION_ERROR';
  }

  // Hide internal errors on production
  if (statusCode === 500 && process.env.NODE_ENV === 'production') {
    message = 'An unexpected error occurred. Our team has been notified.';
    errorCode = 'INTERNAL_ERROR';
  }

  // Safe logging layout
  console.error(`[${new Date().toISOString()}] [API_ERROR] ${errorCode}: ${err.message}`, {
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      ...(process.env.NODE_ENV === 'development' && { devDetails: err.message, stack: err.stack }),
    }
  });
};
