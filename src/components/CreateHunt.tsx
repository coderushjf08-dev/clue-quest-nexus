import { useState, useEffect } from "react"
import { useHuntCreation } from "@/hooks/useHuntCreation"
import { FileUpload } from "@/components/ui/file-upload"
import { HuntTemplates } from "@/components/HuntTemplates"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Eye, 
  Upload, 
  Image, 
  Music, 
  Type, 
  Lightbulb,
  Settings,
  Save,
  Play,
  Clock,
  Users,
  Target,
  ArrowUp,
  ArrowDown,
  Copy
} from "lucide-react"

interface Clue {
  id: string
  title: string
  content: string
  clue_type: 'text' | 'image' | 'audio' | 'mixed'
  answer: string
  answer_type: 'exact' | 'contains' | 'regex'
  hints: string[]
  points_value: number
  media_url?: string
}

interface Hunt {
  title: string
  description: string
  is_public: boolean
  difficulty_level: 'easy' | 'medium' | 'hard'
  estimated_duration: number
  clues: Clue[]
}

interface CreateHuntProps {
  onBack: () => void
}

export const CreateHunt = ({ onBack }: CreateHuntProps) => {
  const [showTemplates, setShowTemplates] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [hunt, setHunt] = useState<Hunt>({
    title: "",
    description: "",
    is_public: true,
    difficulty_level: "medium",
    estimated_duration: 30,
    clues: []
  })
  
  const [editingClue, setEditingClue] = useState<Clue | null>(null)
  const [previewMode, setPreviewMode] = useState(false)
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, File>>({})
  
  const { 
    createHunt, 
    uploadFile, 
    validateHunt, 
    saveDraft, 
    loadDraft, 
    clearDraft,
    isSubmitting, 
    uploadProgress 
  } = useHuntCreation()

  // Load draft on mount
  useEffect(() => {
    const draft = loadDraft()
    if (draft) {
      setHunt(draft)
      setShowTemplates(false)
      toast.info('Draft loaded', {
        description: 'Your previous work has been restored.'
      })
    }
  }, [])

  const handleTemplateSelect = (template: any) => {
    setHunt({
      title: template.title,
      description: template.description,
      is_public: true,
      difficulty_level: template.difficulty,
      estimated_duration: template.estimatedDuration,
      clues: template.clues.map((clue: any) => ({
        id: generateId(),
        ...clue
      }))
    })
    setShowTemplates(false)
  }

  const handleCreateFromScratch = () => {
    setShowTemplates(false)
  }

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  // Generate unique ID for clues
  const generateId = () => Math.random().toString(36).substr(2, 9)

  // Default clue template
  const createDefaultClue = (): Clue => ({
    id: generateId(),
    title: "",
    content: "",
    clue_type: "text",
    answer: "",
    answer_type: "exact",
    hints: ["", "", ""],
    points_value: 100
  })

  const addClue = () => {
    const newClue = createDefaultClue()
    setHunt(prev => ({
      ...prev,
      clues: [...prev.clues, newClue]
    }))
    setEditingClue(newClue)
  }

  const updateClue = (updatedClue: Clue) => {
    setHunt(prev => ({
      ...prev,
      clues: prev.clues.map(clue => 
        clue.id === updatedClue.id ? updatedClue : clue
      )
    }))
  }

  const deleteClue = (clueId: string) => {
    setHunt(prev => ({
      ...prev,
      clues: prev.clues.filter(clue => clue.id !== clueId)
    }))
  }

  const moveClue = (clueId: string, direction: 'up' | 'down') => {
    const clues = [...hunt.clues]
    const index = clues.findIndex(c => c.id === clueId)
    
    if (direction === 'up' && index > 0) {
      [clues[index], clues[index - 1]] = [clues[index - 1], clues[index]]
    } else if (direction === 'down' && index < clues.length - 1) {
      [clues[index], clues[index + 1]] = [clues[index + 1], clues[index]]
    }
    
    setHunt(prev => ({ ...prev, clues }))
  }

  const duplicateClue = (clue: Clue) => {
    const duplicatedClue = {
      ...clue,
      id: generateId(),
      title: `${clue.title} (Copy)`
    }
    
    const index = hunt.clues.findIndex(c => c.id === clue.id)
    const newClues = [...hunt.clues]
    newClues.splice(index + 1, 0, duplicatedClue)
    
    setHunt(prev => ({ ...prev, clues: newClues }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return hunt.title.trim().length > 0 && hunt.description.trim().length > 0
      case 2:
        return hunt.estimated_duration > 0
      case 3:
        return hunt.clues.length > 0 && hunt.clues.every(clue => 
          clue.title.trim().length > 0 && 
          clue.content.trim().length > 0 && 
          clue.answer.trim().length > 0
        )
      default:
        return true
    }
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    } else {
      toast.error("Please fill in all required fields before proceeding")
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const submitHunt = async () => {
    const validation = validateHunt(hunt)
    if (!validation.isValid) {
      toast.error("Please fix the following errors:", {
        description: validation.errors.join(', ')
      })
      return
    }

    try {
      await createHunt(hunt)
      clearDraft()
      onBack()
    } catch (error) {
      // Error handling is done in the hook
    }
  }

  // Auto-save draft periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (hunt.title || hunt.description || hunt.clues.length > 0) {
        saveDraft(hunt)
      }
    }, 30000) // Save every 30 seconds

    return () => clearInterval(interval)
  }, [hunt, saveDraft])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getClueTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />
      case 'image': return <Image className="h-4 w-4" />
      case 'audio': return <Music className="h-4 w-4" />
      case 'mixed': return <Plus className="h-4 w-4" />
      default: return <Type className="h-4 w-4" />
    }
  }

  if (showTemplates) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">Create New Hunt</h1>
                  <p className="text-muted-foreground">Choose a template or start from scratch</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <HuntTemplates 
            onSelectTemplate={handleTemplateSelect}
            onCreateFromScratch={handleCreateFromScratch}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create New Hunt</h1>
                <p className="text-muted-foreground">Step {currentStep} of {totalSteps}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => saveDraft(hunt)}
                disabled={!hunt.title && !hunt.description && hunt.clues.length === 0}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(true)}
                disabled={hunt.clues.length === 0}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={submitHunt}
                disabled={!validateHunt(hunt).isValid || isSubmitting}
                className="bg-gradient-to-r from-accent-purple to-accent-teal"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Hunt
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-accent-purple" />
                  Hunt Details
                </CardTitle>
                <CardDescription>
                  Set up the basic information for your treasure hunt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Hunt Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter an exciting title for your hunt..."
                    value={hunt.title}
                    onChange={(e) => setHunt(prev => ({ ...prev, title: e.target.value }))}
                    className="text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your hunt. What's the theme? What should players expect?"
                    value={hunt.description}
                    onChange={(e) => setHunt(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="public"
                    checked={hunt.is_public}
                    onCheckedChange={(checked) => setHunt(prev => ({ ...prev, is_public: checked }))}
                  />
                  <Label htmlFor="public">Make this hunt public</Label>
                  <Badge variant={hunt.is_public ? "default" : "secondary"}>
                    {hunt.is_public ? "Public" : "Private"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-accent-teal" />
                  Hunt Settings
                </CardTitle>
                <CardDescription>
                  Configure the difficulty and duration of your hunt
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Difficulty Level</Label>
                    <Select
                      value={hunt.difficulty_level}
                      onValueChange={(value: 'easy' | 'medium' | 'hard') => 
                        setHunt(prev => ({ ...prev, difficulty_level: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Easy</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span>Medium</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="hard">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span>Hard</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      min="1"
                      max="300"
                      value={hunt.estimated_duration}
                      onChange={(e) => setHunt(prev => ({ 
                        ...prev, 
                        estimated_duration: parseInt(e.target.value) || 0 
                      }))}
                    />
                  </div>
                </div>

                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Hunt Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getDifficultyColor(hunt.difficulty_level)}`}></div>
                      <span className="capitalize">{hunt.difficulty_level}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{hunt.estimated_duration} minutes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{hunt.is_public ? "Public" : "Private"}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-accent-gold" />
                        Clues ({hunt.clues.length})
                      </CardTitle>
                      <CardDescription>
                        Create the clues that will guide players through your hunt
                      </CardDescription>
                    </div>
                    <Button onClick={addClue} className="bg-gradient-to-r from-accent-purple to-accent-teal">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Clue
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {hunt.clues.length === 0 ? (
                    <div className="text-center py-12">
                      <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No clues yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start by adding your first clue to get players started on their adventure
                      </p>
                      <Button onClick={addClue} className="bg-gradient-to-r from-accent-purple to-accent-teal">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Clue
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {hunt.clues.map((clue, index) => (
                        <Card key={clue.id} className="border-l-4 border-l-accent-purple">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <Badge variant="outline" className="text-xs">
                                  #{index + 1}
                                </Badge>
                                <div className="flex items-center space-x-2">
                                  {getClueTypeIcon(clue.clue_type)}
                                  <span className="font-medium">
                                    {clue.title || `Clue ${index + 1}`}
                                  </span>
                                </div>
                                <Badge variant="secondary">
                                  {clue.points_value} pts
                                </Badge>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveClue(clue.id, 'up')}
                                  disabled={index === 0}
                                >
                                  <ArrowUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => moveClue(clue.id, 'down')}
                                  disabled={index === hunt.clues.length - 1}
                                >
                                  <ArrowDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => duplicateClue(clue)}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingClue(clue)}
                                >
                                  <Settings className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Clue</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this clue? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => deleteClue(clue.id)}
                                        className="bg-destructive hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Content:</span>
                                <p className="truncate">{clue.content || "No content"}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Answer:</span>
                                <p className="truncate font-mono bg-muted px-2 py-1 rounded">
                                  {clue.answer || "No answer"}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-accent-gold" />
                  Review & Publish
                </CardTitle>
                <CardDescription>
                  Review your hunt before publishing it to the world
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Hunt Information</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-muted-foreground">Title:</span>
                        <p className="font-medium">{hunt.title}</p>
                      </div>
                      <div>
                        <span className="text-sm text-muted-foreground">Description:</span>
                        <p className="text-sm">{hunt.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold">Settings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Difficulty:</span>
                        <Badge className={getDifficultyColor(hunt.difficulty_level)}>
                          {hunt.difficulty_level}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Duration:</span>
                        <span className="text-sm">{hunt.estimated_duration} minutes</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Visibility:</span>
                        <Badge variant={hunt.is_public ? "default" : "secondary"}>
                          {hunt.is_public ? "Public" : "Private"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Total Clues:</span>
                        <span className="text-sm">{hunt.clues.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-4">Clues Overview</h3>
                  <div className="space-y-2">
                    {hunt.clues.map((clue, index) => (
                      <div key={clue.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge variant="outline">#{index + 1}</Badge>
                          {getClueTypeIcon(clue.clue_type)}
                          <span className="font-medium">{clue.title}</span>
                        </div>
                        <Badge variant="secondary">{clue.points_value} pts</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <Button
                  key={i}
                  variant={currentStep === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentStep(i + 1)}
                  className="w-8 h-8 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            
            <Button
              onClick={currentStep === totalSteps ? submitHunt : nextStep}
              disabled={!validateStep(currentStep) || (currentStep === totalSteps && isSubmitting)}
              className="bg-gradient-to-r from-accent-purple to-accent-teal"
            >
              {currentStep === totalSteps ? (
                isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Publish Hunt
                  </>
                )
              ) : (
                <>
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Clue Editor Dialog */}
      {editingClue && (
        <ClueEditor
          clue={editingClue}
          onSave={(updatedClue) => {
            updateClue(updatedClue)
            setEditingClue(null)
          }}
          onClose={() => setEditingClue(null)}
        />
      )}

      {/* Preview Dialog */}
      <Dialog open={previewMode} onOpenChange={setPreviewMode}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hunt Preview</DialogTitle>
            <DialogDescription>
              This is how your hunt will appear to players
            </DialogDescription>
          </DialogHeader>
          <HuntPreview hunt={hunt} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Clue Editor Component
interface ClueEditorProps {
  clue: Clue
  onSave: (clue: Clue) => void
  onClose: () => void
}

const ClueEditor = ({ clue, onSave, onClose }: ClueEditorProps) => {
  const [editedClue, setEditedClue] = useState<Clue>(clue)

  const handleSave = () => {
    if (!editedClue.title.trim() || !editedClue.content.trim() || !editedClue.answer.trim()) {
      toast.error("Please fill in all required fields")
      return
    }
    onSave(editedClue)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Clue</DialogTitle>
          <DialogDescription>
            Configure the details of your clue
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clue-title">Title *</Label>
              <Input
                id="clue-title"
                value={editedClue.title}
                onChange={(e) => setEditedClue(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter clue title..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="clue-type">Type</Label>
              <Select
                value={editedClue.clue_type}
                onValueChange={(value: 'text' | 'image' | 'audio' | 'mixed') => 
                  setEditedClue(prev => ({ ...prev, clue_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">
                    <div className="flex items-center space-x-2">
                      <Type className="h-4 w-4" />
                      <span>Text Only</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="image">
                    <div className="flex items-center space-x-2">
                      <Image className="h-4 w-4" />
                      <span>Image</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="audio">
                    <div className="flex items-center space-x-2">
                      <Music className="h-4 w-4" />
                      <span>Audio</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="mixed">
                    <div className="flex items-center space-x-2">
                      <Plus className="h-4 w-4" />
                      <span>Mixed Media</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clue-content">Content *</Label>
            <Textarea
              id="clue-content"
              value={editedClue.content}
              onChange={(e) => setEditedClue(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter the clue content that players will see..."
              rows={4}
            />
          </div>

          {(editedClue.clue_type === 'image' || editedClue.clue_type === 'audio' || editedClue.clue_type === 'mixed') && (
            <div className="space-y-2">
              <Label>Media Upload</Label>
              <FileUpload
                accept={editedClue.clue_type === 'image' ? 'image/*' : editedClue.clue_type === 'audio' ? 'audio/*' : 'image/*,audio/*'}
                maxSize={10}
                onFileSelect={(file) => {
                  setUploadingFiles(prev => ({ ...prev, [editedClue.id]: file }))
                  // Start upload process
                  uploadFile(file, editedClue.id)
                    .then((url) => {
                      setEditedClue(prev => ({ ...prev, media_url: url }))
                      setUploadingFiles(prev => {
                        const newFiles = { ...prev }
                        delete newFiles[editedClue.id]
                        return newFiles
                      })
                    })
                    .catch((error) => {
                      toast.error('Upload failed')
                      setUploadingFiles(prev => {
                        const newFiles = { ...prev }
                        delete newFiles[editedClue.id]
                        return newFiles
                      })
                    })
                }}
                onFileRemove={() => {
                  setEditedClue(prev => ({ ...prev, media_url: undefined }))
                  setUploadingFiles(prev => {
                    const newFiles = { ...prev }
                    delete newFiles[editedClue.id]
                    return newFiles
                  })
                }}
                currentFile={uploadingFiles[editedClue.id]}
                uploadProgress={uploadProgress[editedClue.id]}
                description={`Upload an ${editedClue.clue_type === 'image' ? 'image' : editedClue.clue_type === 'audio' ? 'audio file' : 'media file'}`}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clue-answer">Answer *</Label>
              <Input
                id="clue-answer"
                value={editedClue.answer}
                onChange={(e) => setEditedClue(prev => ({ ...prev, answer: e.target.value }))}
                placeholder="Enter the correct answer..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="answer-type">Answer Type</Label>
              <Select
                value={editedClue.answer_type}
                onValueChange={(value: 'exact' | 'contains' | 'regex') => 
                  setEditedClue(prev => ({ ...prev, answer_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exact">Exact Match</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="regex">Regular Expression</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Hints (Optional)</Label>
            <div className="space-y-2">
              {editedClue.hints.map((hint, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Hint {index + 1}
                  </Badge>
                  <Input
                    value={hint}
                    onChange={(e) => {
                      const newHints = [...editedClue.hints]
                      newHints[index] = e.target.value
                      setEditedClue(prev => ({ ...prev, hints: newHints }))
                    }}
                    placeholder={`Enter hint ${index + 1}...`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="points">Points Value</Label>
            <Input
              id="points"
              type="number"
              min="10"
              max="1000"
              step="10"
              value={editedClue.points_value}
              onChange={(e) => setEditedClue(prev => ({ 
                ...prev, 
                points_value: parseInt(e.target.value) || 100 
              }))}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-gradient-to-r from-accent-purple to-accent-teal">
            Save Clue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hunt Preview Component
interface HuntPreviewProps {
  hunt: Hunt
}

const HuntPreview = ({ hunt }: HuntPreviewProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'hard': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">{hunt.title}</h2>
        <p className="text-muted-foreground">{hunt.description}</p>
      </div>

      <div className="flex items-center justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${getDifficultyColor(hunt.difficulty_level)}`}></div>
          <span className="capitalize">{hunt.difficulty_level}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>{hunt.estimated_duration} min</span>
        </div>
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-4 w-4" />
          <span>{hunt.clues.length} clues</span>
        </div>
      </div>

      <Separator />

      <div>
        <h3 className="font-semibold mb-4">Clues Preview</h3>
        <div className="space-y-4">
          {hunt.clues.map((clue, index) => (
            <Card key={clue.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span>{clue.title}</span>
                  </CardTitle>
                  <Badge variant="secondary">{clue.points_value} pts</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-3">{clue.content}</p>
                <div className="text-xs text-muted-foreground">
                  Answer type: {clue.answer_type} • {clue.hints.filter(h => h.trim()).length} hints available
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}