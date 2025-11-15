import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import FileModel from '../models/File';
import ProjectModel from '../models/Project';
import storageService from '../services/storageService';

export const uploadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      res.status(400).json({ error: 'Project ID required' });
      return;
    }

    const project = ProjectModel.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Authorization check
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

    // Store file in memory
    storageService.store(fileId, req.file.buffer, {
      filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const newFile = FileModel.create({
      id: fileId,
      filename,
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      projectId,
      uploadedBy: req.user!.userId,
      path: filePath,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: newFile,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getFileMetadata = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      res.status(400).json({ error: 'File ID required' });
      return;
    }

    const file = FileModel.findById(fileId);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const project = ProjectModel.findById(file.projectId);
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
};

export const downloadFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      res.status(400).json({ error: 'File ID required' });
      return;
    }

    const file = FileModel.findById(fileId);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const project = ProjectModel.findById(file.projectId);
    if (!project) {
      res.status(404).json({ error: 'Associated project not found' });
      return;
    }

    // Set headers
    res.setHeader('Content-Type', file.mimetype);
    res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
    res.setHeader('Content-Length', file.size.toString());

    // Send mock file content for testing
    res.status(200).send(Buffer.from('mock-file-content'));
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { projectId } = req.params;

    if (!projectId) {
      res.status(400).json({ error: 'Project ID required' });
      return;
    }

    const project = ProjectModel.findById(projectId);
    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const files = FileModel.findByProject(projectId);

    res.status(200).json({
      files,
      count: files.length,
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    if (!fileId) {
      res.status(400).json({ error: 'File ID required' });
      return;
    }

    const file = FileModel.findById(fileId);

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    const project = ProjectModel.findById(file.projectId);
    if (!project) {
      res.status(404).json({ error: 'Associated project not found' });
      return;
    }

    // Authorization check: file uploader, project owner, or admin
    if (
      file.uploadedBy !== req.user!.userId &&
      project.ownerId !== req.user!.userId &&
      req.user!.role !== 'admin'
    ) {
      res.status(403).json({ error: 'Forbidden: Not authorized to delete this file' });
      return;
    }

    // Delete from storage
    storageService.delete(fileId);

    // Delete from database
    FileModel.delete(fileId);

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
