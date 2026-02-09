# Backend Documentation

## Overview

The backend is a Node.js/Express REST API server that handles user authentication, URL shortening, and database operations. It uses MongoDB for data persistence and JWT for secure authentication.

## Tech Stack

- **Node.js** with Express.js - REST API server
- **MongoDB** with Mongoose - Database
- **JWT (jsonwebtoken)** - Authentication
- **bcrypt** - Password hashing
- **nanoid** - Random ID generation for short URLs
- **Nodemon** - Development server auto-reload

## Project Structure

```
BACKEND/
├── app.js                          # Main server entry point
├── package.json
├── .env                            # Environment variables (create this)
└── src/
    ├── config/
    │   ├── config.js               # App configuration (cookie options)
    │   └── mongo.config.js         # MongoDB connection
    ├── controllers/
    │   ├── auth.controller.js      # Authentication handlers
    │   ├── shortUrl.controller.js  # URL shortening handlers
    │   └── user.controller.js      # User data handlers
    ├── dao/
    │   ├── shortUrl.js             # Short URL database queries
    │   └── user.dao.js             # User database queries
    ├── middleware/
    │   └── auth.middleware.js      # JWT authentication middleware
    ├── models/
    │   ├── shortUrl.model.js       # Short URL schema
    │   └── user.model.js           # User schema
    ├── routes/
    │   ├── auth.route.js           # Auth endpoints
    │   ├── shortUrl.route.js       # URL shortening endpoints
    │   └── user.route.js           # User endpoints
    ├── services/
    │   ├── auth.service.js         # Auth business logic
    │   └── shortUrl.service.js     # URL shortening logic
    └── utils/
        ├── attachUser.js           # Middleware to attach user to request
        ├── errorHandler.js         # Global error handler
        ├── helper.js               # Helper functions
        └── tryCatchWrapper.js      # Async error wrapper
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

### Steps

1. **Navigate to backend directory:**
   ```bash
   cd BACKEND
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file with required environment variables:**
   ```env
   MONGO_URI=mongodb://localhost:27017/url_shortener
   JWT_SECRET=your_secret_key_here
   APP_URL=http://localhost:3000/
   PORT=3000
   NODE_ENV=development
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`

## Environment Variables

Create a `.env` file in the BACKEND directory with the following variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/url_shortener` |
| `JWT_SECRET` | Secret key for JWT signing (keep private and strong) | `your_secret_key_here` |
| `APP_URL` | Base URL of the application | `http://localhost:3000/` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` or `production` |

**Important:** Never commit `.env` files to version control. Keep all secrets secure.

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### 1. **Register User**
- **Endpoint:** `POST /auth/register`
- **Description:** Create a new user account
- **Authorization:** Not required
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "message": "Register Success"
  }
  ```
- **Notes:** Password is hashed with bcrypt before storage. User token is set in HTTP-only cookie.

#### 2. **Login User**
- **Endpoint:** `POST /auth/login`
- **Description:** Authenticate user and receive access token
- **Request Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securePassword123"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "gravatar_url"
    },
    "message": "Login Success"
  }
  ```
- **Notes:** Access token is stored in HTTP-only cookie automatically.

#### 3. **Logout User**
- **Endpoint:** `POST /auth/logout`
- **Description:** Clear user session and remove authentication token
- **Authorization:** Not required
- **Response:** `200 OK`
  ```json
  {
    "message": "logout success"
  }
  ```

#### 4. **Get Current User**
- **Endpoint:** `GET /auth/me`
- **Description:** Retrieve currently authenticated user information
- **Authorization:** Required (JWT token in cookie)
- **Response:** `200 OK`
  ```json
  {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "avatar": "gravatar_url"
    }
  }
  ```

### URL Shortening Endpoints

#### 1. **Create Short URL**
- **Endpoint:** `POST /create`
- **Description:** Create a shortened URL
- **Authorization:** Optional (different behavior for authenticated users)
- **Request Body:**
  ```json
  {
    "url": "https://example.com/very/long/url",
    "slug": "custom-slug"
  }
  ```
- **Response:** `200 OK`
  ```json
  {
    "shortUrl": "http://localhost:3000/abc123xyz"
  }
  ```
- **Behavior:**
  - **Authenticated users:** Can provide custom slug, URL is associated with user
  - **Anonymous users:** Random short ID generated, URL expires after browser session
- **Notes:** 
  - Custom slug must be unique if provided
  - Short URL ID generated using nanoid for randomness
  - Click count initialized to 0

#### 2. **Redirect Short URL (Public)**
- **Endpoint:** `GET /:id`
- **Description:** Redirect from short URL to original long URL
- **Parameters:** `id` - Short URL identifier
- **Response:** `302 Found` (Redirect to original URL)
- **Side Effect:** Increments the click counter for the shortened URL
- **Example:** `http://localhost:3000/abc123xyz` → `https://example.com/very/long/url`

### User Endpoints

#### 1. **Get All User URLs**
- **Endpoint:** `GET /user/urls`
- **Description:** Retrieve all shortened URLs created by authenticated user
- **Authorization:** Required (JWT token in cookie)
- **Response:** `200 OK`
  ```json
  [
    {
      "_id": "url_id",
      "full_url": "https://example.com/long/url",
      "short_url": "abc123xyz",
      "clicks": 42,
      "user": "user_id"
    },
    {
      "_id": "url_id_2",
      "full_url": "https://another.com/url",
      "short_url": "custom-slug",
      "clicks": 15,
      "user": "user_id"
    }
  ]
  ```
- **Notes:** Returns only URLs belonging to the authenticated user

## Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed with bcrypt, not selected by default),
  avatar: String (optional, defaults to Gravatar URL)
}
```

**Methods:**
- `comparePassword(password)` - Compare plaintext password with hashed password

**Middleware:**
- Pre-save: Hash password before storing
- toJSON: Remove password and __v from JSON responses

### Short URL Model

```javascript
{
  full_url: String (required),
  short_url: String (required, unique, indexed),
  clicks: Number (default: 0),
  user: ObjectId (reference to User, optional)
}
```

**Features:**
- Indexed `short_url` for fast lookups
- Click counter for analytics
- Optional user reference for tracking ownership

## Authentication

### How It Works

The application uses JWT-based authentication with secure token storage:

1. **User Registration:**
   - User credentials validated
   - Password securely hashed before storage
   - User document created in database
   - Authentication token issued

2. **Token Management:**
   - Tokens issued upon successful authentication
   - Securely stored using HTTP-only cookies
   - Automatically included in authenticated requests
   - Validated on protected endpoints

3. **Protected Routes:**
   - Certain endpoints require valid authentication
   - Invalid or missing tokens are rejected
   - User information extracted from valid tokens

### Security Features

- **Password Security:** Industry-standard hashing algorithm (bcrypt)
- **Secure Token Storage:** HTTP-only cookies with additional security flags
- **Cross-Origin Protection:** CORS configured for frontend domain only
- **Input Validation:** Request data validated before processing
- **Error Handling:** Generic error messages prevent information leakage

## Error Handling

### Global Error Handler
The application uses a centralized error handler (`src/utils/errorHandler.js`) that:
- Catches all errors from route handlers
- Returns consistent error responses
- Logs errors for debugging
- Provides appropriate HTTP status codes

### Async Wrapper
The `src/utils/tryCatchWrapper.js` utility:
- Wraps async route handlers
- Automatically catches errors
- Passes errors to global error handler
- Prevents unhandled promise rejections

## Development Workflow

### Start Development Server
```bash
cd BACKEND
npm run dev
```

The server will run with auto-reload via Nodemon on `http://localhost:3000`

### Running Both Backend and Frontend

Open two terminals:

1. **Terminal 1** (Backend):
   ```bash
   cd BACKEND
   npm run dev
   ```

2. **Terminal 2** (Frontend):
   ```bash
   cd FRONTEND
   npm run dev
   ```

## API Testing

You can test the API endpoints using tools like:
- **Postman** - API request builder and testing tool
- **cURL** - Command-line HTTP client
- **Thunder Client** - VS Code extension for API testing
- **REST Client** - VS Code extension for inline API testing

## Contributing

When contributing to the backend:
1. Follow the existing code structure and patterns
2. Add proper error handling for new endpoints
3. Document new API endpoints in this README
4. Use the existing middleware and utilities
5. Test endpoints before submitting changes

---

**Last Updated:** February 2026
**Version:** 1.0.0
