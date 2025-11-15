import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import {
  generateToken,
  mockUsers,
  createMockDatabase,
  MockProject,
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

app.post('/api/projects', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, address, city, state, zipCode } = req.body;

    if (!title || !address || !city || !state || !zipCode) {
      res.status(400).json({ error: 'Required fields missing' });
      return;
    }

    const projectId = `proj-${Date.now()}`;
    const newProject: MockProject = {
      id: projectId,
      title,
      description: description || '',
      address,
      city,
      state,
      zipCode,
      status: 'draft',
      ownerId: req.user!.userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockDb.projects.set(projectId, newProject);

    res.status(201).json({
      message: 'Project created successfully',
      project: newProject,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', status, city } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    let projects = Array.from(mockDb.projects.values());

    if (status) {
      projects = projects.filter((p: MockProject) => p.status === status);
    }

    if (city) {
      projects = projects.filter(
        (p: MockProject) => p.city.toLowerCase() === (city as string).toLowerCase()
      );
    }

    const total = projects.length;
    const totalPages = Math.ceil(total / limitNum);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;

    const paginatedProjects = projects.slice(startIndex, endIndex);

    res.status(200).json({
      projects: paginatedProjects,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/projects/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: 'Project ID required' });
      return;
    }

    const project = mockDb.projects.get(id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/projects/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: 'Project ID required' });
      return;
    }

    const project = mockDb.projects.get(id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.ownerId !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Not project owner' });
      return;
    }

    const { title, description, address, city, state, zipCode, status } = req.body;

    const updatedProject = {
      ...project,
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(address && { address }),
      ...(city && { city }),
      ...(state && { state }),
      ...(zipCode && { zipCode }),
      ...(status && { status }),
      updatedAt: new Date(),
    };

    mockDb.projects.set(id, updatedProject);

    res.status(200).json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    if (!id) {
      res.status(400).json({ error: 'Project ID required' });
      return;
    }

    const project = mockDb.projects.get(id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    if (project.ownerId !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Not project owner' });
      return;
    }

    mockDb.projects.delete(id);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

describe('Project Routes', () => {
  let homeownerToken: string;
  let contractorToken: string;
  let adminToken: string;
  let homeownerId: string;
  let contractorId: string;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
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

  describe('POST /api/projects', () => {
    it('should create project with authorized user', async () => {
      const projectData = {
        title: 'New Test Project',
        description: 'Testing project creation',
        address: '789 Test Ave',
        city: 'TestCity',
        state: 'TS',
        zipCode: '12345',
      };

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send(projectData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Project created successfully');
      expect(res.body.project).toMatchObject({
        title: projectData.title,
        description: projectData.description,
        address: projectData.address,
        city: projectData.city,
        state: projectData.state,
        zipCode: projectData.zipCode,
        status: 'draft',
        ownerId: homeownerId,
      });
      expect(res.body.project.id).toBeDefined();
      expect(res.body.project.createdAt).toBeDefined();
      expect(res.body.project.updatedAt).toBeDefined();
    });

    it('should create project without description', async () => {
      const projectData = {
        title: 'Minimal Project',
        address: '123 Minimal St',
        city: 'MinCity',
        state: 'MC',
        zipCode: '54321',
      };

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${contractorToken}`)
        .send(projectData);

      expect(res.status).toBe(201);
      expect(res.body.project.description).toBe('');
    });

    it('should fail to create project without token (unauthorized)', async () => {
      const projectData = {
        title: 'Unauthorized Project',
        address: '456 Unauth Rd',
        city: 'NoAuthCity',
        state: 'NA',
        zipCode: '99999',
      };

      const res = await request(app).post('/api/projects').send(projectData);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should fail to create project with invalid token', async () => {
      const projectData = {
        title: 'Invalid Token Project',
        address: '789 Invalid St',
        city: 'InvalidCity',
        state: 'IV',
        zipCode: '11111',
      };

      const res = await request(app)
        .post('/api/projects')
        .set('Authorization', 'Bearer invalid.token.here')
        .send(projectData);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });

    it('should fail to create project with missing required fields', async () => {
      const incompleteData = [
        { address: '123 St', city: 'City', state: 'ST', zipCode: '12345' },
        { title: 'Title', city: 'City', state: 'ST', zipCode: '12345' },
        { title: 'Title', address: '123 St', state: 'ST', zipCode: '12345' },
        { title: 'Title', address: '123 St', city: 'City', zipCode: '12345' },
        { title: 'Title', address: '123 St', city: 'City', state: 'ST' },
      ];

      for (const data of incompleteData) {
        const res = await request(app)
          .post('/api/projects')
          .set('Authorization', `Bearer ${homeownerToken}`)
          .send(data);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Required fields missing');
      }
    });
  });

  describe('GET /api/projects', () => {
    beforeEach(() => {
      mockDb.reset();
    });

    it('should get all projects with pagination', async () => {
      const res = await request(app)
        .get('/api/projects?page=1&limit=10')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      expect(Array.isArray(res.body.projects)).toBe(true);
      expect(res.body.projects.length).toBeLessThanOrEqual(10);
      expect(res.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });

    it('should paginate projects correctly', async () => {
      const page1 = await request(app)
        .get('/api/projects?page=1&limit=2')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(page1.status).toBe(200);
      expect(page1.body.projects.length).toBe(2);
      expect(page1.body.pagination.page).toBe(1);
      expect(page1.body.pagination.limit).toBe(2);

      const page2 = await request(app)
        .get('/api/projects?page=2&limit=2')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(page2.status).toBe(200);
      expect(page2.body.projects.length).toBe(2);
      expect(page2.body.pagination.page).toBe(2);

      expect(page1.body.projects[0].id).not.toBe(page2.body.projects[0].id);
    });

    it('should filter projects by status', async () => {
      const res = await request(app)
        .get('/api/projects?status=draft')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      res.body.projects.forEach((project: MockProject) => {
        expect(project.status).toBe('draft');
      });
    });

    it('should filter projects by city', async () => {
      const res = await request(app)
        .get('/api/projects?city=Springfield')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      res.body.projects.forEach((project: MockProject) => {
        expect(project.city).toBe('Springfield');
      });
    });

    it('should filter projects by status and city', async () => {
      const res = await request(app)
        .get('/api/projects?status=draft&city=Springfield')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      res.body.projects.forEach((project: MockProject) => {
        expect(project.status).toBe('draft');
        expect(project.city).toBe('Springfield');
      });
    });

    it('should handle case-insensitive city filter', async () => {
      const res = await request(app)
        .get('/api/projects?city=springfield')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.projects).toBeDefined();
      res.body.projects.forEach((project: MockProject) => {
        expect(project.city.toLowerCase()).toBe('springfield');
      });
    });

    it('should return empty array when no projects match filter', async () => {
      const res = await request(app)
        .get('/api/projects?status=nonexistent')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.projects).toEqual([]);
      expect(res.body.pagination.total).toBe(0);
    });

    it('should use default pagination values', async () => {
      const res = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/projects');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should get single project by ID', async () => {
      const projectId = 'proj-1';

      const res = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.project).toBeDefined();
      expect(res.body.project.id).toBe(projectId);
      expect(res.body.project.title).toBeDefined();
      expect(res.body.project.address).toBeDefined();
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app)
        .get('/api/projects/nonexistent-id')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Project not found');
    });

    it('should fail without authentication', async () => {
      const res = await request(app).get('/api/projects/proj-1');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should allow any authenticated user to view project', async () => {
      const projectId = 'proj-1';

      const res1 = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      const res2 = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${contractorToken}`);

      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      expect(res1.body.project.id).toBe(res2.body.project.id);
    });
  });

  describe('PUT /api/projects/:id', () => {
    it('should update project as owner', async () => {
      const projectId = 'proj-1';
      const updateData = {
        title: 'Updated Kitchen Renovation',
        description: 'Updated description with more details',
        status: 'submitted',
      };

      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Project updated successfully');
      expect(res.body.project).toMatchObject({
        id: projectId,
        title: updateData.title,
        description: updateData.description,
        status: updateData.status,
      });
      expect(new Date(res.body.project.updatedAt).getTime()).toBeGreaterThan(
        new Date(res.body.project.createdAt).getTime()
      );
    });

    it('should allow partial updates', async () => {
      const projectId = 'proj-1';
      const originalProject = mockDb.projects.get(projectId);

      const updateData = {
        title: 'Only Title Updated',
      };

      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.project.title).toBe(updateData.title);
      expect(res.body.project.description).toBe(originalProject.description);
      expect(res.body.project.address).toBe(originalProject.address);
    });

    it('should fail to update project as non-owner (forbidden)', async () => {
      const projectId = 'proj-1';
      const updateData = {
        title: 'Unauthorized Update',
      };

      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send(updateData);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden: Not project owner');
    });

    it('should allow admin to update any project', async () => {
      const projectId = 'proj-1';
      const updateData = {
        title: 'Admin Updated Title',
        status: 'approved',
      };

      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.project.title).toBe(updateData.title);
      expect(res.body.project.status).toBe(updateData.status);
    });

    it('should return 404 for non-existent project', async () => {
      const updateData = {
        title: 'Update Non-existent',
      };

      const res = await request(app)
        .put('/api/projects/nonexistent-id')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send(updateData);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Project not found');
    });

    it('should fail without authentication', async () => {
      const projectId = 'proj-1';
      const updateData = {
        title: 'Unauthorized Update',
      };

      const res = await request(app).put(`/api/projects/${projectId}`).send(updateData);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should preserve ownerId on update', async () => {
      const projectId = 'proj-1';
      const originalProject = mockDb.projects.get(projectId);

      const updateData = {
        title: 'Updated Title',
        ownerId: 'different-owner-id',
      };

      const res = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body.project.ownerId).toBe(originalProject.ownerId);
    });
  });

  describe('DELETE /api/projects/:id', () => {
    it('should delete project as owner', async () => {
      const projectId = 'proj-1';

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Project deleted successfully');

      const deletedProject = mockDb.projects.get(projectId);
      expect(deletedProject).toBeUndefined();
    });

    it('should fail to delete project as non-owner (forbidden)', async () => {
      const projectId = 'proj-1';

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${contractorToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('Forbidden: Not project owner');

      const project = mockDb.projects.get(projectId);
      expect(project).toBeDefined();
    });

    it('should allow admin to delete any project', async () => {
      const projectId = 'proj-1';

      const res = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Project deleted successfully');

      const deletedProject = mockDb.projects.get(projectId);
      expect(deletedProject).toBeUndefined();
    });

    it('should return 404 for non-existent project', async () => {
      const res = await request(app)
        .delete('/api/projects/nonexistent-id')
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Project not found');
    });

    it('should fail without authentication', async () => {
      const projectId = 'proj-1';

      const res = await request(app).delete(`/api/projects/${projectId}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should not allow deleting project twice', async () => {
      const projectId = 'proj-1';

      const res1 = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res1.status).toBe(200);

      const res2 = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(res2.status).toBe(404);
      expect(res2.body.error).toBe('Project not found');
    });
  });

  describe('Integration: Full Project CRUD Flow', () => {
    it('should complete full project lifecycle', async () => {
      const projectData = {
        title: 'Full Lifecycle Project',
        description: 'Testing complete CRUD operations',
        address: '999 Lifecycle St',
        city: 'TestCity',
        state: 'TC',
        zipCode: '99999',
      };

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send(projectData);

      expect(createRes.status).toBe(201);
      const projectId = createRes.body.project.id;

      const getRes = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.project.id).toBe(projectId);

      const updateRes = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send({ title: 'Updated Lifecycle Project', status: 'submitted' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.project.title).toBe('Updated Lifecycle Project');
      expect(updateRes.body.project.status).toBe('submitted');

      const deleteRes = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(deleteRes.status).toBe(200);

      const getDeletedRes = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(getDeletedRes.status).toBe(404);
    });

    it('should enforce ownership across operations', async () => {
      const projectData = {
        title: 'Ownership Test Project',
        address: '123 Owner St',
        city: 'OwnerCity',
        state: 'OC',
        zipCode: '12345',
      };

      const createRes = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${homeownerToken}`)
        .send(projectData);

      expect(createRes.status).toBe(201);
      const projectId = createRes.body.project.id;

      const getRes = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${contractorToken}`);

      expect(getRes.status).toBe(200);

      const updateRes = await request(app)
        .put(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${contractorToken}`)
        .send({ title: 'Unauthorized Update' });

      expect(updateRes.status).toBe(403);

      const deleteRes = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${contractorToken}`);

      expect(deleteRes.status).toBe(403);

      const stillExists = await request(app)
        .get(`/api/projects/${projectId}`)
        .set('Authorization', `Bearer ${homeownerToken}`);

      expect(stillExists.status).toBe(200);
    });
  });
});
