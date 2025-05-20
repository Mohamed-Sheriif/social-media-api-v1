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

  async getUserFriends(userId: number): Promise<any> {
    const friends = await this.prisma.friendship.findMany({
      where: {
        OR: [{ requesterId: userId }, { addresseeId: userId }],
        status: 'accepted',
      },
      select: {
        id: true,
        requester: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
        addressee: {
          select: {
            username: true,
            avatarUrl: true,
          },
        },
        status: true,
      },
    });

    return friends;
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
