import React, { useState } from "react";
import { Song, WritingStrategy, ThemeAesthetic, SongCheckpoint } from "../types";

interface VaultTabProps {
  songs: Song[];
  activeSongId: string;
  onSelectSong: (songId: string) => void;
  onAddNewSong: (title?: string) => void;
  onDeleteSong: (songId: string) => void;
  onUpdateSong: (updates: Partial<Song>) => void;
  onTriggerSaveToast: () => void;
}

const THEME_LABELS: Record<ThemeAesthetic, string> = {
  midnight: "Cosmic Midnight",
  neon: "Electric Neon",
  acoustic: "Warm Acoustic",
  brutalist: "Brutalist Steel",
  ethereal: "Ethereal Dream"
};

export const VaultTab: React.FC<VaultTabProps> = ({
  songs,
  activeSongId,
  onSelectSong,
  onAddNewSong,
  onDeleteSong,
  onUpdateSong,
  onTriggerSaveToast
}) => {
  const [newTitle, setNewTitle] = useState("");
  const activeSong = songs.find((s) => s.id === activeSongId);

  // Take a manual backup checkpoint
  const handleCreateCheckpoint = () => {
    if (!activeSong) return;
    
    const checkpoint: SongCheckpoint = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      title: activeSong.title,
      strategy: activeSong.strategy,
      concept: activeSong.concept,
      sections: JSON.parse(JSON.stringify(activeSong.sections)),
      keySignature: activeSong.keySignature,
      bpm: activeSong.bpm,
      chordProgression: [...activeSong.chordProgression],
      instruments: [...activeSong.instruments],
      chordNotes: JSON.parse(JSON.stringify(activeSong.chordNotes))
    };

    const checkpoints = activeSong.checkpoints || [];
    onUpdateSong({
      checkpoints: [checkpoint, ...checkpoints]
    });
    onTriggerSaveToast();
  };

  // Restore previous checkpoint
  const handleRestoreCheckpoint = (cp: SongCheckpoint) => {
    if (!confirm("Restore backup version? All current unsaved changes will be overridden.")) return;
    
    onUpdateSong({
      title: cp.title,
      strategy: cp.strategy,
      concept: cp.concept,
      sections: cp.sections,
      keySignature: cp.keySignature,
      bpm: cp.bpm,
      chordProgression: cp.chordProgression,
      instruments: cp.instruments,
      chordNotes: cp.chordNotes,
      lastModified: Date.now()
    });
  };

  // Export process history
  const handleExportJSON = () => {
    if (!activeSong) return;
    const blob = new Blob([JSON.stringify(activeSong, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeSong.title.replace(/\s+/g, "_")}_process_backup.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-5 pb-24">
        
        {/* Section: Create / Select Songs */}
        <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <span className="text-[10px] uppercase font-mono text-indigo-400 tracking-wider block mb-1">Project Library</span>
          <h3 className="text-base font-bold text-white mb-4">Workspace Tracks</h3>

          {/* Quick Create input */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Track name..."
              className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
            />
            <button
              onClick={() => {
                onAddNewSong(newTitle);
                setNewTitle("");
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex-shrink-0"
            >
              Add
            </button>
          </div>

          {/* Tracks list */}
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {songs.map((song) => {
              const isActive = song.id === activeSongId;
              return (
                <div
                  key={song.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isActive
                      ? "bg-indigo-500/10 border-indigo-500/40 text-white"
                      : "bg-slate-900/40 border-white/5 text-slate-400 hover:bg-slate-900/60"
                  }`}
                >
                  <button
                    onClick={() => onSelectSong(song.id)}
                    className="flex-1 text-left font-semibold text-xs truncate mr-2"
                  >
                    {song.title}
                  </button>

                  {songs.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`Delete project: "${song.title}"?`)) {
                          onDeleteSong(song.id);
                        }
                      }}
                      className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {activeSong && (
          <>
            {/* Theme / Aesthetic Config */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] uppercase font-mono text-emerald-400 tracking-wider block mb-1">Visual Identity</span>
              <h3 className="text-base font-bold text-white mb-3">Project Aesthetic Palette</h3>
              
              <div className="grid grid-cols-2 gap-2">
                {(["midnight", "neon", "acoustic", "brutalist", "ethereal"] as ThemeAesthetic[]).map((aesthetic) => {
                  const isCurrent = activeSong.themeAesthetic === aesthetic || (aesthetic === "midnight" && !activeSong.themeAesthetic);
                  return (
                    <button
                      key={aesthetic}
                      onClick={() => onUpdateSong({ themeAesthetic: aesthetic })}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs font-semibold ${
                        isCurrent
                          ? "bg-slate-800 border-indigo-500 text-white"
                          : "bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10"
                      }`}
                    >
                      {THEME_LABELS[aesthetic]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkpoints & manual back up system */}
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-[10px] uppercase font-mono text-purple-400 tracking-wider block mb-1">Backup Vault</span>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-white">Manual Checkpoints</h3>
                <button
                  onClick={handleCreateCheckpoint}
                  className="px-3 py-1.5 bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 rounded-xl text-[10px] font-bold transition-all"
                >
                  Create Backup
                </button>
              </div>

              {activeSong.checkpoints && activeSong.checkpoints.length > 0 ? (
                <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                  {activeSong.checkpoints.map((cp) => (
                    <div
                      key={cp.id}
                      className="flex items-center justify-between p-2.5 bg-slate-900/40 border border-white/5 rounded-xl text-xs"
                    >
                      <div>
                        <p className="font-semibold text-slate-300">{cp.title}</p>
                        <span className="text-[9px] text-neutral-500 font-mono">
                          {new Date(cp.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRestoreCheckpoint(cp)}
                        className="px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-slate-300 transition-all"
                      >
                        Restore
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-xl">
                  <p className="text-[10px] text-neutral-500">No process checkpoints archived yet.</p>
                </div>
              )}
            </div>

            {/* JSON file exports */}
            <div className="p-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-white">Download Project Process</h4>
                <p className="text-[10px] text-indigo-300">Save your lyrics and musical scores as JSON</p>
              </div>
              <button
                onClick={handleExportJSON}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all"
              >
                Export Process
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
