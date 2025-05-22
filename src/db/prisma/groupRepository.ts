import { PrismaClient } from '@prisma/client';

import { Group } from '@/core/entitys/group.entity';
import { IGroupRepository } from '@/core/interfaces/groupRepository.interface';

export class GroupRepository implements IGroupRepository {
  constructor(private prisma: PrismaClient) {}

  async createGroup(
    group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    // Create Group
    const createdGroup = await this.prisma.group.create({
      data: {
        name: group.name,
        description: group.description,
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

  async getGroupById(id: number): Promise<Group | null> {
    const group = await this.prisma.group.findUnique({
      where: {
        id,
      },
    });

    return group;
  }

  async updateGroup(
    id: number,
    group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Group> {
    const updatedGroup = await this.prisma.group.update({
      where: {
        id,
      },
      data: {
        name: group.name,
        description: group.description,
      },
    });

    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<void> {
    await this.prisma.group.delete({
      where: {
        id,
      },
    });
  }
}
