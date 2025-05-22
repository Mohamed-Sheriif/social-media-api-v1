import { Group } from '@/core/entitys/group.entity';

export interface IGroupRepository {
  createGroup(
    userId: number,
    group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number>;

  getGroupByName(name: string): Promise<Group | null>;
}
