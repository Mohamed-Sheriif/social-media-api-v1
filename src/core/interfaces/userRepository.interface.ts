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
}
