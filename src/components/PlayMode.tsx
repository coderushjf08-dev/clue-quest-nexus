import { useState, useEffect } from "react"
import { GameButton } from "./ui/game-button"
import { GameCard, GameCardContent, GameCardHeader, GameCardTitle } from "./ui/game-card"
import { Input } from "./ui/input"
import { Clock, Lightbulb, AlertCircle, CheckCircle, Trophy } from "lucide-react"

interface Clue {
  id: string
  title: string
  content: string
  hints: string[]
  answer: string
}

const sampleClue: Clue = {
  id: "1",
  title: "The Ancient Riddle",
  content: "I speak without a mouth and hear without ears. I have no body, but come alive with the wind. What am I?",
  hints: [
    "Think about natural phenomena (-10 points)",
    "It bounces off mountains and valleys (-20 points)", 
    "You can hear it calling back to you (-30 points)"
  ],
  answer: "echo"
}

export const PlayMode = () => {
  const [currentAnswer, setCurrentAnswer] = useState("")
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [wrongAttempts, setWrongAttempts] = useState(0)
  const [score, setScore] = useState(100)
  const [showHint, setShowHint] = useState(false)
  const [gameState, setGameState] = useState<'playing' | 'correct' | 'wrong'>('playing')
  
  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  const handleSubmit = () => {
    if (currentAnswer.toLowerCase().trim() === sampleClue.answer.toLowerCase()) {
      setGameState('correct')
      setTimeout(() => {
        // Next clue logic would go here
      }, 2000)
    } else {
      setGameState('wrong')
      setWrongAttempts(prev => prev + 1)
      setScore(prev => Math.max(0, prev - 5))
      setTimeout(() => setGameState('playing'), 1500)
    }
  }
  
  const useHint = () => {
    if (hintsUsed < sampleClue.hints.length) {
      setShowHint(true)
      setHintsUsed(prev => prev + 1)
      const penalties = [10, 20, 30]
      setScore(prev => Math.max(0, prev - penalties[hintsUsed]))
    }
  }
  
  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* HUD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="hud-panel text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Clock className="w-5 h-5 text-accent-teal" />
              <span className="text-sm text-muted-foreground">Time</span>
            </div>
            <div className="font-gaming text-xl text-accent-teal">{formatTime(timeElapsed)}</div>
          </div>
          
          <div className="hud-panel text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Trophy className="w-5 h-5 text-accent-gold" />
              <span className="text-sm text-muted-foreground">Score</span>
            </div>
            <div className="font-gaming text-xl text-accent-gold">{score}</div>
          </div>
          
          <div className="hud-panel text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Lightbulb className="w-5 h-5 text-accent-purple" />
              <span className="text-sm text-muted-foreground">Hints</span>
            </div>
            <div className="font-gaming text-xl text-accent-purple">{hintsUsed}/3</div>
          </div>
          
          <div className="hud-panel text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-danger" />
              <span className="text-sm text-muted-foreground">Wrong</span>
            </div>
            <div className="font-gaming text-xl text-danger">{wrongAttempts}</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Clue 1 of 5</span>
            <span>20% Complete</span>
          </div>
          <div className="w-full bg-surface rounded-full h-2">
            <div className="bg-gradient-primary h-2 rounded-full transition-all duration-500" style={{ width: '20%' }}></div>
          </div>
        </div>
        
        {/* Main Clue Card */}
        <GameCard className="mb-8">
          <GameCardHeader>
            <GameCardTitle className="text-center text-accent-purple">{sampleClue.title}</GameCardTitle>
          </GameCardHeader>
          <GameCardContent>
            <div className="text-center mb-8">
              <p className="text-lg leading-relaxed text-foreground">
                {sampleClue.content}
              </p>
            </div>
            
            {/* Hint Display */}
            {showHint && hintsUsed > 0 && (
              <div className="mb-6 p-4 bg-accent-purple/10 rounded-lg border border-accent-purple/20 animate-fade-in">
                <div className="flex items-start space-x-2">
                  <Lightbulb className="w-5 h-5 text-accent-purple mt-0.5" />
                  <div>
                    <div className="font-medium text-accent-purple mb-1">Hint {hintsUsed}</div>
                    <div className="text-muted-foreground">{sampleClue.hints[hintsUsed - 1]}</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Answer Input */}
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="flex-1 bg-surface border-border focus:border-accent-purple"
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                <GameButton 
                  variant="hero" 
                  onClick={handleSubmit}
                  disabled={!currentAnswer.trim()}
                >
                  Submit
                </GameButton>
              </div>
              
              <div className="flex justify-between">
                <GameButton
                  variant="outline"
                  onClick={useHint}
                  disabled={hintsUsed >= sampleClue.hints.length}
                  className="border-accent-purple text-accent-purple hover:bg-accent-purple hover:text-background"
                >
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Use Hint {hintsUsed < 3 ? `(-${[10, 20, 30][hintsUsed]} pts)` : ''}
                </GameButton>
                
                <GameButton variant="ghost" className="text-muted-foreground">
                  Skip Clue (-50 pts)
                </GameButton>
              </div>
            </div>
          </GameCardContent>
        </GameCard>
        
        {/* Game State Feedback */}
        {gameState === 'correct' && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
            <GameCard className="bg-success/20 border-success animate-scale-in max-w-md">
              <GameCardContent className="text-center p-8">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h3 className="text-2xl font-gaming text-success mb-2">Correct!</h3>
                <p className="text-muted-foreground">Moving to next clue...</p>
              </GameCardContent>
            </GameCard>
          </div>
        )}
        
        {gameState === 'wrong' && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-background/80 backdrop-blur-sm">
            <GameCard className="bg-danger/20 border-danger animate-scale-in max-w-md">
              <GameCardContent className="text-center p-8">
                <AlertCircle className="w-16 h-16 text-danger mx-auto mb-4" />
                <h3 className="text-2xl font-gaming text-danger mb-2">Try Again</h3>
                <p className="text-muted-foreground">-5 points penalty</p>
              </GameCardContent>
            </GameCard>
          </div>
        )}
      </div>
    </div>
  )
}