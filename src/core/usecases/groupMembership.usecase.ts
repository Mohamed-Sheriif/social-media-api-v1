import { GroupMembership } from '@/core/entitys/groupMembership.entity';
import { IGroupMembershipRepository } from '@/core/interfaces/groupMembershipRepository.interface';

export class GroupMembershipUseCase {
  constructor(private groupMembershipRepository: IGroupMembershipRepository) {}

  async addUserToGroup(
    groupMembership: Omit<GroupMembership, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<void> {
    await this.groupMembershipRepository.addUserToGroup(groupMembership);
  }

  async getGroupMemberByUserId(userId: number): Promise<GroupMembership[]> {
    const groupMembers =
      await this.groupMembershipRepository.getGroupMemberByUserId(userId);

    return groupMembers;
  }

  async getGroupMembershipByGroupId(
    groupId: number
  ): Promise<GroupMembership[]> {
    const groupMembers =
      await this.groupMembershipRepository.getGroupMembershipByGroupId(groupId);

    return groupMembers;
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

  async getGroupRequests(groupId: number): Promise<any> {
    const groupRequests = await this.groupMembershipRepository.getGroupRequests(
      groupId
    );

    return groupRequests;
  }

  async getGroupRequestByRequestId(
    requestId: number
  ): Promise<GroupMembership | null> {
    const request =
      await this.groupMembershipRepository.getGroupRequestByRequestId(
        requestId
      );

    return request;
  }

  async requestToJoinGroup(userId: number, groupId: number): Promise<number> {
    const requestId = await this.groupMembershipRepository.requestToJoinGroup(
      userId,
      groupId
    );

    return requestId;
  }

  async approveGroupRequest(requestId: number): Promise<void> {
    await this.groupMembershipRepository.approveGroupRequest(requestId);
  }

  async deleteGroupRequestByRequestId(requestId: number): Promise<void> {
    await this.groupMembershipRepository.deleteGroupRequestByRequestId(
      requestId
    );
  }

  async leaveGroup(userId: number, groupId: number): Promise<void> {
    await this.groupMembershipRepository.leaveGroup(userId, groupId);
  }
}
