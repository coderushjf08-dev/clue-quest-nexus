import { useState } from "react"
import { Navigation } from "@/components/Navigation"
import { HeroSection } from "@/components/HeroSection" 
import { PlayMode } from "@/components/PlayMode"
import { Leaderboards } from "@/components/Leaderboards"

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'play' | 'leaderboards'>('home')
  
  const handleHeroNavigate = (view: 'play' | 'create') => {
    if (view === 'play') {
      setCurrentView('play')
    }
    // Create view would be implemented later
  }
  
  const renderCurrentView = () => {
    switch (currentView) {
      case 'play':
        return <PlayMode />
      case 'leaderboards':
        return <Leaderboards />
      default:
        return <HeroSection onNavigate={handleHeroNavigate} />
    }
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation activeView={currentView} onViewChange={setCurrentView} />
      {renderCurrentView()}
    </div>
  )
}

export default Index