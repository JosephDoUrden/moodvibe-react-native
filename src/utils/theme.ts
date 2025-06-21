import { Appearance } from "react-native";
import { UserPreferences } from "../types";

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  card: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;

  // Interactive
  primary: string;
  secondary: string;
  accent: string;

  // Status
  success: string;
  warning: string;
  error: string;

  // Borders and separators
  border: string;
  separator: string;

  // Overlays
  overlay: string;
  modalBackground: string;

  // Icons
  icon: string;
  iconSecondary: string;
}

export const lightTheme: ThemeColors = {
  // Backgrounds
  background: "#F2F2F7",
  surface: "#FFFFFF",
  card: "#FFFFFF",

  // Text
  text: "#000000",
  textSecondary: "#8E8E93",
  textTertiary: "#C7C7CC",

  // Interactive
  primary: "#007AFF",
  secondary: "#6B73FF",
  accent: "#FF6B6B",

  // Status
  success: "#34C759",
  warning: "#FF9500",
  error: "#FF3B30",

  // Borders and separators
  border: "#E5E5EA",
  separator: "#E5E5EA",

  // Overlays
  overlay: "rgba(0, 0, 0, 0.4)",
  modalBackground: "rgba(0, 0, 0, 0.5)",

  // Icons
  icon: "#8E8E93",
  iconSecondary: "#C7C7CC",
};

export const darkTheme: ThemeColors = {
  // Backgrounds
  background: "#000000",
  surface: "#1C1C1E",
  card: "#2C2C2E",

  // Text
  text: "#FFFFFF",
  textSecondary: "#8E8E93",
  textTertiary: "#48484A",

  // Interactive
  primary: "#0A84FF",
  secondary: "#5E5CE6",
  accent: "#FF6B6B",

  // Status
  success: "#32D74B",
  warning: "#FF9F0A",
  error: "#FF453A",

  // Borders and separators
  border: "#38383A",
  separator: "#38383A",

  // Overlays
  overlay: "rgba(0, 0, 0, 0.6)",
  modalBackground: "rgba(0, 0, 0, 0.8)",

  // Icons
  icon: "#8E8E93",
  iconSecondary: "#48484A",
};

export const getTheme = (preferences: UserPreferences): ThemeColors => {
  switch (preferences.theme) {
    case "light":
      return lightTheme;
    case "dark":
      return darkTheme;
    case "auto":
    default:
      return Appearance.getColorScheme() === "dark" ? darkTheme : lightTheme;
  }
};

export const getSystemTheme = (): "light" | "dark" => {
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
};
