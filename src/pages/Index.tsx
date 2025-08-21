import { useState } from "react"
import { Navigation } from "@/components/Navigation"
import { HeroSection } from "@/components/HeroSection" 
import { PlayMode } from "@/components/PlayMode"
import { Leaderboards } from "@/components/Leaderboards"
import { CreateHunt } from "@/components/CreateHunt"

const Index = () => {
  const [currentView, setCurrentView] = useState<'home' | 'play' | 'leaderboards' | 'create'>('home')
  
  const handleHeroNavigate = (view: 'play' | 'create') => {
    setCurrentView(view)
  }
  
  const renderCurrentView = () => {
    switch (currentView) {
      case 'play':
        return <PlayMode />
      case 'leaderboards':
        return <Leaderboards />
      case 'create':
        return <CreateHunt onBack={() => setCurrentView('home')} />
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