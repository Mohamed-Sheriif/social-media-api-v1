import { Request } from 'express';

export interface payloadData {
  id: number;
  userName: string;
  type: string;
}
export interface RequestWithUser extends Request {
  user: {
    id: number;
    userName: string;
  };
}
