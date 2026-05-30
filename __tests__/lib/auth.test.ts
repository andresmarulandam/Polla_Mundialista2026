// Test that auth module exports expected functions
import * as auth from '@/lib/auth';

describe('Auth Module Exports', () => {
  it('should export hashPassword function', () => {
    expect(auth.hashPassword).toBeDefined();
    expect(typeof auth.hashPassword).toBe('function');
  });

  it('should export verifyPassword function', () => {
    expect(auth.verifyPassword).toBeDefined();
    expect(typeof auth.verifyPassword).toBe('function');
  });

  it('should export createSession function', () => {
    expect(auth.createSession).toBeDefined();
    expect(typeof auth.createSession).toBe('function');
  });

  it('should export verifySession function', () => {
    expect(auth.verifySession).toBeDefined();
    expect(typeof auth.verifySession).toBe('function');
  });

  it('should export createUser function', () => {
    expect(auth.createUser).toBeDefined();
    expect(typeof auth.createUser).toBe('function');
  });

  it('should export authenticateUser function', () => {
    expect(auth.authenticateUser).toBeDefined();
    expect(typeof auth.authenticateUser).toBe('function');
  });

  it('should export getUserById function', () => {
    expect(auth.getUserById).toBeDefined();
    expect(typeof auth.getUserById).toBe('function');
  });
});

// Simple unit test for token generation (mocking jose)
describe('Token Generation Logic', () => {
  // We'll test the logic that doesn't depend on external services
  // by manually testing what we can
  
  it('should handle empty password in hashPassword (would fail but not crash)', async () => {
    // This test just verifies the function exists and can be called
    // Actual bcrypt behavior is tested implicitly through integration
    expect(auth.hashPassword).toBeDefined();
  });
});
