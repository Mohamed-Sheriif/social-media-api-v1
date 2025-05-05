import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import { ApiError } from '@/core/base/apiError';
import { UserUseCase } from '@/core/usecases/user.usecase';
import { UserRepository } from '@/db/prisma/userRepository';
import { CreateUserRequest } from '@/core/validation/user/CreateUserRequest';
import { LoginRequest } from '@/core/validation/user/loginReqest';
import { validateRequest } from '@/api/v1/middleware/validate';
import { signToken } from '@/api/v1/helpers/jwt';
import { authenticate } from '@/api/v1/middleware/authenticate';
import { RequestWithUser } from '@/api/v1/helpers/types';

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

  router.get(
    '/login',
    validateRequest(LoginRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { email, password } = req.body;

      const user = await userUseCase.getUserByEmail(email);
      if (!user) {
        return next(new ApiError('Email or password is incorrect!', 400));
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return next(new ApiError('Email or password is incorrect!', 400));
      }

      // Sign token
      const token = signToken({
        id: user.id,
        userName: user.username,
        email: user.email,
      });

      if (token === '') {
        return next(new ApiError('JWT_SECRET is not set', 500));
      }

      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json({
        message: 'Login successful',
        user: userWithoutPassword,
        token,
      });
    })
  );

  router.get(
    '/me',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;

      const user = await userUseCase.getUserById(userId);
      if (!user) {
        return next(new ApiError('User not found', 404));
      }

      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        message: 'User retrieved successfully',
        user: userWithoutPassword,
      });
    })
  );

  return router;
}
