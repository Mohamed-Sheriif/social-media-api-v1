import { User } from '@/core/entitys/user.entity';
import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateUserRequest extends User {
  @IsString()
  @MinLength(3, {
    message: 'Username must be at least 3 characters long',
  })
  @MaxLength(20, {
    message: 'Username must be at most 20 characters long',
  })
  @IsOptional()
  override fullName: string | null;

  @IsString()
  @MinLength(3, {
    message: 'Username must be at least 3 characters long',
  })
  @MaxLength(20, {
    message: 'Username must be at most 20 characters long',
  })
  @IsOptional()
  override bio: string | null;

  @IsString()
  @IsOptional()
  override avatarUrl: string | null;
}
