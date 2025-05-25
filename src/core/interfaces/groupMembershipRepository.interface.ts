import { GroupMembership } from '@/core/entitys/groupMembership.entity';

export interface IGroupMembershipRepository {
  addUserToGroup(
    groupMembership: Omit<GroupMembership, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void>;

  getGroupMemberByUserId(userId: number): Promise<GroupMembership[]>;

  getGroupMembershipByGroupId(groupId: number): Promise<GroupMembership[]>;

  getGroupMembershipByGroupIdAndUserId(
    groupId: number,
    userId: number
  ): Promise<GroupMembership | null>;
}
