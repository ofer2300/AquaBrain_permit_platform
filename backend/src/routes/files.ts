import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth';
import {
  uploadFile,
  getFileMetadata,
  downloadFile,
  getProjectFiles,
  deleteFile,
} from '../controllers/fileController';

const router = Router();

// Multer configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Multer error handling middleware
const handleMulterError = (req: Request, res: Response, next: NextFunction): void => {
  upload.single('file')(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(413).json({ error: 'File too large' });
        return;
      }
      res.status(400).json({ error: err.message });
      return;
    } else if (err) {
      res.status(400).json({ error: 'Invalid file type' });
      return;
    }
    next();
  });
};

// File routes
router.post('/projects/:projectId/files', authMiddleware, handleMulterError, uploadFile);
router.get('/files/:fileId', authMiddleware, getFileMetadata);
router.get('/files/:fileId/download', authMiddleware, downloadFile);
router.get('/projects/:projectId/files', authMiddleware, getProjectFiles);
router.delete('/files/:fileId', authMiddleware, deleteFile);

export default router;
