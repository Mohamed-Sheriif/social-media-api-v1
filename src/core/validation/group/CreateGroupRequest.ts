import { Group } from '@/core/entitys/group.entity';
import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateGroupRequest extends Group {
  @IsString({ message: 'Group name must be a string' })
  @IsNotEmpty({ message: 'Group name is required' })
  @MaxLength(100, { message: 'Group name must not exceed 20 characters' })
  override name: string;

  @IsOptional()
  @IsString({ message: 'Group description must be string' })
  override description: string | null;
}
