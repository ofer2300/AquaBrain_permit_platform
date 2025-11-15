import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface TestUser {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'homeowner' | 'contractor' | 'admin' | 'reviewer';
}

export const mockUsers: { [key: string]: TestUser } = {
  homeowner: {
    id: '1',
    email: 'homeowner@test.com',
    password: 'Password123!',
    name: 'John Homeowner',
    role: 'homeowner',
  },
  contractor: {
    id: '2',
    email: 'contractor@test.com',
    password: 'Password123!',
    name: 'Jane Contractor',
    role: 'contractor',
  },
  admin: {
    id: '3',
    email: 'admin@test.com',
    password: 'Password123!',
    name: 'Admin User',
    role: 'admin',
  },
  reviewer: {
    id: '4',
    email: 'reviewer@test.com',
    password: 'Password123!',
    name: 'Bob Reviewer',
    role: 'reviewer',
  },
};

export const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'test-secret-key-for-jwt-tokens';
  return jwt.sign({ userId, role }, secret, { expiresIn: '24h' });
};

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 10);
};

export const comparePasswords = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET || 'test-secret-key-for-jwt-tokens';
  return jwt.verify(token, secret);
};

export interface MockProject {
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

export const mockProjects: MockProject[] = [
  {
    id: 'proj-1',
    title: 'Kitchen Renovation',
    description: 'Complete kitchen remodel with new appliances',
    address: '123 Main St',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62701',
    status: 'draft',
    ownerId: '1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'proj-2',
    title: 'Bathroom Addition',
    description: 'Add new bathroom to second floor',
    address: '456 Oak Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601',
    status: 'submitted',
    ownerId: '2',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
  {
    id: 'proj-3',
    title: 'Deck Construction',
    description: 'Build new deck in backyard',
    address: '789 Pine Rd',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62702',
    status: 'under_review',
    ownerId: '1',
    createdAt: new Date('2024-01-03'),
    updatedAt: new Date('2024-01-03'),
  },
  {
    id: 'proj-4',
    title: 'Garage Expansion',
    description: 'Expand garage to fit three cars',
    address: '321 Elm St',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60602',
    status: 'approved',
    ownerId: '2',
    createdAt: new Date('2024-01-04'),
    updatedAt: new Date('2024-01-04'),
  },
  {
    id: 'proj-5',
    title: 'Basement Finishing',
    description: 'Finish basement with home theater',
    address: '654 Maple Dr',
    city: 'Springfield',
    state: 'IL',
    zipCode: '62703',
    status: 'rejected',
    ownerId: '1',
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
];

export interface MockFile {
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

export const mockFiles: MockFile[] = [
  {
    id: 'file-1',
    filename: 'floor-plan-1234.pdf',
    originalName: 'floor-plan.pdf',
    mimetype: 'application/pdf',
    size: 524288,
    projectId: 'proj-1',
    uploadedBy: '1',
    path: '/uploads/floor-plan-1234.pdf',
    createdAt: new Date('2024-01-01'),
  },
  {
    id: 'file-2',
    filename: 'elevation-5678.pdf',
    originalName: 'elevation.pdf',
    mimetype: 'application/pdf',
    size: 1048576,
    projectId: 'proj-1',
    uploadedBy: '1',
    path: '/uploads/elevation-5678.pdf',
    createdAt: new Date('2024-01-02'),
  },
];

export const createMockDatabase = () => {
  const users = new Map<string, any>();
  const projects = new Map<string, any>();
  const files = new Map<string, any>();

  mockProjects.forEach((project) => projects.set(project.id, { ...project }));
  mockFiles.forEach((file) => files.set(file.id, { ...file }));

  return {
    users,
    projects,
    files,
    reset: () => {
      users.clear();
      projects.clear();
      files.clear();
      mockProjects.forEach((project) => projects.set(project.id, { ...project }));
      mockFiles.forEach((file) => files.set(file.id, { ...file }));
    },
  };
};

export const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
