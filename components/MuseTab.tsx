import React, { useState } from "react";
import { Song, SongSection } from "../types";
import { generateLyricsSuggestion } from "../services/geminiService";

interface MuseTabProps {
  song: Song;
  onAppendLyricsToSection: (sectionId: string, textToAppend: string) => void;
}

const MUSE_PROPMPTS = [
  { label: "Transition Bridge", prompt: "Suggest a bridge transition." },
  { label: "Chorus Hook", prompt: "Create a massive, unforgettable chorus hook." },
  { label: "Vivid Imagery verse", prompt: "Write dynamic lines filled with sensory imagery and metaphors." },
  { label: "Melancholic Outro", prompt: "Write a fading, emotional outro." },
  { label: "Introductory Hook", prompt: "Suggest an opening intro line that hooks the listener." }
];

export const MuseTab: React.FC<MuseTabProps> = ({ song, onAppendLyricsToSection }) => {
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState(MUSE_PROPMPTS[0].prompt);
  const [customInstruction, setCustomInstruction] = useState("");
  const [targetSectionId, setTargetSectionId] = useState(song.sections[0]?.id || "");
  const [showAppendSuccess, setShowAppendSuccess] = useState(false);

  const handleInspire = async () => {
    setLoading(true);
    setSuggestion("");
    setShowAppendSuccess(false);

    const activeInstruction = customInstruction.trim() || selectedInstruction;
    const fullLyrics = song.sections.map((s) => s.content).join("\n\n");
    const context = `Concept: ${song.concept || "untitled"}\nLyrics Context:\n${fullLyrics}`;

    try {
      const result = await generateLyricsSuggestion(song.strategy, context, activeInstruction);
      setSuggestion(result);
    } catch (e) {
      console.error(e);
      setSuggestion("The internal creative spark is resting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAppend = () => {
    if (!targetSectionId || !suggestion) return;
    onAppendLyricsToSection(targetSectionId, "\n" + suggestion);
    setShowAppendSuccess(true);
    setTimeout(() => {
      setShowAppendSuccess(false);
    }, 2500);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 pb-24">
        
        {/* Main interactive controller */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider">AI Muse</span>
          <h3 className="text-lg font-bold text-white mb-4">Prompt the Songwriting Muse</h3>

          {/* Current Strategy Info */}
          <div className="p-3.5 mb-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <span className="font-bold">Active Directive:</span> {song.strategy}
          </div>

          {/* Preset Prompts List */}
          <div className="space-y-2 mb-4">
            <label className="text-[10px] uppercase text-neutral-500 font-bold block">Quick Directives</label>
            <div className="grid grid-cols-2 gap-2">
              {MUSE_PROPMPTS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedInstruction(item.prompt);
                    setCustomInstruction("");
                  }}
                  className={`p-2.5 rounded-xl text-[11px] font-semibold text-left border transition-all ${
                    selectedInstruction === item.prompt && !customInstruction
                      ? "bg-slate-800 border-indigo-500 text-white"
                      : "bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Instruction Input */}
          <div className="space-y-2 mb-4">
            <label className="text-[10px] uppercase text-neutral-500 font-bold block">Custom Directive</label>
            <input
              type="text"
              value={customInstruction}
              onChange={(e) => setCustomInstruction(e.target.value)}
              placeholder="e.g. Write a rapid rap verse about regret..."
              className="w-full bg-slate-900 border border-white/5 rounded-xl px-3 py-2.5 text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-slate-200 placeholder-neutral-600"
            />
          </div>

          {/* Inspire CTA */}
          <button
            onClick={handleInspire}
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-xs font-bold text-white transition-all active:scale-95 shadow-lg shadow-indigo-600/15"
          >
            {loading ? "Channelling inspiration..." : "Generate Inspired Line"}
          </button>
        </div>

        {/* Suggestion Outputs */}
        {suggestion && (
          <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-500 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-[9px] uppercase font-mono text-emerald-400 tracking-wider">Inspired output</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(suggestion);
                }}
                className="text-[10px] text-neutral-400 hover:text-white font-semibold flex items-center gap-1"
              >
                Copy
              </button>
            </div>
            
            <p className="text-sm italic leading-relaxed text-slate-200 whitespace-pre-line bg-slate-900/60 p-4 rounded-xl border border-white/5">
              {suggestion}
            </p>

            {/* Insertion block */}
            <div className="space-y-3 pt-2">
              <label className="text-[10px] uppercase text-neutral-500 font-bold block">Send lines to section</label>
              
              <div className="flex gap-2">
                <select
                  value={targetSectionId}
                  onChange={(e) => setTargetSectionId(e.target.value)}
                  className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="" disabled>Select target section</option>
                  {song.sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.type}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAppend}
                  disabled={!targetSectionId}
                  className="px-4 py-2 bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/25 disabled:opacity-40 text-xs font-bold rounded-xl transition-all"
                >
                  Append lines
                </button>
              </div>

              {showAppendSuccess && (
                <p className="text-[11px] text-emerald-400 font-semibold animate-bounce mt-1">
                  Lyrics appended to section successfully!
                </p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
