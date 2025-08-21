import express from 'express';
import { uploadFile, deleteFile, getFileInfo } from '../controllers/uploadController.js';
import { authenticateToken } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// POST /api/upload - Upload a file (image or audio)
router.post('/', authenticateToken, upload.single('file'), handleUploadError, uploadFile);

// DELETE /api/upload/:public_id - Delete a file
router.delete('/:public_id', authenticateToken, deleteFile);

// GET /api/upload/:public_id - Get file info
router.get('/:public_id', getFileInfo);

export default router;