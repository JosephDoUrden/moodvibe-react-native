import { Sound, SoundCategory } from "../types";

export const SOUNDS: Sound[] = [
  // Calm & Relaxed sounds
  {
    id: "ocean_waves",
    name: "Ocean Waves",
    fileName: "ocean_waves.mp3",
    category: SoundCategory.NATURE,
    moodIds: ["calm", "sleepy", "anxious"],
    isLooped: true,
    isPremium: false,
    description: "Gentle ocean waves lapping against the shore",
    tags: ["water", "relaxing", "peaceful"],
  },
  {
    id: "rain_light",
    name: "Light Rain",
    fileName: "rain_light.mp3",
    category: SoundCategory.NATURE,
    moodIds: ["calm", "sleepy", "focused"],
    isLooped: true,
    isPremium: false,
    description: "Soft rainfall creating a peaceful atmosphere",
    tags: ["rain", "calming", "sleep"],
  },
  {
    id: "forest_birds",
    name: "Forest Birds",
    fileName: "forest_birds.mp3",
    category: SoundCategory.NATURE,
    moodIds: ["calm", "meditative", "energetic"],
    isLooped: true,
    isPremium: false,
    description: "Chirping birds in a serene forest setting",
    tags: ["birds", "nature", "morning"],
  },

  // Focused & Productive sounds
  {
    id: "white_noise",
    name: "White Noise",
    fileName: "white_noise.mp3",
    category: SoundCategory.WHITE_NOISE,
    moodIds: ["focused", "sleepy"],
    isLooped: true,
    isPremium: false,
    description: "Pure white noise for maximum concentration",
    tags: ["focus", "concentration", "study"],
  },
  {
    id: "coffee_shop",
    name: "Coffee Shop Ambiance",
    fileName: "coffee_shop.mp3",
    category: SoundCategory.URBAN,
    moodIds: ["focused", "energetic"],
    isLooped: true,
    isPremium: true,
    description: "Bustling coffee shop atmosphere",
    tags: ["urban", "productive", "work"],
  },
  {
    id: "brown_noise",
    name: "Brown Noise",
    fileName: "brown_noise.mp3",
    category: SoundCategory.WHITE_NOISE,
    moodIds: ["focused", "sleepy"],
    isLooped: true,
    isPremium: false,
    description: "Deep brown noise for enhanced focus",
    tags: ["noise", "focus", "deep"],
  },

  // Sleepy & Restful sounds
  {
    id: "rain_thunder",
    name: "Rain with Thunder",
    fileName: "rain_thunder.mp3",
    category: SoundCategory.NATURE,
    moodIds: ["sleepy", "calm"],
    isLooped: true,
    isPremium: true,
    description: "Distant thunder with gentle rain",
    tags: ["storm", "sleep", "cozy"],
  },
  {
    id: "night_crickets",
    name: "Night Crickets",
    fileName: "night_crickets.mp3",
    category: SoundCategory.NATURE,
    moodIds: ["sleepy", "calm"],
    isLooped: true,
    isPremium: false,
    description: "Peaceful cricket sounds on a quiet night",
    tags: ["night", "crickets", "peaceful"],
  },
  {
    id: "fireplace",
    name: "Fireplace Crackling",
    fileName: "fireplace.mp3",
    category: SoundCategory.URBAN,
    moodIds: ["sleepy", "calm"],
    isLooped: true,
    isPremium: true,
    description: "Warm fireplace crackling sounds",
    tags: ["fire", "cozy", "warm"],
  },

  // Energetic & Motivated sounds
  {
    id: "flowing_water",
    name: "Flowing Water",
    fileName: "flowing_water.mp3",
    category: SoundCategory.NATURE,
    moodIds: ["energetic", "focused"],
    isLooped: true,
    isPremium: false,
    description: "Energizing stream of flowing water",
    tags: ["water", "energy", "fresh"],
  },
  {
    id: "city_rain",
    name: "City Rain",
    fileName: "city_rain.mp3",
    category: SoundCategory.URBAN,
    moodIds: ["energetic", "focused"],
    isLooped: true,
    isPremium: true,
    description: "Rain in the city with urban sounds",
    tags: ["urban", "rain", "dynamic"],
  },
  {
    id: "wind_chimes",
    name: "Wind Chimes",
    fileName: "wind_chimes.mp3",
    category: SoundCategory.NATURE,
    moodIds: ["energetic", "meditative"],
    isLooped: true,
    isPremium: false,
    description: "Gentle wind chimes in a light breeze",
    tags: ["chimes", "wind", "uplifting"],
  },

  // Meditative & Mindful sounds
  {
    id: "tibetan_bowls",
    name: "Tibetan Singing Bowls",
    fileName: "tibetan_bowls.mp3",
    category: SoundCategory.INSTRUMENTAL,
    moodIds: ["meditative", "calm"],
    isLooped: true,
    isPremium: true,
    description: "Sacred Tibetan singing bowls",
    tags: ["meditation", "spiritual", "healing"],
  },
  {
    id: "ambient_drone",
    name: "Ambient Drone",
    fileName: "ambient_drone.mp3",
    category: SoundCategory.INSTRUMENTAL,
    moodIds: ["meditative", "focused"],
    isLooped: true,
    isPremium: false,
    description: "Deep ambient drone for meditation",
    tags: ["ambient", "drone", "deep"],
  },
  {
    id: "om_chanting",
    name: "Om Chanting",
    fileName: "om_chanting.mp3",
    category: SoundCategory.INSTRUMENTAL,
    moodIds: ["meditative", "calm"],
    isLooped: true,
    isPremium: true,
    description: "Traditional Om chanting for meditation",
    tags: ["om", "chanting", "spiritual"],
  },

  // Anxious & Stressed sounds
  {
    id: "gentle_piano",
    name: "Gentle Piano",
    fileName: "gentle_piano.mp3",
    category: SoundCategory.INSTRUMENTAL,
    moodIds: ["anxious", "calm"],
    isLooped: true,
    isPremium: true,
    description: "Soft, calming piano melodies",
    tags: ["piano", "gentle", "soothing"],
  },
  {
    id: "deep_breathing",
    name: "Deep Breathing",
    fileName: "deep_breathing.mp3",
    category: SoundCategory.INSTRUMENTAL,
    moodIds: ["anxious", "meditative"],
    isLooped: true,
    isPremium: false,
    description: "Guided deep breathing exercise",
    tags: ["breathing", "relaxation", "anxiety"],
  },
  {
    id: "alpha_waves",
    name: "Alpha Waves",
    fileName: "alpha_waves.mp3",
    category: SoundCategory.BINAURAL,
    moodIds: ["anxious", "calm", "focused"],
    isLooped: true,
    isPremium: true,
    description: "Alpha brainwave frequencies for relaxation",
    tags: ["binaural", "alpha", "brainwaves"],
  },
];

export const getSoundsByMood = (moodId: string): Sound[] => {
  return SOUNDS.filter((sound) => sound.moodIds.includes(moodId));
};

export const getSoundsByCategory = (category: SoundCategory): Sound[] => {
  return SOUNDS.filter((sound) => sound.category === category);
};

export const getFreeSound = (): Sound[] => {
  return SOUNDS.filter((sound) => !sound.isPremium);
};

export const getPremiumSounds = (): Sound[] => {
  return SOUNDS.filter((sound) => sound.isPremium);
};

export const getSoundById = (id: string): Sound | undefined => {
  return SOUNDS.find((sound) => sound.id === id);
};
