// Core Types
export interface Mood {
  id: string;
  name: string;
  description: string;
  color: string;
  gradientColors: [string, string];
  icon: string;
  sounds: string[];
}

export interface Sound {
  id: string;
  name: string;
  description: string;
  fileName: string;
  duration: number;
  category: SoundCategory;
  tags: string[];
  isLooped: boolean;
  isPremium: boolean;
  isFavorite?: boolean;
}

export type SoundCategory =
  | "nature"
  | "urban"
  | "white-noise"
  | "instrumental"
  | "binaural";

// Enhanced types for sound mixing
export interface ActiveSound {
  id: string;
  sound: any; // Audio.Sound instance
  volume: number;
  soundData: Sound;
  isPlaying: boolean;
  position: number;
  startTime: Date;
}

export interface SoundMix {
  id: string;
  name: string;
  description?: string;
  sounds: Array<{
    soundId: string;
    volume: number;
  }>;
  isPlaying: boolean;
  isCustom: boolean;
  isPremium: boolean;
  moodId?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  playCount: number;
}

export interface PlaybackState {
  // Single sound mode
  isPlaying: boolean;
  currentSound?: Sound;
  volume: number;
  position: number;
  duration: number;

  // Mix mode (new)
  isMixMode: boolean;
  currentMix?: SoundMix;
  activeSounds: ActiveSound[];
  mixVolume: number; // Master volume for mix

  // Timer and effects
  timerEndTime?: Date;
  fadeDuration?: number;

  // Playback info
  mode: "single" | "mix";
}

export interface TimerSettings {
  duration: number; // in minutes
  fadeOutDuration: number; // in seconds
  isEnabled: boolean;
}

export interface AppSettings {
  theme: "light" | "dark" | "auto";
  timerDuration: number;
  masterVolume: number;
  autoPlayNext: boolean;
  enableNotifications: boolean;
  soundQuality: "standard" | "high";
}

// Mix creation and management
export interface MixCreationState {
  name: string;
  description: string;
  selectedSounds: Array<{
    soundId: string;
    volume: number;
  }>;
  isPreviewMode: boolean;
  masterVolume: number;
}

export interface MixPreset {
  id: string;
  name: string;
  description: string;
  sounds: Array<{
    soundId: string;
    volume: number;
  }>;
  category: "focus" | "relax" | "sleep" | "energy" | "custom";
  isPremium: boolean;
}

export interface UserPreferences {
  theme: "light" | "dark" | "auto";
  defaultTimerDuration: number;
  autoPlay: boolean;
  notifications: boolean;
  masterVolume: number;
  favoritesSoundIds: string[];
  favoritesMixIds: string[];
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "auto",
  defaultTimerDuration: 30 * 60 * 1000, // 30 minutes in milliseconds
  autoPlay: true,
  notifications: true,
  masterVolume: 0.8,
  favoritesSoundIds: [],
  favoritesMixIds: [],
};

export const DEFAULT_TIMER_OPTIONS = [
  { label: "15 minutes", value: 15 * 60 * 1000 },
  { label: "30 minutes", value: 30 * 60 * 1000 },
  { label: "1 hour", value: 60 * 60 * 1000 },
  { label: "2 hours", value: 2 * 60 * 60 * 1000 },
  { label: "4 hours", value: 4 * 60 * 60 * 1000 },
  { label: "8 hours", value: 8 * 60 * 60 * 1000 },
];

export interface SessionData {
  moodId: string;
  soundId?: string;
  mixId?: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
}

// Navigation Types
export type RootStackParamList = {
  Home: undefined;
  MoodSelection: undefined;
  SoundPlayer: {
    moodId: string;
    soundId?: string;
    mixId?: string;
  };
  SoundLibrary: undefined;
  Settings: undefined;
  MixCreator: {
    moodId?: string;
    mixId?: string;
  };
};

// Component Props Types
export interface MoodCardProps {
  mood: Mood;
  onPress: (mood: Mood) => void;
  isSelected?: boolean;
  animationDelay?: number;
}

export interface SoundCardProps {
  sound: Sound;
  onPress: (sound: Sound) => void;
  onFavorite: (sound: Sound) => void;
  isFavorite: boolean;
  isPlaying?: boolean;
}

export interface AudioPlayerProps {
  sound?: Sound;
  mix?: SoundMix;
  isPlaying: boolean;
  volume: number;
  onPlayPause: () => void;
  onVolumeChange: (volume: number) => void;
  onStop: () => void;
}

// Enums
export enum PlaybackMode {
  SINGLE = "single",
  MIX = "mix",
  PLAYLIST = "playlist",
}

// Audio Service Types
export interface AudioServiceConfig {
  enableBackgroundPlayback: boolean;
  audioMode: "mix" | "single";
  crossfadeDuration: number;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export enum ErrorCode {
  AUDIO_LOAD_FAILED = "AUDIO_LOAD_FAILED",
  AUDIO_PLAYBACK_FAILED = "AUDIO_PLAYBACK_FAILED",
  NETWORK_ERROR = "NETWORK_ERROR",
  STORAGE_ERROR = "STORAGE_ERROR",
  PERMISSION_DENIED = "PERMISSION_DENIED",
}

// Constants are defined above with UserPreferences interface
