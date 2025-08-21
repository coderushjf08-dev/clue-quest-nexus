# Reverse Treasure Hunt - Backend API

A comprehensive Node.js/Express backend for the Reverse Treasure Hunt game application with PostgreSQL database, JWT authentication, file uploads, and real-time leaderboards.

## 🚀 Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Hunt Management**: Create, read, update, delete treasure hunts with clues
- **Game Logic**: Complete game session management with scoring and progression
- **File Uploads**: Cloudinary integration for image and audio uploads
- **Leaderboards**: Real-time leaderboards with global and hunt-specific rankings
- **Security**: Rate limiting, CORS, helmet security headers, input validation
- **Database**: PostgreSQL with optimized queries and materialized views

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Cloudinary account (for file uploads)

## 🛠️ Installation

1. **Clone and navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   - Database connection string
   - JWT secret key
   - Cloudinary credentials
   - Frontend URL

4. **Set up PostgreSQL database**:
   ```bash
   # Create database
   createdb treasure_hunt_db
   
   # Run migrations
   npm run migrate
   
   # Seed with sample data (optional)
   npm run seed
   ```

## 🚦 Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Using Docker
```bash
# Start with Docker Compose (includes PostgreSQL)
docker-compose -f docker-compose.dev.yml up
```

## 📚 API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /profile` - Get user profile (authenticated)

### Hunts (`/api/hunts`)
- `POST /` - Create new hunt (authenticated)
- `GET /` - Get all public hunts (with filters)
- `GET /my` - Get user's hunts (authenticated)
- `GET /:id` - Get hunt by ID
- `DELETE /:id` - Delete hunt (owner only)

### Game (`/api/game`)
- `POST /start/:huntId` - Start new game session
- `GET /:sessionId/clue` - Get current clue
- `POST /:sessionId/answer` - Submit answer
- `POST /:sessionId/hint` - Use hint
- `POST /:sessionId/abandon` - Abandon game

### Leaderboard (`/api/leaderboard`)
- `GET /hunt/:huntId` - Hunt-specific leaderboard
- `GET /global` - Global leaderboard
- `GET /user/stats` - User statistics
- `POST /refresh` - Refresh leaderboard

### Upload (`/api/upload`)
- `POST /` - Upload file (authenticated)
- `GET /:public_id` - Get file info
- `DELETE /:public_id` - Delete file (owner only)

## 🗄️ Database Schema

### Core Tables
- **users**: User accounts with authentication
- **hunts**: Treasure hunt definitions
- **clues**: Individual clues within hunts
- **game_sessions**: Active and completed game sessions
- **clue_attempts**: User attempts at solving clues
- **hint_usage**: Tracking hint usage and penalties

### Views
- **leaderboard**: Materialized view for performance rankings

## 🔧 Configuration

### Environment Variables
```bash
# Server
NODE_ENV=development|production
PORT=3001
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# File Upload
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Security Features
- Rate limiting (100 requests per 15 minutes)
- CORS protection
- Helmet security headers
- Input validation with Joi
- SQL injection prevention
- XSS protection

## 🎯 Game Mechanics

### Scoring System
- Base points per clue (default: 100)
- Time penalties: -1 point per 30 seconds
- Attempt penalties: -10 points per wrong answer
- Hint penalties: -10, -20, -30 points for hints 1, 2, 3
- Minimum score: 10 points per clue

### Answer Types
- **Exact**: Must match exactly (case-insensitive)
- **Contains**: Answer contains or is contained in correct answer
- **Regex**: Regular expression matching

## 📊 Performance Optimizations

- Database indexes on frequently queried columns
- Materialized views for leaderboards
- Connection pooling
- Query optimization
- Compression middleware
- Efficient pagination

## 🚀 Deployment

### Railway
```bash
# Deploy to Railway
railway login
railway link
railway up
```

### Render
```bash
# Use render.yaml configuration
# Push to GitHub and connect to Render
```

### Docker
```bash
# Build image
docker build -t treasure-hunt-backend .

# Run container
docker run -p 3001:3001 --env-file .env treasure-hunt-backend
```

## 🧪 Testing

### API Testing
```bash
# Test endpoints with curl or Postman
curl -X GET http://localhost:3001/health
```

### Database Testing
```bash
# Run migrations in test mode
NODE_ENV=test npm run migrate
```

## 📝 Scripts

- `npm run dev` - Development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with sample data

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository or contact the development team.