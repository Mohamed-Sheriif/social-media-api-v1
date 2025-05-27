# social-media-api-v1

This is a comprehensive social media API built with **Node.js**, **Express**, and **PostgreSQL**. It provides endpoints for managing users, authentication, posts, comments, likes, followers, notifications, and messaging.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Authentication and Authorization](#authentication-and-authorization)
- [Environment Variables](#environment-variables)
- [License](#license)

## Installation

1. Clone the repository:

   ```sh
   git clone git@github.com:Mohamed-Sheriif/social-media-api-v1.git
   cd social-media-api-v1
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in the root directory and add your environment variables (see [Environment Variables](#environment-variables)).

4. Start the server:

   ```sh
   npm run start:prod
   ```

## Usage

- The API will run on `http://localhost:3000` by default.
- Use tools like **Postman** or **Insomnia** to interact with the API endpoints.

## API Endpoints

### **Users**

- `GET /api/v1/user` - Get all users.
- `GET /api/v1/user/:id` - Get a user by ID.
- `PATCH /api/v1/user/:id` - Update a user by ID.
- `PATCH /api/v1/user/:id/password` - Update the logged-in user's password.
- `DELETE /api/v1/user/:id` - Delete a user by ID.

### **Authentication**

- `POST /api/v1/user/register` - Sign up a new user.
- `POST /api/v1/user/login` - Log in a user.
- `POST /api/v1/user/forgotPassword` - Request a password reset.
- `POST /api/v1/user/verifyResetCode` - Verify a password reset code.
- `POST /api/v1/user/resetPassword` - Reset a user's password.
- `POST /api/v1/user/refresh-token` - Request new refresh token.
- `POST /api/v1/user/logout` - Logout user.
- `POST /api/v1/user/logout-all` - Logout from all devices.

### **Google Authentication**

- `GET /api/v1/user/google` - Login with google.
- `GET /api/v1/user/google/callback` - Google OAuth callback.

### **Two-Factor Authentication (2FA)**

- `POST /api/v1/user/2fa/generate` - Generate a 2FA secret and QR code for the user.
- `POST /api/v1/user/2fa/verify` - Verify the 2FA code and enable 2FA for the user.
- `POST /api/v1/user/2fa/login` - Log in with 2FA (after providing username/password).

### **Posts**

- `POST /api/v1/post` - Create a new post.
- `GET /api/v1/post` - Get all posts.
- `GET /api/v1/post/:id` - Get a post by ID.
- `PATCH /api/v1/post/:id` - Update a post by ID.
- `DELETE /api/v1/post/:id` - Delete a post by ID.
- `GET /api/v1/post/user/:userId` - Get user posts.
- `PATCH /api/v1/post/:id/status` - Update post status.
- `GET /api/v1/post/:postId/comments` - Get post comments.
- `GET /api/v1/post/:postId/likes` - Get post likes.

### **Comments**

- `POST /api/v1/comment` - Create a new comment.
- `GET /api/v1/comment/:id` - Get a comment by ID.
- `PATCH /api/v1/comment/:id` - Update a comment by ID.
- `DELETE /api/v1/comment/:id` - Delete a comment by ID.

### **Likes**

- `POST /api/v1/likes/:postId/like` - Like a post.
- `DELETE /api/v1/likes/:postId/unlike` - Unlike a post.

### **Friendships**

- `POST /api/v1/friendship/:addresseId` - Send friendship request.
- `POST /api/v1/friendship/:requesterId/status` - Update friendship request.
- `GET /api/v1/friendship/:userId/friends` - Get friends.
- `GET /api/v1/friendship/friends-request` - Get friends request.
- `DELETE /api/v1/friendship/:userId/friends` - Delete friend.

### **Groups**

- `POST /group` - Create new group.
- `GET /group` - Get user groups.
- `GET /group/{id}` - Get group with members.
- `PUT /group/{id}` - Update group.
- `DELETE /group/{id}` - Delete group.

### **Group Members**

- `POST /group/{id}/join` - Request to join group.
- `PUT /group/{id}/join/{requestId}/approve` - Approve group join request.
- `PUT /group/{id}/join/{requestId}/decline` - Decline group join request.
- `GET /group/{id}/request` - Get group join requests.
- `DELETE /group/{id}/leave` - Leave group.
- `GET /group/{id}/members` - Get group members.

### **Group Posts**

- `POST /group/{id}/post` - Create new post in group.
- `GET /group/{id}/post` - Get group posts.
- `GET /group/{id}/post/pending` - Get group pending posts.
- `PUT /group/{id}/post/{postId}/approve` - Approve group post request.
- `PUT /group/{id}/post/{postId}/decline` - Decline group post request.
- `DELETE /group/{id}/post/{postId}` - Delete group post request.

## Authentication and Authorization

The API uses **JWT (JSON Web Tokens)** for authentication and authorization. It supports standard login, Google OAuth, and optional Two-Factor Authentication (2FA) for enhanced security.

### Authentication Flow

1. **Register**

   - Endpoint: `POST /api/v1/user/register`
   - Users can sign up by providing their details (e.g., name, email, password).

2. **Login**

   - Endpoint: `POST /api/v1/user/login`
   - Users log in with email and password to receive a JWT access and refresh token.

3. **Google Authentication**

   - Endpoint: `GET /api/v1/user/google`
   - Redirects the user to Google for OAuth authentication.
   - Endpoint: `GET /api/v1/user/google/callback`
   - Handles the callback from Google and issues JWT tokens.

4. **Two-Factor Authentication (2FA)**

   - **Setup:**
     - Endpoint: `POST /api/v1/user/2fa/generate`
     - Generates a 2FA secret and QR code for the user to scan with an authenticator app.
   - **Enable:**
     - Endpoint: `POST /api/v1/user/2fa/verify`
     - User submits the code from their authenticator app to enable 2FA on their account.
   - **2FA Login:**
     - Endpoint: `POST /api/v1/user/2fa/login`
     - After entering email and password, if 2FA is enabled, the user must provide a valid 2FA code to complete login.

5. **Password Reset**

   - **Request Reset:**
     - Endpoint: `POST /api/v1/user/forgotPassword`
     - Sends a reset code to the user's email.
   - **Verify Reset Code:**
     - Endpoint: `POST /api/v1/user/verifyResetCode`
     - Verifies the code sent to the user's email.
   - **Reset Password:**
     - Endpoint: `POST /api/v1/user/resetPassword`
     - Allows the user to set a new password.

6. **Token Management**
   - **Refresh Token:**
     - Endpoint: `POST /api/v1/user/refresh-token`
     - Obtain a new access token using a valid refresh token.
   - **Logout:**
     - Endpoint: `POST /api/v1/user/logout`
     - Logs out the user from the current device.
   - **Logout All:**
     - Endpoint: `POST /api/v1/user/logout-all`
     - Logs out the user from all devices.

### Authorization

- Most endpoints require a valid JWT in the `Authorization` header as a Bearer token.
- Some endpoints are restricted to specific roles (e.g., admin, moderator, user).

**Summary:**  
This authentication system provides secure login with JWT, supports Google OAuth for social login, and allows users to enable 2FA for additional security.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL=DATABASE_URL
JWT_SECRET=your_jwt_secret
CACHE_SECRET=your_cache_secret
CACHE_EXPIREIN="1m"
NODE_ENV="development"
BASE_URL="http://localhost:3000/api/v1"
SESSION_SECRET=your_session_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USERNAME=your_email_user
EMAIL_PASSWORD=your_email_password
```

## License

This project is licensed under the MIT License.
