import { Group } from '@/core/entitys/group.entity';
import { IGroupRepository } from '@/core/interfaces/groupRepository.interface';

export class GroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async createGroup(
    group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number> {
    const createdGroupId = await this.groupRepository.createGroup(group);

    return createdGroupId;
  }

  async getGroupByName(name: string): Promise<Group | null> {
    const group = await this.groupRepository.getGroupByName(name);

    return group;
  }

  async getGroupById(id: number): Promise<Group | null> {
    const groupMembership = await this.groupRepository.getGroupById(id);

    return groupMembership;
  }

  async updateGroup(
    id: number,
    group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Group> {
    const updatedGroup = await this.groupRepository.updateGroup(id, group);

    return updatedGroup;
  }

  async deleteGroup(id: number): Promise<void> {
    await this.groupRepository.deleteGroup(id);
  }
}
