import { beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-for-jwt-tokens';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/building_permit_test';
  process.env.REDIS_URL = 'redis://localhost:6379/1';
  process.env.FILE_UPLOAD_PATH = './test-uploads';
  process.env.MAX_FILE_SIZE = '10485760';
});

afterAll(async () => {
  // Cleanup
});

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});
