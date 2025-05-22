import { Group } from '@/core/entitys/group.entity';
import { IGroupRepository } from '@/core/interfaces/groupRepository.interface';

export class GroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async createGroup(
    userId: number,
    group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    const createdGroupId = await this.groupRepository.createGroup(
      userId,
      group
    );

    return createdGroupId;
  }

  async getGroupByName(name: string): Promise<Group | null> {
    const group = await this.groupRepository.getGroupByName(name);

    return group;
  }
}
