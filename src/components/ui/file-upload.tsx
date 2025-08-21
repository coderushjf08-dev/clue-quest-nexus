import React, { useRef, useState } from 'react'
import { Button } from './button'
import { Progress } from './progress'
import { Badge } from './badge'
import { Card, CardContent } from './card'
import { toast } from 'sonner'
import { 
  Upload, 
  X, 
  File, 
  Image, 
  Music, 
  Video, 
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface FileUploadProps {
  accept?: string
  maxSize?: number // in MB
  onFileSelect: (file: File) => void
  onFileRemove?: () => void
  uploadProgress?: number
  currentFile?: File | null
  disabled?: boolean
  className?: string
  description?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  accept = 'image/*,audio/*',
  maxSize = 10,
  onFileSelect,
  onFileRemove,
  uploadProgress,
  currentFile,
  disabled = false,
  className = '',
  description = 'Upload an image or audio file'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (file: File) => {
    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`File size exceeds ${maxSize}MB limit`)
      return
    }

    // Validate file type
    const acceptedTypes = accept.split(',').map(type => type.trim())
    const isValidType = acceptedTypes.some(type => {
      if (type === 'image/*') return file.type.startsWith('image/')
      if (type === 'audio/*') return file.type.startsWith('audio/')
      if (type === 'video/*') return file.type.startsWith('video/')
      return file.type === type
    })

    if (!isValidType) {
      toast.error('Invalid file type')
      return
    }

    onFileSelect(file)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
    
    if (disabled) return

    const file = event.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    if (!disabled) {
      setDragOver(true)
    }
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setDragOver(false)
  }

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-8 w-8" />
    if (file.type.startsWith('audio/')) return <Music className="h-8 w-8" />
    if (file.type.startsWith('video/')) return <Video className="h-8 w-8" />
    return <File className="h-8 w-8" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeLabel = (file: File) => {
    if (file.type.startsWith('image/')) return 'Image'
    if (file.type.startsWith('audio/')) return 'Audio'
    if (file.type.startsWith('video/')) return 'Video'
    return 'File'
  }

  if (currentFile && uploadProgress !== undefined) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 text-muted-foreground">
              {getFileIcon(currentFile)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium truncate">{currentFile.name}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {getFileTypeLabel(currentFile)}
                  </Badge>
                  {onFileRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onFileRemove}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(currentFile.size)}</span>
                  <span>
                    {uploadProgress < 100 ? `${Math.round(uploadProgress)}%` : 'Complete'}
                  </span>
                </div>
                <Progress value={uploadProgress} className="h-1" />
              </div>
              {uploadProgress === 100 && (
                <div className="flex items-center space-x-1 mt-2 text-xs text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  <span>Upload complete</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (currentFile) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 text-muted-foreground">
              {getFileIcon(currentFile)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{currentFile.name}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="text-xs">
                    {getFileTypeLabel(currentFile)}
                  </Badge>
                  {onFileRemove && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onFileRemove}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatFileSize(currentFile.size)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div
      className={`
        border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer
        ${dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
        ${className}
      `}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
      />
      
      <div className="space-y-3">
        <div className="flex justify-center">
          <Upload className="h-10 w-10 text-muted-foreground" />
        </div>
        
        <div>
          <p className="text-sm font-medium">
            {dragOver ? 'Drop file here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
          <p className="text-xs text-muted-foreground">
            Max size: {maxSize}MB
          </p>
        </div>
        
        <Button variant="outline" size="sm" disabled={disabled}>
          Choose File
        </Button>
      </div>
    </div>
  )
}