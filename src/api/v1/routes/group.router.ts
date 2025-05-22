import { Request, Response, NextFunction, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

import { ApiError } from '@/core/base/apiError';
import { authenticate } from '@/api/v1/middleware/authenticate';
import { RequestWithUser } from '@/api/v1/helpers/types';
import { validateRequest } from '@/api/v1/middleware/validate';
import { CreateGroupRequest } from '@/core/validation/group/CreateGroupRequest';
import { GroupUseCase } from '@/core/usecases/group.usecase';
import { GroupRepository } from '@/db/prisma/groupRepository';

export function GroupRoute(prisma: PrismaClient): Router {
  const router = Router();
  const groupUsecase = new GroupUseCase(new GroupRepository(prisma));

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
      const GroupId = await groupUsecase.createGroup(userId, {
        name,
        description,
      });

      res.status(201).json({ message: 'Group created successfully', GroupId });
    })
  );

  return router;
}
