import { Request, Response, NextFunction, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

import { ApiError } from '@/core/base/apiError';
import { authenticate } from '@/api/v1/middleware/authenticate';
import { RequestWithUser } from '@/api/v1/helpers/types';
import { validateRequest } from '@/api/v1/middleware/validate';
import { CreateGroupRequest } from '@/core/validation/group/CreateGroupRequest';
import { CreateGroupPostRequest } from '@/core/validation/group/post/CreateGroupPostRequest';
import { GroupUseCase } from '@/core/usecases/group.usecase';
import { GroupRepository } from '@/db/prisma/groupRepository';
import { GroupMembershipUseCase } from '@/core/usecases/groupMembership.usecase';
import { GroupMembershipRepository } from '@/db/prisma/groupMembershipRepository';
import { GroupPostUseCase } from '@/core/usecases/groupPost.usecase';
import { GroupPostRepository } from '@/db/prisma/groupPostRepository';

export function GroupRoute(prisma: PrismaClient): Router {
  const router = Router();
  const groupUsecase = new GroupUseCase(new GroupRepository(prisma));
  const groupMembershipUsecase = new GroupMembershipUseCase(
    new GroupMembershipRepository(prisma)
  );
  const groupPostUsecase = new GroupPostUseCase(
    new GroupPostRepository(prisma)
  );

  // GROUPS
  /**
   * @desc    Create new group
   * @route   POST /api/v1/group
   * @access  Private
   */
  router.post(
    '/',
    authenticate,
    validateRequest(CreateGroupRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name, description } = req.body;
      const userId = (req as RequestWithUser).user.id;

      // Check if group name already exist
      const group = await groupUsecase.getGroupByName(name);
      if (group) {
        return next(new ApiError('Group name already exist!', 409));
      }

      // Create group
      const groupId = await groupUsecase.createGroup({
        name,
        description,
      });

      // Add user to this group and make him the admin
      await groupMembershipUsecase.addUserToGroup({
        userId,
        groupId,
        role: 'admin',
        status: 'accepted',
      });

      res.status(201).json({ message: 'Group created successfully', groupId });
    })
  );

  /**
   * @desc    Get user groups
   * @route   GET /api/v1/group
   * @access  Private
   */
  router.get(
    '/',
    authenticate,
    asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;

      // Get GroupMembers by user id
      const groupMembers = await groupMembershipUsecase.getGroupMemberByUserId(
        userId
      );
      if (groupMembers.length === 0) {
        res
          .status(200)
          .json({ message: 'groups retrevied successfully', groups: [] });
      }

      const groupsId = groupMembers.map(groupMember => {
        return groupMember.groupId;
      });

      // Get groups by id
      const groups = await groupUsecase.getGroupsById(groupsId);

      res
        .status(200)
        .json({ message: 'groups retrevied successfully', groups });
    })
  );

  /**
   * @desc    Get group
   * @route   GET /api/v1/group/:id
   * @access  Private
   */
  router.get(
    '/:id',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const groupId = Number(req.params.id);
      const userId = (req as RequestWithUser).user.id;

      // Get group by id
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 409));
      }

      // Get GroupMembers by group id
      const groupMembers =
        await groupMembershipUsecase.getGroupMembershipByGroupId(groupId);

      // return group joined with members
      const groupWithMember = {
        ...group,
        members: groupMembers,
      };

      res.status(200).json({
        message: 'group retrevied successfully',
        group: groupWithMember,
      });
    })
  );

  /**
   * @desc    Get group members
   * @route   GET /api/v1/group/:id/members
   * @access  Private
   */
  router.get(
    '/:id/members',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const groupId = Number(req.params.id);
      const userId = (req as RequestWithUser).user.id;

      // Get group by id
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 409));
      }

      // Get GroupMembers by group id
      const groupMembers =
        await groupMembershipUsecase.getGroupMembershipByGroupId(groupId);

      res.status(200).json({
        message: 'group members retrevied successfully',
        members: groupMembers,
      });
    })
  );

  /**
   * @desc    Update group
   * @route   PUT /api/v1/group/:id
   * @access  Private
   */
  router.put(
    '/:id',
    authenticate,
    validateRequest(CreateGroupRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { name, description } = req.body;
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group and is the admin
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 409));
      } else if (
        !(
          groupMembership.role == 'admin' &&
          groupMembership.status == 'accepted'
        )
      ) {
        return next(
          new ApiError('You are not authorized to update this group!', 403)
        );
      }

      // Check if group name already exist
      const groupExist = await groupUsecase.getGroupByName(name);
      if (groupExist) {
        return next(new ApiError('Group name already exist!', 409));
      }

      // Update group
      const updatedGroup = await groupUsecase.updateGroup(groupId, {
        name,
        description,
      });

      res
        .status(200)
        .json({ message: 'Group updated successfully', group: updatedGroup });
    })
  );

  /**
   * @desc    Delete group
   * @route   DELETE /api/v1/group/:id
   * @access  Private
   */
  router.delete(
    '/:id',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group and is the admin
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 409));
      } else if (
        !(
          groupMembership.role == 'admin' &&
          groupMembership.status == 'accepted'
        )
      ) {
        return next(
          new ApiError('You are not authorized to update this group!', 403)
        );
      }

      // Delete group
      await groupUsecase.deleteGroup(groupId);

      res.status(200).json({ message: 'Group deleted successfully' });
    })
  );

  // GROUP MEMBERS
  /**
   * @desc    Request to join group
   * @route   POST /api/v1/group/:id/join
   * @access  Private
   */
  router.post(
    '/:id/join',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group or already requested before
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (groupMembership) {
        if (groupMembership.status == 'accepted') {
          return next(new ApiError('You already member in this group!', 409));
        } else if (groupMembership.status == 'pending') {
          return next(new ApiError('You already requested before!', 409));
        }
      }

      // Inster in groupMember record with status pending
      const requestId = await groupMembershipUsecase.requestToJoinGroup(
        userId,
        groupId
      );

      res
        .status(200)
        .json({ message: 'Request created successfully', requestId });
    })
  );

  /**
   * @desc    Approve group request
   * @route   PUT /api/v1/group/:id/join/:requestId/approve
   * @access  Private
   */
  router.put(
    '/:id/join/:requestId/approve',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);
      const requestId = Number(req.params.requestId);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group and is the admin
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 403));
      } else if (
        !(
          groupMembership.role == 'admin' &&
          groupMembership.status == 'accepted'
        )
      ) {
        return next(
          new ApiError(
            'You are not authorized to update requests of this group!',
            403
          )
        );
      }

      const request = await groupMembershipUsecase.getGroupRequestByRequestId(
        requestId
      );
      if (!request) {
        return next(new ApiError('request not found!', 404));
      }

      // Approve group request
      await groupMembershipUsecase.approveGroupRequest(requestId);

      res.status(200).json({
        message: 'Group request approved successfully',
      });
    })
  );

  /**
   * @desc    Decline group request
   * @route   PUT /api/v1/group/:id/join/:requestId/decline
   * @access  Private
   */
  router.put(
    '/:id/join/:requestId/decline',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);
      const requestId = Number(req.params.requestId);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group and is the admin
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 403));
      } else if (
        !(
          groupMembership.role == 'admin' &&
          groupMembership.status == 'accepted'
        )
      ) {
        return next(
          new ApiError(
            'You are not authorized to update requests of this group!',
            403
          )
        );
      }

      const request = await groupMembershipUsecase.getGroupRequestByRequestId(
        requestId
      );
      if (!request) {
        return next(new ApiError('request not found!', 404));
      }

      // delete group request
      await groupMembershipUsecase.deleteGroupRequestByRequestId(requestId);

      res.status(200).json({
        message: 'Group request declined successfully',
      });
    })
  );

  /**
   * @desc    Leave group
   * @route   DELETE /api/v1/group/:id/leave
   * @access  Private
   */
  router.delete(
    '/:id/leave',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 409));
      }

      // delete group request
      await groupMembershipUsecase.leaveGroup(userId, groupId);

      res.status(200).json({
        message: 'Group leaved successfully',
      });
    })
  );

  /**
   * @desc    Get group requests
   * @route   GET /api/v1/group/:id/request
   * @access  Private
   */
  router.get(
    '/:id/request',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group and is the admin
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 403));
      } else if (
        !(
          groupMembership.role == 'admin' &&
          groupMembership.status == 'accepted'
        )
      ) {
        return next(
          new ApiError(
            'You are not authorized to view requests of this group!',
            403
          )
        );
      }

      // Get all request of this group
      const groupRequest = await groupMembershipUsecase.getGroupRequests(
        groupId
      );

      res.status(200).json({
        message: 'Group requests retrieved successfully',
        groupRequest,
      });
    })
  );

  /**
   * @desc    Approve group request
   * @route   GET /api/v1/group/:id/request
   * @access  Private
   */
  router.get(
    '/:id/request',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group and is the admin
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 403));
      } else if (
        !(
          groupMembership.role == 'admin' &&
          groupMembership.status == 'accepted'
        )
      ) {
        return next(
          new ApiError(
            'You are not authorized to view requests of this group!',
            403
          )
        );
      }

      // Get all request of this group
      const groupRequest = await groupMembershipUsecase.getGroupRequests(
        groupId
      );

      res.status(200).json({
        message: 'Group requests retrieved successfully',
        groupRequest,
      });
    })
  );

  // GROUP POSTS
  /**
   * @desc    Create new group post
   * @route   POST /api/v1/group/:id/post
   * @access  Private
   */
  router.post(
    '/:id/post',
    authenticate,
    validateRequest(CreateGroupPostRequest),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const { content, mediaUrl } = req.body;
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership || groupMembership.status !== 'accepted') {
        return next(new ApiError('You are not member at this group!', 409));
      }

      // Create post
      let groupPostId;
      if (groupMembership.role === 'admin') {
        groupPostId = await groupPostUsecase.createGroupPost({
          userId,
          groupId,
          content,
          mediaUrl,
          status: 'accepted',
        });
      } else {
        groupPostId = await groupPostUsecase.createGroupPost({
          userId,
          groupId,
          content,
          mediaUrl,
          status: 'pending',
        });
      }

      res.status(200).json({
        message: 'Group post created successfully',
        groupPostId,
      });
    })
  );

  /**
   * @desc    Get group posts
   * @route   GET /api/v1/group/:id/post
   * @access  Private
   */
  router.get(
    '/:id/post',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership || groupMembership.status !== 'accepted') {
        return next(new ApiError('You are not member at this group!', 409));
      }

      const groupPosts = await groupPostUsecase.getGroupApprovedPosts(groupId);

      res
        .status(200)
        .json({ message: 'Group posts retrieved successflly', groupPosts });
    })
  );

  /**
   * @desc    Get group pending posts
   * @route   PUT /api/v1/group/:id/post/pending
   * @access  Private
   */
  router.get(
    '/:id/post/pending',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group and is the admin
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 403));
      } else if (
        !(
          groupMembership.role == 'admin' &&
          groupMembership.status == 'accepted'
        )
      ) {
        return next(
          new ApiError(
            'You are not authorized to update requests of this group!',
            403
          )
        );
      }

      const groupPosts = await groupPostUsecase.getGroupPendingPosts(groupId);

      res.status(200).json({
        message: 'Group pending posts retrieved successflly',
        groupPosts,
      });
    })
  );

  /**
   * @desc    Approve group post request
   * @route   DELETE /api/v1/group/:id/post/:postId/approve
   * @access  Private
   */
  router.put(
    '/:id/post/:postId/approve',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);
      const postId = Number(req.params.postId);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group and is the admin
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 403));
      } else if (
        !(
          groupMembership.role == 'admin' &&
          groupMembership.status == 'accepted'
        )
      ) {
        return next(
          new ApiError(
            'You are not authorized to update requests of this group!',
            403
          )
        );
      }

      // Check if group post exist
      const groupPost = await groupPostUsecase.getGroupPostById(postId);
      if (!groupPost) {
        return next(new ApiError('Group post not found!', 404));
      }

      // Approve group post request
      await groupPostUsecase.approveGroupPost(postId);

      res.status(200).json({
        message: 'Group post request approved successfully',
      });
    })
  );

  /**
   * @desc    Decline group post request
   * @route   DELETE /api/v1/group/:id/post/:postId/decline
   * @access  Private
   */
  router.put(
    '/:id/post/:postId/decline',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);
      const postId = Number(req.params.postId);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group and is the admin
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 403));
      } else if (
        !(
          groupMembership.role == 'admin' &&
          groupMembership.status == 'accepted'
        )
      ) {
        return next(
          new ApiError(
            'You are not authorized to update requests of this group!',
            403
          )
        );
      }

      // Check if group post exist
      const groupPost = await groupPostUsecase.getGroupPostById(postId);
      if (!groupPost) {
        return next(new ApiError('Group post not found!', 404));
      }

      // Delete group post request
      await groupPostUsecase.deleteGroupPost(postId);

      res.status(200).json({
        message: 'Group post request declined successfully',
      });
    })
  );

  /**
   * @desc    Delete group post request
   * @route   DELETE /api/v1/group/:id/post/:postId
   * @access  Private
   */
  router.delete(
    '/:id/post/:postId',
    authenticate,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      const userId = (req as RequestWithUser).user.id;
      const groupId = Number(req.params.id);
      const postId = Number(req.params.postId);

      // Check if group exist
      const group = await groupUsecase.getGroupById(groupId);
      if (!group) {
        return next(new ApiError('Group not found!', 404));
      }

      // Check if the user in this group and is the admin
      const groupMembership =
        await groupMembershipUsecase.getGroupMembershipByGroupIdAndUserId(
          groupId,
          userId
        );
      if (!groupMembership) {
        return next(new ApiError('You are not member at this group!', 403));
      } else if (
        !(
          groupMembership.role == 'admin' &&
          groupMembership.status == 'accepted'
        ) ||
        groupMembership.status !== 'accepted'
      ) {
        return next(
          new ApiError(
            'You are not authorized to update requests of this group!',
            403
          )
        );
      }

      // Check if group post exist
      const groupPost = await groupPostUsecase.getGroupPostById(postId);
      if (!groupPost) {
        return next(new ApiError('Group post not found!', 404));
      }

      // Delete group post request
      await groupPostUsecase.deleteGroupPost(postId);

      res.status(200).json({
        message: 'Group post deleted successfully',
      });
    })
  );

  return router;
}
