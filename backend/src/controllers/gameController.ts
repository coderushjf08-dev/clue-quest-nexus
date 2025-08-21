import { Request, Response } from 'express';
import { query, getClient } from '../config/database.js';
import { SubmitAnswerRequest, UseHintRequest } from '../types/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const startGame = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { huntId } = req.params;
    const userId = req.user!.id;

    // Check if hunt exists and is accessible
    const huntResult = await query(
      `SELECT h.id, h.title, h.is_public, h.creator_id, h.total_clues
       FROM hunts h 
       WHERE h.id = $1`,
      [huntId]
    );

    if (huntResult.rows.length === 0) {
      res.status(404).json({ error: 'Hunt not found' });
      return;
    }

    const hunt = huntResult.rows[0];

    // Check access permissions
    if (!hunt.is_public && hunt.creator_id !== userId) {
      res.status(403).json({ error: 'Access denied to private hunt' });
      return;
    }

    // Check if user has an active session for this hunt
    const activeSessionResult = await query(
      'SELECT id FROM game_sessions WHERE user_id = $1 AND hunt_id = $2 AND status = $3',
      [userId, huntId, 'active']
    );

    if (activeSessionResult.rows.length > 0) {
      res.status(400).json({ error: 'You already have an active session for this hunt' });
      return;
    }

    // Get first clue
    const firstClueResult = await query(
      'SELECT id, sequence_order FROM clues WHERE hunt_id = $1 ORDER BY sequence_order ASC LIMIT 1',
      [huntId]
    );

    if (firstClueResult.rows.length === 0) {
      res.status(400).json({ error: 'Hunt has no clues' });
      return;
    }

    const firstClue = firstClueResult.rows[0];

    // Create game session
    const sessionResult = await query(
      `INSERT INTO game_sessions (user_id, hunt_id, current_clue_id, current_clue_sequence) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, start_time`,
      [userId, huntId, firstClue.id, firstClue.sequence_order]
    );

    const session = sessionResult.rows[0];

    res.json({
      message: 'Game started successfully',
      session: {
        id: session.id,
        hunt_id: huntId,
        hunt_title: hunt.title,
        total_clues: hunt.total_clues,
        start_time: session.start_time,
        current_clue_sequence: firstClue.sequence_order
      }
    });
  } catch (error) {
    console.error('Start game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCurrentClue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    // Get session and current clue
    const result = await query(
      `SELECT 
        gs.id, gs.hunt_id, gs.current_clue_sequence, gs.total_score, gs.hints_used, gs.status,
        c.id as clue_id, c.title, c.content, c.clue_type, c.media_url, c.hints, c.points_value,
        h.title as hunt_title, h.total_clues,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - gs.start_time))::INTEGER as elapsed_time
       FROM game_sessions gs
       JOIN clues c ON gs.current_clue_id = c.id
       JOIN hunts h ON gs.hunt_id = h.id
       WHERE gs.id = $1 AND gs.user_id = $2 AND gs.status = 'active'`,
      [sessionId, userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Active game session not found' });
      return;
    }

    const session = result.rows[0];

    // Get hints already used for this clue
    const hintsUsedResult = await query(
      'SELECT hint_index FROM hint_usage WHERE session_id = $1 AND clue_id = $2 ORDER BY hint_index',
      [sessionId, session.clue_id]
    );

    const hintsUsed = hintsUsedResult.rows.map(row => row.hint_index);
    const availableHints = JSON.parse(session.hints);

    res.json({
      session: {
        id: session.id,
        hunt_id: session.hunt_id,
        hunt_title: session.hunt_title,
        total_clues: session.total_clues,
        current_clue_sequence: session.current_clue_sequence,
        total_score: session.total_score,
        hints_used: session.hints_used,
        elapsed_time: session.elapsed_time
      },
      clue: {
        id: session.clue_id,
        title: session.title,
        content: session.content,
        clue_type: session.clue_type,
        media_url: session.media_url,
        points_value: session.points_value,
        available_hints: availableHints.length,
        hints_used: hintsUsed,
        revealed_hints: hintsUsed.map(index => availableHints[index]).filter(Boolean)
      }
    });
  } catch (error) {
    console.error('Get current clue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const submitAnswer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const { sessionId } = req.params;
    const { answer } = req.body as SubmitAnswerRequest;
    const userId = req.user!.id;

    // Get current session and clue
    const sessionResult = await client.query(
      `SELECT 
        gs.id, gs.hunt_id, gs.current_clue_id, gs.current_clue_sequence, gs.total_score, 
        gs.hints_used, gs.start_time,
        c.answer, c.answer_type, c.points_value, c.sequence_order,
        h.total_clues
       FROM game_sessions gs
       JOIN clues c ON gs.current_clue_id = c.id
       JOIN hunts h ON gs.hunt_id = h.id
       WHERE gs.id = $1 AND gs.user_id = $2 AND gs.status = 'active'`,
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Active game session not found' });
      return;
    }

    const session = sessionResult.rows[0];
    const userAnswer = answer.toLowerCase().trim();
    const correctAnswer = session.answer.toLowerCase().trim();

    // Check if answer is correct
    let isCorrect = false;
    switch (session.answer_type) {
      case 'exact':
        isCorrect = userAnswer === correctAnswer;
        break;
      case 'contains':
        isCorrect = userAnswer.includes(correctAnswer) || correctAnswer.includes(userAnswer);
        break;
      case 'regex':
        try {
          const regex = new RegExp(correctAnswer, 'i');
          isCorrect = regex.test(userAnswer);
        } catch (e) {
          isCorrect = userAnswer === correctAnswer;
        }
        break;
    }

    // Get attempt count for this clue
    const attemptCountResult = await client.query(
      'SELECT COUNT(*) as count FROM clue_attempts WHERE session_id = $1 AND clue_id = $2',
      [sessionId, session.current_clue_id]
    );
    
    const attemptNumber = parseInt(attemptCountResult.rows[0].count) + 1;

    // Calculate time taken for this clue
    const clueStartResult = await client.query(
      `SELECT COALESCE(MAX(created_at), $2) as clue_start_time 
       FROM clue_attempts 
       WHERE session_id = $1`,
      [sessionId, session.start_time]
    );
    
    const clueStartTime = clueStartResult.rows[0].clue_start_time;
    const timeTaken = Math.floor((Date.now() - new Date(clueStartTime).getTime()) / 1000);

    // Calculate score with penalties
    let scoreEarned = 0;
    if (isCorrect) {
      scoreEarned = session.points_value;
      
      // Apply time penalty (lose 1 point per 30 seconds, minimum 10 points)
      const timePenalty = Math.floor(timeTaken / 30);
      scoreEarned = Math.max(10, scoreEarned - timePenalty);
      
      // Apply attempt penalty (lose 10 points per wrong attempt)
      const attemptPenalty = (attemptNumber - 1) * 10;
      scoreEarned = Math.max(10, scoreEarned - attemptPenalty);
    }

    // Record attempt
    await client.query(
      `INSERT INTO clue_attempts (session_id, clue_id, user_answer, is_correct, attempt_number, time_taken, score_earned) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sessionId, session.current_clue_id, answer, isCorrect, attemptNumber, timeTaken, scoreEarned]
    );

    if (isCorrect) {
      // Update session score
      await client.query(
        'UPDATE game_sessions SET total_score = total_score + $1 WHERE id = $2',
        [scoreEarned, sessionId]
      );

      // Check if this was the last clue
      if (session.current_clue_sequence >= session.total_clues) {
        // Complete the game
        await client.query(
          'UPDATE game_sessions SET status = $1, end_time = CURRENT_TIMESTAMP WHERE id = $2',
          ['completed', sessionId]
        );

        // Refresh leaderboard
        await client.query('REFRESH MATERIALIZED VIEW leaderboard');

        await client.query('COMMIT');

        res.json({
          correct: true,
          score_earned: scoreEarned,
          game_completed: true,
          message: 'Congratulations! You completed the hunt!'
        });
        return;
      }

      // Move to next clue
      const nextClueResult = await client.query(
        'SELECT id FROM clues WHERE hunt_id = $1 AND sequence_order = $2',
        [session.hunt_id, session.current_clue_sequence + 1]
      );

      if (nextClueResult.rows.length > 0) {
        await client.query(
          `UPDATE game_sessions 
           SET current_clue_id = $1, current_clue_sequence = current_clue_sequence + 1 
           WHERE id = $2`,
          [nextClueResult.rows[0].id, sessionId]
        );
      }

      await client.query('COMMIT');

      res.json({
        correct: true,
        score_earned: scoreEarned,
        next_clue: true,
        message: 'Correct! Moving to the next clue.'
      });
    } else {
      await client.query('COMMIT');

      res.json({
        correct: false,
        score_earned: 0,
        attempts: attemptNumber,
        message: 'Incorrect answer. Try again!'
      });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Submit answer error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const useHint = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    
    const { sessionId } = req.params;
    const { hint_index } = req.body as UseHintRequest;
    const userId = req.user!.id;

    // Get current session and clue
    const sessionResult = await client.query(
      `SELECT 
        gs.id, gs.current_clue_id, c.hints
       FROM game_sessions gs
       JOIN clues c ON gs.current_clue_id = c.id
       WHERE gs.id = $1 AND gs.user_id = $2 AND gs.status = 'active'`,
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'Active game session not found' });
      return;
    }

    const session = sessionResult.rows[0];
    const hints = JSON.parse(session.hints);

    // Validate hint index
    if (hint_index < 0 || hint_index >= hints.length) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'Invalid hint index' });
      return;
    }

    // Check if hint already used
    const existingHintResult = await client.query(
      'SELECT id FROM hint_usage WHERE session_id = $1 AND clue_id = $2 AND hint_index = $3',
      [sessionId, session.current_clue_id, hint_index]
    );

    if (existingHintResult.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'Hint already used' });
      return;
    }

    // Calculate penalty (progressive penalties: 10, 20, 30 points)
    const penaltyPoints = (hint_index + 1) * 10;

    // Record hint usage
    await client.query(
      `INSERT INTO hint_usage (session_id, clue_id, hint_index, penalty_points) 
       VALUES ($1, $2, $3, $4)`,
      [sessionId, session.current_clue_id, hint_index, penaltyPoints]
    );

    // Update session
    await client.query(
      `UPDATE game_sessions 
       SET hints_used = hints_used + 1, total_score = GREATEST(0, total_score - $1) 
       WHERE id = $2`,
      [penaltyPoints, sessionId]
    );

    await client.query('COMMIT');

    res.json({
      hint: hints[hint_index],
      penalty_points: penaltyPoints,
      message: `Hint revealed! -${penaltyPoints} points`
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Use hint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const abandonGame = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const userId = req.user!.id;

    const result = await query(
      'UPDATE game_sessions SET status = $1 WHERE id = $2 AND user_id = $3 AND status = $4 RETURNING id',
      ['abandoned', sessionId, userId, 'active']
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Active game session not found' });
      return;
    }

    res.json({ message: 'Game session abandoned' });
  } catch (error) {
    console.error('Abandon game error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};