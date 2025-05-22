import { Group } from '@/core/entitys/group.entity';

export interface IGroupRepository {
  createGroup(
    group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<number>;

  getGroupById(id: number): Promise<Group | null>;

  getGroupByName(name: string): Promise<Group | null>;

  updateGroup(
    id: number,
    group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Group>;

  deleteGroup(id: number): Promise<void>;
}
