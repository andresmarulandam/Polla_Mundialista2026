import '@testing-library/jest-dom';

// Ensure TextEncoder/TextDecoder are available (for Node.js compatibility)
if (typeof TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = require('util').TextEncoder;
}
if (typeof TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = require('util').TextDecoder;
}

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    pushState: jest.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Supabase client
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      updateUser: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
    from: () => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
  supabaseAdmin: {
    auth: {
      admin: {
        getUserById: jest.fn(),
        updateUserById: jest.fn(),
        deleteUser: jest.fn(),
        listUsers: jest.fn(),
      },
    },
    from: () => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

// Mock bcrypt
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true),
}));

// Mock jose
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('fake_jwt_token'),
  })),
  jwtVerify: jest.fn().mockResolvedValue({ payload: { id: '1', name: 'test', is_admin: false } }),
}));

// Mock process.env
process.env = {
  ...process.env,
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-anon-key',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
  SESSION_SECRET: 'test-session-secret-key-1234567890123456',
};
