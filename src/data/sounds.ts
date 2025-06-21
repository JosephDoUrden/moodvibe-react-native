import { Sound, SoundCategory } from "../types";

export const SOUNDS: Sound[] = [
  // Calm & Relaxed sounds
  {
    id: "ocean_waves",
    name: "Ocean Waves",
    description: "Gentle ocean waves lapping against the shore",
    fileName: "ocean_waves.mp3",
    duration: 300,
    category: "nature",
    tags: ["water", "relaxing", "peaceful"],
    isLooped: true,
    isPremium: false,
    isFavorite: false,
  },
  {
    id: "rain_light",
    name: "Light Rain",
    description: "Soft rainfall creating a peaceful atmosphere",
    fileName: "rain_light.mp3",
    duration: 450,
    category: "nature",
    tags: ["rain", "calming", "sleep"],
    isLooped: true,
    isPremium: false,
    isFavorite: false,
  },
  {
    id: "forest_birds",
    name: "Forest Birds",
    description: "Chirping birds in a serene forest setting",
    fileName: "forest_birds.mp3",
    duration: 360,
    category: "nature",
    tags: ["birds", "nature", "morning"],
    isLooped: true,
    isPremium: false,
    isFavorite: false,
  },

  // Focused & Productive sounds
  {
    id: "white_noise",
    name: "White Noise",
    description: "Pure white noise for maximum concentration",
    fileName: "white_noise.mp3",
    duration: 600,
    category: "white-noise",
    tags: ["focus", "concentration", "study"],
    isLooped: true,
    isPremium: false,
    isFavorite: false,
  },
  {
    id: "coffee_shop",
    name: "Coffee Shop Ambiance",
    description: "Bustling coffee shop atmosphere",
    fileName: "coffee_shop.mp3",
    duration: 420,
    category: "urban",
    tags: ["urban", "productive", "work"],
    isLooped: true,
    isPremium: true,
    isFavorite: false,
  },
  {
    id: "brown_noise",
    name: "Brown Noise",
    description: "Deep brown noise for enhanced focus",
    fileName: "brown_noise.mp3",
    duration: 600,
    category: "white-noise",
    tags: ["noise", "focus", "deep"],
    isLooped: true,
    isPremium: false,
    isFavorite: false,
  },

  // Sleepy & Restful sounds
  {
    id: "rain_thunder",
    name: "Rain with Thunder",
    description: "Distant thunder with gentle rain",
    fileName: "rain_thunder.mp3",
    duration: 480,
    category: "nature",
    tags: ["storm", "sleep", "cozy"],
    isLooped: true,
    isPremium: true,
    isFavorite: false,
  },
  {
    id: "night_crickets",
    name: "Night Crickets",
    description: "Peaceful cricket sounds on a quiet night",
    fileName: "night_crickets.mp3",
    duration: 540,
    category: "nature",
    tags: ["night", "crickets", "peaceful"],
    isLooped: true,
    isPremium: false,
    isFavorite: false,
  },
  {
    id: "fireplace",
    name: "Fireplace Crackling",
    description: "Warm fireplace crackling sounds",
    fileName: "fireplace.mp3",
    duration: 300,
    category: "urban",
    tags: ["fire", "cozy", "warm"],
    isLooped: true,
    isPremium: true,
    isFavorite: false,
  },

  // Energetic & Motivated sounds
  {
    id: "flowing_water",
    name: "Flowing Water",
    description: "Energizing stream of flowing water",
    fileName: "flowing_water.mp3",
    duration: 390,
    category: "nature",
    tags: ["water", "energy", "fresh"],
    isLooped: true,
    isPremium: false,
    isFavorite: false,
  },
  {
    id: "city_rain",
    name: "City Rain",
    description: "Rain in the city with urban sounds",
    fileName: "city_rain.mp3",
    duration: 360,
    category: "urban",
    tags: ["urban", "rain", "dynamic"],
    isLooped: true,
    isPremium: true,
    isFavorite: false,
  },
  {
    id: "wind_chimes",
    name: "Wind Chimes",
    description: "Gentle wind chimes in a light breeze",
    fileName: "wind_chimes.mp3",
    duration: 270,
    category: "nature",
    tags: ["chimes", "wind", "uplifting"],
    isLooped: true,
    isPremium: false,
    isFavorite: false,
  },

  // Meditative & Mindful sounds
  {
    id: "tibetan_bowls",
    name: "Tibetan Singing Bowls",
    description: "Sacred Tibetan singing bowls",
    fileName: "tibetan_bowls.mp3",
    duration: 480,
    category: "instrumental",
    tags: ["meditation", "spiritual", "healing"],
    isLooped: true,
    isPremium: true,
    isFavorite: false,
  },
  {
    id: "ambient_drone",
    name: "Ambient Drone",
    description: "Deep ambient drone for meditation",
    fileName: "ambient_drone.mp3",
    duration: 720,
    category: "instrumental",
    tags: ["ambient", "drone", "deep"],
    isLooped: true,
    isPremium: false,
    isFavorite: false,
  },
  {
    id: "om_chanting",
    name: "Om Chanting",
    description: "Traditional Om chanting for meditation",
    fileName: "om_chanting.mp3",
    duration: 360,
    category: "instrumental",
    tags: ["om", "chanting", "spiritual"],
    isLooped: true,
    isPremium: true,
    isFavorite: false,
  },

  // Anxious & Stressed sounds
  {
    id: "gentle_piano",
    name: "Gentle Piano",
    description: "Soft, calming piano melodies",
    fileName: "gentle_piano.mp3",
    duration: 420,
    category: "instrumental",
    tags: ["piano", "gentle", "soothing"],
    isLooped: true,
    isPremium: true,
    isFavorite: false,
  },
  {
    id: "deep_breathing",
    name: "Deep Breathing",
    description: "Guided deep breathing exercise",
    fileName: "deep_breathing.mp3",
    duration: 300,
    category: "instrumental",
    tags: ["breathing", "relaxation", "anxiety"],
    isLooped: true,
    isPremium: false,
    isFavorite: false,
  },
  {
    id: "alpha_waves",
    name: "Alpha Waves",
    description: "Alpha brainwave frequencies for relaxation",
    fileName: "alpha_waves.mp3",
    duration: 600,
    category: "binaural",
    tags: ["binaural", "alpha", "brainwaves"],
    isLooped: true,
    isPremium: true,
    isFavorite: false,
  },
];

export const getSoundsByMood = (moodId: string): Sound[] => {
  // Get sounds based on mood from MOODS definition
  const { MOODS } = require("./moods");
  const mood = MOODS.find((m: any) => m.id === moodId);
  if (mood) {
    return SOUNDS.filter((sound) => mood.sounds.includes(sound.id));
  }
  return [];
};

export const getSoundsByCategory = (category: SoundCategory): Sound[] => {
  return SOUNDS.filter((sound) => sound.category === category);
};

export const getFreeSounds = (): Sound[] => {
  return SOUNDS.filter((sound) => !sound.isPremium);
};

export const getPremiumSounds = (): Sound[] => {
  return SOUNDS.filter((sound) => sound.isPremium);
};

export const getSoundById = (id: string): Sound | undefined => {
  return SOUNDS.find((sound) => sound.id === id);
};
