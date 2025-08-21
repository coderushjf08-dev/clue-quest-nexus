import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';

async function seedDatabase() {
  try {
    console.log('Seeding database with sample data...');
    
    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const users = [
      { email: 'admin@example.com', username: 'admin', password: hashedPassword },
      { email: 'player1@example.com', username: 'player1', password: hashedPassword },
      { email: 'player2@example.com', username: 'player2', password: hashedPassword },
    ];
    
    const userIds: string[] = [];
    
    for (const user of users) {
      const result = await query(
        `INSERT INTO users (email, username, password_hash) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (email) DO NOTHING 
         RETURNING id`,
        [user.email, user.username, user.password]
      );
      
      if (result.rows.length > 0) {
        userIds.push(result.rows[0].id);
        console.log(`Created user: ${user.username}`);
      } else {
        // Get existing user ID
        const existingUser = await query('SELECT id FROM users WHERE email = $1', [user.email]);
        if (existingUser.rows.length > 0) {
          userIds.push(existingUser.rows[0].id);
        }
      }
    }
    
    // Create sample hunt
    const huntResult = await query(
      `INSERT INTO hunts (title, description, creator_id, is_public, difficulty_level, estimated_duration) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       ON CONFLICT DO NOTHING 
       RETURNING id`,
      [
        'The Ancient Mystery',
        'Embark on a journey through ancient riddles and puzzles. Test your wit and wisdom!',
        userIds[0],
        true,
        'medium',
        30
      ]
    );
    
    if (huntResult.rows.length > 0) {
      const huntId = huntResult.rows[0].id;
      console.log('Created sample hunt: The Ancient Mystery');
      
      // Create sample clues
      const clues = [
        {
          title: 'The Silent Speaker',
          content: 'I speak without a mouth and hear without ears. I have no body, but come alive with the wind. What am I?',
          answer: 'echo',
          hints: [
            'Think about natural phenomena (-10 points)',
            'It bounces off mountains and valleys (-20 points)',
            'You can hear it calling back to you (-30 points)'
          ]
        },
        {
          title: 'The Time Keeper',
          content: 'I have a face but no eyes, hands but no arms. I move without walking. What am I?',
          answer: 'clock',
          hints: [
            'Found in every home and office (-10 points)',
            'It helps you stay punctual (-20 points)',
            'Tick tock, tick tock (-30 points)'
          ]
        },
        {
          title: 'The Final Challenge',
          content: 'The more you take, the more you leave behind. What am I?',
          answer: 'footsteps',
          hints: [
            'Think about movement (-10 points)',
            'They follow you everywhere you go (-20 points)',
            'Look down to see them (-30 points)'
          ]
        }
      ];
      
      for (let i = 0; i < clues.length; i++) {
        const clue = clues[i]!;
        await query(
          `INSERT INTO clues (hunt_id, sequence_order, title, content, answer, hints, points_value) 
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [huntId, i + 1, clue.title, clue.content, clue.answer, JSON.stringify(clue.hints), 100]
        );
        console.log(`Created clue ${i + 1}: ${clue.title}`);
      }
    }
    
    // Refresh materialized view
    await query('REFRESH MATERIALIZED VIEW leaderboard');
    
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();