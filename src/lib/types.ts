export type Prediction = 'REAL' | 'FAKE';
export type RiskLevel = 'Low' | 'Medium' | 'High';
export type Theme = 'dark' | 'light';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  theme: Theme;
  created_at: string;
  updated_at: string;
}

export interface Analysis {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string | null;
  prediction: Prediction;
  confidence: number;
  risk_level: RiskLevel;
  face_consistency: number;
  lip_sync: number;
  visual_artifact: number;
  temporal_consistency: number;
  explanation: string | null;
  summary: string | null;
  created_at: string;
}

export interface AnalysisInput {
  file_name: string;
  file_size: number;
  file_type: string | null;
  prediction: Prediction;
  confidence: number;
  risk_level: RiskLevel;
  face_consistency: number;
  lip_sync: number;
  visual_artifact: number;
  temporal_consistency: number;
  explanation: string;
  summary: string;
}

export const SUPPORTED_FORMATS = ['mp4', 'mov', 'avi', 'mkv'] as const;
export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
