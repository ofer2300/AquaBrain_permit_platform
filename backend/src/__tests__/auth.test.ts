import request from 'supertest';
import express, { Express, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import {
  generateToken,
  hashPassword,
  comparePasswords,
  verifyToken,
  createMockDatabase,
} from '../test/helpers';

const app: Express = express();
app.use(express.json());

const mockDb = createMockDatabase();

app.post('/api/auth/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({
        error:
          'Password must be at least 8 characters with uppercase, lowercase, number, and special character',
      });
      return;
    }

    const existingUser = Array.from(mockDb.users.values()).find(
      (u: any) => u.email === email
    );
    if (existingUser) {
      res.status(409).json({ error: 'User already exists' });
      return;
    }

    const hashedPassword = await hashPassword(password);
    const userId = `user-${Date.now()}`;

    const newUser = {
      id: userId,
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
    };

    mockDb.users.set(userId, newUser);

    const token = generateToken(userId, role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: userId,
        name,
        email,
        role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = Array.from(mockDb.users.values()).find((u: any) => u.email === email);

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await comparePasswords(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = verifyToken(token);
      const user = mockDb.users.get(decoded.userId);

      if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
      }

      res.status(200).json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (jwtError) {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

describe('Auth Routes', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
  });

  afterAll(async () => {
    mockDb.reset();
  });

  beforeEach(() => {
    mockDb.reset();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid credentials', async () => {
      const userData = {
        name: 'Test User',
        email: 'newuser@test.com',
        password: 'Password123!',
        role: 'homeowner',
      };

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('User registered successfully');
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });
      expect(res.body.user.id).toBeDefined();
      expect(res.body.user.password).toBeUndefined();
    });

    it('should fail registration with existing email', async () => {
      const userData = {
        name: 'First User',
        email: 'duplicate@test.com',
        password: 'Password123!',
        role: 'homeowner',
      };

      await request(app).post('/api/auth/register').send(userData);

      const duplicateUser = {
        name: 'Second User',
        email: 'duplicate@test.com',
        password: 'DifferentPass123!',
        role: 'contractor',
      };

      const res = await request(app).post('/api/auth/register').send(duplicateUser);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('User already exists');
    });

    it('should fail registration with invalid email format', async () => {
      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@nodomain.com',
        'spaces in@email.com',
        'double@@email.com',
      ];

      for (const email of invalidEmails) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email,
            password: 'Password123!',
            role: 'homeowner',
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid email format');
      }
    });

    it('should fail registration with weak password', async () => {
      const weakPasswords = [
        { password: 'short', reason: 'too short' },
        { password: 'nouppercase123!', reason: 'no uppercase' },
        { password: 'NOLOWERCASE123!', reason: 'no lowercase' },
        { password: 'NoNumbers!', reason: 'no numbers' },
        { password: 'NoSpecial123', reason: 'no special character' },
      ];

      for (const { password } of weakPasswords) {
        const res = await request(app)
          .post('/api/auth/register')
          .send({
            name: 'Test User',
            email: 'test@test.com',
            password,
            role: 'homeowner',
          });

        expect(res.status).toBe(400);
        expect(res.body.error).toContain('Password must be at least 8 characters');
      }
    });

    it('should fail registration with missing fields', async () => {
      const incompleteData = [
        { email: 'test@test.com', password: 'Password123!', role: 'homeowner' },
        { name: 'Test User', password: 'Password123!', role: 'homeowner' },
        { name: 'Test User', email: 'test@test.com', role: 'homeowner' },
        { name: 'Test User', email: 'test@test.com', password: 'Password123!' },
      ];

      for (const data of incompleteData) {
        const res = await request(app).post('/api/auth/register').send(data);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('All fields are required');
      }
    });

    it('should hash password before storing', async () => {
      const userData = {
        name: 'Test User',
        email: 'hash@test.com',
        password: 'Password123!',
        role: 'homeowner',
      };

      const res = await request(app).post('/api/auth/register').send(userData);

      expect(res.status).toBe(201);

      const userId = res.body.user.id;
      const user = mockDb.users.get(userId);

      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$.{56}$/);

      const isValid = await comparePasswords(userData.password, user.password);
      expect(isValid).toBe(true);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await hashPassword('Password123!');
      mockDb.users.set('test-user-1', {
        id: 'test-user-1',
        name: 'Test User',
        email: 'login@test.com',
        password: hashedPassword,
        role: 'homeowner',
      });
    });

    it('should login with valid credentials', async () => {
      const credentials = {
        email: 'login@test.com',
        password: 'Password123!',
      };

      const res = await request(app).post('/api/auth/login').send(credentials);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login successful');
      expect(res.body.token).toBeDefined();
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user).toMatchObject({
        id: 'test-user-1',
        name: 'Test User',
        email: 'login@test.com',
        role: 'homeowner',
      });
      expect(res.body.user.password).toBeUndefined();
    });

    it('should fail login with invalid password', async () => {
      const credentials = {
        email: 'login@test.com',
        password: 'WrongPassword123!',
      };

      const res = await request(app).post('/api/auth/login').send(credentials);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
      expect(res.body.token).toBeUndefined();
    });

    it('should fail login with non-existent user', async () => {
      const credentials = {
        email: 'nonexistent@test.com',
        password: 'Password123!',
      };

      const res = await request(app).post('/api/auth/login').send(credentials);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
      expect(res.body.token).toBeUndefined();
    });

    it('should fail login with missing email', async () => {
      const credentials = {
        password: 'Password123!',
      };

      const res = await request(app).post('/api/auth/login').send(credentials);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email and password are required');
    });

    it('should fail login with missing password', async () => {
      const credentials = {
        email: 'login@test.com',
      };

      const res = await request(app).post('/api/auth/login').send(credentials);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email and password are required');
    });
  });

  describe('GET /api/auth/me', () => {
    let validToken: string;
    let userId: string;

    beforeEach(async () => {
      userId = 'current-user-1';
      const hashedPassword = await hashPassword('Password123!');
      mockDb.users.set(userId, {
        id: userId,
        name: 'Current User',
        email: 'current@test.com',
        password: hashedPassword,
        role: 'contractor',
      });

      validToken = generateToken(userId, 'contractor');
    });

    it('should get current user with valid JWT token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${validToken}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        id: userId,
        name: 'Current User',
        email: 'current@test.com',
        role: 'contractor',
      });
      expect(res.body.user.password).toBeUndefined();
    });

    it('should fail without authentication token (401)', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should fail with invalid token format', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'InvalidFormat token123');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No token provided');
    });

    it('should fail with malformed JWT token (401)', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid.jwt.token');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });

    it('should fail with expired JWT token', async () => {
      const expiredToken = jwt.sign(
        { userId, role: 'contractor' },
        process.env.JWT_SECRET as string,
        { expiresIn: '0s' }
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });

    it('should fail with token signed with wrong secret', async () => {
      const wrongToken = jwt.sign({ userId, role: 'contractor' }, 'wrong-secret', {
        expiresIn: '24h',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${wrongToken}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid token');
    });

    it('should fail when user no longer exists', async () => {
      const deletedUserId = 'deleted-user';
      const tokenForDeletedUser = generateToken(deletedUserId, 'homeowner');

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${tokenForDeletedUser}`);

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('User not found');
    });
  });

  describe('JWT Token Validation', () => {
    it('should generate valid JWT token with correct payload', () => {
      const userId = 'test-user-123';
      const role = 'admin';

      const token = generateToken(userId, role);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      const decoded = verifyToken(token);
      expect(decoded.userId).toBe(userId);
      expect(decoded.role).toBe(role);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should create tokens with 24 hour expiration', () => {
      const token = generateToken('user-1', 'homeowner');
      const decoded = verifyToken(token);

      const expirationTime = decoded.exp - decoded.iat;
      expect(expirationTime).toBe(24 * 60 * 60);
    });

    it('should verify token with correct secret', () => {
      const token = generateToken('user-1', 'homeowner');

      expect(() => {
        verifyToken(token);
      }).not.toThrow();
    });

    it('should reject token verification with wrong secret', () => {
      const token = jwt.sign({ userId: 'user-1', role: 'homeowner' }, 'wrong-secret');

      expect(() => {
        verifyToken(token);
      }).toThrow();
    });
  });

  describe('Password Hashing Verification', () => {
    it('should hash password correctly', async () => {
      const plainPassword = 'TestPassword123!';
      const hash = await hashPassword(plainPassword);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(plainPassword);
      expect(hash).toMatch(/^\$2[aby]\$.{56}$/);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SamePassword123!';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should verify correct password against hash', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);

      const isValid = await comparePasswords(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password against hash', async () => {
      const password = 'CorrectPassword123!';
      const hash = await hashPassword(password);

      const isValid = await comparePasswords('WrongPassword123!', hash);
      expect(isValid).toBe(false);
    });

    it('should handle password comparison with invalid hash', async () => {
      const isValid = await comparePasswords('Password123!', 'invalid-hash');
      expect(isValid).toBe(false);
    });

    it('should use bcrypt with sufficient salt rounds', async () => {
      const password = 'TestPassword123!';
      const hash = await hashPassword(password);

      const saltRounds = hash.substring(4, 6);
      expect(parseInt(saltRounds)).toBeGreaterThanOrEqual(10);
    });
  });

  describe('Integration: Full Authentication Flow', () => {
    it('should complete full registration and login flow', async () => {
      const userData = {
        name: 'Integration Test User',
        email: 'integration@test.com',
        password: 'IntegrationPass123!',
        role: 'contractor',
      };

      const registerRes = await request(app).post('/api/auth/register').send(userData);

      expect(registerRes.status).toBe(201);
      const registerToken = registerRes.body.token;

      const meRes1 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${registerToken}`);

      expect(meRes1.status).toBe(200);
      expect(meRes1.body.user.email).toBe(userData.email);

      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: userData.email, password: userData.password });

      expect(loginRes.status).toBe(200);
      const loginToken = loginRes.body.token;

      const meRes2 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginToken}`);

      expect(meRes2.status).toBe(200);
      expect(meRes2.body.user).toMatchObject({
        name: userData.name,
        email: userData.email,
        role: userData.role,
      });
    });

    it('should maintain separate sessions for different users', async () => {
      const user1 = {
        name: 'User One',
        email: 'user1@test.com',
        password: 'Password123!',
        role: 'homeowner',
      };

      const user2 = {
        name: 'User Two',
        email: 'user2@test.com',
        password: 'Password456!',
        role: 'contractor',
      };

      const reg1 = await request(app).post('/api/auth/register').send(user1);
      const reg2 = await request(app).post('/api/auth/register').send(user2);

      expect(reg1.status).toBe(201);
      expect(reg2.status).toBe(201);

      const token1 = reg1.body.token;
      const token2 = reg2.body.token;

      const me1 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token1}`);
      const me2 = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token2}`);

      expect(me1.body.user.email).toBe(user1.email);
      expect(me2.body.user.email).toBe(user2.email);
      expect(me1.body.user.id).not.toBe(me2.body.user.id);
    });
  });
});
