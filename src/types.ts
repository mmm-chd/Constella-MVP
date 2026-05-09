export enum PlanetStage {
  EMPTY = 0,
  ASTEROID = 1,
  MAGMA = 2,
  OCEAN = 3,
  LIVING = 4,
  ASCENDED = 5
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  personalityProfile?: {
    communication_style: string;
    stress_pattern: string;
    comfort_topics: string[];
    motivation_type: string;
    preferred_response_style: string;
  };
  createdAt: any;
}

export interface Planet {
  id?: string;
  userId: string;
  stage: PlanetStage;
  totalInputs: number;
  currentEmotion: string;
  emotionalBlend: string[];
  emotionalSummary: string;
  status: 'active' | 'archived';
  createdAt: any;
  updatedAt: any;
}

export interface JournalAnalysis {
  dominantEmotion: string;
  blend: string[];
  intensity: number;
  summary: string;
  sentimentScore: number;
}

export interface JournalEntry {
  id?: string;
  userId: string;
  planetId: string;
  text: string;
  analysis: JournalAnalysis;
  createdAt: any;
}

export enum PlanetWeather {
  SAD = 'rain',
  ANGRY = 'storms',
  CALM = 'aurora',
  HAPPY = 'sun-flares',
  ANXIOUS = 'flickering'
}
