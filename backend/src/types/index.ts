export interface User {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Hunt {
  id: string;
  title: string;
  description: string;
  creator_id: string;
  is_public: boolean;
  difficulty_level: 'easy' | 'medium' | 'hard';
  estimated_duration: number; // in minutes
  total_clues: number;
  created_at: Date;
  updated_at: Date;
}

export interface Clue {
  id: string;
  hunt_id: string;
  sequence_order: number;
  title: string;
  content: string;
  clue_type: 'text' | 'image' | 'audio' | 'mixed';
  media_url?: string;
  answer: string;
  answer_type: 'exact' | 'contains' | 'regex';
  hints: string[];
  points_value: number;
  created_at: Date;
  updated_at: Date;
}

export interface GameSession {
  id: string;
  user_id: string;
  hunt_id: string;
  current_clue_id: string | null;
  current_clue_sequence: number;
  start_time: Date;
  end_time?: Date;
  total_score: number;
  hints_used: number;
  time_penalties: number;
  status: 'active' | 'completed' | 'abandoned';
  created_at: Date;
  updated_at: Date;
}

export interface ClueAttempt {
  id: string;
  session_id: string;
  clue_id: string;
  user_answer: string;
  is_correct: boolean;
  hints_used_count: number;
  attempt_number: number;
  time_taken: number; // in seconds
  score_earned: number;
  created_at: Date;
}

export interface Leaderboard {
  id: string;
  hunt_id: string;
  user_id: string;
  username: string;
  total_time: number; // in seconds
  total_score: number;
  hints_used: number;
  completion_date: Date;
  rank?: number;
}

export interface HintUsage {
  id: string;
  session_id: string;
  clue_id: string;
  hint_index: number;
  penalty_points: number;
  created_at: Date;
}

// Request/Response types
export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateHuntRequest {
  title: string;
  description: string;
  is_public: boolean;
  difficulty_level: 'easy' | 'medium' | 'hard';
  estimated_duration: number;
  clues: CreateClueRequest[];
}

export interface CreateClueRequest {
  title: string;
  content: string;
  clue_type: 'text' | 'image' | 'audio' | 'mixed';
  answer: string;
  answer_type: 'exact' | 'contains' | 'regex';
  hints: string[];
  points_value: number;
}

export interface SubmitAnswerRequest {
  answer: string;
}

export interface UseHintRequest {
  hint_index: number;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}