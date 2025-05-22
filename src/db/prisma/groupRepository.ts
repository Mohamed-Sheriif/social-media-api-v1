import { PrismaClient } from '@prisma/client';

import { Group } from '@/core/entitys/group.entity';
import { IGroupRepository } from '@/core/interfaces/groupRepository.interface';

export class GroupRepository implements IGroupRepository {
  constructor(private prisma: PrismaClient) {}

  async createGroup(
    userId: number,
    group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    // Create Group
    const createdGroup = await this.prisma.group.create({
      data: {
        name: group.name,
        description: group.description,
      },
    });

    // Create user group member and make him the admin
    await this.prisma.groupMembership.create({
      data: {
        userId,
        groupId: createdGroup.id,
        role: 'admin',
        status: 'accepted',
      },
    });

    return createdGroup.id;
  }

  async getGroupByName(name: string): Promise<Group | null> {
    const group = await this.prisma.group.findUnique({
      where: {
        name,
      },
    });

    return group;
  }
}
