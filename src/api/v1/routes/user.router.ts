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
import { UpdateUserRequest } from '@/core/validation/user/updateUserRequest';
import { UpdateUserPasswordRequest } from '@/core/validation/user/UpdateUserPasswordRequest';

export function UserRoute(prisma: PrismaClient): Router {
  const router = Router();

  const userUseCase = new UserUseCase(new UserRepository(prisma));

  router.post(
    '/register',
    validateRequest(CreateUserRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { username, email, password } = req.body;

      // Check if the user already exists
      const existingUser = await userUseCase.getUserByEmail(email);
      if (existingUser) {
        return next(new ApiError('User with this email already exists', 400));
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user
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

      // Check if the user exists
      const user = await userUseCase.getUserByEmail(email);
      if (!user) {
        return next(new ApiError('Email or password is incorrect!', 400));
      }

      // Check if the password is correct
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
    '/:id',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = Number(req.params.id);

      // Check if the user exists
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

  router.get(
    '/',
    authenticate,
    asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
      const users = await userUseCase.getAllUsers();

      const usersWithoutPassword = users.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });

      res.status(200).json({
        message: 'Users retrieved successfully',
        users: usersWithoutPassword,
      });
    })
  );

  router.put(
    '/:id',
    authenticate,
    validateRequest(UpdateUserRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = Number(req.params.id);
      const { fullName, bio, avatarUrl } = req.body;

      // Check if the user exists
      const user = await userUseCase.getUserById(userId);
      if (!user) {
        return next(new ApiError('User not found', 404));
      }

      // Update the user
      await userUseCase.updateUser(userId, fullName, bio, avatarUrl);

      res.status(204).json({
        message: 'User updated successfully',
      });
    })
  );

  // Update User Password
  router.put(
    '/:id/password',
    authenticate,
    validateRequest(UpdateUserPasswordRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = Number(req.params.id);
      const { curruntPassword, newPassword } = req.body;

      const user = await userUseCase.getUserById(userId);
      if (!user) {
        return next(new ApiError('User not found', 404));
      }

      // Check if the current password is correct
      const isPasswordValid = await bcrypt.compare(
        curruntPassword,
        user.password
      );
      if (!isPasswordValid) {
        return next(new ApiError('Current password is incorrect', 400));
      }

      // Hash the new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password
      await userUseCase.updateUserPassword(userId, hashedNewPassword);

      res.status(204).json({
        message: 'User password updated successfully',
      });
    })
  );

  return router;
}
