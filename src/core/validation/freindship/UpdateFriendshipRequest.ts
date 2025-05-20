import { Friendship } from '@/core/entitys/friendship.entity';
import { IsString, IsNotEmpty, IsIn } from 'class-validator';

export class UpdateFriendshipRequest extends Friendship {
  @IsNotEmpty({ message: 'Ststus is required' })
  @IsString({ message: 'Status must be a string' })
  @IsIn(['accepted', 'declined'], {
    message: 'Status must be either accepted or declined',
  })
  override status: 'accepted' | 'declined';
}
