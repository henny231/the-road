import { WritingStrategy, AIRhymeSuggestion, AIAnalysis, MusicalIdentityResponse } from "../types";

export const generateLyricsSuggestion = async (
  strategy: WritingStrategy,
  context: string,
  instruction: string
): Promise<string> => {
  try {
    const response = await fetch("/api/generate-lyrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategy, context, instruction }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to generate lyrics.");
    }
    const data = await response.json();
    return data.text;
  } catch (error: any) {
    console.error("Lyrics suggestion error:", error);
    return `Error: ${error.message || "Failed to reach the songwriting server."}`;
  }
};

export const findRhymes = async (word: string, themeContext: string): Promise<AIRhymeSuggestion[]> => {
  try {
    const response = await fetch("/api/find-rhymes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ word, themeContext }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to find rhymes.");
    }
    return await response.json();
  } catch (error) {
    console.error("Rhyme search error:", error);
    return [];
  }
};

export const suggestMusicalIdentity = async (
  strategy: string,
  context: string
): Promise<MusicalIdentityResponse> => {
  try {
    const response = await fetch("/api/suggest-music", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ strategy, context }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to suggest score.");
    }
    return await response.json();
  } catch (error) {
    console.error("Score suggestion error:", error);
    return { keySignature: "", bpm: "", chordProgression: [], instruments: [], chordNotes: {}, reasoning: "Failed to construct musical scores." };
  }
};

export const analyzeLyrics = async (lyrics: string): Promise<AIAnalysis> => {
  try {
    const response = await fetch("/api/analyze-lyrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lyrics }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to analyze lyrics.");
    }
    return await response.json();
  } catch (error) {
    console.error("Lyric analysis error:", error);
    throw error;
  }
};

export const analyzeRhymeScheme = async (text: string): Promise<string[]> => {
  try {
    const response = await fetch("/api/analyze-rhyme-scheme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to analyze rhyme scheme.");
    }
    return await response.json();
  } catch (error) {
    console.error("Rhyme scheme analysis error:", error);
    return [];
  }
};
