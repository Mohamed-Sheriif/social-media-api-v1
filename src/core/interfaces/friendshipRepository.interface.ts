import { Friendship } from '@/core/entitys/friendship.entity';

export interface IFriendshipRepository {
  sendFriendRequest(requesterId: number, addresseeId: number): Promise<number>;

  getFriendshipRequest(
    requesterId: number,
    addresseeId: number
  ): Promise<Friendship | null>;

  updateFriendshipStatusToAccepted(
    requesterId: number,
    addresseeId: number
  ): Promise<void>;

  deleteFriendship(requesterId: number, addresseeId: number): Promise<void>;
}
