export type ObjectCategory =
  | "animal"
  | "food"
  | "vehicle"
  | "household"
  | "sport"
  | "nature"
  | "other";

export interface WeightleObject {
  id: string;
  name: string;
  massKg: number;
  qualifier: string;
  sourceUrl: string;
  category: ObjectCategory;
  /** Wikimedia Commons file name or direct URL for dev */
  imageKey: string;
  attribution: string;
}

export interface WeightlePair {
  id: string;
  objectAId: string;
  objectBId: string;
}

export interface RoundGuess {
  roundIndex: number;
  pickedId: string;
  correct: boolean;
  heavierId: string;
  kgOff: number;
}

export type GameMode = "daily" | "unlimited";

export interface GameSession {
  mode: GameMode;
  date?: string;
  pairIds: string[];
  guesses: RoundGuess[];
  completed: boolean;
}

export interface DailyCompletion {
  date: string;
  score: number;
  totalKgOff: number;
  guesses: RoundGuess[];
  playedAt: string;
}

export interface WeightleStats {
  dailyStreak: number;
  lastDailyDate: string | null;
  dailyHistory: { date: string; score: number; totalKgOff: number }[];
  unlimitedGamesPlayed: number;
  bestDailyScore: number;
}
