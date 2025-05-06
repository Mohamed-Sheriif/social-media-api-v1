import crypto from 'crypto';

import bcrypt from 'bcrypt';
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

import { sendEmail } from '@/helpers/sendEmail';
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
import { ForgetPasswordRequest } from '@/core/validation/user/ForgetPasswordRequest';
import { ResetPasswordRequest } from '@/core/validation/user/ResetPasswordRequest';

export function UserRoute(prisma: PrismaClient): Router {
  const router = Router();

  const userUseCase = new UserUseCase(new UserRepository(prisma));

  /**
   * @desc    Signup user
   * @route   POST /api/v1/user/register
   * @access  Public
   */
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

  /**
   * @desc    Login user
   * @route   POST /api/v1/user/login
   * @access  Public
   */
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

  /**
   * @desc    Forget Password
   * @route   POST /api/v1/user/forget-password
   * @access  Private
   */
  router.post(
    '/forget-password',
    validateRequest(ForgetPasswordRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { email } = req.body;

      // 1) Check if the user exists
      const user = await userUseCase.getUserByEmail(email);
      if (!user) {
        return next(new ApiError('User not found', 404));
      }

      // 2) if user exists, generate a reset token with 6 digits
      const resetToken = Math.floor(100000 + Math.random() * 900000).toString();
      const hashedResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // 3) Set the reset token and expiration date in the database
      const passwordResetExpires = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes
      const passwordResetVerified = false;
      await userUseCase.updateUserResetTokenInfo(
        user.id,
        hashedResetToken,
        passwordResetExpires,
        passwordResetVerified
      );

      // 4) Send the reset token to the user's email
      const message = `Hi ${user.username},\nwe received a request to reset your password on Social Media account. \nYour password reset code is: ${resetToken}.`;
      try {
        await sendEmail(user.email, 'Password Reset Token', message);

        res.status(200).json({
          message: 'Reset token sent to email',
        });
      } catch (error) {
        // 5) If there was an error sending the email, reset the token and expiration date in the database
        await userUseCase.updateUserResetTokenInfo(user.id, null, null, null);
        return next(new ApiError('Error sending email', 500));
      }
    })
  );

  /**
   * @desc    Verify reset token
   * @route   POST /api/v1/user/verify-reset-token
   * @access  Public
   */
  router.post(
    '/verify-reset-token',
    validateRequest(ForgetPasswordRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { resetCode } = req.body;

      const hashedResetToken = crypto
        .createHash('sha256')
        .update(resetCode)
        .digest('hex');

      // 1) Check if the reset token is valid
      const user = await userUseCase.getUserByResetCode(hashedResetToken);
      if (!user) {
        return next(new ApiError('Invalid reset token', 400));
      }

      // 2) Check if the reset token has expired
      const currentTime = new Date();
      if (
        user.passwordResetExpires &&
        user.passwordResetExpires < currentTime
      ) {
        return next(new ApiError('Reset token has expired', 400));
      }

      // 3) Check if the reset token is verified
      if (user.passwordResetVerified) {
        return next(new ApiError('Reset token has already been verified', 400));
      }

      // 4) Update the user with the verified reset token
      await userUseCase.updateUserResetTokenInfo(
        user.id,
        user.passwordResetCode,
        user.passwordResetExpires,
        true
      );

      res.status(200).json({
        message: 'Reset token is valid',
      });
    })
  );

  /**
   * @desc    Reset Password
   * @route   POST /api/v1/user/reset-password
   * @access  Public
   */
  router.post(
    '/reset-password',
    validateRequest(ResetPasswordRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { resetCode, newPassword } = req.body;

      const hashedResetToken = crypto
        .createHash('sha256')
        .update(resetCode)
        .digest('hex');
      // 1) Check if the reset token is valid
      const user = await userUseCase.getUserByResetCode(hashedResetToken);
      if (!user) {
        return next(new ApiError('Invalid reset token', 400));
      }
      // 2) Check if the reset token is verified
      if (!user.passwordResetVerified) {
        return next(new ApiError('Reset token is not verified', 400));
      }

      // 3) Update the user's password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await userUseCase.updateUserPassword(user.id, hashedNewPassword);

      // 4) Clear the reset token and expiration date in the database
      await userUseCase.updateUserResetTokenInfo(user.id, null, null, null);

      // 5) Sign token
      const token = signToken({
        id: user.id,
        userName: user.username,
        email: user.email,
      });

      if (token === '') {
        return next(new ApiError('JWT_SECRET is not set', 500));
      }

      res.status(200).json({
        message: 'Password reset successfully',
      });
    })
  );

  /**
   * @desc    Get user profile
   * @route   GET /api/v1/user/:id
   * @access  Private
   */
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

  /**
   * @desc    Get all users
   * @route   GET /api/v1/user
   * @access  Private
   */
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

  /**
   * @desc    Update user profile
   * @route   PUT /api/v1/user/:id
   * @access  Private
   */
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

  /**
   * @desc    Update user password
   * @route   PUT /api/v1/user/:id/password
   * @access  Private
   */
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

  /**
   * @desc    Delete user
   * @route   DELETE /api/v1/user/:id
   * @access  Private
   */
  router.delete(
    '/:id',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = Number(req.params.id);

      // Check if the user exists
      const user = await userUseCase.getUserById(userId);
      if (!user) {
        return next(new ApiError('User not found', 404));
      }

      // Delete the user
      await userUseCase.deleteUser(userId);

      res.status(204).json({
        message: 'User deleted successfully',
      });
    })
  );

  return router;
}
