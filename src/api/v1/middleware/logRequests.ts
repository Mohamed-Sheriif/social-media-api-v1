import { Request, Response, NextFunction } from 'express';
import logger from '@/config/logger';

export function logRequests(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();

  res.on('finish', () => {
    const elapsedTime = Date.now() - startTime;
    logger.info(
      `[${req.method}] ${req.originalUrl} ${res.statusCode} ${elapsedTime}ms`
    );
  });

  next();
}
