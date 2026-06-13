
export enum WritingStrategy {
  NARRATIVE = 'Narrative Storytelling',
  EMOTIONAL = 'Emotional Expression',
  ABSTRACT = 'Abstract & Metaphorical',
  ANTHEMIC = 'Anthemic & Powerful',
  MINIMALIST = 'Minimalist & Direct'
}

export type ThemeAesthetic = "midnight" | "neon" | "acoustic" | "brutalist" | "ethereal";

export interface SongSection {
  id: string;
  type: 'Verse' | 'Chorus' | 'Bridge' | 'Intro' | 'Outro';
  content: string;
  rhymeScheme?: string[];
}

export interface AIRhymeSuggestion {
  word: string;
  type: 'Perfect' | 'Slant' | 'Internal';
  meaning?: string;
}

export interface AIAnalysis {
  sentiment: string;
  tones: string[];
  vocabularyComplexity: number;
  imageryScore: number;
  keyThemes: string[];
}

export interface MusicalIdentityResponse {
  keySignature: string;
  bpm: string;
  chordProgression: string[];
  instruments: string[];
  chordNotes: Record<string, string[]>;
  reasoning: string;
}

export interface SongCheckpoint {
  id: string;
  timestamp: number;
  title: string;
  strategy: WritingStrategy;
  concept: string;
  sections: SongSection[];
  keySignature: string;
  bpm: string;
  chordProgression: string[];
  instruments: string[];
  chordNotes: Record<string, string[]>;
}

export interface Song {
  id: string;
  title: string;
  strategy: WritingStrategy;
  themeAesthetic?: ThemeAesthetic;
  keySignature: string;
  bpm: string;
  chordProgression: string[];
  instruments: string[];
  chordNotes: Record<string, string[]>;
  concept: string;
  sections: SongSection[];
  analysis?: AIAnalysis;
  lastModified: number;
  checkpoints?: SongCheckpoint[];
}

