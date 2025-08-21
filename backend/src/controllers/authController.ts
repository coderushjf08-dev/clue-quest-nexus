import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { CreateUserRequest, LoginRequest } from '../types/index.js';

export const register = async (req: Request<{}, {}, CreateUserRequest>, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      res.status(400).json({ error: 'User with this email or username already exists' });
      return;
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await query(
      `INSERT INTO users (email, username, password_hash) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, username, created_at`,
      [email, username, passwordHash]
    );

    const user = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await query(
      'SELECT id, email, username, password_hash, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    const result = await query(
      `SELECT 
        u.id, u.email, u.username, u.created_at,
        COUNT(DISTINCT h.id) as hunts_created,
        COUNT(DISTINCT gs.id) as hunts_played,
        COUNT(DISTINCT CASE WHEN gs.status = 'completed' THEN gs.id END) as hunts_completed
       FROM users u
       LEFT JOIN hunts h ON u.id = h.creator_id
       LEFT JOIN game_sessions gs ON u.id = gs.user_id
       WHERE u.id = $1
       GROUP BY u.id, u.email, u.username, u.created_at`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        created_at: user.created_at,
        stats: {
          hunts_created: parseInt(user.hunts_created),
          hunts_played: parseInt(user.hunts_played),
          hunts_completed: parseInt(user.hunts_completed)
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};