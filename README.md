# ProShare — Backend API

REST API and WebSocket server for [ProShare](https://github.com/shamzaali7/proshare-frontend), a platform where developers can share and discover projects, message each other in real time, and manage their profiles.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
  - [Users](#users)
  - [Projects](#projects)
  - [Messages](#messages)
  - [Uploads](#uploads)
- [WebSocket Events](#websocket-events)
- [Data Models](#data-models)
- [Running Tests](#running-tests)

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | HTTP server and REST API |
| MongoDB + Mongoose | Database and ODM |
| Socket.io | Real-time bidirectional messaging |
| Cloudinary | Cloud image storage and transformation |
| express-fileupload | Multipart form/file handling |
| dotenv | Environment variable management |
| cors | Cross-origin request support |
| Mocha + Chai + Supertest | Testing |

---

## Project Structure

```
proshare-backend/
├── controllers/
│   ├── userController.js       # User CRUD routes
│   ├── projectController.js    # Project CRUD routes
│   ├── messageController.js    # Messaging and conversation routes
│   └── uploadController.js     # Cloudinary image upload routes
├── models/
│   ├── userModel.js            # User schema
│   ├── projectModel.js         # Project schema
│   ├── messageModel.js         # Message schema
│   └── conversationModel.js    # Conversation schema (with findOrCreate)
├── db/
│   ├── connection.js           # MongoDB connection
│   ├── seed.js                 # Database seeder
│   ├── userSeed.json           # Sample user data
│   └── projectSeed.json        # Sample project data
├── test/
│   ├── userController.test.js
│   ├── projectController.test.js
│   └── messageController.test.js
├── .env                        # Environment variables (not committed)
├── .gitignore
├── index.js                    # Entry point — Express app + Socket.io
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- A [Cloudinary](https://cloudinary.com) account

### Installation

```bash
git clone https://github.com/shamzaali7/proshare-backend.git
cd proshare-backend
npm install
```

Create a `.env` file in the root (see [Environment Variables](#environment-variables)), then start the server:

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

The server runs on port **4000** by default.

### Seed the Database

```bash
npm run seed
```

---

## Environment Variables

Create a `.env` file in the project root with the following keys:

```env
DB_URL=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## API Reference

Base URL: `https://proshare-backend-27b5d2fdd236.herokuapp.com/api`

### Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/users` | Get all users |
| `GET` | `/users/:googleid` | Get a user by Google ID |
| `POST` | `/users` | Create a new user |
| `PUT` | `/users` | Update a user by `_id` (body) |
| `PUT` | `/users/profile-picture/:googleid` | Update a user's profile picture URL |
| `DELETE` | `/users/:_id` | Delete a user |

**POST /users — Request Body**
```json
{
  "googleid": "string",
  "email": "string",
  "name": "string",
  "firstName": "string",
  "lastName": "string",
  "profilePicture": "string (optional)"
}
```

> **Note on `googleid`:** this field stores the Google OAuth user ID for Google sign-in users, or the Firebase UID for email/password users. Both are stable string identifiers managed by Firebase.

---

### Projects

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/projects` | Get all projects |
| `GET` | `/projects/:googleid` | Get all projects for a user |
| `POST` | `/projects` | Create a new project |
| `PUT` | `/projects` | Update a project by `_id` (body) |
| `DELETE` | `/projects` | Delete a project by `_id` (body) |

**POST /projects — Request Body**
```json
{
  "title": "string",
  "github": "string (URL)",
  "deployedLink": "string (URL)",
  "picture": "string (URL)",
  "gid": "string (Google ID of creator)",
  "creator": "string (display name)",
  "backendRepo": "string (URL, optional)",
  "backendDeploy": "string (URL, optional)",
  "comments": ["string"]
}
```

---

### Messages

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/messages/conversations/:googleid` | Get all conversations for a user (with unread counts); always reads the latest message directly from the Message collection rather than the cached `lastMessage` field on the Conversation document |
| `GET` | `/messages/conversation/:conversationId` | Get all messages in a conversation |
| `POST` | `/messages` | Send a message (creates conversation if needed) |
| `PUT` | `/messages/read` | Mark messages in a conversation as read |
| `DELETE` | `/messages/conversation/:conversationId` | Delete a conversation and all its messages |

**POST /messages — Request Body**
```json
{
  "senderId": "string (Google ID)",
  "receiverId": "string (Google ID)",
  "senderName": "string",
  "text": "string"
}
```

**PUT /messages/read — Request Body**
```json
{
  "conversationId": "string",
  "userId": "string (Google ID)"
}
```

---

### Uploads

All upload endpoints accept `multipart/form-data` with an `image` field.

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/upload/profile-picture` | Upload a profile picture (max 5MB, returns Cloudinary URL) |
| `POST` | `/upload/project-image` | Upload a project screenshot (max 10MB, returns Cloudinary URL) |
| `DELETE` | `/upload/image/:publicId` | Delete an image from Cloudinary by public ID |

**Upload Response**
```json
{
  "success": true,
  "url": "https://res.cloudinary.com/...",
  "publicId": "proshare/profile-pictures/..."
}
```

Accepted file types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`

---

## WebSocket Events

The server uses **Socket.io** for real-time messaging. Connect to the root URL.

### Client → Server

| Event | Payload | Description |
|---|---|---|
| `join` | `googleId: string` | Register the user's socket on connection |
| `sendMessage` | `{ receiverId, message, conversationId }` | Deliver a message to a specific user |
| `typing` | `{ receiverId, isTyping, senderName }` | Broadcast typing indicator |
| `messagesRead` | `{ senderId, conversationId }` | Notify the sender their messages were read |

### Server → Client

| Event | Payload | Description |
|---|---|---|
| `receiveMessage` | `{ message, conversationId }` | Incoming message for the connected user |
| `userTyping` | `{ isTyping, senderName }` | Typing indicator from another user |
| `messagesReadConfirmation` | `{ conversationId }` | Confirmation that messages were read |

---

## Data Models

### User
```js
{
  googleid:       String,  // Google OAuth ID (Google users) or Firebase UID (email/password users)
  email:          String,
  name:           String,
  firstName:      String,
  lastName:       String,
  profilePicture: String,
  createdAt:      Date
}
```

### Project
```js
{
  title:        String,
  github:       String,
  deployedLink: String,
  picture:      String,
  gid:          String,   // Google ID of the creator
  creator:      String,   // Display name of the creator
  backendRepo:  String,
  backendDeploy: String,
  comments:     [String],
  user:         ObjectId  // Reference to User
}
```

### Conversation
```js
{
  participants: [String],  // Array of two Google IDs
  lastMessage: {
    text:      String,
    senderId:  String,
    timestamp: Date
  },
  updatedAt: Date
}
```

### Message
```js
{
  conversationId: ObjectId,  // Reference to Conversation
  senderId:       String,    // Google ID
  senderName:     String,
  text:           String,
  read:           Boolean,
  createdAt:      Date
}
```

---

## Running Tests

```bash
npm test
```

Tests use **Mocha**, **Chai**, and **Supertest**. Ensure your `.env` has a valid `DB_URL` pointing to a test-safe database before running.

---

## Deployment

The API is deployed on **Heroku**. The `DB_URL` and Cloudinary credentials are set as Heroku config vars.

```bash
heroku config:set DB_URL=...
heroku config:set CLOUDINARY_CLOUD_NAME=...
heroku config:set CLOUDINARY_API_KEY=...
heroku config:set CLOUDINARY_API_SECRET=...
```

---

## Author

**Hamza Ali** — [GitHub](https://github.com/shamzaali7) · [LinkedIn](https://www.linkedin.com/in/hamza-ali7/)
