import { useState } from "react"
import { GameCard, GameCardContent, GameCardHeader, GameCardTitle } from "./ui/game-card"
import { GameButton } from "./ui/game-button"
import { Trophy, Clock, Lightbulb, Target, Medal, Crown, Award } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface LeaderboardEntry {
  rank: number
  name: string
  avatar?: string
  time: string
  score: number
  hintsUsed: number
  wrongAttempts: number
  completedAt: string
}

const sampleLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    name: "CipherMaster",
    avatar: "",
    time: "04:23",
    score: 485,
    hintsUsed: 1,
    wrongAttempts: 0,
    completedAt: "2 min ago"
  },
  {
    rank: 2,
    name: "PuzzleQueen",
    avatar: "",
    time: "05:17",
    score: 470,
    hintsUsed: 2,
    wrongAttempts: 1,
    completedAt: "5 min ago"
  },
  {
    rank: 3,
    name: "TreasureHunter",
    avatar: "",
    time: "06:45",
    score: 445,
    hintsUsed: 3,
    wrongAttempts: 2,
    completedAt: "12 min ago"
  },
  {
    rank: 4,
    name: "RiddleSolver",
    avatar: "",
    time: "07:12",
    score: 420,
    hintsUsed: 2,
    wrongAttempts: 3,
    completedAt: "18 min ago"
  },
  {
    rank: 5,
    name: "ClueChaser",
    avatar: "",
    time: "08:33",
    score: 395,
    hintsUsed: 4,
    wrongAttempts: 1,
    completedAt: "25 min ago"
  }
]

export const Leaderboards = () => {
  const [activeTab, setActiveTab] = useState<'hunt' | 'global'>('hunt')
  const [timeFilter, setTimeFilter] = useState<'live' | 'daily' | 'weekly' | 'alltime'>('live')
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-accent-gold" />
      case 2:
        return <Medal className="w-5 h-5 text-muted-foreground" />
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-muted-foreground font-gaming text-sm">{rank}</div>
    }
  }
  
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "border-accent-gold shadow-glow-gold"
      case 2:
        return "border-muted-foreground"
      case 3:
        return "border-amber-600"
      default:
        return "border-border"
    }
  }
  
  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold text-foreground mb-4">
            <span className="text-accent-gold">Leaderboards</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Compete with treasure hunters worldwide
          </p>
        </div>
        
        {/* Tab Controls */}
        <div className="flex justify-center mb-8">
          <div className="bg-surface rounded-lg p-1 flex">
            <GameButton
              variant={activeTab === 'hunt' ? 'hero' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('hunt')}
            >
              Current Hunt
            </GameButton>
            <GameButton
              variant={activeTab === 'global' ? 'hero' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('global')}
            >
              Global Rankings
            </GameButton>
          </div>
        </div>
        
        {/* Time Filter */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {(['live', 'daily', 'weekly', 'alltime'] as const).map((filter) => (
              <GameButton
                key={filter}
                variant={timeFilter === filter ? 'neon' : 'ghost'}
                size="sm"
                onClick={() => setTimeFilter(filter)}
                className="capitalize"
              >
                {filter === 'alltime' ? 'All Time' : filter}
              </GameButton>
            ))}
          </div>
        </div>
        
        {/* Current Hunt Info */}
        {activeTab === 'hunt' && (
          <GameCard className="mb-8">
            <GameCardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-gaming text-accent-purple mb-2">
                    The Ancient Cipher Mystery
                  </h3>
                  <p className="text-muted-foreground">
                    5 clues • Created by MysteryMaker • 247 players
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-gaming text-accent-gold">485</div>
                  <div className="text-sm text-muted-foreground">Best Score</div>
                </div>
              </div>
            </GameCardContent>
          </GameCard>
        )}
        
        {/* Leaderboard */}
        <GameCard>
          <GameCardHeader>
            <GameCardTitle className="flex items-center space-x-2">
              <Trophy className="w-6 h-6 text-accent-gold" />
              <span>Live Rankings</span>
              <div className="ml-auto flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span>Live Updates</span>
              </div>
            </GameCardTitle>
          </GameCardHeader>
          <GameCardContent className="p-0">
            <div className="space-y-2 p-6">
              {/* Header Row */}
              <div className="grid grid-cols-12 gap-4 text-sm text-muted-foreground font-gaming mb-4 pb-2 border-b border-border">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-2 text-center">Time</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-1 text-center">Hints</div>
                <div className="col-span-1 text-center">Wrong</div>
                <div className="col-span-1 text-right">Completed</div>
              </div>
              
              {/* Leaderboard Entries */}
              {sampleLeaderboard.map((entry, index) => (
                <div
                  key={entry.rank}
                  className={`leaderboard-row grid grid-cols-12 gap-4 items-center py-3 px-4 rounded-lg transition-all duration-200 hover:bg-surface/50 border ${getRankColor(entry.rank)}`}
                >
                  <div className="col-span-1 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="col-span-4 flex items-center space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={entry.avatar} />
                      <AvatarFallback className="bg-accent-purple/20 text-accent-purple text-sm">
                        {entry.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-foreground">{entry.name}</div>
                      {entry.rank <= 3 && (
                        <div className="text-xs text-accent-gold">Champion</div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="w-4 h-4 text-accent-teal" />
                      <span className="font-gaming text-accent-teal">{entry.time}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Trophy className="w-4 h-4 text-accent-gold" />
                      <span className="font-gaming text-accent-gold">{entry.score}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-1 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Lightbulb className="w-4 h-4 text-accent-purple" />
                      <span className="font-gaming text-accent-purple">{entry.hintsUsed}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-1 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Target className="w-4 h-4 text-danger" />
                      <span className="font-gaming text-danger">{entry.wrongAttempts}</span>
                    </div>
                  </div>
                  
                  <div className="col-span-1 text-right text-sm text-muted-foreground">
                    {entry.completedAt}
                  </div>
                </div>
              ))}
            </div>
          </GameCardContent>
        </GameCard>
        
        {/* Your Rank Card */}
        <GameCard className="mt-8 bg-gradient-to-r from-accent-purple/10 to-accent-teal/10">
          <GameCardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center">
                  <span className="font-gaming text-accent-purple">#12</span>
                </div>
                <div>
                  <div className="font-medium text-foreground">Your Best Run</div>
                  <div className="text-sm text-muted-foreground">Time: 09:45 • Score: 365</div>
                </div>
              </div>
              <GameButton variant="hero" size="sm">
                Beat Your Record
              </GameButton>
            </div>
          </GameCardContent>
        </GameCard>
      </div>
    </div>
  )
}