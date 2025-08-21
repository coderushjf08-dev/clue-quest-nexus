# Reverse Treasure Hunt - Backend API

A comprehensive Node.js + Express backend for the Reverse Treasure Hunt game, featuring user authentication, hunt management, real-time gameplay, leaderboards, and file uploads.

## 🚀 Features

- **User Authentication**: JWT-based signup/login with secure password hashing
- **Hunt Management**: Create, read, update, delete treasure hunts with clues
- **Game Logic**: Sequential clue progression with answer validation
- **Leaderboard System**: Real-time rankings with completion times and scores
- **Hint System**: Progressive hints with scoring penalties
- **File Uploads**: Support for images and audio in clues via Cloudinary
- **Real-time Scoring**: Dynamic scoring with time and hint penalties

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Database and service configurations
│   ├── controllers/      # Route handlers and business logic
│   ├── middleware/       # Authentication, validation, upload middleware
│   ├── routes/          # API route definitions
│   ├── scripts/         # Database migration and seeding scripts
│   ├── types/           # TypeScript type definitions
│   └── server.ts        # Main application entry point
├── Dockerfile           # Docker container configuration
├── railway.json         # Railway deployment configuration
├── render.yaml          # Render deployment configuration
└── package.json         # Dependencies and scripts
```

## 🛠 Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Cloudinary account (for file uploads)

### Local Development

1. **Clone and setup**:
   ```bash
   cd backend
   npm install
   ```

2. **Environment Configuration**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your values:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/treasure_hunt_db
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   PORT=3001
   NODE_ENV=development
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   FRONTEND_URL=http://localhost:5173
   ```

3. **Database Setup**:
   ```bash
   # Run migrations
   npm run migrate
   
   # Seed with sample data
   npm run seed
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`

## 📡 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body**:
```json
{
  "email": "user@example.com",
  "username": "player1",
  "password": "password123"
}
```

**Response**:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "player1",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-here"
}
```

#### POST `/api/auth/login`
Authenticate user and get access token.

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### GET `/api/auth/profile`
Get current user profile (requires authentication).

**Headers**: `Authorization: Bearer <token>`

### Hunt Management Endpoints

#### GET `/api/hunts`
Get all public hunts with pagination and filters.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `difficulty`: Filter by difficulty (easy/medium/hard)
- `creator`: Filter by creator username

**Response**:
```json
{
  "hunts": [
    {
      "id": "uuid",
      "title": "The Ancient Mystery",
      "description": "Embark on a journey...",
      "difficulty_level": "medium",
      "estimated_duration": 30,
      "total_clues": 3,
      "creator_name": "admin",
      "play_count": 5,
      "completion_count": 2,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

#### POST `/api/hunts`
Create a new hunt (requires authentication).

**Request Body**:
```json
{
  "title": "My Treasure Hunt",
  "description": "An exciting adventure",
  "is_public": true,
  "difficulty_level": "medium",
  "estimated_duration": 30,
  "clues": [
    {
      "title": "First Clue",
      "content": "What has keys but no locks?",
      "clue_type": "text",
      "answer": "keyboard",
      "answer_type": "exact",
      "hints": ["Think about computers", "It helps you type"],
      "points_value": 100
    }
  ]
}
```

#### GET `/api/hunts/:id`
Get specific hunt details.

#### GET `/api/hunts/my`
Get current user's created hunts (requires authentication).

#### DELETE `/api/hunts/:id`
Delete a hunt (requires authentication, owner only).

### Game Play Endpoints

#### POST `/api/game/start/:huntId`
Start a new game session (requires authentication).

**Response**:
```json
{
  "message": "Game started successfully",
  "session": {
    "id": "session-uuid",
    "hunt_id": "hunt-uuid",
    "hunt_title": "The Ancient Mystery",
    "total_clues": 3,
    "start_time": "2024-01-01T00:00:00.000Z",
    "current_clue_sequence": 1
  }
}
```

#### GET `/api/game/:sessionId/clue`
Get current clue for active session (requires authentication).

**Response**:
```json
{
  "session": {
    "id": "session-uuid",
    "hunt_title": "The Ancient Mystery",
    "current_clue_sequence": 1,
    "total_score": 100,
    "hints_used": 0,
    "elapsed_time": 120
  },
  "clue": {
    "id": "clue-uuid",
    "title": "The Silent Speaker",
    "content": "I speak without a mouth...",
    "clue_type": "text",
    "points_value": 100,
    "available_hints": 3,
    "hints_used": [],
    "revealed_hints": []
  }
}
```

#### POST `/api/game/:sessionId/answer`
Submit answer for current clue (requires authentication).

**Request Body**:
```json
{
  "answer": "echo"
}
```

**Response**:
```json
{
  "correct": true,
  "score_earned": 85,
  "next_clue": true,
  "message": "Correct! Moving to the next clue."
}
```

#### POST `/api/game/:sessionId/hint`
Use a hint for current clue (requires authentication).

**Request Body**:
```json
{
  "hint_index": 0
}
```

**Response**:
```json
{
  "hint": "Think about natural phenomena (-10 points)",
  "penalty_points": 10,
  "message": "Hint revealed! -10 points"
}
```

#### POST `/api/game/:sessionId/abandon`
Abandon current game session (requires authentication).

### Leaderboard Endpoints

#### GET `/api/leaderboard/hunt/:huntId`
Get leaderboard for specific hunt.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

#### GET `/api/leaderboard/global`
Get global leaderboard across all hunts.

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `timeframe`: Filter by time (all/week/month, default: all)

#### GET `/api/leaderboard/user/stats`
Get current user's statistics (requires authentication).

#### GET `/api/leaderboard/user/:userId/stats`
Get specific user's public statistics.

### File Upload Endpoints

#### POST `/api/upload`
Upload image or audio file (requires authentication).

**Request**: Multipart form data with `file` field

**Response**:
```json
{
  "message": "File uploaded successfully",
  "file": {
    "public_id": "treasure-hunt/user-id_timestamp",
    "url": "https://res.cloudinary.com/...",
    "format": "jpg",
    "resource_type": "image",
    "bytes": 154832
  }
}
```

#### DELETE `/api/upload/:publicId`
Delete uploaded file (requires authentication).

#### GET `/api/upload/:publicId`
Get file information.

## 🎯 Game Mechanics

### Scoring System
- **Base Points**: Each clue has a base point value (default: 100)
- **Time Penalty**: -1 point per 30 seconds (minimum 10 points)
- **Attempt Penalty**: -10 points per wrong attempt
- **Hint Penalty**: Progressive penalties (10, 20, 30 points per hint)

### Answer Types
- **Exact**: Answer must match exactly (case-insensitive)
- **Contains**: Answer can contain the correct answer or vice versa
- **Regex**: Answer validated against regular expression pattern

### Hunt Progression
- Clues must be solved in sequence
- Next clue unlocks only after solving current one
- Game session tracks progress and scoring
- Completion triggers leaderboard update

## 🚀 Deployment

### Railway Deployment

1. **Connect Repository**: Link your GitHub repository to Railway
2. **Environment Variables**: Set all required environment variables in Railway dashboard
3. **Database**: Add PostgreSQL addon to your Railway project
4. **Deploy**: Railway will automatically build and deploy using `railway.json` configuration

### Render Deployment

1. **Create Services**: Use the `render.yaml` blueprint to create web service and database
2. **Environment Variables**: Configure all required environment variables
3. **Database**: Render will create PostgreSQL database automatically
4. **Deploy**: Connect your GitHub repository and deploy

### Environment Variables Checklist

Required for production:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Strong secret key for JWT tokens
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret
- `FRONTEND_URL`: Your frontend domain URL

## 🧪 Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts and authentication
- **hunts**: Treasure hunt definitions
- **clues**: Individual clues within hunts
- **game_sessions**: Active and completed game sessions
- **clue_attempts**: User answers and attempts
- **hint_usage**: Tracking hint usage and penalties
- **leaderboard**: Materialized view for rankings

## 🔧 Development

### Available Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm run migrate`: Run database migrations
- `npm run seed`: Seed database with sample data

### Adding New Features

1. **Controllers**: Add business logic in `src/controllers/`
2. **Routes**: Define API endpoints in `src/routes/`
3. **Middleware**: Add reusable middleware in `src/middleware/`
4. **Types**: Define TypeScript interfaces in `src/types/`
5. **Database**: Update schema in `src/database/schema.sql`

## 🛡 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevent API abuse
- **CORS Protection**: Configurable cross-origin policies
- **Input Validation**: Joi schema validation
- **File Upload Security**: Type and size restrictions
- **SQL Injection Prevention**: Parameterized queries

## 📊 Monitoring & Health

- **Health Check**: `/health` endpoint for monitoring
- **Request Logging**: Morgan HTTP request logger
- **Error Handling**: Centralized error handling
- **Performance**: Compression and caching headers

## 🤝 Frontend Integration

The backend provides a complete REST API that can be integrated with any frontend framework. The original frontend is built with React/TypeScript and can be found in the parent directory.

### Example Integration

```typescript
// Frontend API client example
const API_BASE = 'http://localhost:3001/api';

// Authentication
const login = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Start game
const startGame = async (huntId: string, token: string) => {
  const response = await fetch(`${API_BASE}/game/start/${huntId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};
```

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.