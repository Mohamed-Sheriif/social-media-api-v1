import { Comment } from '@/core/entitys/comment.entity';
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsNumber,
} from 'class-validator';

export class CreateCommentRequest extends Comment {
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(100, { message: 'Content must not exceed 20 characters' })
  override content: string;

  @IsNotEmpty({ message: 'PostId is required' })
  @IsNumber()
  override postId: number;

  @IsOptional()
  @IsNumber()
  override parentId: number | null;
}
