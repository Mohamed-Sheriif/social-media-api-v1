import { Post } from '@/core/entitys/post.entity';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class CreatePostRequest extends Post {
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(200, { message: 'Content must not exceed 20 characters' })
  override content: string;

  @IsOptional()
  @IsString({ message: 'mediaUrl must be string' })
  override mediaUrl: string | null;

  @IsNotEmpty({ message: 'IsPublic is required' })
  @IsBoolean({ message: 'IsPublic should only contain true or false' })
  override isPublic: boolean;
}
