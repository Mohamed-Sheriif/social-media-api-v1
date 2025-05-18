import { UserInvalidTokens } from '@/core/entitys/userInvalidTokens.entity';

export interface IUserInvalidTokens {
  insertToken(
    userId: number,
    accessToken: string,
    expirationTime: string
  ): Promise<void>;

  getInvalidToken(accessToken: string): Promise<UserInvalidTokens | null>;
}
