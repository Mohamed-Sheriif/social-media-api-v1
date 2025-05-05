import { User } from '../entitys/user.entity';

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

  updateUserPassword(id: number, newPassword: string): Promise<void>;

  deleteUser(id: number): Promise<void>;
}
