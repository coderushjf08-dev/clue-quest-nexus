import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Book, 
  Camera, 
  Music, 
  Gamepad2, 
  Puzzle,
  Star,
  Clock,
  Users,
  ChevronRight
} from "lucide-react"

interface HuntTemplate {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  estimatedDuration: number
  clueTypes: ('text' | 'image' | 'audio' | 'mixed')[]
  category: string
  icon: React.ComponentType<any>
  popular?: boolean
  clues: {
    title: string
    content: string
    clue_type: 'text' | 'image' | 'audio' | 'mixed'
    answer: string
    answer_type: 'exact' | 'contains' | 'regex'
    hints: string[]
    points_value: number
  }[]
}

interface HuntTemplatesProps {
  onSelectTemplate: (template: HuntTemplate) => void
  onCreateFromScratch: () => void
}

export const HuntTemplates = ({ onSelectTemplate, onCreateFromScratch }: HuntTemplatesProps) => {
  const templates: HuntTemplate[] = [
    {
      id: 'mystery-mansion',
      title: 'Mystery Mansion',
      description: 'Solve the secrets hidden within an old Victorian mansion',
      difficulty: 'medium',
      estimatedDuration: 45,
      clueTypes: ['text', 'image'],
      category: 'Mystery',
      icon: MapPin,
      popular: true,
      clues: [
        {
          title: 'The Locked Library',
          content: 'In the dusty library, behind books of lore, lies a secret that opens the door. Count the volumes of ancient tales, where wisdom never fails.',
          clue_type: 'text',
          answer: '42',
          answer_type: 'exact',
          hints: [
            'Look for the philosophy section',
            'The answer to life, universe, and everything',
            'Douglas Adams had the answer'
          ],
          points_value: 100
        },
        {
          title: 'The Portrait Gallery',
          content: 'Among the painted faces of the past, one holds a secret that will last. Find the lady in the blue dress, her eyes hold the next address.',
          clue_type: 'image',
          answer: 'attic',
          answer_type: 'exact',
          hints: [
            'She\'s looking upward',
            'The highest room in the house',
            'Where old things are stored'
          ],
          points_value: 120
        },
        {
          title: 'The Final Revelation',
          content: 'In the place where memories sleep, where old treasures we keep, solve this riddle to complete your quest: "I have keys but no locks, I have space but no room, you can enter but not go outside. What am I?"',
          clue_type: 'text',
          answer: 'keyboard',
          answer_type: 'exact',
          hints: [
            'It\'s something you use every day',
            'It helps you communicate',
            'It has letters and numbers'
          ],
          points_value: 150
        }
      ]
    },
    {
      id: 'nature-explorer',
      title: 'Nature Explorer',
      description: 'Discover the wonders of the natural world around you',
      difficulty: 'easy',
      estimatedDuration: 30,
      clueTypes: ['text', 'image'],
      category: 'Outdoor',
      icon: Camera,
      clues: [
        {
          title: 'Tree Identification',
          content: 'Find a tree with leaves that have 5 pointed sections and bark that peels. This tree is known for its colorful fall display.',
          clue_type: 'image',
          answer: 'maple',
          answer_type: 'contains',
          hints: [
            'Its leaf is on the Canadian flag',
            'It produces sweet syrup',
            'Common in North America'
          ],
          points_value: 80
        },
        {
          title: 'Bird Watching',
          content: 'Listen for the bird that says its own name. This black bird is known for its intelligence and loud calls.',
          clue_type: 'audio',
          answer: 'crow',
          answer_type: 'exact',
          hints: [
            'It\'s completely black',
            'Very intelligent bird',
            'Often seen in groups'
          ],
          points_value: 90
        }
      ]
    },
    {
      id: 'music-mystery',
      title: 'Musical Mystery',
      description: 'Follow the rhythm and solve musical puzzles',
      difficulty: 'hard',
      estimatedDuration: 60,
      clueTypes: ['audio', 'text'],
      category: 'Music',
      icon: Music,
      popular: true,
      clues: [
        {
          title: 'Classical Composer',
          content: 'This composer wrote "Für Elise" and his 9th symphony includes "Ode to Joy". He continued composing even after losing his hearing.',
          clue_type: 'audio',
          answer: 'beethoven',
          answer_type: 'exact',
          hints: [
            'German composer',
            'Born in 1770',
            'Famous for his symphonies'
          ],
          points_value: 130
        },
        {
          title: 'Musical Notation',
          content: 'In musical notation, this symbol at the beginning of a staff determines the pitch of the notes. The most common one is named after a letter.',
          clue_type: 'text',
          answer: 'clef',
          answer_type: 'contains',
          hints: [
            'Treble or Bass',
            'Determines note positions',
            'Looks like a fancy letter'
          ],
          points_value: 110
        }
      ]
    },
    {
      id: 'history-quest',
      title: 'History Quest',
      description: 'Journey through time and discover historical mysteries',
      difficulty: 'medium',
      estimatedDuration: 50,
      clueTypes: ['text', 'image', 'mixed'],
      category: 'History',
      icon: Book,
      clues: [
        {
          title: 'Ancient Wonder',
          content: 'This ancient wonder of the world was built as a tomb for a pharaoh. It\'s the only one of the seven wonders still standing today.',
          clue_type: 'text',
          answer: 'pyramid',
          answer_type: 'contains',
          hints: [
            'Located in Egypt',
            'Built with massive stone blocks',
            'Triangular shape'
          ],
          points_value: 120
        },
        {
          title: 'Medieval Castle',
          content: 'This defensive structure was built to protect against invaders. It has high walls, towers, and often a water-filled barrier around it.',
          clue_type: 'image',
          answer: 'moat',
          answer_type: 'exact',
          hints: [
            'Filled with water',
            'Surrounds the castle',
            'Makes it hard to attack'
          ],
          points_value: 100
        }
      ]
    },
    {
      id: 'science-lab',
      title: 'Science Laboratory',
      description: 'Conduct experiments and solve scientific puzzles',
      difficulty: 'hard',
      estimatedDuration: 70,
      clueTypes: ['text', 'mixed'],
      category: 'Science',
      icon: Puzzle,
      clues: [
        {
          title: 'Periodic Element',
          content: 'This element has the atomic number 79 and has been valued throughout history. It doesn\'t tarnish and is often used in jewelry.',
          clue_type: 'text',
          answer: 'gold',
          answer_type: 'exact',
          hints: [
            'Chemical symbol is Au',
            'Very valuable metal',
            'Yellow in color'
          ],
          points_value: 140
        },
        {
          title: 'Physics Formula',
          content: 'Einstein\'s most famous equation relates mass and energy. Complete this formula: E = mc²',
          clue_type: 'text',
          answer: 'energy equals mass times the speed of light squared',
          answer_type: 'contains',
          hints: [
            'E stands for energy',
            'c is the speed of light',
            'Shows mass-energy equivalence'
          ],
          points_value: 160
        }
      ]
    },
    {
      id: 'city-adventure',
      title: 'City Adventure',
      description: 'Explore urban landmarks and city culture',
      difficulty: 'easy',
      estimatedDuration: 40,
      clueTypes: ['text', 'image'],
      category: 'Urban',
      icon: MapPin,
      clues: [
        {
          title: 'Famous Landmark',
          content: 'This tall structure in Paris was built for the 1889 World\'s Fair. It\'s made of iron and is one of the most recognizable landmarks in the world.',
          clue_type: 'image',
          answer: 'eiffel tower',
          answer_type: 'contains',
          hints: [
            'Located in Paris',
            'Iron lattice tower',
            'Named after its engineer'
          ],
          points_value: 90
        },
        {
          title: 'Transportation Hub',
          content: 'This underground transportation system helps millions of people travel around the city quickly. Each line is usually color-coded.',
          clue_type: 'text',
          answer: 'subway',
          answer_type: 'contains',
          hints: [
            'Runs underground',
            'Uses trains',
            'Also called metro'
          ],
          points_value: 80
        }
      ]
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      'Mystery': 'bg-purple-100 text-purple-800',
      'Outdoor': 'bg-green-100 text-green-800',
      'Music': 'bg-blue-100 text-blue-800',
      'History': 'bg-amber-100 text-amber-800',
      'Science': 'bg-cyan-100 text-cyan-800',
      'Urban': 'bg-gray-100 text-gray-800'
    }
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Choose Your Adventure</h2>
        <p className="text-muted-foreground">
          Start with a template or create your own unique hunt from scratch
        </p>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onCreateFromScratch}
          variant="outline"
          size="lg"
          className="border-dashed border-2"
        >
          <Puzzle className="h-5 w-5 mr-2" />
          Create from Scratch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const IconComponent = template.icon
          return (
            <Card key={template.id} className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
              {template.popular && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge className="bg-gradient-to-r from-accent-purple to-accent-teal">
                    <Star className="h-3 w-3 mr-1" />
                    Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {template.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={getCategoryColor(template.category)}
                        >
                          {template.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-2">
                  {template.description}
                </CardDescription>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getDifficultyColor(template.difficulty)}`}></div>
                      <span className="capitalize">{template.difficulty}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{template.estimatedDuration}m</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-muted-foreground">
                      <Puzzle className="h-3 w-3" />
                      <span>{template.clues.length} clues</span>
                    </div>
                    <div className="flex space-x-1">
                      {template.clueTypes.map((type, index) => {
                        const icons = {
                          text: <Book className="h-3 w-3" />,
                          image: <Camera className="h-3 w-3" />,
                          audio: <Music className="h-3 w-3" />,
                          mixed: <Gamepad2 className="h-3 w-3" />
                        }
                        return (
                          <div key={index} className="text-muted-foreground">
                            {icons[type]}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => onSelectTemplate(template)}
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                  variant="outline"
                >
                  Use This Template
                  <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}