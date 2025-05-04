import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/core/base/apiError';

const handlePrismaError = (err: PrismaClientKnownRequestError) => {
  switch (err.code) {
    case 'P2002':
      // handling duplicate key errors
      return new ApiError(
        `Duplicate field value: ${err.meta ? err.meta.target : err.meta}`,
        400
      );
    case 'P2014':
      // handling invalid id errors
      return new ApiError(
        `Invalid ID: ${err.meta ? err.meta.target : err.meta}`,
        400
      );
    case 'P2003':
      // handling invalid data errors
      return new ApiError(
        `Invalid input data: ${err.meta ? err.meta.target : err.meta}`,
        400
      );
    default:
      // handling all other errors
      return new ApiError(`Something went wrong: ${err.message}`, 500);
  }
};

const handleJWTError = () =>
  new ApiError('Invalid token please login again', 400);

const handleJWTExpiredError = () =>
  new ApiError('Token has expired please login again', 400);

const sendErrorForDev = (err: ApiError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorForProd = (err: ApiError, res: Response): void => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

export function errorHandler(
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorForDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };

    error.message = err.message;
    if (err instanceof PrismaClientKnownRequestError) {
      error = handlePrismaError(err);
    } else if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    } else if (error.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }
    sendErrorForProd(error, res);
  }
}
