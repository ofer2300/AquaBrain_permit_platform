export interface Project {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

class ProjectModel {
  private projects: Map<string, Project> = new Map();

  create(project: Project): Project {
    this.projects.set(project.id, project);
    return project;
  }

  findById(id: string): Project | undefined {
    return this.projects.get(id);
  }

  update(id: string, updates: Partial<Project>): Project | undefined {
    const project = this.projects.get(id);
    if (!project) return undefined;

    const updatedProject = { ...project, ...updates, updatedAt: new Date() };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  delete(id: string): boolean {
    return this.projects.delete(id);
  }

  getAll(): Project[] {
    return Array.from(this.projects.values());
  }

  findByOwner(ownerId: string): Project[] {
    return Array.from(this.projects.values()).filter(p => p.ownerId === ownerId);
  }

  clear(): void {
    this.projects.clear();
  }
}

export default new ProjectModel();
