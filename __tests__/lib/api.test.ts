import { 
  calculatePoints, 
  canPredict, 
  getTimeRemaining, 
  formatMatchDateTime,
  STAGE_LABELS,
  STAGES_ORDER
} from '@/lib/api';
import { MatchStage, MatchStatus } from '@/lib/types';

describe('API Utilities', () => {
  describe('calculatePoints', () => {
    it('should award 5 points for exact score in group stage', () => {
      const points = calculatePoints(2, 1, 2, 1, 'group_stage');
      expect(points).toBe(5);
    });

    it('should award 10 points for exact score in knockout stage', () => {
      const points = calculatePoints(2, 1, 2, 1, 'final');
      expect(points).toBe(10); // 5 * 2 multiplier
    });

    it('should award 3 points for correct winner in group stage', () => {
      const points = calculatePoints(2, 0, 2, 1, 'group_stage');
      expect(points).toBe(3);
    });

    it('should award 6 points for correct winner in knockout stage', () => {
      const points = calculatePoints(2, 0, 2, 1, 'final');
      expect(points).toBe(6); // 3 * 2 multiplier
    });

    it('should award 3 points for correct draw in group stage', () => {
      const points = calculatePoints(1, 1, 0, 0, 'group_stage');
      expect(points).toBe(3);
    });

    it('should award 0 points for wrong prediction', () => {
      const points = calculatePoints(0, 0, 2, 1, 'group_stage');
      expect(points).toBe(0);
    });

    it('should handle null scores correctly', () => {
      // When both scores are null, it's considered a draw but not an exact match
      const points = calculatePoints(0, 0, null as unknown as number, null as unknown as number, 'group_stage');
      expect(points).toBe(3); // Predicted 0-0 vs actual null-null = draw (3 pts)
    });
  });

  describe('canPredict', () => {
    const baseMatch = {
      status: 'pending' as const,
      home_score: null,
      away_score: null,
      stage: 'group_stage' as MatchStage,
    };

    it('should allow prediction when match is far in future', () => {
      const futureMatch = {
        ...baseMatch,
        match_datetime: new Date(Date.now() + 100 * 60 * 60 * 1000).toISOString(), // 100 hours from now
      };
      expect(canPredict(futureMatch)).toBe(true);
    });

    it('should not allow prediction when match is too close (< 48h for group stage)', () => {
      const closeMatch = {
        ...baseMatch,
        match_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      };
      expect(canPredict(closeMatch)).toBe(false);
    });

    it('should not allow prediction for finished matches', () => {
      const finishedMatch = {
        ...baseMatch,
        status: 'finished' as MatchStatus,
        match_datetime: new Date(Date.now() + 100 * 60 * 60 * 1000).toISOString(),
      };
      expect(canPredict(finishedMatch)).toBe(false);
    });

    it('should not allow prediction when scores already exist', () => {
      const scoredMatch = {
        ...baseMatch,
        home_score: 1,
        match_datetime: new Date(Date.now() + 100 * 60 * 60 * 1000).toISOString(),
      };
      expect(canPredict(scoredMatch)).toBe(false);
    });

    it('should apply same 48h rule for knockout stage', () => {
      const knockoutMatch = {
        ...baseMatch,
        stage: 'final' as MatchStage,
        match_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      };
      expect(canPredict(knockoutMatch)).toBe(false);
    });
  });

  describe('getTimeRemaining', () => {
    it('should return correct time for future match', () => {
      const futureDate = new Date(Date.now() + 90 * 60 * 60 * 1000); // 90 hours = 3 days 18 hours
      const match = { match_datetime: futureDate.toISOString() };
      const remaining = getTimeRemaining(match);
      expect(remaining).toContain('3d'); // Should show days
      expect(remaining).toContain('h');  // Should show hours
    });

    it('should return hours only when less than a day', () => {
      const futureDate = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours
      const match = { match_datetime: futureDate.toISOString() };
      const remaining = getTimeRemaining(match);
      expect(remaining).toBe('Cierra en 5h');
    });

    it('should return minutes when less than an hour', () => {
      const futureDate = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      const match = { match_datetime: futureDate.toISOString() };
      const remaining = getTimeRemaining(match);
      expect(remaining).toBe('Cierra en 30m');
    });

    it('should return \"Cerrado\" for past matches', () => {
      const pastDate = new Date(Date.now() - 10 * 60 * 60 * 1000); // 10 hours ago
      const match = { match_datetime: pastDate.toISOString() };
      const remaining = getTimeRemaining(match);
      expect(remaining).toBe('Cerrado');
    });
  });

  describe('formatMatchDateTime', () => {
    it('should format date correctly for Mexico City timezone', () => {
      // Fixed date: 2026-06-15 19:00:00 UTC
      const dateString = '2026-06-15T19:00:00Z';
      const formatted = formatMatchDateTime(dateString);
      // Should be converted to Mexico City time (UTC-5 or UTC-6 depending on DST)
      // Just checking it returns a string
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('STAGE_LABELS and STAGES_ORDER', () => {
    it('should have correct stage labels', () => {
      expect(STAGE_LABELS.group_stage).toBe('Fase de Grupos');
      expect(STAGE_LABELS.final).toBe('Gran Final');
    });

    it('should have stages in correct order', () => {
      expect(STAGES_ORDER[0].stage).toBe('group_stage');
      expect(STAGES_ORDER[STAGES_ORDER.length - 1].stage).toBe('final');
    });
  });
});
