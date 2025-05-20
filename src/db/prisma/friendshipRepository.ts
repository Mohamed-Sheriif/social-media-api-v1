import { PrismaClient } from '@prisma/client';

import { Friendship } from '@/core/entitys/friendship.entity';
import { IFriendshipRepository } from '@/core/interfaces/friendshipRepository.interface';

export class FriendshipRepository implements IFriendshipRepository {
  constructor(private prisma: PrismaClient) {}

  async sendFriendRequest(
    requesterId: number,
    addresseeId: number
  ): Promise<number> {
    const friendship = await this.prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
      },
    });

    return friendship.id;
  }

  async getFriendshipRequest(
    requesterId: number,
    addresseeId: number
  ): Promise<Friendship | null> {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    });

    return friendship;
  }

  async updateFriendshipStatusToAccepted(
    requesterId: number,
    addresseeId: number
  ): Promise<void> {
    await this.prisma.friendship.update({
      where: {
        requesterId_addresseeId: {
          requesterId,
          addresseeId,
        },
      },
      data: {
        status: 'accepted',
      },
    });
  }

  async deleteFriendship(
    requesterId: number,
    addresseeId: number
  ): Promise<void> {
    await this.prisma.friendship.delete({
      where: {
        requesterId_addresseeId: {
          requesterId,
          addresseeId,
        },
      },
    });
  }
}
