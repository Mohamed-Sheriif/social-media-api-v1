import { UserRefreshToken } from '@/core/entitys/userRefreshToken.entity';

export interface IUserRefreshTokenRepository {
  insertUserRefreshToken(userId: number, refreshToken: string): Promise<void>;

  getByUserIdAndToken(
    userId: number,
    refreshToken: string
  ): Promise<UserRefreshToken | null>;

  deleteUserRefreshToken(userId: number): Promise<void>;
}
