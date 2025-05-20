import { Request, Response, NextFunction, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

import { ApiError } from '@/core/base/apiError';
import { authenticate } from '@/api/v1/middleware/authenticate';
import { RequestWithUser } from '@/api/v1/helpers/types';
import { UpdateFriendshipRequest } from '@/core/validation/freindship/UpdateFriendshipRequest';
import { validateRequest } from '@/api/v1/middleware/validate';
import { UserUseCase } from '@/core/usecases/user.usecase';
import { UserRepository } from '@/db/prisma/userRepository';
import { FriendshipUseCase } from '@/core/usecases/freindship.usecase';
import { FriendshipRepository } from '@/db/prisma/friendshipRepository';

export function FriendshipRoute(prisma: PrismaClient): Router {
  const router = Router();

  const friendshipUsecase = new FriendshipUseCase(
    new FriendshipRepository(prisma)
  );
  const userUsecase = new UserUseCase(new UserRepository(prisma));

  /**
   * @desc    Send friendship request
   * @route   POST /api/v1/friendship/:addresseeId
   * @access  Private
   */
  router.post(
    '/:addresseeId',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const addresseeId = Number(req.params.addresseeId);
      const requesterId = (req as RequestWithUser).user.id;

      // Check if addressee user exist
      const user = await userUsecase.getUserById(addresseeId);
      if (!user) {
        return next(new ApiError('User with this does not exist', 404));
      }

      // Check if there is already a request between them
      const freindship = await friendshipUsecase.getFriendshipRequest(
        requesterId,
        addresseeId
      );
      if (freindship) {
        if (freindship.requesterId === requesterId) {
          return next(
            new ApiError('Conflict, You already sent a request before!', 409)
          );
        } else {
          return next(
            new ApiError(
              'Conflict, You already have freind request from him!',
              409
            )
          );
        }
      }

      // Send friend request
      const freindshipId = await friendshipUsecase.sendFriendRequest(
        requesterId,
        addresseeId
      );

      res
        .status(200)
        .json({ message: 'Frendship request sent successfully', freindshipId });
    })
  );

  /**
   * @desc    Get all friends for a user
   * @route   GET /api/v1/friendship/:userId/friends
   * @access  Private
   */
  router.get(
    '/:userId/friends',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = Number(req.params.userId);

      // Check if addressee user exist
      const user = await userUsecase.getUserById(userId);
      if (!user) {
        return next(new ApiError('User with this does not exist', 404));
      }

      // Get user friends
      const friends = await friendshipUsecase.getUserFriends(userId);

      res
        .status(200)
        .json({ message: 'Friends retrieved successfully', friends });
    })
  );

  /**
   * @desc    Get friends request for a user
   * @route   GET /api/v1/friendship/friends-request
   * @access  Private
   */
  router.get(
    '/friends-request',
    authenticate,
    asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;

      // Get user friends request
      const friendsRequest = await friendshipUsecase.getUserFriendsRequest(
        userId
      );

      res.status(200).json({
        message: 'Friends request retrieved successfully',
        friendsRequest,
      });
    })
  );

  /**
   * @desc    Update friendship status
   * @route   PUT /api/v1/friendship/:requesterId/status
   * @access  Private
   */
  router.put(
    '/:requesterId/status',
    authenticate,
    validateRequest(UpdateFriendshipRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { status } = req.body;
      const requesterId = Number(req.params.requesterId);
      const addresseeId = (req as RequestWithUser).user.id;

      // Check if addressee user exist
      const user = await userUsecase.getUserById(requesterId);
      if (!user) {
        return next(new ApiError('User with this id does not exist', 404));
      }

      // Check if there is already a request between them
      const freindship = await friendshipUsecase.getFriendshipRequest(
        requesterId,
        addresseeId
      );
      if (!freindship) {
        return next(
          new ApiError('There no friendship request between you and him!', 404)
        );
      } else if (freindship.status === 'accepted') {
        return next(new ApiError('You already friends!', 409));
      } else {
        // Check if the logged in user is the addressee user
        if (freindship.addresseeId !== addresseeId) {
          return next(
            new ApiError(
              'You are not authorized to update this request status!',
              403
            )
          );
        }
      }

      // Check if status id "accepted" then update , else id "declined" just delete
      if (status === 'accepted') {
        await friendshipUsecase.updateFriendshipStatusToAccepted(
          requesterId,
          addresseeId
        );
      } else {
        await friendshipUsecase.deleteFriendship(requesterId, addresseeId);
      }

      res
        .status(200)
        .json({ message: `Frendship request ${status} successfully` });
    })
  );

  /**
   * @desc    Unfriend
   * @route   DELETE /api/v1/friendship/:userId/friends
   * @access  Private
   */
  router.delete(
    '/:userId/friends',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = Number(req.params.userId);
      const loggedUserId = (req as RequestWithUser).user.id;

      // Check if user exist
      const user = await userUsecase.getUserById(userId);
      if (!user) {
        return next(new ApiError('User with this does not exist', 404));
      }

      // Check if you are friends
      const freindship = await friendshipUsecase.getFriendshipRequest(
        userId,
        loggedUserId
      );
      if (!freindship) {
        return next(new ApiError('You are not friends!', 409));
      }

      // Delete friendship
      await friendshipUsecase.deleteFriendship(userId, loggedUserId);

      res.status(200).json({ message: 'Friendship deleted successfully' });
    })
  );

  return router;
}
