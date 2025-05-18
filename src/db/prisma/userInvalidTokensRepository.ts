import { PrismaClient } from '@prisma/client';
import { UserInvalidTokens } from '@/core/entitys/userInvalidTokens.entity';
import { IUserInvalidTokens } from '@/core/interfaces/userInvalidTokensRepository.interface';

export class UserInvalidTokensRepository implements IUserInvalidTokens {
  constructor(private prisma: PrismaClient) {}

  async insertToken(
    userId: number,
    accessToken: string,
    expirationTime: string
  ): Promise<void> {
    await this.prisma.userInvalidToken.create({
      data: {
        userId,
        accessToken,
        expirationTime,
      },
    });
  }
  async getInvalidToken(
    accessToken: string
  ): Promise<UserInvalidTokens | null> {
    const userInvalidToken = await this.prisma.userInvalidToken.findFirst({
      where: {
        accessToken,
      },
    });

    return userInvalidToken;
  }
}
