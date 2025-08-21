-- Reverse Treasure Hunt Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hunts table
CREATE TABLE hunts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN DEFAULT true,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    estimated_duration INTEGER NOT NULL, -- in minutes
    total_clues INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clues table
CREATE TABLE clues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hunt_id UUID NOT NULL REFERENCES hunts(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    clue_type VARCHAR(20) CHECK (clue_type IN ('text', 'image', 'audio', 'mixed')) DEFAULT 'text',
    media_url TEXT,
    answer VARCHAR(500) NOT NULL,
    answer_type VARCHAR(20) CHECK (answer_type IN ('exact', 'contains', 'regex')) DEFAULT 'exact',
    hints JSONB DEFAULT '[]'::jsonb,
    points_value INTEGER DEFAULT 100,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(hunt_id, sequence_order)
);

-- Game sessions table
CREATE TABLE game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hunt_id UUID NOT NULL REFERENCES hunts(id) ON DELETE CASCADE,
    current_clue_id UUID REFERENCES clues(id),
    current_clue_sequence INTEGER DEFAULT 1,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP WITH TIME ZONE,
    total_score INTEGER DEFAULT 0,
    hints_used INTEGER DEFAULT 0,
    time_penalties INTEGER DEFAULT 0,
    status VARCHAR(20) CHECK (status IN ('active', 'completed', 'abandoned')) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Clue attempts table
CREATE TABLE clue_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    clue_id UUID NOT NULL REFERENCES clues(id) ON DELETE CASCADE,
    user_answer VARCHAR(500) NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    hints_used_count INTEGER DEFAULT 0,
    attempt_number INTEGER DEFAULT 1,
    time_taken INTEGER DEFAULT 0, -- in seconds
    score_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Hint usage table
CREATE TABLE hint_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    clue_id UUID NOT NULL REFERENCES clues(id) ON DELETE CASCADE,
    hint_index INTEGER NOT NULL,
    penalty_points INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard view (materialized for performance)
CREATE MATERIALIZED VIEW leaderboard AS
SELECT 
    l.hunt_id,
    l.user_id,
    u.username,
    l.total_time,
    l.total_score,
    l.hints_used,
    l.completion_date,
    ROW_NUMBER() OVER (PARTITION BY l.hunt_id ORDER BY l.total_score DESC, l.total_time ASC) as hunt_rank,
    ROW_NUMBER() OVER (ORDER BY l.total_score DESC, l.total_time ASC) as global_rank
FROM (
    SELECT 
        gs.hunt_id,
        gs.user_id,
        EXTRACT(EPOCH FROM (gs.end_time - gs.start_time))::INTEGER as total_time,
        gs.total_score,
        gs.hints_used,
        gs.end_time as completion_date
    FROM game_sessions gs
    WHERE gs.status = 'completed'
) l
JOIN users u ON l.user_id = u.id;

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_hunts_creator_id ON hunts(creator_id);
CREATE INDEX idx_hunts_is_public ON hunts(is_public);
CREATE INDEX idx_hunts_difficulty ON hunts(difficulty_level);
CREATE INDEX idx_clues_hunt_id ON clues(hunt_id);
CREATE INDEX idx_clues_sequence ON clues(hunt_id, sequence_order);
CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_hunt_id ON game_sessions(hunt_id);
CREATE INDEX idx_game_sessions_status ON game_sessions(status);
CREATE INDEX idx_clue_attempts_session_id ON clue_attempts(session_id);
CREATE INDEX idx_clue_attempts_clue_id ON clue_attempts(clue_id);
CREATE INDEX idx_hint_usage_session_id ON hint_usage(session_id);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hunts_updated_at BEFORE UPDATE ON hunts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clues_updated_at BEFORE UPDATE ON clues FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_game_sessions_updated_at BEFORE UPDATE ON game_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to refresh leaderboard
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS VOID AS $$
BEGIN
    REFRESH MATERIALIZED VIEW leaderboard;
END;
$$ language 'plpgsql';

-- Trigger to update hunt total_clues when clues are added/removed
CREATE OR REPLACE FUNCTION update_hunt_total_clues()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE hunts SET total_clues = total_clues + 1 WHERE id = NEW.hunt_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE hunts SET total_clues = total_clues - 1 WHERE id = OLD.hunt_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_hunt_clue_count_insert AFTER INSERT ON clues FOR EACH ROW EXECUTE FUNCTION update_hunt_total_clues();
CREATE TRIGGER update_hunt_clue_count_delete AFTER DELETE ON clues FOR EACH ROW EXECUTE FUNCTION update_hunt_total_clues();