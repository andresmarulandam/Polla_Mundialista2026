/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/(.*)$': '<rootDir>/$1',
    // Handle ES module imports
    '^jose$': '<rootDir>/node_modules/jose/dist/browser/index.js',
  },
  testMatch: [
    '**/__tests__/**/*.[jt]s?(x)',
    '**/?(*.)+(spec|test).[tj]s?(x)'
  ],
  transform: {
    '^.+\.(ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/',
    '!/node_modules/jose',
  ],
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!app/layout.tsx',
    '!app/page.tsx',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
