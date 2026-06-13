import React, { useState, useEffect } from "react";
import { Song, MusicalIdentityResponse } from "../types";
import { suggestMusicalIdentity } from "../services/geminiService";

interface AcousticsTabProps {
  song: Song;
  onUpdateSong: (updates: Partial<Song>) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

// Convert common musical note names to frequency Hz
const NOTE_FREQS: Record<string, number> = {
  // Octave 2
  "C2": 65.41, "C#2": 69.30, "D2": 73.42, "D#2": 77.78, "E2": 82.41, "F2": 87.31, "F#2": 92.50, "G2": 98.00, "G#2": 103.83, "A2": 110.00, "A#2": 116.54, "B2": 123.47,
  // Octave 3
  "C3": 130.81, "C#3": 138.59, "D3": 146.83, "D#3": 155.56, "E3": 164.81, "F3": 174.61, "F#3": 185.00, "G3": 196.00, "G#3": 207.65, "A3": 220.00, "A#3": 233.08, "B3": 246.94,
  // Octave 4
  "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13, "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00, "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88,
  // Octave 5
  "C5": 523.25, "C#5": 554.37, "D5": 587.33, "D#5": 622.25, "E5": 659.25, "F5": 698.46, "F#5": 739.99, "G5": 783.99, "G#5": 830.61, "A5": 880.00, "A#5": 932.33, "B5": 987.77
};

export const AcousticsTab: React.FC<AcousticsTabProps> = ({
  song,
  onUpdateSong,
  soundEnabled,
  onToggleSound,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeChord, setActiveChord] = useState<string | null>(null);
  const [synthType, setSynthType] = useState<OscillatorType>("triangle");
  const [statusText, setStatusText] = useState<string>("");

  // Synthesize chord notes using Web Audio API
  const playChordSynth = (notes: string[]) => {
    if (!soundEnabled || notes.length === 0) return;

    try {
      // @ts-ignore - Handle prefixing if needed
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;

      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      
      // Setup master gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.15, now);
      masterGain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
      masterGain.connect(ctx.destination);

      notes.forEach((noteName) => {
        // Clean up formatting (e.g. removing spaces)
        const cleanNote = noteName.trim();
        const freq = NOTE_FREQS[cleanNote] || NOTE_FREQS[cleanNote + "3"] || 220; // fallback to 220Hz

        const osc = ctx.createOscillator();
        osc.type = synthType;
        osc.frequency.setValueAtTime(freq, now);

        // Add note subtle detune
        osc.detune.setValueAtTime(Math.random() * 8 - 4, now);

        osc.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.2);
      });

      // Close context when sound completes
      setTimeout(() => {
        ctx.close();
      }, 1500);
    } catch (e) {
      console.error("Synthesizer error:", e);
    }
  };

  const handleSuggestScore = async () => {
    setLoading(true);
    setStatusText("Analyzing lyric cadence & strategy...");
    
    // Stitch lyrics
    const fullLyrics = song.sections.map((s) => s.content).join("\n\n");
    const docContext = `Concept: ${song.concept || "untitled"}\nLyrics:\n${fullLyrics}`;

    try {
      const result: MusicalIdentityResponse = await suggestMusicalIdentity(song.strategy, docContext);
      onUpdateSong({
        keySignature: result.keySignature || "C Minor",
        bpm: result.bpm || "92",
        chordProgression: result.chordProgression && result.chordProgression.length > 0 ? result.chordProgression : ["Am", "F", "C", "G"],
        instruments: result.instruments && result.instruments.length > 0 ? result.instruments : ["Synthesizer", "Acoustic Piano", "Electric Synth Bass"],
        chordNotes: result.chordNotes || {
          "Am": ["A3", "C4", "E4"],
          "F": ["F3", "A3", "C4"],
          "C": ["C3", "E3", "G3"],
          "G": ["G3", "B3", "D4"]
        },
      });
      setStatusText("");
    } catch (error) {
      console.error(error);
      setStatusText("The muse experienced latency. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChordClick = (chordName: string) => {
    setActiveChord(chordName);
    const notes = song.chordNotes[chordName] || [];
    playChordSynth(notes);
    setTimeout(() => {
      setActiveChord(null);
    }, 300);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Scrollable container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 pb-24">
        {/* Card: Orchestrator Assistant */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider">Acoustic Engine</span>
              <h3 className="text-lg font-bold text-white">Score Architecture</h3>
            </div>
            <button
              onClick={handleSuggestScore}
              disabled={loading}
              className={`px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-indigo-600/10`}
            >
              <svg className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {loading ? "Composing..." : "Suggest Blueprint"}
            </button>
          </div>

          {statusText && (
            <p className="text-xs text-indigo-400/80 mb-3 animate-pulse">{statusText}</p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <span className="text-[9px] uppercase text-neutral-500 font-bold block mb-1">Key Scale</span>
              <span className="text-sm font-semibold text-white">{song.keySignature || "—"}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/50 border border-white/5">
              <span className="text-[9px] uppercase text-neutral-500 font-bold block mb-1">Tempo Beat</span>
              <span className="text-sm font-semibold text-white">{song.bpm ? `${song.bpm} BPM` : "—"}</span>
            </div>
          </div>
        </div>

        {/* Card: Chord Progression Selector & Synthesizer */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <div>
              <span className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider">Tactile Synth</span>
              <h3 className="text-base font-bold text-white">Harmonic Chord Progression</h3>
            </div>
            
            {/* Audio Toggle */}
            <button
              onClick={onToggleSound}
              className={`p-1.5 rounded-lg border transition-all ${
                soundEnabled 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-slate-800 border-slate-700 text-slate-500"
              }`}
              title={soundEnabled ? "Mute synth" : "Enable synth sound"}
            >
              {soundEnabled ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zm12.302-3.414l2.828-2.828m0 5.656l-2.828-2.828" />
                </svg>
              )}
            </button>
          </div>

          {song.chordProgression && song.chordProgression.length > 0 ? (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">Click a chord node below to hear its synthesized acoustic notes.</p>
              
              {/* Actual Chord Nodes */}
              <div className="grid grid-cols-4 gap-2">
                {song.chordProgression.map((chord, index) => {
                  const isActive = activeChord === chord;
                  return (
                    <button
                      key={index}
                      onClick={() => handleChordClick(chord)}
                      className={`h-16 flex flex-col items-center justify-center rounded-xl border font-bold transition-all active:scale-95 ${
                        isActive
                          ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-500/25 translate-y-0.5"
                          : "bg-slate-900/50 border-white/5 text-slate-300 hover:bg-slate-800/50 hover:border-white/15"
                      }`}
                    >
                      <span className="text-base font-bold">{chord}</span>
                      <span className="text-[8px] opacity-70 font-mono">
                        {song.chordNotes[chord] ? song.chordNotes[chord].join(" ") : ""}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Synthesizer Wave Settings */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 uppercase font-bold">Wavetable voice</span>
                <div className="flex bg-slate-900 rounded-lg p-0.5 border border-white/5">
                  {(["sine", "triangle", "sawtooth"] as OscillatorType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setSynthType(type)}
                      className={`px-2.5 py-1 text-[9px] uppercase font-bold rounded-md transition-all ${
                        synthType === type
                          ? "bg-slate-800 text-white border border-white/10"
                          : "text-neutral-500 hover:text-neutral-300"
                      }`}
                    >
                      {type === "triangle" ? "retro" : type === "sawtooth" ? "pulse" : "smooth"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
              <p className="text-xs text-neutral-500">Tap "Suggest Blueprint" to trigger harmonic chords.</p>
            </div>
          )}
        </div>

        {/* Card: Orchestral Soundscape */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="text-[10px] uppercase font-mono text-pink-400 tracking-wider">Acoustic Texture</span>
          <h3 className="text-base font-bold text-white mb-4">Tone Orchestration</h3>

          {song.instruments && song.instruments.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              {song.instruments.map((inst, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/40 border border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-200">{inst}</span>
                    <p className="text-[10px] text-neutral-500">Suggested timbre texture score layers</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-white/10 rounded-xl">
              <p className="text-xs text-neutral-500 font-medium">Orchestration modules will display here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
