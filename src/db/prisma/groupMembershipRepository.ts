import { PrismaClient } from '@prisma/client';

import { GroupMembership } from '@/core/entitys/groupMembership.entity';
import { IGroupMembershipRepository } from '@/core/interfaces/groupMembershipRepository.interface';

export class GroupMembershipRepository implements IGroupMembershipRepository {
  constructor(private prisma: PrismaClient) {}

  async addUserToGroup(
    groupMembership: Omit<GroupMembership, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    await this.prisma.groupMembership.create({
      data: {
        userId: groupMembership.userId,
        groupId: groupMembership.groupId,
        role: groupMembership.role,
        status: groupMembership.status,
      },
    });
  }

  async getGroupMemberByUserId(userId: number): Promise<GroupMembership[]> {
    const groupMembers = await this.prisma.groupMembership.findMany({
      where: {
        userId,
        status: 'accepted',
      },
    });

    return groupMembers;
  }

  async getGroupMembershipByGroupId(groupId: number): Promise<any> {
    const groupMembers = await this.prisma.groupMembership.findMany({
      where: {
        groupId,
        status: 'accepted',
      },
      select: {
        userId: true,
        user: {
          select: {
            username: true,
          },
        },
        role: true,
      },
      orderBy: {
        role: 'asc',
      },
    });

    return groupMembers;
  }

  async getGroupMembershipByGroupIdAndUserId(
    groupId: number,
    userId: number
  ): Promise<GroupMembership | null> {
    const groupMembership = await this.prisma.groupMembership.findUnique({
      where: {
        userId_groupId: {
          userId,
          groupId,
        },
      },
    });

    return groupMembership;
  }

  async getGroupRequests(groupId: number): Promise<any> {
    const groupRequests = await this.prisma.groupMembership.findMany({
      where: {
        groupId,
        status: 'pending',
      },
      select: {
        userId: true,
        user: {
          select: {
            username: true,
          },
        },
        status: true,
      },
    });

    return groupRequests;
  }

  async requestToJoinGroup(userId: number, groupId: number): Promise<number> {
    const request = await this.prisma.groupMembership.create({
      data: {
        userId,
        groupId,
        status: 'pending',
        role: 'member',
      },
    });

    return request.id;
  }
}
