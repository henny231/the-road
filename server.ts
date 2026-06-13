import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Ensure we have a valid API Key. If not, the server will log a warning, 
// and the requests will report a clean warning to the client.
const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({
  apiKey: apiKey || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // Middleware to verify API key
  const requireApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Missing GEMINI_API_KEY environment variable. Please configure it in your Settings > Secrets.",
      });
    }
    next();
  };

  // 1. Generate Lyrics
  app.post("/api/generate-lyrics", requireApiKey, async (req, res) => {
    try {
      const { strategy, context, instruction } = req.body;
      const model = "gemini-3.5-flash";
      const prompt = `
        You are an elite songwriting assistant focused on the "${strategy}" strategy.
        Context: ${context || "Untitled project"}
        Instruction: ${instruction || "Suggest new inspiring lines"}
        
        Generate 2-4 lines of professional-grade lyrics. 
        Do not output any introductory notes, bracketed section labels (representing Chorus/Verse/Bridge), quotation marks, emojis, or explanations. 
        Only produce the raw lyrical lines.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });

      res.json({ text: response.text || "No lyrics were generated." });
    } catch (error: any) {
      console.error("Generate lyrics error:", error);
      res.status(500).json({ error: error.message || "Failed to generate lyrics." });
    }
  });

  // 2. Find Rhymes
  app.post("/api/find-rhymes", requireApiKey, async (req, res) => {
    try {
      const { word, themeContext } = req.body;
      const model = "gemini-3.5-flash";
      const prompt = `
        You are a rhyming dictionary specialist. 
        Find exactly 5 creative, expressive, and structurally pleasant rhymes for "${word}" within the artistic context of: "${themeContext || ""}".
        Provide a variety of perfect, slant, and internal rhymes. 
        Return a JSON array of objects representing these rhymes.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "A list of rhyming words along with their rhyme type and meaning/aesthetic fit.",
            items: {
              type: Type.OBJECT,
              properties: {
                word: { type: Type.STRING, description: "The rhyming word itself." },
                type: { 
                  type: Type.STRING, 
                  enum: ["Perfect", "Slant", "Internal"], 
                  description: "The type of rhyme relationship." 
                },
                meaning: { 
                  type: Type.STRING, 
                  description: "A very brief 3-5 word note on the imagery or aesthetic utility of this word." 
                }
              },
              required: ["word", "type", "meaning"]
            }
          }
        }
      });

      const text = response.text?.trim() || "[]";
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Find rhymes error:", error);
      res.status(500).json({ error: error.message || "Failed to locate creative rhymes." });
    }
  });

  // 3. Suggest Musical Identity
  app.post("/api/suggest-music", requireApiKey, async (req, res) => {
    try {
      const { strategy, context } = req.body;
      const model = "gemini-3.5-flash";
      const prompt = `
        Analyze this song's theme, storytelling strategy, and lyrical context:
        Strategy: ${strategy}
        Context: ${context ? context.slice(0, 1500) : "No context provided yet"}

        Suggest a full-fidelity musical identity blueprint including:
        1. A musical scale/Key Signature (e.g. C minor, G# major, F Dorian).
        2. A Tempo in BPM (between 60 and 150 BPM).
        3. A 4-chord progression of beautiful harmony that matches this vibe (e.g. ["Am", "F", "C", "G"]).
        4. Exactly 3 distinct modern instruments that form the orchestration.
        5. Specific notes for each chord in the progression so they can be synthesized on a keyboard (e.g., chord "Am" maps to notes ["A3", "C4", "E4"]). Give precisely 3 or 4 notes per chord.
        6. A clean, jargon-free artistic reasoning.

        Return a single JSON object.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              keySignature: { type: Type.STRING, description: "The suggested key signature." },
              bpm: { type: Type.STRING, description: "Tempo beats per minute as a string." },
              chordProgression: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Array of exactly 4 chord abbreviations." 
              },
              instruments: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Array of exactly 3 instrument names." 
              },
              chordNotes: { 
                type: Type.OBJECT,
                description: "Object mapping each chord abbreviation inside the progress to its constituent musical note strings (e.g. {'Am': ['A3', 'C4', 'E4']})"
              },
              reasoning: { type: Type.STRING, description: "Professional musical analysis on how the architecture supports the theme." }
            },
            required: ["keySignature", "bpm", "chordProgression", "instruments", "chordNotes", "reasoning"]
          }
        }
      });

      const text = response.text?.trim() || "{}";
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Suggest musical identity error:", error);
      res.status(500).json({ error: error.message || "Failed to construct musical score." });
    }
  });

  // 4. Analyze Lyrics Sentiment & Themes
  app.post("/api/analyze-lyrics", requireApiKey, async (req, res) => {
    try {
      const { lyrics } = req.body;
      const model = "gemini-3.5-flash";
      const prompt = `
        Analyze the overall artistry, sentiment, tones, and complexity of these lyrics:
        "${lyrics || ""}"

        Return an emotional and structural analysis including:
        1. A primary emotional sentiment statement (e.g., "Hauntingly Melancholic", "Fiercely Empowered").
        2. Up to 3 distinct narrative or character tones (e.g. ["Reflective", "Gritty", "Vulnerable"]).
        3. A numeric vocabulary complexity complexity score between 10 and 100 representing word density.
        4. A numeric imagery/storytelling intensity score between 10 and 100.
        5. Up to 4 key terms, motifs, or themes.

        Return a single JSON object.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentiment: { type: Type.STRING },
              tones: { type: Type.ARRAY, items: { type: Type.STRING } },
              vocabularyComplexity: { type: Type.NUMBER },
              imageryScore: { type: Type.NUMBER },
              keyThemes: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["sentiment", "tones", "vocabularyComplexity", "imageryScore", "keyThemes"]
          }
        }
      });

      const text = response.text?.trim() || "{}";
      res.json(JSON.parse(text));
    } catch (error: any) {
      console.error("Analyze lyrics error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze emotional landscape." });
    }
  });

  // 5. Analyze Rhyme Scheme
  app.post("/api/analyze-rhyme-scheme", requireApiKey, async (req, res) => {
    try {
      const { text } = req.body;
      const model = "gemini-3.5-flash";
      const prompt = `
        Analyze the line-by-line rhyme scheme of the following verse lyrics:
        "${text || ""}"

        Determine which lines rhyme with each other, mapping them to structural letters (A, B, C, D, etc.). 
        Each line should have exactly one corresponding scheme letter in sequence.
        For example, a standard AABB or ABAB format.
        Return ONLY a JSON array of letters, e.g. ["A", "B", "A", "B"]. 
        Keep the array size exactly equal to the number of non-empty lines in the input.
      `;

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of letters representing line rhyme groupings, e.g., ['A', 'B', 'A', 'B']."
          }
        }
      });

      const parsedText = response.text?.trim() || "[]";
      res.json(JSON.parse(parsedText));
    } catch (error: any) {
      console.error("Analyze rhyme scheme error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze rhyme structure." });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server executing at http://localhost:${PORT}`);
  });
}

startServer();
