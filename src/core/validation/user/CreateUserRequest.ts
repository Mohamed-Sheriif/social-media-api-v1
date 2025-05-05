import { User } from '@/core/entitys/user.entity';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  Matches,
  IsEmail,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserRequest extends User {
  @IsString()
  @IsNotEmpty()
  @Matches(/^\S+$/, { message: 'Username cannot contain spaces' })
  override username: string;

  @IsString()
  @IsNotEmpty()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  override email: string;

  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(5, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  @Matches(/(?=.*[A-Z])/, {
    message: 'Password must contain at least one uppercase letter',
  })
  @Matches(/(?=.*\d)/, {
    message: 'Password must contain at least one number',
  })
  @Matches(/(?=.*[!@#$%^&*])/, {
    message: 'Password must contain at least one special character',
  })
  override password: string;

  @IsString()
  @IsOptional()
  override fullName: string | null;

  @IsString()
  @IsOptional()
  override bio: string | null;

  @IsString()
  @IsOptional()
  override avatarUrl: string | null;

  @IsString()
  @IsOptional()
  override isVerified: boolean;
}
