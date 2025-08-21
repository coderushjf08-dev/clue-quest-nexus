import { Request, Response } from 'express';
import { query } from '../config/database.js';

export const getHuntLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { huntId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get hunt leaderboard
    const result = await query(
      `SELECT 
        l.user_id,
        l.username,
        l.total_time,
        l.total_score,
        l.hints_used,
        l.completion_date,
        l.hunt_rank as rank
       FROM leaderboard l
       WHERE l.hunt_id = $1
       ORDER BY l.hunt_rank ASC
       LIMIT $2 OFFSET $3`,
      [huntId, Number(limit), offset]
    );

    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) as total FROM leaderboard WHERE hunt_id = $1',
      [huntId]
    );

    // Get hunt info
    const huntResult = await query(
      'SELECT title, description FROM hunts WHERE id = $1',
      [huntId]
    );

    if (huntResult.rows.length === 0) {
      res.status(404).json({ error: 'Hunt not found' });
      return;
    }

    res.json({
      hunt: huntResult.rows[0],
      leaderboard: result.rows.map(row => ({
        ...row,
        total_time_formatted: formatTime(row.total_time)
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get hunt leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGlobalLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, timeframe = 'all' } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '';
    const params: any[] = [Number(limit), offset];

    // Add timeframe filter
    if (timeframe === 'week') {
      whereClause = 'WHERE l.completion_date >= CURRENT_DATE - INTERVAL \'7 days\'';
    } else if (timeframe === 'month') {
      whereClause = 'WHERE l.completion_date >= CURRENT_DATE - INTERVAL \'30 days\'';
    }

    const result = await query(
      `SELECT 
        l.user_id,
        l.username,
        COUNT(*) as hunts_completed,
        SUM(l.total_score) as total_score,
        AVG(l.total_time) as avg_time,
        SUM(l.hints_used) as total_hints_used,
        MAX(l.completion_date) as last_completion,
        ROW_NUMBER() OVER (ORDER BY SUM(l.total_score) DESC, AVG(l.total_time) ASC) as rank
       FROM leaderboard l
       ${whereClause}
       GROUP BY l.user_id, l.username
       ORDER BY total_score DESC, avg_time ASC
       LIMIT $1 OFFSET $2`,
      params
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(DISTINCT l.user_id) as total
       FROM leaderboard l
       ${whereClause}`
    );

    res.json({
      leaderboard: result.rows.map(row => ({
        ...row,
        avg_time: Math.round(row.avg_time),
        avg_time_formatted: formatTime(Math.round(row.avg_time))
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(countResult.rows[0].total),
        pages: Math.ceil(parseInt(countResult.rows[0].total) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const { targetUserId } = req.params;
    const userIdToQuery = targetUserId || userId;

    if (!userIdToQuery) {
      res.status(400).json({ error: 'User ID required' });
      return;
    }

    // Get user's game statistics
    const statsResult = await query(
      `SELECT 
        u.username,
        COUNT(DISTINCT gs.id) as total_games,
        COUNT(DISTINCT CASE WHEN gs.status = 'completed' THEN gs.id END) as completed_games,
        COUNT(DISTINCT CASE WHEN gs.status = 'active' THEN gs.id END) as active_games,
        COUNT(DISTINCT h.id) as hunts_created,
        COALESCE(AVG(CASE WHEN gs.status = 'completed' THEN gs.total_score END), 0) as avg_score,
        COALESCE(AVG(CASE WHEN gs.status = 'completed' THEN EXTRACT(EPOCH FROM (gs.end_time - gs.start_time)) END), 0) as avg_completion_time
       FROM users u
       LEFT JOIN game_sessions gs ON u.id = gs.user_id
       LEFT JOIN hunts h ON u.id = h.creator_id
       WHERE u.id = $1
       GROUP BY u.id, u.username`,
      [userIdToQuery]
    );

    if (statsResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const stats = statsResult.rows[0];

    // Get user's best performances
    const bestPerformancesResult = await query(
      `SELECT 
        h.title as hunt_title,
        l.total_score,
        l.total_time,
        l.hints_used,
        l.hunt_rank,
        l.completion_date
       FROM leaderboard l
       JOIN hunts h ON l.hunt_id = h.id
       WHERE l.user_id = $1
       ORDER BY l.total_score DESC, l.total_time ASC
       LIMIT 5`,
      [userIdToQuery]
    );

    // Get user's recent activity
    const recentActivityResult = await query(
      `SELECT 
        h.title as hunt_title,
        gs.status,
        gs.total_score,
        gs.start_time,
        gs.end_time,
        CASE WHEN gs.status = 'completed' 
             THEN EXTRACT(EPOCH FROM (gs.end_time - gs.start_time))::INTEGER 
             ELSE NULL END as duration
       FROM game_sessions gs
       JOIN hunts h ON gs.hunt_id = h.id
       WHERE gs.user_id = $1
       ORDER BY gs.start_time DESC
       LIMIT 10`,
      [userIdToQuery]
    );

    res.json({
      user: {
        username: stats.username,
        stats: {
          total_games: parseInt(stats.total_games),
          completed_games: parseInt(stats.completed_games),
          active_games: parseInt(stats.active_games),
          hunts_created: parseInt(stats.hunts_created),
          avg_score: Math.round(stats.avg_score),
          avg_completion_time: Math.round(stats.avg_completion_time),
          avg_completion_time_formatted: formatTime(Math.round(stats.avg_completion_time)),
          completion_rate: stats.total_games > 0 ? 
            Math.round((stats.completed_games / stats.total_games) * 100) : 0
        },
        best_performances: bestPerformancesResult.rows.map(row => ({
          ...row,
          total_time_formatted: formatTime(row.total_time)
        })),
        recent_activity: recentActivityResult.rows.map(row => ({
          ...row,
          duration_formatted: row.duration ? formatTime(row.duration) : null
        }))
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refreshLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    await query('REFRESH MATERIALIZED VIEW leaderboard');
    res.json({ message: 'Leaderboard refreshed successfully' });
  } catch (error) {
    console.error('Refresh leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to format time in seconds to MM:SS format
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}