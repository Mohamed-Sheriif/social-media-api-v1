import { User } from '../entitys/user.entity';
import { IUserRepository } from '../interfaces/userRepository.interface';

export class UserUseCase {
  constructor(private userRepository: IUserRepository) {}

  createUser(
    username: string,
    email: string,
    password: string
  ): Promise<number> {
    const userId = this.userRepository.createUser(username, email, password);
    return userId;
  }

  getUserByEmail(email: string): Promise<User | null> {
    const user = this.userRepository.getUserByEmail(email);
    return user;
  }
}
