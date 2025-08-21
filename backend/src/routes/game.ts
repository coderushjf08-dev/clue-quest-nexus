import express from 'express';
import { startGame, getCurrentClue, submitAnswer, useHint, abandonGame } from '../controllers/gameController.js';
import { validate, submitAnswerSchema, useHintSchema } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// POST /api/game/start/:huntId - Start a new game session
router.post('/start/:huntId', authenticateToken, startGame);

// GET /api/game/:sessionId/clue - Get current clue for session
router.get('/:sessionId/clue', authenticateToken, getCurrentClue);

// POST /api/game/:sessionId/answer - Submit answer for current clue
router.post('/:sessionId/answer', authenticateToken, validate(submitAnswerSchema), submitAnswer);

// POST /api/game/:sessionId/hint - Use a hint for current clue
router.post('/:sessionId/hint', authenticateToken, validate(useHintSchema), useHint);

// POST /api/game/:sessionId/abandon - Abandon current game session
router.post('/:sessionId/abandon', authenticateToken, abandonGame);

export default router;