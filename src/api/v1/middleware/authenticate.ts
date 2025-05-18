import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';

import prisma from '@/config/prisma';
import { ApiError } from '@/core/base/apiError';
import { payloadData, RequestWithUser } from '@/api/v1/helpers/types';
import { verifyToken } from '@/api/v1/helpers/jwt';
import { UserInvalidTokensUseCase } from '@/core/usecases/userInvalidTokens.usecase';
import { UserInvalidTokensRepository } from '@/db/prisma/userInvalidTokensRepository';

const userInvalidTokensUseCase = new UserInvalidTokensUseCase(
  new UserInvalidTokensRepository(prisma)
);

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    //  Get JWT token from Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      next(new ApiError('Authentication failed: missing token', 401));
    } else {
      // Check if accessToken exist in userInvalidTokens
      const invalidToken = await userInvalidTokensUseCase.getInvalidToken(
        token
      );
      if (invalidToken) {
        return next(new ApiError('Access token invalid', 401));
      }
    }

    //  Verify JWT token
    const decoded: payloadData = verifyToken(token as string) as payloadData;
    if (!decoded) {
      next(new ApiError('Authentication failed: failed to verify token', 401));
    }

    // extend the request object with the user object
    (req as RequestWithUser).user = {
      id: decoded.id,
      username: decoded.userName,
      email: decoded.email,
    };

    next();
  }
);
