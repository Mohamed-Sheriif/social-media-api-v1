import { User } from '../entitys/user.entity';
import { IUserRepository } from '../interfaces/userRepository.interface';

export class UserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async createUser(
    username: string,
    email: string,
    password: string
  ): Promise<number> {
    const userId = await this.userRepository.createUser(
      username,
      email,
      password
    );
    return userId;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.getUserByEmail(email);
    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.getUserById(id);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.userRepository.getAllUsers();
    return users;
  }

  async updateUser(
    id: number,
    fullName: string,
    bio: string,
    avatarUrl: string
  ): Promise<void> {
    await this.userRepository.updateUser(id, fullName, bio, avatarUrl);
  }

  async updateUserTwoFASecretKey(id: number, secretKey: string): Promise<void> {
    await this.userRepository.updateUserTwoFASecretKey(id, secretKey);
  }

  async updateUserTwoFAEnabled(id: number, enabled: boolean): Promise<void> {
    await this.userRepository.updateUserTwoFAEnabled(id, enabled);
  }

  async updateUserPassword(id: number, newPassword: string): Promise<void> {
    await this.userRepository.updateUserPassword(id, newPassword);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.deleteUser(id);
  }

  async updateUserResetTokenInfo(
    id: number,
    hashedResetToken: string | null,
    passwordResetExpires: Date | null,
    passwordResetVerified: boolean | null
  ): Promise<void> {
    await this.userRepository.updateUserResetTokenInfo(
      id,
      hashedResetToken,
      passwordResetExpires,
      passwordResetVerified
    );
  }

  getUserByResetToken(hashedResetToken: string): Promise<User | null> {
    return this.userRepository.getUserByResetToken(hashedResetToken);
  }
}
