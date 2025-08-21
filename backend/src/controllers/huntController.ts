import { Request, Response } from 'express';
import { query, getClient } from '../config/database.js';
import { CreateHuntRequest } from '../types/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const createHunt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const { title, description, is_public, difficulty_level, estimated_duration, clues } = req.body as CreateHuntRequest;
    const creatorId = req.user!.id;

    // Create hunt
    const huntResult = await client.query(
      `INSERT INTO hunts (title, description, creator_id, is_public, difficulty_level, estimated_duration) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id`,
      [title, description, creatorId, is_public, difficulty_level, estimated_duration]
    );

    const huntId = huntResult.rows[0].id;

    // Create clues
    for (let i = 0; i < clues.length; i++) {
      const clue = clues[i]!;
      await client.query(
        `INSERT INTO clues (hunt_id, sequence_order, title, content, clue_type, answer, answer_type, hints, points_value) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          huntId,
          i + 1,
          clue.title,
          clue.content,
          clue.clue_type,
          clue.answer.toLowerCase().trim(),
          clue.answer_type,
          JSON.stringify(clue.hints),
          clue.points_value
        ]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Hunt created successfully',
      hunt: { id: huntId, title, description, total_clues: clues.length }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create hunt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const getHunts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, difficulty, creator } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE h.is_public = true';
    const params: any[] = [Number(limit), offset];
    let paramCount = 2;

    if (difficulty) {
      whereClause += ` AND h.difficulty_level = $${++paramCount}`;
      params.push(difficulty);
    }

    if (creator) {
      whereClause += ` AND u.username ILIKE $${++paramCount}`;
      params.push(`%${creator}%`);
    }

    const result = await query(
      `SELECT 
        h.id, h.title, h.description, h.difficulty_level, h.estimated_duration, 
        h.total_clues, h.created_at, u.username as creator_name,
        COUNT(gs.id) as play_count,
        COUNT(CASE WHEN gs.status = 'completed' THEN 1 END) as completion_count
       FROM hunts h
       JOIN users u ON h.creator_id = u.id
       LEFT JOIN game_sessions gs ON h.id = gs.hunt_id
       ${whereClause}
       GROUP BY h.id, h.title, h.description, h.difficulty_level, h.estimated_duration, 
                h.total_clues, h.created_at, u.username
       ORDER BY h.created_at DESC
       LIMIT $1 OFFSET $2`,
      params
    );

    const countResult = await query(
      `SELECT COUNT(DISTINCT h.id) as total
       FROM hunts h
       JOIN users u ON h.creator_id = u.id
       ${whereClause}`,
      params.slice(2)
    );

    res.json({
      hunts: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get hunts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getHuntById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        h.id, h.title, h.description, h.difficulty_level, h.estimated_duration, 
        h.total_clues, h.created_at, h.is_public, u.username as creator_name,
        COUNT(gs.id) as play_count,
        COUNT(CASE WHEN gs.status = 'completed' THEN 1 END) as completion_count
       FROM hunts h
       JOIN users u ON h.creator_id = u.id
       LEFT JOIN game_sessions gs ON h.id = gs.hunt_id
       WHERE h.id = $1
       GROUP BY h.id, h.title, h.description, h.difficulty_level, h.estimated_duration, 
                h.total_clues, h.created_at, h.is_public, u.username`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Hunt not found' });
      return;
    }

    const hunt = result.rows[0];

    // Check if hunt is public or user is the creator
    const user = (req as any).user;
    if (!hunt.is_public && (!user || user.id !== hunt.creator_id)) {
      res.status(403).json({ error: 'Access denied to private hunt' });
      return;
    }

    res.json({ hunt });
  } catch (error) {
    console.error('Get hunt by ID error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserHunts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const result = await query(
      `SELECT 
        h.id, h.title, h.description, h.difficulty_level, h.estimated_duration, 
        h.total_clues, h.created_at, h.is_public,
        COUNT(gs.id) as play_count,
        COUNT(CASE WHEN gs.status = 'completed' THEN 1 END) as completion_count
       FROM hunts h
       LEFT JOIN game_sessions gs ON h.id = gs.hunt_id
       WHERE h.creator_id = $1
       GROUP BY h.id, h.title, h.description, h.difficulty_level, h.estimated_duration, 
                h.total_clues, h.created_at, h.is_public
       ORDER BY h.created_at DESC`,
      [userId]
    );

    res.json({ hunts: result.rows });
  } catch (error) {
    console.error('Get user hunts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteHunt = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if user owns the hunt
    const huntResult = await query(
      'SELECT creator_id FROM hunts WHERE id = $1',
      [id]
    );

    if (huntResult.rows.length === 0) {
      res.status(404).json({ error: 'Hunt not found' });
      return;
    }

    if (huntResult.rows[0].creator_id !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Delete hunt (cascades to clues and sessions)
    await query('DELETE FROM hunts WHERE id = $1', [id]);

    res.json({ message: 'Hunt deleted successfully' });
  } catch (error) {
    console.error('Delete hunt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};