import { Mood } from "../types";

export const MOODS: Mood[] = [
  {
    id: "calm",
    name: "Calm & Relaxed",
    icon: "😌",
    description: "Find your inner peace",
    color: "#6B73FF",
    gradientColors: ["#6B73FF", "#9B59B6"],
    sounds: ["ocean_waves", "rain_light", "white_noise", "tibetan_bowls"],
  },
  {
    id: "focused",
    name: "Focused & Productive",
    icon: "🎯",
    description: "Enhance your concentration",
    color: "#FF6B6B",
    gradientColors: ["#FF6B6B", "#FF8E53"],
    sounds: ["white_noise", "brown_noise", "coffee_shop", "gentle_piano"],
  },
  {
    id: "sleepy",
    name: "Sleepy & Restful",
    icon: "😴",
    description: "Drift into peaceful sleep",
    color: "#4ECDC4",
    gradientColors: ["#4ECDC4", "#44A08D"],
    sounds: ["rain_light", "night_crickets", "flowing_water", "deep_breathing"],
  },
  {
    id: "energetic",
    name: "Energetic & Motivated",
    icon: "⚡",
    description: "Boost your energy levels",
    color: "#FFD93D",
    gradientColors: ["#FFD93D", "#FF6B6B"],
    sounds: ["flowing_water", "wind_chimes", "forest_birds", "alpha_waves"],
  },
  {
    id: "meditative",
    name: "Meditative & Mindful",
    icon: "🧘",
    description: "Connect with your inner self",
    color: "#A8E6CF",
    gradientColors: ["#A8E6CF", "#88D8C0"],
    sounds: ["tibetan_bowls", "om_chanting", "ambient_drone", "alpha_waves"],
  },
  {
    id: "anxious",
    name: "Anxious & Stressed",
    icon: "😰",
    description: "Find calm in the storm",
    color: "#B19CD9",
    gradientColors: ["#B19CD9", "#9B59B6"],
    sounds: ["deep_breathing", "rain_light", "ocean_waves", "ambient_drone"],
  },
];

export const getMoodById = (id: string): Mood | undefined => {
  return MOODS.find((mood) => mood.id === id);
};

export const getMoodsByEmotion = (
  emotion: "positive" | "negative" | "neutral"
): Mood[] => {
  switch (emotion) {
    case "positive":
      return MOODS.filter((mood) =>
        ["energetic", "calm", "focused"].includes(mood.id)
      );
    case "negative":
      return MOODS.filter((mood) => ["anxious", "sleepy"].includes(mood.id));
    case "neutral":
      return MOODS.filter((mood) => ["meditative"].includes(mood.id));
    default:
      return MOODS;
  }
};
