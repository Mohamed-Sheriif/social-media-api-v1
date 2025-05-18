export class Post {
  id: number;
  userId: number;
  content: string | null;
  mediaUrl: string[];
  isPublic: Boolean | null;
  createdAt: Date;
  updatedAt: Date;
}
