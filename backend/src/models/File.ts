export interface File {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  projectId: string;
  uploadedBy: string;
  path: string;
  createdAt: Date;
}

class FileModel {
  private files: Map<string, File> = new Map();

  create(file: File): File {
    this.files.set(file.id, file);
    return file;
  }

  findById(id: string): File | undefined {
    return this.files.get(id);
  }

  findByProject(projectId: string): File[] {
    return Array.from(this.files.values()).filter(f => f.projectId === projectId);
  }

  delete(id: string): boolean {
    return this.files.delete(id);
  }

  getAll(): File[] {
    return Array.from(this.files.values());
  }

  clear(): void {
    this.files.clear();
  }
}

export default new FileModel();
