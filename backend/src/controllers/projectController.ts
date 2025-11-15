import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import ProjectModel from '../models/Project';

export const createProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, address, city, state, zipCode } = req.body;

    if (!title || !address || !city || !state || !zipCode) {
      res.status(400).json({ error: 'Required fields missing' });
      return;
    }

    const projectId = `proj-${Date.now()}`;
    const newProject = ProjectModel.create({
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
    });

    res.status(201).json({
      message: 'Project created successfully',
      project: newProject,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjects = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '10', status, city } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    let projects = ProjectModel.getAll();

    // Filter by status
    if (status) {
      projects = projects.filter(p => p.status === status);
    }

    // Filter by city (case-insensitive)
    if (city) {
      projects = projects.filter(p => p.city.toLowerCase() === (city as string).toLowerCase());
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
};

export const getProjectById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Project ID required' });
      return;
    }

    const project = ProjectModel.findById(id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.status(200).json({ project });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Project ID required' });
      return;
    }

    const project = ProjectModel.findById(id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Authorization check
    if (project.ownerId !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Not project owner' });
      return;
    }

    const { title, description, address, city, state, zipCode, status } = req.body;

    const updates: any = { updatedAt: new Date() };
    if (title) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (address) updates.address = address;
    if (city) updates.city = city;
    if (state) updates.state = state;
    if (zipCode) updates.zipCode = zipCode;
    if (status) updates.status = status;

    const updatedProject = ProjectModel.update(id, updates);

    res.status(200).json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({ error: 'Project ID required' });
      return;
    }

    const project = ProjectModel.findById(id);

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Authorization check
    if (project.ownerId !== req.user!.userId && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Forbidden: Not project owner' });
      return;
    }

    ProjectModel.delete(id);

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
