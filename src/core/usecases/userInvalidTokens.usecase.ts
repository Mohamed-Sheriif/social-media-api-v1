import { UserInvalidTokens } from '@/core/entitys/userInvalidTokens.entity';
import { IUserInvalidTokens } from '@/core/interfaces/userInvalidTokensRepository.interface';

export class UserInvalidTokensUseCase {
  constructor(private userInvalidTokensRepository: IUserInvalidTokens) {}

  async insertToken(
    userId: number,
    accessToken: string,
    expirationTime: string
  ): Promise<void> {
    await this.userInvalidTokensRepository.insertToken(
      userId,
      accessToken,
      expirationTime
    );
  }

  async getInvalidToken(
    accessToken: string
  ): Promise<UserInvalidTokens | null> {
    const userInvalidToken =
      await this.userInvalidTokensRepository.getInvalidToken(accessToken);

    return userInvalidToken;
  }
}
