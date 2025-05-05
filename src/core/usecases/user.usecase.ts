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
}
