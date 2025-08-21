import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { huntsApi, uploadApi, ApiError } from '@/services/api'

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

interface CreateHuntRequest {
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
}

export const useHuntCreation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const createHunt = useCallback(async (hunt: Hunt) => {
    setIsSubmitting(true)
    
    try {
      // Prepare the request payload
      const huntRequest: CreateHuntRequest = {
        title: hunt.title,
        description: hunt.description,
        is_public: hunt.is_public,
        difficulty_level: hunt.difficulty_level,
        estimated_duration: hunt.estimated_duration,
        clues: hunt.clues.map(clue => ({
          title: clue.title,
          content: clue.content,
          clue_type: clue.clue_type,
          answer: clue.answer,
          answer_type: clue.answer_type,
          hints: clue.hints.filter(hint => hint.trim().length > 0),
          points_value: clue.points_value
        }))
      }

      const result = await huntsApi.createHunt(huntRequest)
      
      toast.success('Hunt created successfully!', {
        description: 'Your hunt is now available for players to discover.'
      })
      
      return result
    } catch (error) {
      console.error('Error creating hunt:', error)
      
      if (error instanceof ApiError) {
        toast.error('Failed to create hunt', {
          description: error.message
        })
      } else {
        toast.error('Failed to create hunt', {
          description: 'Please check your connection and try again.'
        })
      }
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [])

  const uploadFile = useCallback(async (file: File, clueId: string) => {
    try {
      // Set initial progress
      setUploadProgress(prev => ({ ...prev, [clueId]: 0 }))
      
      // Simulate upload progress (since we can't track real progress with fetch)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const current = prev[clueId] || 0
          if (current < 90) {
            return { ...prev, [clueId]: current + Math.random() * 20 }
          }
          return prev
        })
      }, 200)

      const result = await uploadApi.uploadFile(file)
      
      // Complete progress
      clearInterval(progressInterval)
      setUploadProgress(prev => ({ ...prev, [clueId]: 100 }))
      
      // Clean up progress after a short delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev }
          delete newProgress[clueId]
          return newProgress
        })
      }, 1000)
      
      return result.file.url
    } catch (error) {
      console.error('Upload error:', error)
      
      // Clean up progress on error
      setUploadProgress(prev => {
        const newProgress = { ...prev }
        delete newProgress[clueId]
        return newProgress
      })
      
      if (error instanceof ApiError) {
        toast.error('Upload failed', {
          description: error.message
        })
      } else {
        toast.error('Upload failed', {
          description: 'Please try again'
        })
      }
      
      throw error
    }
  }, [])

  const validateHunt = useCallback((hunt: Hunt): { isValid: boolean; errors: string[] } => {
    const errors: string[] = []

    // Basic validation
    if (!hunt.title.trim()) {
      errors.push('Hunt title is required')
    }
    
    if (!hunt.description.trim()) {
      errors.push('Hunt description is required')
    }
    
    if (hunt.estimated_duration <= 0) {
      errors.push('Estimated duration must be greater than 0')
    }
    
    if (hunt.clues.length === 0) {
      errors.push('At least one clue is required')
    }

    // Clue validation
    hunt.clues.forEach((clue, index) => {
      if (!clue.title.trim()) {
        errors.push(`Clue ${index + 1}: Title is required`)
      }
      
      if (!clue.content.trim()) {
        errors.push(`Clue ${index + 1}: Content is required`)
      }
      
      if (!clue.answer.trim()) {
        errors.push(`Clue ${index + 1}: Answer is required`)
      }
      
      if (clue.points_value < 10 || clue.points_value > 1000) {
        errors.push(`Clue ${index + 1}: Points must be between 10 and 1000`)
      }

      // Validate regex answers
      if (clue.answer_type === 'regex') {
        try {
          new RegExp(clue.answer)
        } catch {
          errors.push(`Clue ${index + 1}: Invalid regular expression`)
        }
      }
    })

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [])

  const saveDraft = useCallback(async (hunt: Hunt) => {
    try {
      localStorage.setItem('huntDraft', JSON.stringify({
        ...hunt,
        lastSaved: new Date().toISOString()
      }))
      
      toast.success('Draft saved', {
        description: 'Your progress has been saved locally.'
      })
    } catch (error) {
      toast.error('Failed to save draft')
    }
  }, [])

  const loadDraft = useCallback((): Hunt | null => {
    try {
      const draft = localStorage.getItem('huntDraft')
      if (draft) {
        const parsed = JSON.parse(draft)
        // Remove lastSaved property before returning
        const { lastSaved, ...hunt } = parsed
        return hunt
      }
    } catch (error) {
      console.error('Error loading draft:', error)
    }
    return null
  }, [])

  const clearDraft = useCallback(() => {
    localStorage.removeItem('huntDraft')
  }, [])

  return {
    createHunt,
    uploadFile,
    validateHunt,
    saveDraft,
    loadDraft,
    clearDraft,
    isSubmitting,
    uploadProgress
  }
}