// Core Types
export interface Mood {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  gradient: string[];
}

export interface Sound {
  id: string;
  name: string;
  fileName: string;
  category: SoundCategory;
  moodIds: string[];
  duration?: number;
  isLooped: boolean;
  isPremium: boolean;
  description?: string;
  tags: string[];
}

export interface SoundMix {
  id: string;
  name: string;
  sounds: Array<{
    soundId: string;
    volume: number;
  }>;
  moodId?: string;
  isCustom: boolean;
  createdAt: Date;
}

export interface PlaybackState {
  isPlaying: boolean;
  currentSound?: Sound;
  currentMix?: SoundMix;
  volume: number;
  position: number;
  duration: number;
  timerEndTime?: Date;
  fadeDuration?: number;
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
export enum SoundCategory {
  NATURE = "nature",
  URBAN = "urban",
  WHITE_NOISE = "white_noise",
  INSTRUMENTAL = "instrumental",
  BINAURAL = "binaural",
}

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

export interface TimerConfig {
  duration: number; // in milliseconds
  fadeDuration: number; // in milliseconds
  autoStop: boolean;
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

// Constants
export const MOODS: Mood[] = [
  {
    id: "calm",
    name: "Calm & Relaxed",
    emoji: "😌",
    description: "Find your inner peace",
    color: "#6B73FF",
    gradient: ["#6B73FF", "#9B59B6"],
  },
  {
    id: "focused",
    name: "Focused & Productive",
    emoji: "🎯",
    description: "Enhance your concentration",
    color: "#FF6B6B",
    gradient: ["#FF6B6B", "#FF8E53"],
  },
  {
    id: "sleepy",
    name: "Sleepy & Restful",
    emoji: "😴",
    description: "Drift into peaceful sleep",
    color: "#4ECDC4",
    gradient: ["#4ECDC4", "#44A08D"],
  },
  {
    id: "energetic",
    name: "Energetic & Motivated",
    emoji: "⚡",
    description: "Boost your energy levels",
    color: "#FFD93D",
    gradient: ["#FFD93D", "#FF6B6B"],
  },
  {
    id: "meditative",
    name: "Meditative & Mindful",
    emoji: "🧘",
    description: "Connect with your inner self",
    color: "#A8E6CF",
    gradient: ["#A8E6CF", "#88D8C0"],
  },
  {
    id: "anxious",
    name: "Anxious & Stressed",
    emoji: "😰",
    description: "Find calm in the storm",
    color: "#B19CD9",
    gradient: ["#B19CD9", "#9B59B6"],
  },
];

export const DEFAULT_TIMER_OPTIONS = [
  { label: "15 minutes", value: 15 * 60 * 1000 },
  { label: "30 minutes", value: 30 * 60 * 1000 },
  { label: "1 hour", value: 60 * 60 * 1000 },
  { label: "2 hours", value: 2 * 60 * 60 * 1000 },
  { label: "8 hours", value: 8 * 60 * 60 * 1000 },
];

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: "auto",
  defaultTimerDuration: 30 * 60 * 1000, // 30 minutes
  autoPlay: true,
  notifications: true,
  masterVolume: 0.8,
  favoritesSoundIds: [],
  favoritesMixIds: [],
};
