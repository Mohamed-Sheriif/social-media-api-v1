import { PrismaClient } from '@prisma/client';
import { User } from '@/core/entitys/user.entity';
import { IUserRepository } from '@/core/interfaces/userRepository.interface';

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async createUser(
    username: string,
    email: string,
    password: string
  ): Promise<number> {
    const createdUser = await this.prisma.user.create({
      data: {
        username,
        email,
        password,
        fullName: null,
        bio: null,
        avatarUrl: null,
        isVerified: null,
      },
    });

    return createdUser.id;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany();

    return users;
  }

  async updateUser(
    id: number,
    fullName: string,
    bio: string,
    avatarUrl: string
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        fullName,
        bio,
        avatarUrl,
      },
    });
  }

  async updateUserPassword(id: number, newPassword: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        password: newPassword,
      },
    });
  }

  async deleteUser(id: number): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}
