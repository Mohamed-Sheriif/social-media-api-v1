export class Comment {
  id: number;
  userId: number;
  postId: number;
  parentId: number | null;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  replies: {
    id: number;
    userId: number;
    content: string;
    updatedAt: Date;
  }[];
}
