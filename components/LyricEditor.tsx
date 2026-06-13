import React, { useState } from "react";
import { SongSection } from "../types";
import { analyzeRhymeScheme } from "../services/geminiService";

interface LyricEditorProps {
  sections: SongSection[];
  onUpdateSection: (id: string, content: string) => void;
  onUpdateSectionRhymes: (id: string, scheme: string[]) => void;
  onAddSection: (type: SongSection["type"]) => void;
  onRemoveSection: (id: string) => void;
}

export const LyricEditor: React.FC<LyricEditorProps> = ({
  sections,
  onUpdateSection,
  onUpdateSectionRhymes,
  onAddSection,
  onRemoveSection
}) => {
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());

  const handleRhymeCheck = async (section: SongSection) => {
    if (!section.content.trim()) return;
    
    setAnalyzingIds(prev => {
      const next = new Set(prev);
      next.add(section.id);
      return next;
    });

    try {
      const scheme = await analyzeRhymeScheme(section.content);
      onUpdateSectionRhymes(section.id, scheme);
    } catch (error) {
      console.error("Rhyme check failure:", error);
    } finally {
      setAnalyzingIds(prev => {
        const next = new Set(prev);
        next.delete(section.id);
        return next;
      });
    }
  };

  const getRhymeColor = (label: string) => {
    const colors: Record<string, string> = {
      'A': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      'B': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      'C': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'D': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'E': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'F': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    };
    return colors[label] || 'bg-slate-800 text-slate-400 border-slate-700';
  };

  return (
    <div className="space-y-6 w-full">
      {sections.map((section) => (
        <div 
          key={section.id} 
          className="group relative p-4 rounded-2xl bg-white/5 border border-white/5 shadow-inner transition-all duration-300 hover:border-white/10"
        >
          {/* Section Header Controls */}
          <div className="flex justify-between items-center mb-3.5">
            <div className="flex items-center gap-3">
              <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-md">
                {section.type}
              </span>
              
              <button
                onClick={() => handleRhymeCheck(section)}
                disabled={analyzingIds.has(section.id)}
                className={`text-[9px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors ${
                  analyzingIds.has(section.id) ? 'text-neutral-600' : 'text-neutral-400 hover:text-white'
                }`}
              >
                <svg className={`w-3 h-3 ${analyzingIds.has(section.id) ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {analyzingIds.has(section.id) ? 'Scanning...' : 'Check Rhymes'}
              </button>
            </div>
            
            <button
              onClick={() => onRemoveSection(section.id)}
              className="text-neutral-500 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-white/5"
              aria-label="Remove Section"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Editor & Gutter Grid */}
          <div className="flex gap-3">
            {/* Rhyme Scheme labels on Left side */}
            {section.rhymeScheme && section.rhymeScheme.length > 0 && (
              <div className="flex flex-col pt-1.5 space-y-[1.125rem] w-5 flex-shrink-0">
                {section.rhymeScheme.map((label, idx) => (
                  <div 
                    key={idx} 
                    className={`w-5 h-5 flex items-center justify-center rounded-md text-[9px] font-bold border transition-all animate-in fade-in zoom-in-75 ${getRhymeColor(label)}`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            )}

            <textarea
              value={section.content}
              onChange={(e) => onUpdateSection(section.id, e.target.value)}
              placeholder={`Write your ${section.type.toLowerCase()} lyrics lines...`}
              className="flex-1 bg-transparent border-none p-0 focus:ring-0 text-sm leading-relaxed text-slate-200 placeholder-neutral-600 resize-none min-h-[140px] outline-none"
              style={{ lineHeight: "1.5" }}
            />
          </div>
        </div>
      ))}

      {/* Floating Action Menu for adding sections in Android Style */}
      <div className="pt-4 pb-8 border-t border-white/5">
        <label className="text-[10px] uppercase font-bold text-neutral-500 text-center block mb-3.5">
          + Add Section
        </label>
        <div className="flex flex-wrap gap-2 justify-center">
          {(["Intro", "Verse", "Chorus", "Bridge", "Outro"] as const).map((type) => (
            <button
              key={type}
              onClick={() => onAddSection(type)}
              className="px-3.5 py-2 rounded-xl border border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
export default LyricEditor;
