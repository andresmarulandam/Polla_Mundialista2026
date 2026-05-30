export interface User {
  id: string;
  name: string;
  password_hash: string;
  is_admin: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  api_id: string | null;
  home_team: string;
  away_team: string;
  match_datetime: string;
  venue: string | null;
  country: string | null;
  stage: MatchStage;
  group_name: string | null;
  home_score: number | null;
  away_score: number | null;
  status: MatchStatus;
  updated_at: string;
}

export interface Prediction {
  id: string;
  user_id: string;
  match_id: string;
  home_score_predicted: number;
  away_score_predicted: number;
  points_earned: number;
  created_at: string;
}

export interface AdminSyncLog {
  id: string;
  last_sync_at: string | null;
  matches_updated: number;
}

export type MatchStage = 
  | 'group_stage' 
  | 'round_of_32' 
  | 'round_of_16' 
  | 'quarter_final' 
  | 'semi_final' 
  | 'third_place' 
  | 'final';

export type MatchStatus = 'pending' | 'finished';

export interface Standing {
  rank: number;
  user_id: string;
  user_name: string;
  total_points: number;
  exact_predictions: number;
}

export interface MatchWithPrediction extends Match {
  user_prediction: Prediction | null;
}

export interface MatchGroup {
  stage: MatchStage;
  stageLabel: string;
  matches: MatchWithPrediction[];
}

export interface UserSession {
  id: string;
  name: string;
  is_admin: boolean;
}