import { User } from '@/core/entitys/user.entity';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class LoginRequest extends User {
  @IsString({ message: 'Email must be a string' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  override email: string;

  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  override password: string;
}
