import express from 'express';
import { 
  getHuntLeaderboard, 
  getGlobalLeaderboard, 
  getUserStats, 
  refreshLeaderboard 
} from '../controllers/leaderboardController.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// GET /api/leaderboard/hunt/:huntId - Get leaderboard for specific hunt
router.get('/hunt/:huntId', getHuntLeaderboard);

// GET /api/leaderboard/global - Get global leaderboard
router.get('/global', getGlobalLeaderboard);

// GET /api/leaderboard/user/stats - Get current user's stats
router.get('/user/stats', authenticateToken, getUserStats);

// GET /api/leaderboard/user/:targetUserId/stats - Get specific user's stats
router.get('/user/:targetUserId/stats', optionalAuth, getUserStats);

// POST /api/leaderboard/refresh - Refresh leaderboard (admin only for now)
router.post('/refresh', refreshLeaderboard);

export default router;