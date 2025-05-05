import {
  IsString,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';

export class UpdateUserPasswordRequest {
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(5, { message: 'Password must be at least 8 characters long' })
  @MaxLength(32, { message: 'Password must not exceed 32 characters' })
  curruntPassword: string;

  @IsString()
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
  newPassword: string;
}
