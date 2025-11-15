import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import {
  generateToken,
  mockUsers,
  createMockDatabase,
  MockFile,
} from '../test/helpers';

interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

const app: Express = express();
app.use(express.json());

const mockDb = createMockDatabase();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
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

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = authHeader.substring(7);
  const jwt = require('jsonwebtoken');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

app.post(
  '/api/projects/:projectId/files',
  authMiddleware,
  (req: Request, res: Response, next: NextFunction): void => {
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
  },
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const projectId = req.params.projectId;
      if (!projectId) {
        res.status(400).json({ error: 'Project ID required' });
        return;
      }

      const project = mockDb.projects.get(projectId);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      if (project.ownerId !== req.user!.userId && req.user!.role !== 'admin') {
        res.status(403).json({ error: 'Forbidden: Not project owner' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
      }

      const fileId = `file-${Date.now()}`;
      const filename = `${fileId}-${req.file.originalname}`;
      const filePath = `/uploads/${filename}`;

      const newFile: MockFile = {
        id: fileId,
        filename,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        projectId,
        uploadedBy: req.user!.userId,
        path: filePath,
        createdAt: new Date(),
      };

      mockDb.files.set(fileId, newFile);

      res.status(201).json({
        message: 'File uploaded successfully',
        file: newFile,
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

app.get('/api/files/:fileId', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = req.params.fileId;
    if (!fileId) {
      res.status(400).json({ error: 'File ID required' });
      return;
    }

    const file = mockDb.files.get(fileId);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const project = mockDb.projects.get(file.projectId);
    if (!project) {
      res.status(404).json({ error: 'Associated project not found' });
      return;
    }

    res.status(200).json({
      file,
      downloadUrl: `/api/files/${fileId}/download`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/files/:fileId/download', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const fileId = req.params.fileId;
    if (!fileId) {
      res.status(400).json({ error: 'File ID required' });
      return;
    }

    const file = mockDb.files.get(fileId);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const project = mockDb.projects.get(file.projectId);
    if (!project) {
      res.status(404).json({ error: 'Associated project not found' });
      return;
    }

    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Length', file.size.toString());

    res.status(200).send(Buffer.from('mock-file-content'));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects/:projectId/files', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const projectId = req.params.projectId;
    if (!projectId) {
      res.status(400).json({ error: 'Project ID required' });
      return;
    }

    const project = mockDb.projects.get(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const files = Array.from(mockDb.files.values()).filter(
      (f: MockFile) => f.projectId === projectId
    );

    res.status(200).json({
      files,
      count: files.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/files/:fileId', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const fileId = req.params.fileId;
    if (!fileId) {
      res.status(400).json({ error: 'File ID required' });
      return;
    }

    const file = mockDb.files.get(fileId);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const project = mockDb.projects.get(file.projectId);
    if (!project) {
      res.status(404).json({ error: 'Associated project not found' });
      return;
    }

    if (
      file.uploadedBy !== req.user!.userId &&
      project.ownerId !== req.user!.userId &&
      req.user!.role !== 'admin'
    ) {
      res.status(403).json({ error: 'Forbidden: Not authorized to delete this file' });
      return;
    }

    mockDb.files.delete(fileId);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

describe('File Routes', () => {
  let homeownerToken: string;
  let contractorToken: string;
  let adminToken: string;
  let homeownerId: string;
  let contractorId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
    process.env.MAX_FILE_SIZE = '10485760';
    homeownerId = mockUsers.homeowner?.id || '1';
    contractorId = mockUsers.contractor?.id || '2';
    homeownerToken = generateToken(homeownerId, 'homeowner');
    contractorToken = generateToken(contractorId, 'contractor');
    adminToken = generateToken(mockUsers.admin?.id || '3', 'admin');
  });

  afterAll(async () => {
    mockDb.reset();
  });

  beforeEach(() => {
    mockDb.reset();
  });

  describe('POST /api/projects/:projectId/files', () => {
    it('should upload PDF file successfully', async () => {
      const projectId = 'proj-1';
      const pdfBuffer = Buffer.from('mock-pdf-content');

      const res = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .attach('file', pdfBuffer, {
          filename: 'test-document.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('File uploaded successfully');
      expect(res.body.file).toMatchObject({
        originalName: 'test-document.pdf',
        mimetype: 'application/pdf',
        projectId,
        uploadedBy: homeownerId,
      });
      expect(res.body.file.id).toBeDefined();
      expect(res.body.file.filename).toContain('test-document.pdf');
      expect(res.body.file.path).toContain('/uploads/');
      expect(res.body.file.size).toBeDefined();
      expect(res.body.file.createdAt).toBeDefined();
    });

    it('should upload image file (JPEG) successfully', async () => {
      const projectId = 'proj-1';
      const imageBuffer = Buffer.from('mock-jpeg-content');

      const res = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .attach('file', imageBuffer, {
          filename: 'site-photo.jpg',
          contentType: 'image/jpeg',
        });

      expect(res.status).toBe(201);
      expect(res.body.file.mimetype).toBe('image/jpeg');
      expect(res.body.file.originalName).toBe('site-photo.jpg');
    });

    it('should upload image file (PNG) successfully', async () => {
      const projectId = 'proj-1';
      const imageBuffer = Buffer.from('mock-png-content');

      const res = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .attach('file', imageBuffer, {
          filename: 'blueprint.png',
          contentType: 'image/png',
        });

      expect(res.status).toBe(201);
      expect(res.body.file.mimetype).toBe('image/png');
    });

    it('should fail upload with invalid file type', async () => {
      const projectId = 'proj-1';
      const textBuffer = Buffer.from('plain text content');

      const res = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .attach('file', textBuffer, {
          filename: 'document.txt',
          contentType: 'text/plain',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Invalid file type');
    });

    it('should fail upload with file too large', async () => {
      const projectId = 'proj-1';
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);

      const res = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .attach('file', largeBuffer, {
          filename: 'large-file.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(413);
      expect(res.body.error).toBe('File too large');
    });

    it('should fail upload without file', async () => {
      const projectId = 'proj-1';

      const res = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('No file uploaded');
    });

    it('should fail upload to non-existent project', async () => {
      const pdfBuffer = Buffer.from('mock-pdf-content');

      const res = await request(app)
        .post('/api/projects/nonexistent-project/files')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .attach('file', pdfBuffer, {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Project not found');
    });

    it('should fail upload to other user project (forbidden)', async () => {
      const projectId = 'proj-1';
      const pdfBuffer = Buffer.from('mock-pdf-content');

      const res = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .attach('file', pdfBuffer, {
          filename: 'unauthorized.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden: Not project owner');
    });

    it('should allow admin to upload to any project', async () => {
      const projectId = 'proj-1';
      const pdfBuffer = Buffer.from('mock-pdf-content');

      const res = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', pdfBuffer, {
          filename: 'admin-upload.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(201);
      expect(res.body.file.uploadedBy).toBe(mockUsers.admin?.id || '3');
    });

    it('should fail upload without authentication', async () => {
      const projectId = 'proj-1';
      const pdfBuffer = Buffer.from('mock-pdf-content');

      const res = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .attach('file', pdfBuffer, {
          filename: 'test.pdf',
          contentType: 'application/pdf',
        });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should upload Word document successfully', async () => {
      const projectId = 'proj-1';
      const docBuffer = Buffer.from('mock-docx-content');

      const res = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .attach('file', docBuffer, {
          filename: 'requirements.docx',
          contentType:
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

      expect(res.status).toBe(201);
      expect(res.body.file.mimetype).toBe(
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      );
    });

    it('should upload Excel spreadsheet successfully', async () => {
      const projectId = 'proj-1';
      const xlsxBuffer = Buffer.from('mock-xlsx-content');

      const res = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .attach('file', xlsxBuffer, {
          filename: 'budget.xlsx',
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });

      expect(res.status).toBe(201);
      expect(res.body.file.mimetype).toBe(
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
    });
  });

  describe('GET /api/files/:fileId', () => {
    let testFileId: string;

    beforeEach(() => {
      testFileId = 'file-1';
    });

    it('should get file metadata with authorized user', async () => {
      const res = await request(app)
        .get(`/api/files/${testFileId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.file).toMatchObject({
        id: testFileId,
        originalName: 'floor-plan.pdf',
        mimetype: 'application/pdf',
        projectId: 'proj-1',
      });
      expect(res.body.downloadUrl).toBe(`/api/files/${testFileId}/download`);
    });

    it('should fail to get non-existent file (404)', async () => {
      const res = await request(app)
        .get('/api/files/nonexistent-file')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('File not found');
    });

    it('should fail without authentication (401)', async () => {
      const res = await request(app).get(`/api/files/${testFileId}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should allow any authenticated user to view file metadata', async () => {
      const res1 = await request(app)
        .get(`/api/files/${testFileId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      const res2 = await request(app)
        .get(`/api/files/${testFileId}`)
        .set('Authorization', `Bearer ${contractorToken}`);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.body.file.id).toBe(res2.body.file.id);
    });
  });

  describe('GET /api/files/:fileId/download', () => {
    let testFileId: string;

    beforeEach(() => {
      testFileId = 'file-1';
    });

    it('should download file with authorized user', async () => {
      const res = await request(app)
        .get(`/api/files/${testFileId}/download`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.headers['content-disposition']).toContain('floor-plan.pdf');
      expect(res.headers['content-length']).toBeDefined();
      expect(res.body).toBeDefined();
    });

    it('should fail to download non-existent file (404)', async () => {
      const res = await request(app)
        .get('/api/files/nonexistent-file/download')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('File not found');
    });

    it('should fail download without authentication (401)', async () => {
      const res = await request(app).get(`/api/files/${testFileId}/download`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should allow any authenticated user to download file', async () => {
      const res1 = await request(app)
        .get(`/api/files/${testFileId}/download`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      const res2 = await request(app)
        .get(`/api/files/${testFileId}/download`)
        .set('Authorization', `Bearer ${contractorToken}`);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
    });

    it('should set correct content headers for different file types', async () => {
      const file2Id = 'file-2';

      const res = await request(app)
        .get(`/api/files/${file2Id}/download`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
      expect(res.headers['content-disposition']).toContain('elevation.pdf');
    });
  });

  describe('GET /api/projects/:projectId/files', () => {
    it('should list all files for a project', async () => {
      const projectId = 'proj-1';

      const res = await request(app)
        .get(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.files).toBeDefined();
      expect(Array.isArray(res.body.files)).toBe(true);
      expect(res.body.count).toBe(res.body.files.length);
      expect(res.body.files.length).toBeGreaterThan(0);

      res.body.files.forEach((file: MockFile) => {
        expect(file.projectId).toBe(projectId);
        expect(file.id).toBeDefined();
        expect(file.originalName).toBeDefined();
        expect(file.mimetype).toBeDefined();
      });
    });

    it('should return empty array for project with no files', async () => {
      const projectId = 'proj-3';

      const res = await request(app)
        .get(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.files).toEqual([]);
      expect(res.body.count).toBe(0);
    });

    it('should fail for non-existent project', async () => {
      const res = await request(app)
        .get('/api/projects/nonexistent-project/files')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Project not found');
    });

    it('should fail without authentication', async () => {
      const projectId = 'proj-1';

      const res = await request(app).get(`/api/projects/${projectId}/files`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should allow any authenticated user to list project files', async () => {
      const projectId = 'proj-1';

      const res1 = await request(app)
        .get(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      const res2 = await request(app)
        .get(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${contractorToken}`);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.body.files.length).toBe(res2.body.files.length);
    });
  });

  describe('DELETE /api/files/:fileId', () => {
    it('should delete file as uploader (authorized)', async () => {
      const fileId = 'file-1';

      const res = await request(app)
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('File deleted successfully');

      const deletedFile = mockDb.files.get(fileId);
      expect(deletedFile).toBeUndefined();
    });

    it('should delete file as project owner', async () => {
      const fileId = 'file-1';
      const file = mockDb.files.get(fileId);
      const project = mockDb.projects.get(file.projectId);

      expect(project.ownerId).toBe(homeownerId);

      const res = await request(app)
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('File deleted successfully');
    });

    it('should allow admin to delete any file', async () => {
      const fileId = 'file-1';

      const res = await request(app)
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('File deleted successfully');
    });

    it('should fail to delete file as unauthorized user (forbidden)', async () => {
      const fileId = 'file-1';

      const res = await request(app)
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${contractorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden: Not authorized to delete this file');

      const file = mockDb.files.get(fileId);
      expect(file).toBeDefined();
    });

    it('should fail to delete non-existent file (404)', async () => {
      const res = await request(app)
        .delete('/api/files/nonexistent-file')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('File not found');
    });

    it('should fail without authentication', async () => {
      const fileId = 'file-1';

      const res = await request(app).delete(`/api/files/${fileId}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should not allow deleting file twice', async () => {
      const fileId = 'file-1';

      const res1 = await request(app)
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res1.status).toBe(200);

      const res2 = await request(app)
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res2.status).toBe(404);
      expect(res2.body.error).toBe('File not found');
    });
  });

  describe('Integration: Full File Management Flow', () => {
    it('should complete full file upload, list, download, delete flow', async () => {
      const projectId = 'proj-1';
      const pdfBuffer = Buffer.from('integration-test-pdf-content');

      const uploadRes = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .attach('file', pdfBuffer, {
          filename: 'integration-test.pdf',
          contentType: 'application/pdf',
        });

      expect(uploadRes.status).toBe(201);
      const fileId = uploadRes.body.file.id;

      const listRes = await request(app)
        .get(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(listRes.status).toBe(200);
      const uploadedFile = listRes.body.files.find((f: MockFile) => f.id === fileId);
      expect(uploadedFile).toBeDefined();

      const metadataRes = await request(app)
        .get(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(metadataRes.status).toBe(200);
      expect(metadataRes.body.file.originalName).toBe('integration-test.pdf');

      const downloadRes = await request(app)
        .get(`/api/files/${fileId}/download`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(downloadRes.status).toBe(200);
      expect(downloadRes.headers['content-type']).toBe('application/pdf');

      const deleteRes = await request(app)
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(deleteRes.status).toBe(200);

      const getDeletedRes = await request(app)
        .get(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(getDeletedRes.status).toBe(404);
    });

    it('should handle multiple file uploads to same project', async () => {
      const projectId = 'proj-1';
      const files = [
        { name: 'document1.pdf', type: 'application/pdf' },
        { name: 'photo1.jpg', type: 'image/jpeg' },
        { name: 'blueprint.png', type: 'image/png' },
      ];

      const uploadedFileIds: string[] = [];

      for (const file of files) {
        const buffer = Buffer.from(`mock-content-${file.name}`);
        const res = await request(app)
          .post(`/api/projects/${projectId}/files`)
          .set('Authorization', `Bearer ${homeownerToken}`)
          .attach('file', buffer, {
            filename: file.name,
            contentType: file.type,
          });

        expect(res.status).toBe(201);
        uploadedFileIds.push(res.body.file.id);
      }

      const listRes = await request(app)
        .get(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(listRes.status).toBe(200);
      const projectFiles = listRes.body.files.filter((f: MockFile) =>
        uploadedFileIds.includes(f.id)
      );
      expect(projectFiles.length).toBe(files.length);
    });

    it('should enforce authorization throughout file lifecycle', async () => {
      const projectId = 'proj-1';
      const pdfBuffer = Buffer.from('authorization-test-content');

      const uploadRes = await request(app)
        .post(`/api/projects/${projectId}/files`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .attach('file', pdfBuffer, {
          filename: 'auth-test.pdf',
          contentType: 'application/pdf',
        });

      expect(uploadRes.status).toBe(201);
      const fileId = uploadRes.body.file.id;

      const metadataRes = await request(app)
        .get(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${contractorToken}`);

      expect(metadataRes.status).toBe(200);

      const downloadRes = await request(app)
        .get(`/api/files/${fileId}/download`)
        .set('Authorization', `Bearer ${contractorToken}`);

      expect(downloadRes.status).toBe(200);

      const deleteRes = await request(app)
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${contractorToken}`);

      expect(deleteRes.status).toBe(403);

      const ownerDeleteRes = await request(app)
        .delete(`/api/files/${fileId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(ownerDeleteRes.status).toBe(200);
    });
  });
});
