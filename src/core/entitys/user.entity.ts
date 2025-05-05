export class User {
  id: number;
  username: string;
  email: string;
  password: string;
  fullName: string | null;
  bio: string | null;
  avatarUrl: string | null;
  isVerified: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}
