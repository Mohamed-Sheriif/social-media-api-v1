//import fs from 'fs';

import express, { Application } from 'express';
//import swaggerUi from 'swagger-ui-express';

import { ApiError } from '@/core/base/apiError';
import { errorHandler } from '@/api/v1/middleware/errorHandler';
import { logRequests } from '@/api/v1/middleware/logRequests';
import Prisma from './config/prisma';

import * as dotenv from 'dotenv';
dotenv.config();

export const app: Application = express();

// Swagger UI setup
// const swaggerFile = `${process.cwd()}/src/api/v1/docs/index.json`;
// const swaggerData = fs.readFileSync(swaggerFile, 'utf8');
// const swaggerJSON = JSON.parse(swaggerData);

// Middleware
app.use(logRequests);
app.use(express.json());

// Routes
//app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerJSON));

// Not Found Route
app.all('*', (req, _res, next) => {
  next(new ApiError(`Can't find ${req.originalUrl} on this server!`, 404));
});

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
