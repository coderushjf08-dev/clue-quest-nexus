import express from 'express';
import { createHunt, getHunts, getHuntById, getUserHunts, deleteHunt } from '../controllers/huntController.js';
import { validate, createHuntSchema } from '../middleware/validation.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/hunts - Create a new hunt (authenticated)
router.post('/', authenticateToken, validate(createHuntSchema), createHunt);

// GET /api/hunts - Get all public hunts (with optional filters)
router.get('/', optionalAuth, getHunts);

// GET /api/hunts/my - Get user's hunts (authenticated)
router.get('/my', authenticateToken, getUserHunts);

// GET /api/hunts/:id - Get hunt by ID
router.get('/:id', optionalAuth, getHuntById);

// DELETE /api/hunts/:id - Delete hunt (authenticated, owner only)
router.delete('/:id', authenticateToken, deleteHunt);

export default router;