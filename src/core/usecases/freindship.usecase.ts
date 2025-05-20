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
}
