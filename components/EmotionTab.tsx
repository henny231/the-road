import React, { useState } from "react";
import { Song, AIAnalysis } from "../types";
import { analyzeLyrics } from "../services/geminiService";

interface EmotionTabProps {
  song: Song;
  onUpdateSong: (updates: Partial<Song>) => void;
}

export const EmotionTab: React.FC<EmotionTabProps> = ({ song, onUpdateSong }) => {
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState("");

  const handleAnalyticVibe = async () => {
    // Collect all lyrics
    const fullLyrics = song.sections.map((s) => s.content).join("\n\n");
    if (!fullLyrics.trim()) {
      setErrorText("Write some lyrics first to analyze the emotional spectrum.");
      return;
    }

    setErrorText("");
    setLoading(true);

    try {
      const analysis: AIAnalysis = await analyzeLyrics(fullLyrics);
      onUpdateSong({ analysis });
    } catch (e: any) {
      console.error(e);
      setErrorText("Analysis failed to complete. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const analysis = song.analysis;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 pb-24">
        
        {/* Run Analysis Trigger Area */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex justify-between items-center mb-3">
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider">Semantic Analysis</span>
              <h3 className="text-lg font-bold text-white">Atmospheric Analysis</h3>
            </div>
            <button
              onClick={handleAnalyticVibe}
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-emerald-600/10"
            >
              <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {loading ? "Sensing Vibe..." : "Scan Vibe"}
            </button>
          </div>

          {errorText && (
            <p className="text-xs text-rose-400 mb-3 font-medium">{errorText}</p>
          )}

          {!analysis && !loading && (
            <p className="text-xs text-neutral-400">
              Trigger semantic scanning to map narrative sentiment, tone colors, themes, vocabulary density, and imagistic depth of your written lines.
            </p>
          )}

          {loading && (
            <div className="space-y-2.5 py-4 animate-pulse">
              <div className="h-3 bg-white/10 rounded w-2/3"></div>
              <div className="h-3 bg-white/10 rounded w-1/2"></div>
              <div className="h-3 bg-white/10 rounded w-3/4"></div>
            </div>
          )}
        </div>

        {/* Dynamic Scan Results */}
        {analysis && !loading && (
          <div className="space-y-5 animate-in fade-in duration-500">
            
            {/* Primary Sentiment Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 border border-emerald-500/15">
              <span className="text-[9px] uppercase font-bold text-emerald-400 tracking-wider">Lyrical core sentiment</span>
              <h4 className="text-xl font-bold text-white mt-1">{analysis.sentiment || "Neutral Expression"}</h4>
            </div>

            {/* Narrative Tone Badges */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[9px] uppercase font-mono text-indigo-400 tracking-wider block mb-3">Tone Palette</span>
              {analysis.tones && analysis.tones.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.tones.map((tone, idx) => (
                    <span 
                      key={idx} 
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                    >
                      {tone}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-neutral-500">No core tones registered.</span>
              )}
            </div>

            {/* Circular Gauge Meters (Imagery & Vocab) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Imagery Intensity */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col items-center text-center">
                <span className="text-[9px] uppercase text-neutral-500 font-bold mb-3 block">Imagery Depth</span>
                
                {/* SVG Ring Meter */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="26" 
                      stroke="url(#emeraldGradient)" 
                      strokeWidth="4" 
                      fill="none" 
                      strokeDasharray={163}
                      strokeDashoffset={163 - (163 * (analysis.imageryScore || 50)) / 100}
                    />
                    <defs>
                      <linearGradient id="emeraldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#34d399" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-xs font-bold text-white font-mono">{analysis.imageryScore}%</span>
                </div>
                
                <span className="text-[10px] text-neutral-400 font-medium mt-3">Sensory Imagery</span>
              </div>

              {/* Vocab Complexity */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex flex-col items-center text-center">
                <span className="text-[9px] uppercase text-neutral-500 font-bold mb-3 block">Vocab Density</span>
                
                {/* SVG Ring Meter */}
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <svg className="w-full h-full rotate-[-90deg]">
                    <circle cx="32" cy="32" r="26" stroke="rgba(255,255,255,0.05)" strokeWidth="4" fill="none" />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r="26" 
                      stroke="url(#indigoGradient)" 
                      strokeWidth="4" 
                      fill="none" 
                      strokeDasharray={163}
                      strokeDashoffset={163 - (163 * (analysis.vocabularyComplexity || 50)) / 100}
                    />
                    <defs>
                      <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#818cf8" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className="absolute text-xs font-bold text-white font-mono">{analysis.vocabularyComplexity}%</span>
                </div>
                
                <span className="text-[10px] text-neutral-400 font-medium mt-3">Word Variety Range</span>
              </div>
            </div>

            {/* Top Themes Registry */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[9px] uppercase font-mono text-teal-400 tracking-wider block mb-3">Key Motifs & Themes</span>
              {analysis.keyThemes && analysis.keyThemes.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.keyThemes.map((theme, i) => (
                    <span 
                      key={i} 
                      className="px-2.5 py-1 text-xs italic bg-slate-800/80 border border-white/5 text-slate-300 rounded-lg"
                    >
                      #{theme.replace(/\s+/g, "").toLowerCase()}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs text-neutral-500">No narrative themes mapped.</span>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
