import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { query } from '../config/database.js';
import { User } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const result = await query(
      'SELECT id, email, username, created_at, updated_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    req.user = result.rows[0];
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const result = await query(
      'SELECT id, email, username, created_at, updated_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length > 0) {
      req.user = result.rows[0];
    }
  } catch (error) {
    // Ignore invalid tokens for optional auth
  }

  next();
};