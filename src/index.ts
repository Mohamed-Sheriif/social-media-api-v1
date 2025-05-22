import fs from 'fs';

import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import passport from 'passport';
import session from 'express-session';

import { ApiError } from '@/core/base/apiError';
import { errorHandler } from '@/api/v1/middleware/errorHandler';
import { logRequests } from '@/api/v1/middleware/logRequests';
import Prisma from './config/prisma';
import '@/config/googleAuth';

// Imported Routes
import { UserRoute } from '@/api/v1/routes/user.router';
import { PostRoute } from '@/api/v1/routes/post.router';
import { CommentRoute } from '@/api/v1/routes/comment.router';
import { LikeRoute } from '@/api/v1/routes/like.router';
import { FriendshipRoute } from '@/api/v1/routes/friendship.router';
import { GroupRoute } from '@/api/v1/routes/group.router';

import * as dotenv from 'dotenv';
dotenv.config();

export const app: Application = express();

// Swagger UI setup
const swaggerFile = `${process.cwd()}/src/api/v1/docs/index.json`;
const swaggerData = fs.readFileSync(swaggerFile, 'utf8');
const swaggerJSON = JSON.parse(swaggerData);

// Middleware
app.use(logRequests);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJSON));
app.use('/api/v1/user', UserRoute(Prisma));
app.use('/api/v1/post', PostRoute(Prisma));
app.use('/api/v1/comment', CommentRoute(Prisma));
app.use('/api/v1/likes', LikeRoute(Prisma));
app.use('/api/v1/friendship', FriendshipRoute(Prisma));
app.use('/api/v1/group', GroupRoute(Prisma));

// Not Found Route
// app.all('*', (req, _res, next) => {
//   next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

// Glopal error handler middleware for express
app.use(errorHandler);

const port = process.env.Port || 3000;
const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Handle unhandled rejections outside express
process.on('unhandledRejection', (err: ApiError) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
