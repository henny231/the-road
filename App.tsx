import React, { useState, useEffect } from "react";
import { 
  Song, 
  SongSection, 
  WritingStrategy, 
  ThemeAesthetic, 
  AIAnalysis, 
  SongCheckpoint,
  MusicalIdentityResponse 
} from "./types";
import { LyricEditor } from "./components/LyricEditor";
import { AcousticsTab } from "./components/AcousticsTab";
import { EmotionTab } from "./components/EmotionTab";
import { MuseTab } from "./components/MuseTab";
import { VaultTab } from "./components/VaultTab";

// In Android OS Emulator, we have 5 visual themes
interface ThemeColors {
  bg: string;
  card: string;
  primary: string;
  primaryText: string;
  tint: string;
  borderColor: string;
  glowColor: string;
  textColor: string;
}

const THEME_PALETTES: Record<ThemeAesthetic, ThemeColors> = {
  midnight: {
    bg: "bg-radial-gradient from-slate-950 via-slate-950 to-neutral-950",
    card: "bg-slate-900/40 border-slate-800/60",
    primary: "bg-indigo-600 hover:bg-indigo-500",
    primaryText: "text-indigo-400",
    tint: "bg-indigo-500/10 border-indigo-500/20",
    borderColor: "border-indigo-500/10",
    glowColor: "shadow-indigo-500/5",
    textColor: "text-slate-200"
  },
  neon: {
    bg: "bg-gradient-to-b from-black via-zinc-950 to-black",
    card: "bg-zinc-950/80 border-fuchsia-500/30",
    primary: "bg-fuchsia-600 hover:bg-fuchsia-500",
    primaryText: "text-fuchsia-400",
    tint: "bg-cyan-500/10 border-cyan-500/20",
    borderColor: "border-fuchsia-500/20",
    glowColor: "shadow-fuchsia-500/5",
    textColor: "text-neutral-200"
  },
  acoustic: {
    bg: "bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950",
    card: "bg-neutral-900/50 border-amber-500/20",
    primary: "bg-amber-600 hover:bg-amber-500",
    primaryText: "text-amber-500",
    tint: "bg-emerald-500/10 border-emerald-500/20",
    borderColor: "border-amber-500/10",
    glowColor: "shadow-amber-500/5",
    textColor: "text-stone-200"
  },
  brutalist: {
    bg: "bg-gradient-to-r from-zinc-900 to-stone-900",
    card: "bg-zinc-900 border-stone-750",
    primary: "bg-stone-700 hover:bg-stone-600",
    primaryText: "text-neutral-300",
    tint: "bg-orange-500/10 border-orange-500/20",
    borderColor: "border-stone-705",
    glowColor: "shadow-stone-700/5",
    textColor: "text-zinc-200"
  },
  ethereal: {
    bg: "bg-gradient-to-b from-slate-900 via-neutral-900 to-slate-900",
    card: "bg-slate-900/40 border-violet-500/30",
    primary: "bg-violet-600 hover:bg-violet-500",
    primaryText: "text-violet-300",
    tint: "bg-sky-500/10 border-sky-500/20",
    borderColor: "border-violet-500/20",
    glowColor: "shadow-violet-500/5",
    textColor: "text-slate-200"
  }
};

const SEED_TRACKS: Song[] = [
  {
    id: "galaxy-drive",
    title: "Vapor Trails",
    strategy: WritingStrategy.NARRATIVE,
    themeAesthetic: "neon",
    keySignature: "F# Minor",
    bpm: "112",
    chordProgression: ["F#m", "D", "A", "E"],
    instruments: ["Vapor synth wave pad", "Retro drum module", "Sub bass pluck"],
    chordNotes: {
      "F#m": ["F#3", "A3", "C#4"],
      "D": ["D3", "F#3", "A3"],
      "A": ["A3", "C#4", "E4"],
      "E": ["E3", "G#3", "B3"]
    },
    concept: "Chasing headlight beams down empty digital superhighways at 3 AM. Nostalgia for places we have never been.",
    sections: [
      { id: "v1", type: "Verse", content: "Sodium lamps reflect on carbon fiber shield\nNeon mirages bleeding through the asphalt field\nA quiet grid coordinates my fading trace\nSpeeding into silence through the chrome-lit space" },
      { id: "c1", type: "Chorus", content: "So carry me far past the vapor trails\nUnder a cold sky of neon sails\nWe are digital ghosts in a dying drive\nJust looking for a spark to feel alive" }
    ],
    lastModified: Date.now() - 100000,
    checkpoints: []
  },
  {
    id: "whisper-oak",
    title: "Rust and Timber",
    strategy: WritingStrategy.EMOTIONAL,
    themeAesthetic: "acoustic",
    keySignature: "G Major",
    bpm: "78",
    chordProgression: ["G", "Em", "C", "D"],
    instruments: ["Cedarwood acoustic guitar", "Cello choir", "Bonfire shaker"],
    chordNotes: {
      "G": ["G3", "B3", "D4"],
      "Em": ["E3", "G3", "B3"],
      "C": ["C3", "E3", "G3"],
      "D": ["D3", "F#3", "A3"]
    },
    concept: "Inward reflection. Watching winter tree limbs slowly sway while listening to logs crackle in a fireplace.",
    sections: [
      { id: "v1", type: "Verse", content: "Branches scribe a circle on the cabin glass\nWhispers of the pine trees tell us what will pass\nLog sparks rising high into the cedar flue\nFrost is creeping closer but my eyes see you" },
      { id: "c1", type: "Chorus", content: "Through the rust and timber we will hold the line\nCounting down the hours in the warm pine shine\nSwaying with the seasons as the wind grows cold\nThis is all the wealth we ever sought to hold" }
    ],
    lastModified: Date.now() - 50000,
    checkpoints: []
  }
];

const App: React.FC = () => {
  // 1. Core database states
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem("lyristrat_songs_db");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return SEED_TRACKS;
  });

  const [activeSongId, setActiveSongId] = useState<string>(() => {
    const savedId = localStorage.getItem("lyristrat_active_song_id");
    if (savedId) return savedId;
    return SEED_TRACKS[0].id;
  });

  // 2. Android Device UI States
  const [activeTab, setActiveTab] = useState<"write" | "acoustics" | "emotion" | "muse" | "vault">("write");
  const [quickSettingsOpen, setQuickSettingsOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticVibeEnabled, setHapticVibeEnabled] = useState(true);
  const [autosaveEnabled, setAutosaveEnabled] = useState(true);
  const [batteryLevel, setBatteryLevel] = useState(100);
  const [statusBarTime, setStatusBarTime] = useState("13:50");
  const [isCharging, setIsCharging] = useState(false);
  
  // UX triggers
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("System safeguarded successfully");
  const [notificationLog, setNotificationLog] = useState<Array<{ id: string; msg: string; time: string }>>([
    { id: "init", msg: "Strategic Lyricist OS booted successfully.", time: "13:50" }
  ]);

  // Synchronize database to LocalStorage
  useEffect(() => {
    localStorage.setItem("lyristrat_songs_db", JSON.stringify(songs));
  }, [songs]);

  useEffect(() => {
    localStorage.setItem("lyristrat_active_song_id", activeSongId);
  }, [activeSongId]);

  // Clock increment
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setStatusBarTime(`${hrs}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Battery slowly depletes block
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) => {
        if (prev <= 15) return 100; // recharge emu
        return prev - 1;
      });
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  // Retrieve active song
  const currentSong = songs.find((s) => s.id === activeSongId) || songs[0];

  // Helper trigger action vibration (visual indicator on emulator screen)
  const triggerHapticFeedback = () => {
    if (!hapticVibeEnabled) return;
    // Visually vibrate device container via custom class or quick flash
    const phone = document.getElementById("android-phone-case");
    if (phone) {
      phone.classList.add("translate-x-0.5", "scale-[1.002]");
      setTimeout(() => {
        phone.classList.remove("translate-x-0.5", "scale-[1.002]");
      }, 80);
    }
  };

  const notifyUser = (msg: string) => {
    const freshNotif = {
      id: Math.random().toString(),
      msg,
      time: statusBarTime
    };
    setNotificationLog(prev => [freshNotif, ...prev.slice(0, 4)]);
  };

  const handleTriggerSaveToast = (customMessage?: string) => {
    setToastMessage(customMessage || "Project saved successfully");
    setShowSavedToast(true);
    notifyUser(customMessage || "System Safeguard: lyric project backup secured.");
    triggerHapticFeedback();
    setTimeout(() => setShowSavedToast(false), 2200);
  };

  // State updates triggers
  const handleUpdateSong = (updates: Partial<Song>) => {
    setSongs((prevSongs) =>
      prevSongs.map((song) => {
        if (song.id === activeSongId) {
          return {
            ...song,
            ...updates,
            lastModified: Date.now()
          };
        }
        return song;
      })
    );

    if (autosaveEnabled && (updates.concept !== undefined || updates.sections !== undefined)) {
      // Debounce notice for autosave
      notifyUser(`Auto-save update triggered for ${currentSong.title}`);
    }
  };

  const handleUpdateSection = (id: string, content: string) => {
    const updatedSections = currentSong.sections.map((s) =>
      s.id === id ? { ...s, content } : s
    );
    handleUpdateSong({ sections: updatedSections });
  };

  const handleUpdateSectionRhymes = (id: string, scheme: string[]) => {
    const updatedSections = currentSong.sections.map((s) =>
      s.id === id ? { ...s, rhymeScheme: scheme } : s
    );
    handleUpdateSong({ sections: updatedSections });
  };

  const handleAddSection = (type: SongSection["type"]) => {
    const newSec: SongSection = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: ""
    };
    handleUpdateSong({ sections: [...currentSong.sections, newSec] });
    triggerHapticFeedback();
    notifyUser(`Added section panel: ${type}`);
  };

  const handleRemoveSection = (id: string) => {
    const filtered = currentSong.sections.filter((s) => s.id !== id);
    handleUpdateSong({ sections: filtered });
    triggerHapticFeedback();
  };

  const handleAppendLyricsToSection = (sectionId: string, textToAppend: string) => {
    const updatedSections = currentSong.sections.map((s) =>
      s.id === sectionId ? { ...s, content: s.content + textToAppend } : s
    );
    handleUpdateSong({ sections: updatedSections });
  };

  const handleAddNewSong = (title?: string) => {
    const freshId = "song-" + Math.random().toString(36).substr(2, 9);
    const names = ["Ethereal Wind", "Distant Echo", "Night Whispers", "Wildfire Spark", "Silicon Heart", "Golden Drift"];
    const fallbackTitle = names[Math.floor(Math.random() * names.length)];
    
    // Choose theme aesthetic randomly for fun variation
    const aesthetics: ThemeAesthetic[] = ["midnight", "neon", "acoustic", "brutalist", "ethereal"];
    const chosenAesthetic = aesthetics[songs.length % aesthetics.length];

    const freshSong: Song = {
      id: freshId,
      title: title?.trim() || fallbackTitle,
      strategy: WritingStrategy.NARRATIVE,
      themeAesthetic: chosenAesthetic,
      keySignature: "C Minor",
      bpm: "90",
      chordProgression: ["Cm", "Fm", "G7", "Cm"],
      instruments: ["Acoustic Grand", "String Quarter Ensemble", "Chamber Shaker"],
      chordNotes: {
        "Cm": ["C3", "D#3", "G3"],
        "Fm": ["F3", "G#3", "C4"],
        "G7": ["G3", "B3", "D4", "F4"]
      },
      concept: "Sketch your core concepts and storytelling angles here.",
      sections: [
        { id: "s1", type: "Verse", content: "Type the starting verses of your new project." },
        { id: "s2", type: "Chorus", content: "Design your hook line here." }
      ],
      lastModified: Date.now(),
      checkpoints: []
    };

    setSongs((prev) => [freshSong, ...prev]);
    setActiveSongId(freshId);
    setActiveTab("write");
    handleTriggerSaveToast(`Created lyric project: ${freshSong.title}`);
  };

  const handleDeleteSong = (songId: string) => {
    const remaining = songs.filter((s) => s.id !== songId);
    if (remaining.length > 0) {
      setSongs(remaining);
      setActiveSongId(remaining[0].id);
      notifyUser("Removed track from workspace library.");
    }
  };

  // Dynamic colors resolution based on current project theme settings
  const themeAesthetic = currentSong.themeAesthetic || "midnight";
  const colors = THEME_PALETTES[themeAesthetic];

  return (
    <div className="w-screen h-screen flex flex-col md:flex-row items-center justify-center p-0 md:p-6 bg-slate-900 overflow-hidden font-sans select-none selection:bg-indigo-500/30 selection:text-white">
      
      {/* Decorative desktop details - Hide on actual mobile */}
      <div className="hidden md:flex flex-col max-w-sm mr-8 text-slate-400 p-6 space-y-4">
        <div className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
          <span className="text-[10px] uppercase tracking-widest font-bold">Android Lyricist OS</span>
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight">LyriStrat Studio</h2>
        <p className="text-xs leading-relaxed text-slate-400">
          A premium full-screen songwriting environment combining strategic metrics with a tactile Android-themed console layout.
        </p>
        <div className="pt-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="p-1 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">FULL SCREEN</span>
            <span>Optimized edge-to-edge frame</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="p-1 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">SYNTH PIANO</span>
            <span>Synthesize suggested key chords</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="p-1 rounded bg-slate-800 text-slate-300 font-mono text-[9px]">SECURE COMMITS</span>
            <span>Express-Vite proxied server</span>
          </div>
        </div>
        
        {/* Active song detail card on desktop side */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 max-w-[280px]">
          <span className="text-[9px] uppercase font-bold text-slate-500 block">Workspace focus</span>
          <h4 className="text-sm font-bold text-slate-100 truncate">{currentSong.title}</h4>
          <span className="text-[10px] text-zinc-500 block">Theme: {themeAesthetic.toUpperCase()}</span>
        </div>
      </div>

      {/* Main Physical Android Casing Emulator */}
      <div 
        id="android-phone-case"
        className="relative w-full h-full md:w-[380px] md:h-[780px] md:max-h-[95vh] md:rounded-[42px] bg-slate-950 md:border-[10px] md:border-neutral-800 md:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden transition-all duration-300"
      >
        
        {/* Physical Camera Notch Punch-hole */}
        <div className="hidden md:block absolute top-3.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-950 z-[110] border border-neutral-800/40 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/80"></div>
        </div>

        {/* Saved Toast Overlay */}
        {showSavedToast && (
          <div className="absolute top-28 left-1/2 -translate-x-1/2 z-[100] bg-neutral-900/90 border border-indigo-500/30 text-indigo-200 px-5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md text-xs font-bold text-center w-[80%] animate-in fade-in slide-in-from-top-4 duration-300">
            {toastMessage}
          </div>
        )}

        {/* Android Native-Style Status Bar (Tap to toggle Quick Settings) */}
        <div 
          onClick={() => setQuickSettingsOpen(!quickSettingsOpen)}
          className="h-10 w-full pt-safe flex items-center justify-between px-5 select-none hover:bg-white/5 cursor-pointer z-[100] bg-slate-950/90 border-b border-white/[0.02]"
        >
          {/* Left stats: real time clock + status tags */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-300 font-mono tracking-tighter">
              {statusBarTime}
            </span>
            <div className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
              {/* Little custom notification indicators */}
              <div className="text-[9px] text-neutral-500 scale-90">LTE</div>
            </div>
          </div>

          {/* Right stats: Wi-Fi + Cell + Battery */}
          <div className="flex items-center gap-2">
            {/* Cell signal standard lines */}
            <svg className="w-3.5 h-3.5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 22h20V2L2 22z" />
            </svg>
            
            {/* Static Wi-Fi icon */}
            <svg className="w-3.5 h-3.5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.111 16.111a3 3 0 014.242 0M5.283 13.283a7 7 0 0110.142 0M1.5 9.5a12 12 0 0117 0m-8.5 10a.5.5 0 11-1 0 .5.5 0 011 0z" />
            </svg>

            {/* Dynamic charging or power battery */}
            <div className="flex items-center gap-1 font-mono text-[10px] font-semibold text-slate-300">
              <span>{batteryLevel}%</span>
              <div className="w-5.5 h-3 border border-slate-500 rounded p-[1px] flex items-center">
                <div 
                  className={`h-full rounded-sm ${batteryLevel < 20 ? "bg-red-500" : "bg-emerald-500"}`}
                  style={{ width: `${batteryLevel}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Settings Panel pull-down (Android style) */}
        {quickSettingsOpen && (
          <div className="absolute top-10 inset-x-0 h-[340px] bg-slate-950/98 backdrop-blur-2xl border-b border-white/10 p-5 z-[99] flex flex-col justify-between animate-in slide-in-from-top-6 duration-300 shadow-2xl">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs text-neutral-400 font-bold border-b border-white/5 pb-2">
                <span>SYSTEM QUICK CONFIGURATION</span>
                <span className="font-mono text-neutral-500">SYSTEM: ONLINE</span>
              </div>

              {/* Grid of utility toggles */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {/* 1. Synthesis Sound toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all outline-none ${
                    soundEnabled 
                      ? "bg-indigo-600 text-white" 
                      : "bg-slate-900 border border-white/5 text-neutral-500"
                  }`}
                >
                  <span className="text-[10px] font-bold">SYNTH PORT</span>
                  <span className="text-[9px] uppercase font-semibold">{soundEnabled ? "On" : "Mute"}</span>
                </button>

                {/* 2. Autosave toggle */}
                <button
                  onClick={() => setAutosaveEnabled(!autosaveEnabled)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all outline-none ${
                    autosaveEnabled 
                      ? "bg-emerald-600 text-white" 
                      : "bg-slate-900 border border-white/5 text-neutral-500"
                  }`}
                >
                  <span className="text-[10px] font-bold">AUTOSAVE</span>
                  <span className="text-[9px] uppercase font-semibold">{autosaveEnabled ? "On" : "Off"}</span>
                </button>

                {/* 3. Simulated Haptic toggle */}
                <button
                  onClick={() => setHapticVibeEnabled(!hapticVibeEnabled)}
                  className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-all outline-none ${
                    hapticVibeEnabled 
                      ? "bg-pink-600 text-white" 
                      : "bg-slate-900 border border-white/5 text-neutral-500"
                  }`}
                >
                  <span className="text-[10px] font-bold">HAPTIC</span>
                  <span className="text-[9px] uppercase font-semibold">{hapticVibeEnabled ? "Trigger" : "Mute"}</span>
                </button>
              </div>

              {/* Active notifications box inside drawer */}
              <div className="pt-2">
                <span className="text-[10px] text-neutral-500 uppercase font-bold block mb-2">Android notifications</span>
                <div className="bg-slate-900/60 rounded-xl p-3 border border-white/5 max-h-[100px] overflow-y-auto space-y-2">
                  {notificationLog.map((item) => (
                    <div key={item.id} className="text-[10px] text-slate-300 flex justify-between">
                      <span className="truncate max-w-[80%]">{item.msg}</span>
                      <span className="text-neutral-500 font-mono">{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => setQuickSettingsOpen(false)}
              className="py-1.5 flex items-center justify-center border-t border-white/5 text-neutral-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Current song info bar below system header */}
        <div className={`h-13 ${colors.textColor} border-b border-white/[0.04] px-5 flex items-center justify-between bg-slate-950/80`}>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-neutral-500 font-mono tracking-wider truncate block uppercase">Project file focusing</span>
            <h1 className="text-sm font-bold text-white truncate max-w-[90%]">{currentSong.title}</h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick backup button */}
            <button
              onClick={() => handleTriggerSaveToast("System checkpoint added successfully")}
              className="p-1 px-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-[9px] uppercase tracking-wide font-bold"
            >
              Backup
            </button>
          </div>
        </div>

        {/* Primary Screen Area (The dynamic screen rendered based on active bottom-tab) */}
        <div className={`flex-1 overflow-hidden transition-all duration-500 ${colors.bg}`}>
          
          {/* 1. WRITE Tab: Lyrical brain & writing board */}
          {activeTab === "write" && (
            <div className="flex flex-col h-full overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5 pb-24">
                
                {/* Lyric Brainstorm Spark Concept */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[9px] uppercase font-mono text-indigo-400 tracking-wider block mb-1">Conceptual Sparks</span>
                  <textarea
                    value={currentSong.concept}
                    onChange={(e) => handleUpdateSong({ concept: e.target.value })}
                    placeholder="Brief song vibe sparks details..."
                    className="w-full bg-transparent border-none p-0 text-sm italic leading-relaxed text-slate-300 placeholder-neutral-700 focus:ring-0 focus:outline-none resize-none min-h-[50px]"
                  />
                </div>

                {/* Lyric strategic direction selection */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                  <span className="text-[9px] uppercase font-mono text-indigo-400 tracking-wider block">Lyricist strategy directive</span>
                  <select
                    value={currentSong.strategy}
                    onChange={(e) => handleUpdateSong({ strategy: e.target.value as WritingStrategy })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                  >
                    {Object.values(WritingStrategy).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {/* Sub-component: Lyric lists with rhyme schemes */}
                <LyricEditor
                  sections={currentSong.sections}
                  onUpdateSection={handleUpdateSection}
                  onUpdateSectionRhymes={handleUpdateSectionRhymes}
                  onAddSection={handleAddSection}
                  onRemoveSection={handleRemoveSection}
                />

              </div>
            </div>
          )}

          {/* 2. ACOUSTICS Tab: Suggested key/tempo Chords & Synth */}
          {activeTab === "acoustics" && (
            <AcousticsTab
              song={currentSong}
              onUpdateSong={handleUpdateSong}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
            />
          )}

          {/* 3. EMOTION Tab: Sentiment, Tones, and thematic gauges */}
          {activeTab === "emotion" && (
            <EmotionTab
              song={currentSong}
              onUpdateSong={handleUpdateSong}
            />
          )}

          {/* 4. MUSE Tab: Prompt generation & quick appending */}
          {activeTab === "muse" && (
            <MuseTab
              song={currentSong}
              onAppendLyricsToSection={handleAppendLyricsToSection}
            />
          )}

          {/* 5. VAULT Tab: Library, manual backup archives, global themes */}
          {activeTab === "vault" && (
            <VaultTab
              songs={songs}
              activeSongId={activeSongId}
              onSelectSong={(id) => {
                setActiveSongId(id);
                notifyUser(`Focussed on project: ${songs.find(s => s.id === id)?.title}`);
              }}
              onAddNewSong={handleAddNewSong}
              onDeleteSong={handleDeleteSong}
              onUpdateSong={handleUpdateSong}
              onTriggerSaveToast={handleTriggerSaveToast}
            />
          )}

        </div>

        {/* Android Styled Bottom Navigation Bar */}
        <div className="h-16 w-full bg-slate-950/90 border-t border-white/[0.04] pb-safe z-50 flex-shrink-0 flex items-center justify-around px-2">
          
          {/* Tab 1: Editor */}
          <button
            onClick={() => {
              setActiveTab("write");
              triggerHapticFeedback();
            }}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all outline-none ${
              activeTab === "write" ? "text-indigo-400 font-bold" : "text-neutral-500 hover:text-slate-400"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-[9px] uppercase tracking-wider scale-90">Writer</span>
          </button>

          {/* Tab 2: Studio Acoustics */}
          <button
            onClick={() => {
              setActiveTab("acoustics");
              triggerHapticFeedback();
            }}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all outline-none ${
              activeTab === "acoustics" ? "text-indigo-400 font-bold" : "text-neutral-500 hover:text-slate-400"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
            </svg>
            <span className="text-[9px] uppercase tracking-wider scale-90">STUDIO</span>
          </button>

          {/* Tab 3: Emotion analytics */}
          <button
            onClick={() => {
              setActiveTab("emotion");
              triggerHapticFeedback();
            }}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all outline-none ${
              activeTab === "emotion" ? "text-indigo-400 font-bold" : "text-neutral-500 hover:text-slate-400"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-[9px] uppercase tracking-wider scale-90">ANALYZE</span>
          </button>

          {/* Tab 4: Muse generative helper */}
          <button
            onClick={() => {
              setActiveTab("muse");
              triggerHapticFeedback();
            }}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all outline-none ${
              activeTab === "muse" ? "text-indigo-400 font-bold" : "text-neutral-500 hover:text-slate-400"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span className="text-[9px] uppercase tracking-wider scale-90">MUSE</span>
          </button>

          {/* Tab 5: Local libraries & theme options */}
          <button
            onClick={() => {
              setActiveTab("vault");
              triggerHapticFeedback();
            }}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all outline-none ${
              activeTab === "vault" ? "text-indigo-400 font-bold" : "text-neutral-500 hover:text-slate-400"
            }`}
          >
            <svg className="w-5 h-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span className="text-[9px] uppercase tracking-wider scale-90">LIBRARY</span>
          </button>

        </div>

        {/* Android Native Navigation Gesture Pill bar */}
        <div className="h-5 w-full bg-slate-950 pb-1.5 flex items-center justify-center flex-shrink-0 select-none">
          <div className="w-[110px] h-1.5 rounded-full bg-slate-700/80 transition-all hover:bg-slate-500"></div>
        </div>

      </div>
    </div>
  );
};

export default App;
