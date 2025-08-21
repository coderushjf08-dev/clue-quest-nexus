import { GameButton } from "./ui/game-button"
import { Play, Plus, Trophy } from "lucide-react"
import { GameCard, GameCardContent, GameCardDescription, GameCardHeader, GameCardTitle } from "./ui/game-card"

interface HeroSectionProps {
  onNavigate: (view: 'play' | 'create') => void
}

export const HeroSection = ({ onNavigate }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 treasure-lines opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/10 via-transparent to-accent-teal/10"></div>
      
      {/* Hero Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Title */}
          <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 text-glow">
            <span className="text-accent-purple">Reverse</span>
            <br />
            <span className="text-accent-teal">Treasure</span>
            <br />
            <span className="text-accent-gold">Hunt</span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Create immersive multi-step treasure hunts. Challenge players worldwide. 
            Compete on real-time leaderboards in the ultimate puzzle experience.
          </p>
          
          {/* Hero CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <GameButton 
              variant="hero" 
              size="xl" 
              className="w-full sm:w-auto"
              onClick={() => onNavigate('play')}
            >
              <Play className="w-6 h-6 mr-2" />
              Start Hunt
            </GameButton>
            <GameButton 
              variant="neon" 
              size="xl" 
              className="w-full sm:w-auto"
              onClick={() => onNavigate('create')}
            >
              <Plus className="w-6 h-6 mr-2" />
              Create Hunt
            </GameButton>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <GameCard className="bg-surface/50 backdrop-blur-sm">
              <GameCardHeader className="text-center">
                <div className="w-12 h-12 bg-accent-purple/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-6 h-6 text-accent-purple" />
                </div>
                <GameCardTitle className="text-lg">Creator-First</GameCardTitle>
                <GameCardDescription>
                  Intuitive clue creation with text, images, and audio. 
                  Deterministic validation for fair gameplay.
                </GameCardDescription>
              </GameCardHeader>
            </GameCard>
            
            <GameCard className="bg-surface/50 backdrop-blur-sm">
              <GameCardHeader className="text-center">
                <div className="w-12 h-12 bg-accent-teal/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Play className="w-6 h-6 text-accent-teal" />
                </div>
                <GameCardTitle className="text-lg">Interactive Play</GameCardTitle>
                <GameCardDescription>
                  Immersive game-style interface with real-time hints, 
                  penalties, and smooth animations.
                </GameCardDescription>
              </GameCardHeader>
            </GameCard>
            
            <GameCard className="bg-surface/50 backdrop-blur-sm">
              <GameCardHeader className="text-center">
                <div className="w-12 h-12 bg-accent-gold/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-6 h-6 text-accent-gold" />
                </div>
                <GameCardTitle className="text-lg">Competitive</GameCardTitle>
                <GameCardDescription>
                  Real-time leaderboards, global rankings, 
                  and achievement systems drive engagement.
                </GameCardDescription>
              </GameCardHeader>
            </GameCard>
          </div>
        </div>
      </div>
      
      {/* Floating Stats */}
      <div className="absolute bottom-8 left-8 right-8 z-10">
        <div className="flex justify-center">
          <div className="bg-surface/80 backdrop-blur-sm border border-border rounded-lg p-4">
            <div className="flex items-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-accent-purple font-gaming text-lg">1,247</div>
                <div className="text-muted-foreground">Active Hunts</div>
              </div>
              <div className="w-px h-6 bg-border"></div>
              <div className="text-center">
                <div className="text-accent-teal font-gaming text-lg">15,392</div>
                <div className="text-muted-foreground">Treasure Hunters</div>
              </div>
              <div className="w-px h-6 bg-border"></div>
              <div className="text-center">
                <div className="text-accent-gold font-gaming text-lg">2.3M</div>
                <div className="text-muted-foreground">Clues Solved</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}