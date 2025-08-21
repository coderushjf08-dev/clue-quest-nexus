import { GameButton } from "./ui/game-button"
import { Trophy, Plus, Play, Users, Settings, Home } from "lucide-react"
import { useState } from "react"

interface NavigationProps {
  activeView: string
  onViewChange: (view: 'home' | 'play' | 'leaderboards') => void
}

export const Navigation = ({ activeView, onViewChange }: NavigationProps) => {
  
  const navItems = [
    { id: 'home', label: 'Discover', icon: Home },
    { id: 'play', label: 'Play', icon: Play },
    { id: 'create', label: 'Create', icon: Plus },
    { id: 'leaderboards', label: 'Leaderboards', icon: Trophy },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-background" />
            </div>
            <span className="text-xl font-gaming text-foreground">RTH</span>
          </div>
          
          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-2">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <GameButton
                  key={item.id}
                  variant={isActive ? "hero" : "ghost"}
                  size="sm"
                  onClick={() => onViewChange(item.id as 'home' | 'play' | 'leaderboards')}
                  className="flex items-center space-x-2"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </GameButton>
              )
            })}
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <GameButton 
              variant="neon" 
              size="sm" 
              className="hidden sm:flex"
              onClick={() => onViewChange('play')}
            >
              Start Hunt
            </GameButton>
            <GameButton variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </GameButton>
          </div>
        </div>
      </div>
    </nav>
  )
}