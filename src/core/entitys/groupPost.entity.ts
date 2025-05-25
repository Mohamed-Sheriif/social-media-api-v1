export class GroupPost {
  id: number;
  groupId: number;
  userId: number;
  content: string;
  mediaUrl: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
