import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";
import { ThemeColors, getTheme } from "../utils/theme";
import { settingsService } from "../services/SettingsService";
import { UserPreferences } from "../types";

interface ThemeContextType {
  theme: ThemeColors;
  isDark: boolean;
  currentThemeMode: "light" | "dark" | "auto";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [settings, setSettings] = useState<UserPreferences>(
    settingsService.getSettings()
  );
  const [systemColorScheme, setSystemColorScheme] = useState(
    Appearance.getColorScheme()
  );

  const theme = getTheme(settings);
  const isDark =
    settings.theme === "dark" ||
    (settings.theme === "auto" && systemColorScheme === "dark");

  useEffect(() => {
    // Subscribe to settings changes
    const handleSettingsChange = (newSettings: UserPreferences) => {
      setSettings(newSettings);
    };

    settingsService.addListener(handleSettingsChange);

    return () => {
      settingsService.removeListener(handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    // Subscribe to system color scheme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const value: ThemeContextType = {
    theme,
    isDark,
    currentThemeMode: settings.theme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
