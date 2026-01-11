import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code: err.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

export class ApiError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number = 500, code: string = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Common error types
export const BadRequestError = (message: string) => new ApiError(message, 400, 'BAD_REQUEST');
export const UnauthorizedError = (message: string = 'Unauthorized') => new ApiError(message, 401, 'UNAUTHORIZED');
export const ForbiddenError = (message: string = 'Forbidden') => new ApiError(message, 403, 'FORBIDDEN');
export const NotFoundError = (message: string = 'Not found') => new ApiError(message, 404, 'NOT_FOUND');
export const ConflictError = (message: string) => new ApiError(message, 409, 'CONFLICT');
