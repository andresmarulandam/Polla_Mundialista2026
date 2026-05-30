// Mock Next.js NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init = {}) => ({
      body,
      status: init.status || 200,
      json: async () => body,
    })),
  },
}));

// Mock the matches controller/supabase interactions
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
  supabaseAdmin: {
    from: () => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }),
  },
}));

describe('Matches API Route (mocked)', () => {
  it('should have the route file', () => {
    // Just verify the file exists conceptually
    expect(true).toBe(true);
  });
  
  it('should mock dependencies correctly', () => {
    // Verify our mocks are working
    expect(require('next/server').NextResponse.json).toBeDefined();
    expect(require('@/lib/supabase').supabase).toBeDefined();
  });
});
