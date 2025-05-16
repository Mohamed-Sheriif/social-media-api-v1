import { PrismaClient } from '@prisma/client';
import { UserRefreshToken } from '@/core/entitys/userRefreshToken.entity';
import { IUserRefreshTokenRepository } from '@/core/interfaces/userRefreshTokenRepository.interface';

export class UserRefreshTokenRepository implements IUserRefreshTokenRepository {
  constructor(private prisma: PrismaClient) {}

  async insertUserRefreshToken(
    userId: number,
    refreshToken: string
  ): Promise<void> {
    await this.prisma.userRefreshToken.create({
      data: {
        userId,
        refreshToken,
      },
    });
  }

  async getByUserIdAndToken(
    userId: number,
    refreshToken: string
  ): Promise<UserRefreshToken | null> {
    const userRefreshToken = await this.prisma.userRefreshToken.findFirst({
      where: {
        userId,
        refreshToken,
      },
    });

    return userRefreshToken;
  }

  async deleteUserRefreshToken(userId: number): Promise<void> {
    await this.prisma.userRefreshToken.deleteMany({
      where: {
        userId,
      },
    });
  }
}
