import { Friendship } from '@/core/entitys/friendship.entity';
import { IFriendshipRepository } from '@/core/interfaces/friendshipRepository.interface';

export class FriendshipUseCase {
  constructor(private friendshipRepository: IFriendshipRepository) {}

  async sendFriendRequest(
    requesterId: number,
    addresseeId: number
  ): Promise<number> {
    const friendshipId = await this.friendshipRepository.sendFriendRequest(
      requesterId,
      addresseeId
    );

    return friendshipId;
  }

  async getFriendshipRequest(
    requesterId: number,
    addresseeId: number
  ): Promise<Friendship | null> {
    const friendship = await this.friendshipRepository.getFriendshipRequest(
      requesterId,
      addresseeId
    );

    return friendship;
  }

  async getUserFriends(userId: number): Promise<Friendship[]> {
    const friends = await this.friendshipRepository.getUserFriends(userId);

    return friends;
  }

  async getUserFriendsRequest(userId: number): Promise<Friendship[]> {
    const friendsRequest =
      await this.friendshipRepository.getUserFriendsRequest(userId);

    return friendsRequest;
  }

  async updateFriendshipStatusToAccepted(
    requesterId: number,
    addresseeId: number
  ): Promise<void> {
    await this.friendshipRepository.updateFriendshipStatusToAccepted(
      requesterId,
      addresseeId
    );
  }

  async deleteFriendship(
    requesterId: number,
    addresseeId: number
  ): Promise<void> {
    await this.friendshipRepository.deleteFriendship(requesterId, addresseeId);
  }
}
