# Test Plan for Polla Mundialista

## Overview
This document outlines the testing strategy for the Polla Mundialista World Cup betting pool application built with Next.js 14+, TypeScript, TailwindCSS, and Supabase.

## Testing Goals
1. Ensure core functionality works correctly
2. Prevent regressions during development
3. Validate authentication and authorization
4. Test API endpoints and business logic
5. Verify UI components render and behave correctly
6. Confirm integration between frontend and backend

## Test Types

### 1. Unit Tests
Focus on individual functions and utilities in isolation.

**Files to test:**
- `lib/auth.ts` - Password hashing, JWT handling, user operations
- `lib/api.ts` - TheSportsDB API integration, scoring logic, time helpers
- `lib/supabase.ts` - Supabase client initialization (mocked)
- `lib/types.ts` - TypeScript interfaces and types (if complex logic)

**Testing approach:**
- Use Jest with ts-jest
- Mock external dependencies (Supabase, fetch API)
- Test edge cases and error conditions

### 2. Integration Tests
Test API routes and their interaction with Supabase.

**Files to test:**
- `app/api/auth/route.ts` - Login/register endpoints
- `app/api/session/route.ts` - Session verification
- `app/api/matches/route.ts` - Fetch matches with user predictions
- `app/api/predictions/route.ts` - Save/update predictions
- `app/api/standings/route.ts` - Calculate standings
- `app/api/admin/sync/route.ts` - Sync matches from TheSportsDB
- `app/api/admin/users/route.ts` - User management (admin only)

**Testing approach:**
- Use Jest to mock Supabase client
- Test request validation and response formatting
- Verify database operations (select, insert, update, delete)
- Test authorization middleware

### 3. Component Tests
Test React components for correct rendering and user interactions.

**Files to test:**
- `app/login/page.tsx` - Login/register form
- `app/page.tsx` - Home page with match listings and prediction inputs
- `app/standings/page.tsx` - Standings table with sorting
- `app/admin/page.tsx` - Admin panel with sync controls and user list
- `app/layout.tsx` - Root layout (if complex logic)

**Testing approach:**
- Use React Testing Library (@testing-library/react)
- Render components and query DOM elements
- Simulate user events (clicks, form submissions)
- Verify state changes and UI updates

### 4. End-to-End Tests (Future)
Simulate complete user flows using tools like Cypress or Playwright.

**Critical user flows to test:**
1. User registration → Login → Make predictions → View standings
2. Admin login → Sync matches → View updated matches → Verify scoring
3. Mobile responsiveness of all pages
4. Authentication protection (redirects when not logged in)

## Test Environment Setup

### Dependencies
```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.2",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.2",
    "@types/jest": "^29.5.12",
    "babel-jest": "^29.7.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "ts-jest": "^29.1.1",
    "typescript": "^5.5.4"
  }
}
```

### Configuration Files
- `jest.config.js` - Jest configuration with TypeScript and ES module support
- `babel.config.js` - Babel preset for JSX/TypeScript transformation
- `jest.setup.ts` - Test setup (DOM extensions, mocks)

### Mocking Strategy
1. **Supabase**: Mock `@/lib/supabase` to return predictable responses
2. **Fetch API**: Mock global `fetch` for TheSportsDB API calls
3. **Next.js Navigation**: Mock `next/navigation` hooks (useRouter, usePathname, useSearchParams)
4. **Environment Variables**: Process env variables mocked in test setup

## Test Organization

```
__tests__/
├── lib/
│   ├── auth.test.ts
│   ├── api.test.ts
│   └── supabase.test.ts
├── api/
│   ├── auth.route.test.ts
│   ├── matches.route.test.ts
│   ├── predictions.route.test.ts
│   ├── standings.route.test.ts
│   └── admin/
│       ├── sync.route.test.ts
│       └── users.route.test.ts
├── components/
│   ├── login.test.tsx
│   ├── page.test.tsx          // Home page
│   ├── standings.test.tsx
│   └── admin.test.tsx
└── setup/
    └── jest.setup.ts
```

## Coverage Goals
- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

Focus on critical paths and business logic rather than achieving 100% coverage.

## Continuous Integration
Tests should run on:
1. Pre-commit hook (husky + lint-staged)
2. Pull request validation
3. Main branch protection
4. Deployment preview environments

## Test Data Strategy
- Use factories or builders for test data
- Keep test data minimal and focused
- Reset mock state between tests
- Use realistic but anonymized data

## Performance Considerations
- Keep unit tests fast (<1 second for suite)
- Use explicit mocks to avoid unnecessary work
- Avoid filesystem or network access in unit tests
- Consider test-only optimizations

## Maintenance
- Update tests when modifying corresponding source code
- Review failing tests promptly
- Keep test documentation up-to-date
- Remove obsolete tests

## Sample Test Structure

```typescript
describe('FunctionName', () => {
  beforeEach(() => {
    // Reset mocks, set up common test data
  });

  afterEach(() => {
    // Clean up
  });

  it('should do X when Y', () => {
    // Arrange
    // Act
    // Assert
  });

  it('should handle error case Z', () => {
    // Arrange
    // Act
    // Assert
  });
});
```

## Next Steps
1. Implement authentication utility tests
2. Create API route integration tests
3. Build component test suite
4. Set up test coverage reporting
5. Configure pre-commit hooks
6. Document testing conventions for team
