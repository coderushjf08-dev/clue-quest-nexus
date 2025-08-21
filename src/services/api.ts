// API service for treasure hunt application

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  // Get auth token from localStorage
  const token = localStorage.getItem('authToken')
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData
      )
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    
    // Network or other errors
    throw new ApiError(
      'Network error or server unavailable',
      0,
      error
    )
  }
}

// Authentication API
export const authApi = {
  async register(userData: { email: string; username: string; password: string }) {
    return apiRequest<{
      message: string
      user: {
        id: string
        email: string
        username: string
        created_at: string
      }
      token: string
    }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  },

  async login(credentials: { email: string; password: string }) {
    return apiRequest<{
      message: string
      user: {
        id: string
        email: string
        username: string
        created_at: string
      }
      token: string
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })
  },

  async getProfile() {
    return apiRequest<{
      user: {
        id: string
        email: string
        username: string
        created_at: string
        stats: {
          hunts_created: number
          hunts_played: number
          hunts_completed: number
        }
      }
    }>('/auth/profile')
  },
}

// Hunts API
export const huntsApi = {
  async createHunt(huntData: {
    title: string
    description: string
    is_public: boolean
    difficulty_level: 'easy' | 'medium' | 'hard'
    estimated_duration: number
    clues: {
      title: string
      content: string
      clue_type: 'text' | 'image' | 'audio' | 'mixed'
      answer: string
      answer_type: 'exact' | 'contains' | 'regex'
      hints: string[]
      points_value: number
    }[]
  }) {
    return apiRequest<{
      message: string
      hunt: {
        id: string
        title: string
        description: string
        total_clues: number
      }
    }>('/hunts', {
      method: 'POST',
      body: JSON.stringify(huntData),
    })
  },

  async getHunts(params?: {
    page?: number
    limit?: number
    difficulty?: string
    creator?: string
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return apiRequest<{
      hunts: Array<{
        id: string
        title: string
        description: string
        difficulty_level: string
        estimated_duration: number
        total_clues: number
        created_at: string
        creator_name: string
        play_count: number
        completion_count: number
      }>
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>(`/hunts${query ? `?${query}` : ''}`)
  },

  async getHuntById(id: string) {
    return apiRequest<{
      hunt: {
        id: string
        title: string
        description: string
        difficulty_level: string
        estimated_duration: number
        total_clues: number
        created_at: string
        is_public: boolean
        creator_name: string
        play_count: number
        completion_count: number
      }
    }>(`/hunts/${id}`)
  },

  async getUserHunts() {
    return apiRequest<{
      hunts: Array<{
        id: string
        title: string
        description: string
        difficulty_level: string
        estimated_duration: number
        total_clues: number
        created_at: string
        is_public: boolean
        play_count: number
        completion_count: number
      }>
    }>('/hunts/my')
  },

  async deleteHunt(id: string) {
    return apiRequest<{ message: string }>(`/hunts/${id}`, {
      method: 'DELETE',
    })
  },
}

// Game API
export const gameApi = {
  async startGame(huntId: string) {
    return apiRequest<{
      message: string
      session: {
        id: string
        hunt_id: string
        hunt_title: string
        total_clues: number
        start_time: string
        current_clue_sequence: number
      }
    }>(`/game/start/${huntId}`, {
      method: 'POST',
    })
  },

  async getCurrentClue(sessionId: string) {
    return apiRequest<{
      session: {
        id: string
        hunt_id: string
        hunt_title: string
        total_clues: number
        current_clue_sequence: number
        total_score: number
        hints_used: number
        elapsed_time: number
      }
      clue: {
        id: string
        title: string
        content: string
        clue_type: string
        media_url?: string
        points_value: number
        available_hints: number
        hints_used: number[]
        revealed_hints: string[]
      }
    }>(`/game/${sessionId}/clue`)
  },

  async submitAnswer(sessionId: string, answer: string) {
    return apiRequest<{
      correct: boolean
      score_earned: number
      game_completed?: boolean
      next_clue?: boolean
      attempts?: number
      message: string
    }>(`/game/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    })
  },

  async useHint(sessionId: string, hintIndex: number) {
    return apiRequest<{
      hint: string
      penalty_points: number
      message: string
    }>(`/game/${sessionId}/hint`, {
      method: 'POST',
      body: JSON.stringify({ hint_index: hintIndex }),
    })
  },

  async abandonGame(sessionId: string) {
    return apiRequest<{ message: string }>(`/game/${sessionId}/abandon`, {
      method: 'POST',
    })
  },
}

// Upload API
export const uploadApi = {
  async uploadFile(file: File): Promise<{
    message: string
    file: {
      public_id: string
      url: string
      format: string
      resource_type: string
      bytes: number
      width?: number
      height?: number
      duration?: number
    }
  }> {
    const formData = new FormData()
    formData.append('file', file)

    const token = localStorage.getItem('authToken')
    
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.error || 'Upload failed',
        response.status,
        errorData
      )
    }

    return await response.json()
  },

  async deleteFile(publicId: string, resourceType: string = 'image') {
    return apiRequest<{ message: string }>(`/upload/${publicId}?resource_type=${resourceType}`, {
      method: 'DELETE',
    })
  },

  async getFileInfo(publicId: string, resourceType: string = 'image') {
    return apiRequest<{
      file: {
        public_id: string
        url: string
        format: string
        resource_type: string
        bytes: number
        width?: number
        height?: number
        duration?: number
        created_at: string
      }
    }>(`/upload/${publicId}?resource_type=${resourceType}`)
  },
}

// Leaderboard API
export const leaderboardApi = {
  async getHuntLeaderboard(huntId: string, params?: { page?: number; limit?: number }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return apiRequest<{
      hunt: {
        title: string
        description: string
      }
      leaderboard: Array<{
        user_id: string
        username: string
        total_time: number
        total_score: number
        hints_used: number
        completion_date: string
        rank: number
        total_time_formatted: string
      }>
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>(`/leaderboard/hunt/${huntId}${query ? `?${query}` : ''}`)
  },

  async getGlobalLeaderboard(params?: { 
    page?: number
    limit?: number
    timeframe?: 'all' | 'week' | 'month'
  }) {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })
    }
    
    const query = searchParams.toString()
    return apiRequest<{
      leaderboard: Array<{
        user_id: string
        username: string
        hunts_completed: number
        total_score: number
        avg_time: number
        total_hints_used: number
        last_completion: string
        rank: number
        avg_time_formatted: string
      }>
      pagination: {
        page: number
        limit: number
        total: number
        pages: number
      }
    }>(`/leaderboard/global${query ? `?${query}` : ''}`)
  },

  async getUserStats(userId?: string) {
    const endpoint = userId ? `/leaderboard/user/${userId}/stats` : '/leaderboard/user/stats'
    return apiRequest<{
      user: {
        username: string
        stats: {
          total_games: number
          completed_games: number
          active_games: number
          hunts_created: number
          avg_score: number
          avg_completion_time: number
          avg_completion_time_formatted: string
          completion_rate: number
        }
        best_performances: Array<{
          hunt_title: string
          total_score: number
          total_time: number
          hints_used: number
          hunt_rank: number
          completion_date: string
          total_time_formatted: string
        }>
        recent_activity: Array<{
          hunt_title: string
          status: string
          total_score: number
          start_time: string
          end_time?: string
          duration?: number
          duration_formatted?: string
        }>
      }
    }>(endpoint)
  },
}

// Export the ApiError class for error handling
export { ApiError }