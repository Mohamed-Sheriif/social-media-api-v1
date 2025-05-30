import { UserRefreshToken } from '@/core/entitys/userRefreshToken.entity';
import { IUserRefreshTokenRepository } from '@/core/interfaces/userRefreshTokenRepository.interface';

export class UserRefreshTokenUseCase {
  constructor(
    private userRefreshTokenRepository: IUserRefreshTokenRepository
  ) {}

  async createUserRefreshToken(
    userId: number,
    refreshToken: string
  ): Promise<void> {
    const userRefreshTokenId =
      await this.userRefreshTokenRepository.insertUserRefreshToken(
        userId,
        refreshToken
      );
    return userRefreshTokenId;
  }

  async getUserRefreshTokenByUserId(
    userId: number,
    refreshToken: string
  ): Promise<UserRefreshToken | null> {
    const userRefreshToken =
      await this.userRefreshTokenRepository.getByUserIdAndToken(
        userId,
        refreshToken
      );
    return userRefreshToken;
  }

  async deleteUserRefreshTokenByUserID(userId: number): Promise<void> {
    await this.userRefreshTokenRepository.deleteUserRefreshTokenByUserID(
      userId
    );
  }

  async deleteUserRefreshTokenByUserIDAndRefreshToken(
    userId: number,
    refreshToken: string
  ): Promise<void> {
    await this.userRefreshTokenRepository.deleteUserRefreshTokenByUserIDAndRefreshToken(
      userId,
      refreshToken
    );
  }
}
