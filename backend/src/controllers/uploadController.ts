import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

export const uploadFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file provided' });
      return;
    }

    const { type = 'auto' } = req.body;
    
    // Determine resource type based on file mime type
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    
    if (req.file.mimetype.startsWith('image/')) {
      resourceType = 'image';
    } else if (req.file.mimetype.startsWith('audio/')) {
      resourceType = 'video'; // Cloudinary uses 'video' for audio files
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: 'treasure-hunt',
          public_id: `${req.user!.id}_${Date.now()}`,
          transformation: resourceType === 'image' ? [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto' }
          ] : undefined
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file!.buffer);
    });

    const result = uploadResult as any;

    res.json({
      message: 'File uploaded successfully',
      file: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration // For audio files
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
};

export const deleteFile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { public_id } = req.params;
    const { resource_type = 'image' } = req.query;

    // Verify the file belongs to the user (basic security check)
    if (!public_id.includes(req.user!.id)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type as 'image' | 'video' | 'raw'
    });

    if (result.result === 'ok') {
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found or already deleted' });
    }
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'File deletion failed' });
  }
};

export const getFileInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { public_id } = req.params;
    const { resource_type = 'image' } = req.query;

    // Get file info from Cloudinary
    const result = await cloudinary.api.resource(public_id, {
      resource_type: resource_type as 'image' | 'video' | 'raw'
    });

    res.json({
      file: {
        public_id: result.public_id,
        url: result.secure_url,
        format: result.format,
        resource_type: result.resource_type,
        bytes: result.bytes,
        width: result.width,
        height: result.height,
        duration: result.duration,
        created_at: result.created_at
      }
    });
  } catch (error: any) {
    console.error('Get file info error:', error);
    if (error.http_code === 404) {
      res.status(404).json({ error: 'File not found' });
    } else {
      res.status(500).json({ error: 'Failed to get file info' });
    }
  }
};