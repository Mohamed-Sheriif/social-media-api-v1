import crypto from 'crypto';

import bcrypt from 'bcrypt';
import passport from 'passport';
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import { authenticator } from 'otplib';
import qrcode from 'qrcode';
import NodeCache from 'node-cache';

import { payloadData, RequestWithUser } from '@/api/v1/helpers/types';
import { sendEmail } from '@/helpers/sendEmail';
import { ApiError } from '@/core/base/apiError';
import { verifyToken } from '@/api/v1/helpers/jwt';
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
import { UserRefreshTokenUseCase } from '@/core/usecases/userRefreshToken.usecase';
import { UserRefreshTokenRepository } from '@/db/prisma/userRefreshTokenRepository';
import { UserInvalidTokensUseCase } from '@/core/usecases/userInvalidTokens.usecase';
import { UserInvalidTokensRepository } from '@/db/prisma/userInvalidTokensRepository';

export function UserRoute(prisma: PrismaClient): Router {
  const router = Router();
  const cache = new NodeCache();

  const userUseCase = new UserUseCase(new UserRepository(prisma));
  const userRefreshTokenUseCase = new UserRefreshTokenUseCase(
    new UserRefreshTokenRepository(prisma)
  );
  const userInvalidTokensUseCase = new UserInvalidTokensUseCase(
    new UserInvalidTokensRepository(prisma)
  );

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
   * @desc    Login user with passport
   * @route   POST /api/v1/user/google
   * @access  Public
   */
  router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  /**
   * @desc    Google auth callback
   * @route   GET /api/v1/user/google/callback
   * @access  Public
   */
  router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      // Successful authentication
      const user = req.user as any; // Cast to any to access properties

      // Check if the user already exists in the database , if not create a new user
      let existingUser = await userUseCase.getUserByEmail(user.email);
      let userId = user.id;
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.id, 10);
        userId = await userUseCase.createUser(
          user.username,
          user.email,
          hashedPassword
        );
      }

      // Sign token
      const token = signToken(
        {
          id: userId,
          userName: user.username,
          email: user.email,
        },
        {
          expiresIn: '1h',
        }
      );
      if (token === '') {
        return next(new ApiError('JWT_SECRET is not set', 500));
      }

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      });
    })
  );

  /**
   * @desc    Login user
   * @route   POST /api/v1/user/login
   * @access  Public
   */
  router.post(
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

      if (user.twoFAEnabled) {
        const tempToken = crypto.randomUUID();

        cache.set(
          (process.env.CACHE_SECRET as string) + tempToken,
          user.id,
          process.env.CACHE_EXPIREIN as string
        );

        res.status(200).json({
          tempToken,
          expiresIn: '180s',
        });
      } else {
        // Sign accessToken and refreshToken
        const accessToken = signToken(
          {
            id: user.id,
            userName: user.username,
            email: user.email,
          },
          {
            expiresIn: '1h',
          }
        );
        const refreshToken = signToken(
          {
            id: user.id,
            userName: user.username,
            email: user.email,
          },
          {
            expiresIn: '1h',
          }
        );

        // Inser refreshToken
        await userRefreshTokenUseCase.createUserRefreshToken(
          user.id,
          refreshToken
        );

        res.status(200).json({
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            bio: user.bio,
            avatarUrl: user.avatarUrl,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
          },
          accessToken,
          refreshToken,
        });
      }
    })
  );

  /**
   * @desc    Login with 2FA
   * @route   POST /api/v1/user/2fa/login
   * @access  Public
   */
  router.post(
    '/2fa/login',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { tempToken, totp } = req.body;

      // Validate required fields
      if (!tempToken || !totp) {
        return next(
          new ApiError('Please fill in all fields (tempToken and totp)', 400)
        );
      }

      // Check if user id exist in cache
      const userId = cache.get(
        (process.env.CACHE_SECRET as string) + tempToken
      );
      if (!userId) {
        return next(
          new ApiError(
            'The provided temporary token is incorrect or expired',
            401
          )
        );
      }

      // Check if the user exists
      const user = await userUseCase.getUserById(Number(userId));
      if (!user) {
        return next(new ApiError('User not found', 404));
      }

      if (user.twoFASecret) {
        // Verify the code
        const isValid = authenticator.check(totp, user.twoFASecret);
        if (!isValid) {
          return next(new ApiError('TOTP is not correct or expired', 400));
        }
      } else {
        return next(new ApiError('There is no twoFASecret to verify!', 400));
      }

      // Sign accessToken and refreshToken
      const accessToken = signToken(
        {
          id: user.id,
          userName: user.username,
          email: user.email,
        },
        {
          expiresIn: '1h',
        }
      );
      const refreshToken = signToken(
        {
          id: user.id,
          userName: user.username,
          email: user.email,
        },
        {
          expiresIn: '1h',
        }
      );

      // Inser refreshToken
      await userRefreshTokenUseCase.createUserRefreshToken(
        user.id,
        refreshToken
      );

      res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          fullName: user.fullName,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        accessToken,
        refreshToken,
      });
    })
  );

  /**
   * @desc    Generate QR code for 2fa
   * @route   GET /api/v1/user/2fa/generate
   * @access  Private
   */
  router.get(
    '/2fa/generate',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = Number((req as RequestWithUser).user.id);

      // Check if the user exists
      const user = await userUseCase.getUserById(userId);
      if (!user) {
        return next(new ApiError('User not found', 404));
      }

      // Generate a secret key for the user
      const secret = authenticator.generateSecret();

      // Save the secret key to the user's record in the database
      await userUseCase.updateUserTwoFASecretKey(userId, secret);

      // Generate a QR code URL
      const otpauth = authenticator.keyuri(
        user.email,
        'Social Media App',
        secret
      );
      const qrCodeUrl = await qrcode.toBuffer(otpauth, {
        type: 'png',
        margin: 1,
      });

      // Set the content type and disposition for the QR code image
      res.setHeader('Content-Disposition', 'attachment; filename=qrcode.png');

      res.status(200).type('image/png').send(qrCodeUrl);
    })
  );

  /**
   * @desc    Verify 2fa code
   * @route   POST /api/v1/user/2fa/verify
   * @access  Private
   */
  router.post(
    '/2fa/verify',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = Number((req as RequestWithUser).user.id);
      const { totp } = req.body;

      // Check it totp exist
      if (!totp) {
        return next(new ApiError('totp is required', 400));
      }

      // Check if the user exists
      const user = await userUseCase.getUserById(userId);
      if (!user) {
        return next(new ApiError('User not found', 404));
      }

      console.log(user);

      if (user.twoFASecret) {
        // Verify the code
        const isValid = authenticator.check(totp, user.twoFASecret);
        if (!isValid) {
          return next(new ApiError('TOTP is not correct or expired', 400));
        }
      } else {
        return next(new ApiError('There is no twoFASecret to verify!', 400));
      }

      // Update the user's record to indicate that 2FA is enabled
      await userUseCase.updateUserTwoFAEnabled(userId, true);

      res.status(200).json({
        message: '2FA code verified successfully',
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
      const message = `Hi ${user.username},\nwe received a request to reset your password on Social Media account. \nYour password reset token is: ${resetToken}.`;
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
      const { resetToken } = req.body;

      const hashedResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      // 1) Check if the reset token is valid
      const user = await userUseCase.getUserByResetToken(hashedResetToken);
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
      const { resetToken, newPassword } = req.body;

      const hashedResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
      // 1) Check if the reset token is valid
      const user = await userUseCase.getUserByResetToken(hashedResetToken);
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
      const token = signToken(
        {
          id: user.id,
          userName: user.username,
          email: user.email,
        },
        {
          expiresIn: '1h',
        }
      );

      if (token === '') {
        return next(new ApiError('JWT_SECRET is not set', 500));
      }

      res.status(200).json({
        message: 'Password reset successfully',
      });
    })
  );

  /**
   * @desc    Refresh token
   * @route   POST /api/v1/user/refresh-token
   * @access  Public
   */
  router.post(
    '/refresh-token',
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return next(new ApiError('Refresh token is required', 400));
      }

      // Verify the refresh token
      const decoded: payloadData = verifyToken(refreshToken) as payloadData;
      if (!decoded) {
        return next(new ApiError('Invalid refresh token', 401));
      }

      // Get userRefreshToken from the database
      const userRefreshToken =
        await userRefreshTokenUseCase.getUserRefreshTokenByUserId(
          decoded.id,
          refreshToken
        );

      // Check if the refresh token exists
      if (!userRefreshToken) {
        return next(new ApiError('Refresh token invalid', 401));
      }

      // Remove the old refresh token
      await userRefreshTokenUseCase.deleteUserRefreshTokenByUserID(
        userRefreshToken.userId
      );

      // Sign a new refresh token and access token
      const accessToken = signToken(
        {
          id: decoded.id,
          userName: decoded.userName,
          email: decoded.email,
        },
        {
          expiresIn: '1h',
        }
      );

      const newRefreshToken = signToken(
        {
          id: decoded.id,
          userName: decoded.userName,
          email: decoded.email,
        },
        {
          expiresIn: '1w',
        }
      );

      // Insert the new refresh token into the database
      await userRefreshTokenUseCase.createUserRefreshToken(
        decoded.id,
        newRefreshToken
      );

      res.status(200).json({
        message: 'Refresh token generated successfully',
        accessToken,
        refreshToken: newRefreshToken,
      });
    })
  );

  /**
   * @desc    Logout from single device
   * @route   POST /api/v1/user/logout
   * @access  Private
   */
  router.post(
    '/logout',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { accessToken, refreshToken } = req.body;
      const userId = (req as RequestWithUser).user.id;

      // Validate refreshToken and accessToken
      if (!refreshToken || !accessToken) {
        return next(new ApiError('Refresh and Access token are required', 400));
      }

      // Delete refresh token of this device
      await userRefreshTokenUseCase.deleteUserRefreshTokenByUserIDAndRefreshToken(
        userId,
        refreshToken
      );

      // Insert accessToken in UserInvalidTokens
      await userInvalidTokensUseCase.insertToken(userId, accessToken, '1h');

      res.status(204).json();
    })
  );

  /**
   * @desc    Logout from all devices
   * @route   POST /api/v1/user/logout-all
   * @access  Private
   */
  router.post(
    '/logout-all',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { accessToken } = req.body;
      const userId = (req as RequestWithUser).user.id;

      // Validate refreshToken and accessToken
      if (!accessToken) {
        return next(new ApiError('Access token is required', 400));
      }

      // Delete all user refresh tokens
      await userRefreshTokenUseCase.deleteUserRefreshTokenByUserID(userId);

      // Insert accessToken in UserInvalidTokens
      await userInvalidTokensUseCase.insertToken(userId, accessToken, '1h');

      res.status(204).json();
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

      res.status(200).json({
        message: 'User retrieved successfully',
        user: {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
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

      const userData = users.map(user => {
        return {
          id: user.id,
          username: user.username,
          fullName: user.fullName,
          email: user.email,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
      });

      res.status(200).json({
        message: 'Users retrieved successfully',
        users: userData,
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
