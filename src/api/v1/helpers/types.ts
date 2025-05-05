import { Request } from 'express';

export interface payloadData {
  id: number;
  userName: string;
  email: string;
}
export interface RequestWithUser extends Request {
  user: {
    id: number;
    username: string;
    email: string;
  };
}
