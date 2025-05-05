import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { ApiError } from '@/core/base/apiError';
import { UserUseCase } from '@/core/usecases/user.usecase';
import { UserRepository } from '@/db/prisma/userRepository';
import { CreateUserRequest } from '@/core/validation/user/CreateUserRequest';
import { validateRequest } from '@/api/v1/middleware/validate';

export function UserRoute(prisma: PrismaClient): Router {
  const router = Router();

  const userUseCase = new UserUseCase(new UserRepository(prisma));

  router.post(
    '/register',
    validateRequest(CreateUserRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { username, email, password } = req.body;

      const existingUser = await userUseCase.getUserByEmail(email);
      if (existingUser) {
        return next(new ApiError('User with this email already exists', 400));
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const userId = await userUseCase.createUser(
        username,
        email,
        hashedPassword
      );

      res.status(201).json({
        message: 'User created successfully',
        userId,
      });
    })
  );

  return router;
}
