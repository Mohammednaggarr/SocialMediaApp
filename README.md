# SocialMedia API

A production-ready RESTful Social Media backend built with Node.js, TypeScript, Express v5, MongoDB, Socket.IO, and AWS S3.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js + TypeScript (strict mode) |
| Framework | Express v5 |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) + Bcrypt |
| Real-time | Socket.IO |
| File Storage | AWS S3 (SDK v3) |
| Email | Nodemailer (Gmail) |
| Validation | Zod v4 |
| Security | Helmet, CORS, express-rate-limit |

---

## Project Structure

```
src/
├── app.controller.ts          # Express app bootstrap, middleware, route mounting
├── index.ts                   # Entry point
├── DB/
│   └── connection.ts          # MongoDB connection
├── Middlewares/
│   ├── authentication.middleware.ts  # JWT guard + role-based access
│   └── validation.middleware.ts      # Zod request validation
├── models/
│   ├── user.model.ts          # User schema
│   ├── post.model.ts          # Post schema
│   ├── comment.model.ts       # Comment schema
│   ├── chat.model.ts          # DirectMessage + GroupChat schemas
│   └── token.model.ts         # Revoked JWT blacklist
├── repository/
│   ├── database.repository.ts # Abstract base (find, findById, create, update...)
│   ├── user.repository.ts
│   ├── post.repository.ts
│   ├── comment.repository.ts
│   ├── chat.repository.ts
│   ├── group-chat.repository.ts
│   └── token.repository.ts
├── Modules/
│   ├── Auth/                  # signup, login, confirm-email, resend-confirm-email
│   ├── User/                  # profile, logout, images, friend-request, DMs
│   ├── Post/                  # create, feed, react, comment
│   └── Chat/                  # group chat create + messages
└── Utils/
    ├── Email/                 # Nodemailer transporter + HTML template
    ├── Events/                # EventEmitter for async email sending
    ├── multer/                # Multer config + all S3 helpers
    ├── Response/              # AppError classes + global error handler
    ├── Security/              # bcrypt, OTP generator, JWT helpers
    ├── Socket/                # Socket.IO singleton service
    └── types/                 # Express Request augmentation
```

---

## Prerequisites

Make sure the following are installed on your machine before starting:

- **Node.js** v18 or higher — https://nodejs.org
- **MongoDB** (local) — https://www.mongodb.com/try/download/community  
  OR use a free cloud cluster at https://cloud.mongodb.com
- **TypeScript** (installed locally via npm, no global install needed)

---

## Step 1 — Clone & Install Dependencies

```bash
cd "social media"
npm install
```

---

## Step 2 — Configure Environment Variables

Open the `.env` file in the project root and fill in every value:

```env
# Database — use localhost if running MongoDB locally
DB_URI=mongodb://localhost:27017/social-media

# App
APPLICATION_NAME=social-media
MODE=DEV
PORT=5000

# Email — must be a Gmail account with App Password enabled
# Guide: https://support.google.com/accounts/answer/185833
EMAIL=your-gmail@gmail.com
PASSWORD=your-16-char-app-password

# OTP expiry in milliseconds (600000 = 10 minutes)
OTP_EXPIRATION_MS=600000

# Bcrypt salt rounds
SALT=10

# JWT secrets — use any long random strings (e.g. run: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
ACCESS_USER_TOKEN_SECRET=replace_with_random_secret
REFRESH_USER_TOKEN_SECRET=replace_with_random_secret
ACCESS_ADMIN_TOKEN_SECRET=replace_with_random_secret
REFRESH_ADMIN_TOKEN_SECRET=replace_with_random_secret

# Token TTL in milliseconds
ACCESS_TOKEN_EXPIRATION_MS=3600000      # 1 hour
REFRESH_TOKEN_EXPIRATION_MS=604800000   # 7 days

# AWS S3 — create a bucket and IAM user with S3 full access
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_BUCKET_NAME=your_bucket_name

# CORS origins for production (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000
```

> **Tip:** To generate strong JWT secrets quickly, run this in your terminal:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```
> Run it 4 times (once per secret).

---

## Step 3 — Build & Run

### Development (watch mode — recompiles on save)

```bash
npm run dev
```

This runs two processes in parallel:
1. `tsc --watch` — recompiles TypeScript into `dist/` on every save
2. `node --watch dist/index.js` — restarts the server whenever `dist/` changes

You should see:
```
Server is running on http://localhost:5000
mongoDB connected localhost
```

### Production

```bash
npm run build    # compile TypeScript → dist/
npm start        # run compiled output
```

---

## Step 4 — Test the API

You can use **Postman**, **Insomnia**, or **curl**.

### Quick Smoke Test (curl)

```bash
curl http://localhost:5000/
# Expected: {"message":"SocialBox API is running!"}
```

### Full Auth Flow

#### 1. Sign Up
```bash
curl -X POST http://localhost:5000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "email": "john@example.com",
    "password": "secret123",
    "confirmPassword": "secret123"
  }'
```
Check your email inbox for the 6-digit OTP.

#### 2. Confirm Email
```bash
curl -X PATCH http://localhost:5000/api/v1/auth/confirm-email \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "otp": "123456"}'
```

#### 3. Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "john@example.com", "password": "secret123"}'
```
Save the `access_token` from the response — you'll need it for all protected routes.

#### 4. Get Profile (protected)
```bash
curl http://localhost:5000/api/v1/user/get-profile \
  -H "Authorization: USER <your_access_token>"
```

> **Note:** The Authorization header format is `USER <token>` (not `Bearer`). This matches the signature level scheme used by this API.

#### 5. Create a Post
```bash
curl -X POST http://localhost:5000/api/v1/post/ \
  -H "Content-Type: application/json" \
  -H "Authorization: USER <your_access_token>" \
  -d '{"content": "Hello SocialBox!"}'
```

#### 6. Get Feed (paginated)
```bash
curl "http://localhost:5000/api/v1/post/?page=1&limit=10" \
  -H "Authorization: USER <your_access_token>"
```

#### 7. Like a Post
```bash
curl -X PATCH "http://localhost:5000/api/v1/post/<post_id>/react?action=LIKE" \
  -H "Authorization: USER <your_access_token>"
```

#### 8. Comment on a Post
```bash
curl -X POST http://localhost:5000/api/v1/post/<post_id>/comment \
  -H "Content-Type: application/json" \
  -H "Authorization: USER <your_access_token>" \
  -d '{"content": "Great post!"}'
```

#### 9. Send Friend Request
```bash
curl -X POST http://localhost:5000/api/v1/user/<recipient_user_id>/friend-request \
  -H "Authorization: USER <your_access_token>"
```

#### 10. Send a Direct Message
```bash
curl -X POST http://localhost:5000/api/v1/user/<recipient_user_id>/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: USER <your_access_token>" \
  -d '{"message": "Hey, how are you?"}'
```

#### 11. Create a Group Chat
```bash
curl -X POST http://localhost:5000/api/v1/chat/group \
  -H "Content-Type: application/json" \
  -H "Authorization: USER <your_access_token>" \
  -d '{"name": "Dev Team", "participants": ["<user_id_2>", "<user_id_3>"]}'
```

#### 12. Logout
```bash
curl -X POST http://localhost:5000/api/v1/user/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: USER <your_access_token>" \
  -d '{"flag": "ONLY"}'
# Use "ALL" to invalidate all sessions
```

---

## Step 5 — Test Socket.IO

You can test real-time messaging using the browser console or a Socket.IO client:

```javascript
// Install: npm install socket.io-client  (or use the CDN in a browser)
const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

// Join your personal room (use your MongoDB user _id)
socket.emit("join_room", "YOUR_USER_ID");

// Listen for incoming direct messages
socket.on("receive_message", (data) => {
  console.log("New message:", data);
});

// Listen for group messages
socket.on("receive_group_message", (data) => {
  console.log("Group message:", data);
});

// Join a group room
socket.emit("join_group", "GROUP_CHAT_ID");
```

---

## API Reference

### Auth — `/api/v1/auth`

| Method | Endpoint | Auth | Body |
|---|---|---|---|
| POST | `/signup` | No | `username, email, password, confirmPassword` |
| POST | `/login` | No | `email, password` |
| PATCH | `/confirm-email` | No | `email, otp` |
| PATCH | `/resend-confirm-email` | No | `email` |

### User — `/api/v1/user` (all protected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/get-profile` | Get own profile |
| POST | `/logout` | Logout — body: `{ flag: "ONLY" \| "ALL" }` |
| PATCH | `/profile-image` | Upload profile image (presigned S3 flow) |
| PATCH | `/cover-images` | Upload up to 5 cover images |
| POST | `/:id/friend-request` | Send friend request |
| GET | `/:id/chat` | Get DM history with a user |
| POST | `/:id/chat` | Send a direct message |

### Post — `/api/v1/post` (all protected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create a post — body: `{ content, tags? }` |
| GET | `/?page=1&limit=10` | Paginated feed |
| PATCH | `/:id/react?action=LIKE\|UNLIKE` | Like / unlike a post |
| POST | `/:id/comment` | Add a comment — body: `{ content }` |

### Chat — `/api/v1/chat` (all protected)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/group` | Create group — body: `{ name, participants[] }` |
| GET | `/group/:groupId` | Get all group messages |

### File Serving — no auth

| Method | Endpoint | Description |
|---|---|---|
| GET | `/upload/*path` | Stream a file directly from S3 |
| GET | `/upload/pre-signed/*path` | Get a presigned GET URL for an S3 file |

---

## Security Notes

- Rate limiting: **100 requests / 15 minutes** per IP
- Passwords are **never** returned in any response
- JWT tokens are blacklisted on logout via the `Token` collection
- All sessions are invalidated by updating `changeCredentialsTime`
- Helmet sets secure HTTP headers on every response
- Zod validates all request bodies, params, and query strings before reaching controllers

---

## Common Issues

| Problem | Solution |
|---|---|
| `mongoDB connection error` | Make sure MongoDB is running locally (`mongod`) or your `DB_URI` cloud string is correct |
| `OTP email not received` | Make sure `EMAIL` is a Gmail and `PASSWORD` is an **App Password** (not your login password) |
| `Invalid authorization format` | Use `USER <token>` not `Bearer <token>` in the Authorization header |
| `Token has been revoked` | You already logged out — log in again to get a new token |
| `tsc: command not found` | Run `npm install` first — TypeScript is a local dev dependency |
| S3 upload errors | Double-check `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_NAME` in `.env` |
