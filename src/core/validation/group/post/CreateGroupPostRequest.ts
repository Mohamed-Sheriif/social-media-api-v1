import { GroupPost } from '@/core/entitys/groupPost.entity';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateGroupPostRequest extends GroupPost {
  @IsString({ message: 'Content must be a string' })
  @IsNotEmpty({ message: 'Content is required' })
  @MaxLength(200, { message: 'Content must not exceed 20 characters' })
  override content: string;

  @IsOptional()
  @IsString({ message: 'mediaUrl must be string' })
  override mediaUrl: string | null;
}
