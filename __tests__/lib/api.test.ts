import {
  canPredict,
  calculatePoints,
  getTimeRemaining,
  formatMatchDateTime,
  GROUP_STAGE_DEADLINE,
  ROUND_OF_16_DEADLINE,
  QUARTER_FINAL_DEADLINE,
  SEMI_FINAL_DEADLINE,
  STAGE_LABELS,
  STAGES_ORDER,
} from '@/lib/api';
import { MatchStage, MatchStatus } from '@/lib/types';

describe('API Utilities', () => {
  describe('calculatePoints', () => {
    it('should award 5 points for exact score in group stage', () => {
      expect(calculatePoints(2, 1, 2, 1, 'group_stage')).toBe(5);
    });

    it('should award 10 points for exact score in knockout stage', () => {
      expect(calculatePoints(2, 1, 2, 1, 'final')).toBe(10);
    });

    it('should award 3 points for correct winner in group stage', () => {
      expect(calculatePoints(2, 0, 2, 1, 'group_stage')).toBe(3);
    });

    it('should award 6 points for correct winner in knockout stage', () => {
      expect(calculatePoints(2, 0, 2, 1, 'final')).toBe(6);
    });

    it('should award 3 points for correct draw in group stage', () => {
      expect(calculatePoints(1, 1, 0, 0, 'group_stage')).toBe(3);
    });

    it('should award 0 points for wrong prediction', () => {
      expect(calculatePoints(0, 0, 2, 1, 'group_stage')).toBe(0);
    });
  });

  describe('canPredict', () => {
    const baseMatch = {
      status: 'pending' as const,
      home_score: null,
      away_score: null,
    };

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should allow group stage prediction before June 9 deadline', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-01T00:00:00Z'));
      const match = { ...baseMatch, stage: 'group_stage' as MatchStage, match_datetime: '2026-06-15T19:00:00Z' };
      expect(canPredict(match)).toBe(true);
    });

    it('should block group stage prediction after June 9 deadline', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-10T05:00:00Z'));
      const match = { ...baseMatch, stage: 'group_stage' as MatchStage, match_datetime: '2026-06-15T19:00:00Z' };
      expect(canPredict(match)).toBe(false);
    });

    it('should block finished matches', () => {
      const match = { ...baseMatch, status: 'finished' as MatchStatus, stage: 'group_stage' as MatchStage, match_datetime: '2026-06-15T19:00:00Z' };
      expect(canPredict(match)).toBe(false);
    });

    it('should block matches with scores', () => {
      const match = { ...baseMatch, home_score: 1, stage: 'group_stage' as MatchStage, match_datetime: '2026-06-15T19:00:00Z' };
      expect(canPredict(match)).toBe(false);
    });

    it('should apply 48h rule for knockout stage', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-18T10:00:00Z'));
      const match = { ...baseMatch, stage: 'final' as MatchStage, match_datetime: '2026-07-19T20:00:00Z' };
      expect(canPredict(match)).toBe(false);
    });
  });

  describe('getTimeRemaining', () => {
    afterEach(() => {
      jest.useRealTimers();
    });

    it('should return days and hours for knockout match', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-01T00:00:00Z'));
      const match = { match_datetime: '2026-07-04T18:00:00Z', stage: 'final' };
      const remaining = getTimeRemaining(match);
      expect(remaining).toContain('3d');
    });

    it('should return hours for knockout match less than a day away', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-04T13:00:00Z'));
      const match = { match_datetime: '2026-07-04T18:00:00Z', stage: 'final' };
      const remaining = getTimeRemaining(match);
      expect(remaining).toBe('Cierra en 5h');
    });

    it('should return minutes for knockout match less than an hour away', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-04T17:30:00Z'));
      const match = { match_datetime: '2026-07-04T18:00:00Z', stage: 'final' };
      const remaining = getTimeRemaining(match);
      expect(remaining).toBe('Cierra en 30m');
    });

    it('should return Cerrado for past matches', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-20T00:00:00Z'));
      const match = { match_datetime: '2026-07-19T20:00:00Z', stage: 'final' };
      const remaining = getTimeRemaining(match);
      expect(remaining).toBe('Cerrado');
    });

    it('should show group stage deadline countdown', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-06-08T00:00:00Z'));
      const match = { match_datetime: '2026-06-15T19:00:00Z', stage: 'group_stage' };
      const remaining = getTimeRemaining(match);
      expect(remaining).toContain('d');
      expect(remaining).toContain('h');
    });
  });

  describe('formatMatchDateTime', () => {
    it('should format date correctly', () => {
      const formatted = formatMatchDateTime('2026-06-15T19:00:00Z');
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  });

  describe('STAGE_LABELS and STAGES_ORDER', () => {
    it('should have correct stage labels', () => {
      expect(STAGE_LABELS.group_stage).toBe('Fase de Grupos');
      expect(STAGE_LABELS.round_of_32).toBe('Ronda de 32');
      expect(STAGE_LABELS.round_of_16).toBe('Octavos de Final');
      expect(STAGE_LABELS.quarter_final).toBe('Cuartos de Final');
      expect(STAGE_LABELS.semi_final).toBe('Semifinales');
      expect(STAGE_LABELS.final).toBe('Gran Final');
    });

    it('should have stages in correct order', () => {
      expect(STAGES_ORDER[0].stage).toBe('group_stage');
      expect(STAGES_ORDER[1].stage).toBe('round_of_32');
      expect(STAGES_ORDER[2].stage).toBe('round_of_16');
      expect(STAGES_ORDER[STAGES_ORDER.length - 1].stage).toBe('final');
    });
  });

  describe('GROUP_STAGE_DEADLINE', () => {
    it('should be June 10 04:59 UTC (June 9 23:59 Colombia)', () => {
      expect(GROUP_STAGE_DEADLINE.toISOString()).toBe('2026-06-10T04:59:00.000Z');
    });
  });

  describe('ROUND_OF_16_DEADLINE', () => {
    it('should be July 4 16:00 UTC (July 4 11:00 Colombia)', () => {
      expect(ROUND_OF_16_DEADLINE.toISOString()).toBe('2026-07-04T16:00:00.000Z');
    });
  });

  describe('QUARTER_FINAL_DEADLINE', () => {
    it('should be July 9 18:00 UTC (July 9 13:00 Colombia)', () => {
      expect(QUARTER_FINAL_DEADLINE.toISOString()).toBe('2026-07-09T18:00:00.000Z');
    });
  });

  describe('SEMI_FINAL_DEADLINE', () => {
    it('should be July 14 17:00 UTC (July 14 12:00 Colombia)', () => {
      expect(SEMI_FINAL_DEADLINE.toISOString()).toBe('2026-07-14T17:00:00.000Z');
    });
  });

  describe('canPredict round_of_16', () => {
    const baseMatch = {
      status: 'pending' as const,
      home_score: null,
      away_score: null,
      home_team: 'Brasil',
      away_team: 'Noruega',
    };

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should allow round_of_16 prediction before July 4 deadline', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-01T00:00:00Z'));
      const match = { ...baseMatch, stage: 'round_of_16' as MatchStage, match_datetime: '2026-07-05T20:00:00Z' };
      expect(canPredict(match)).toBe(true);
    });

    it('should block round_of_16 prediction after July 4 deadline', () => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2026-07-04T16:01:00Z'));
      const match = { ...baseMatch, stage: 'round_of_16' as MatchStage, match_datetime: '2026-07-05T20:00:00Z' };
      expect(canPredict(match)).toBe(false);
    });
  });
});
