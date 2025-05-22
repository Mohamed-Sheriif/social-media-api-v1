import { GroupMembership } from '@/core/entitys/groupMembership.entity';
import { IGroupMembershipRepository } from '@/core/interfaces/groupMembershipRepository.interface';

export class GroupMembershipUseCase {
  constructor(private groupMembershipRepository: IGroupMembershipRepository) {}

  async addUserToGroup(
    groupMembership: Omit<GroupMembership, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    await this.groupMembershipRepository.addUserToGroup(groupMembership);
  }

  async getGroupMembershipByGroupIdAndUserId(
    groupId: number,
    userId: number
  ): Promise<GroupMembership | null> {
    const groupMembership =
      await this.groupMembershipRepository.getGroupMembershipByGroupIdAndUserId(
        groupId,
        userId
      );

    return groupMembership;
  }
}
