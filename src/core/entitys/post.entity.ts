export class Post {
  id: number;
  userId: number;
  content: string;
  mediaUrl: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}
