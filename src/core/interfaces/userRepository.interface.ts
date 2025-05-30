import { User } from '@/core/entitys/user.entity';

export interface IUserRepository {
  createUser(
    username: string,
    email: string,
    password: string
  ): Promise<number>;

  getUserByEmail(email: string): Promise<User | null>;

  getUserById(id: number): Promise<User | null>;

  getAllUsers(): Promise<User[]>;

  updateUser(
    id: number,
    fullName: string,
    bio: string,
    avatarUrl: string
  ): Promise<void>;

  updateUserTwoFASecretKey(id: number, secretKey: string): Promise<void>;

  updateUserTwoFAEnabled(id: number, enabled: boolean): Promise<void>;

  updateUserPassword(id: number, newPassword: string): Promise<void>;

  deleteUser(id: number): Promise<void>;

  updateUserResetTokenInfo(
    id: number,
    hashedResetToken: string | null,
    passwordResetExpires: Date | null,
    passwordResetVerified: boolean | null
  ): Promise<void>;

  getUserByResetToken(hashedResetToken: string): Promise<User | null>;
}
