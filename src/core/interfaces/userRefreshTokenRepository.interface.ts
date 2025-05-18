import { UserRefreshToken } from '@/core/entitys/userRefreshToken.entity';

export interface IUserRefreshTokenRepository {
  insertUserRefreshToken(userId: number, refreshToken: string): Promise<void>;

  getByUserIdAndToken(
    userId: number,
    refreshToken: string
  ): Promise<UserRefreshToken | null>;

  deleteUserRefreshTokenByUserID(userId: number): Promise<void>;

  deleteUserRefreshTokenByUserIDAndRefreshToken(
    userId: number,
    refreshToken: string
  ): Promise<void>;
}
