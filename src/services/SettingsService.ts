import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserPreferences, DEFAULT_PREFERENCES } from "../types";

const SETTINGS_KEY = "moodvibe_settings";

export class SettingsService {
  private static instance: SettingsService;
  private settings: UserPreferences = { ...DEFAULT_PREFERENCES };
  private listeners: ((settings: UserPreferences) => void)[] = [];

  private constructor() {
    this.loadSettings();
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  /**
   * Load settings from AsyncStorage
   */
  private async loadSettings(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const loadedSettings = JSON.parse(stored);
        this.settings = { ...DEFAULT_PREFERENCES, ...loadedSettings };
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  /**
   * Save settings to AsyncStorage
   */
  private async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
      throw error;
    }
  }

  /**
   * Get all settings
   */
  public getSettings(): UserPreferences {
    return { ...this.settings };
  }

  /**
   * Update theme setting
   */
  public async setTheme(theme: "light" | "dark" | "auto"): Promise<void> {
    this.settings.theme = theme;
    await this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Update default timer duration
   */
  public async setDefaultTimerDuration(duration: number): Promise<void> {
    this.settings.defaultTimerDuration = duration;
    await this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Update auto-play preference
   */
  public async setAutoPlay(autoPlay: boolean): Promise<void> {
    this.settings.autoPlay = autoPlay;
    await this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Update notifications preference
   */
  public async setNotifications(notifications: boolean): Promise<void> {
    this.settings.notifications = notifications;
    await this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Update master volume
   */
  public async setMasterVolume(volume: number): Promise<void> {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    this.settings.masterVolume = clampedVolume;
    await this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Get theme setting
   */
  public getTheme(): "light" | "dark" | "auto" {
    return this.settings.theme;
  }

  /**
   * Get default timer duration
   */
  public getDefaultTimerDuration(): number {
    return this.settings.defaultTimerDuration;
  }

  /**
   * Get auto-play preference
   */
  public getAutoPlay(): boolean {
    return this.settings.autoPlay;
  }

  /**
   * Get notifications preference
   */
  public getNotifications(): boolean {
    return this.settings.notifications;
  }

  /**
   * Get master volume
   */
  public getMasterVolume(): number {
    return this.settings.masterVolume;
  }

  /**
   * Reset all settings to default
   */
  public async resetSettings(): Promise<void> {
    this.settings = { ...DEFAULT_PREFERENCES };
    await this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Update multiple settings at once
   */
  public async updateSettings(
    updates: Partial<UserPreferences>
  ): Promise<void> {
    this.settings = { ...this.settings, ...updates };
    await this.saveSettings();
    this.notifyListeners();
  }

  /**
   * Get formatted timer duration
   */
  public getFormattedTimerDuration(): string {
    const minutes = this.settings.defaultTimerDuration / (60 * 1000);
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return hours === 1 ? `${hours} hour` : `${hours} hours`;
      } else {
        return `${hours}h ${remainingMinutes}m`;
      }
    }
  }

  /**
   * Get formatted volume percentage
   */
  public getFormattedVolume(): string {
    return `${Math.round(this.settings.masterVolume * 100)}%`;
  }

  /**
   * Subscribe to settings changes
   */
  public addListener(listener: (settings: UserPreferences) => void): void {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.getSettings());
  }

  /**
   * Unsubscribe from settings changes
   */
  public removeListener(listener: (settings: UserPreferences) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    const currentSettings = this.getSettings();
    this.listeners.forEach((listener) => listener(currentSettings));
  }

  /**
   * Export settings for backup
   */
  public exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from backup
   */
  public async importSettings(settingsJson: string): Promise<void> {
    try {
      const importedSettings = JSON.parse(settingsJson);
      // Validate imported settings
      const validatedSettings: UserPreferences = {
        theme: ["light", "dark", "auto"].includes(importedSettings.theme)
          ? importedSettings.theme
          : DEFAULT_PREFERENCES.theme,
        defaultTimerDuration:
          typeof importedSettings.defaultTimerDuration === "number"
            ? importedSettings.defaultTimerDuration
            : DEFAULT_PREFERENCES.defaultTimerDuration,
        autoPlay:
          typeof importedSettings.autoPlay === "boolean"
            ? importedSettings.autoPlay
            : DEFAULT_PREFERENCES.autoPlay,
        notifications:
          typeof importedSettings.notifications === "boolean"
            ? importedSettings.notifications
            : DEFAULT_PREFERENCES.notifications,
        masterVolume:
          typeof importedSettings.masterVolume === "number"
            ? Math.max(0, Math.min(1, importedSettings.masterVolume))
            : DEFAULT_PREFERENCES.masterVolume,
        favoritesSoundIds: Array.isArray(importedSettings.favoritesSoundIds)
          ? importedSettings.favoritesSoundIds
          : DEFAULT_PREFERENCES.favoritesSoundIds,
        favoritesMixIds: Array.isArray(importedSettings.favoritesMixIds)
          ? importedSettings.favoritesMixIds
          : DEFAULT_PREFERENCES.favoritesMixIds,
      };

      this.settings = validatedSettings;
      await this.saveSettings();
      this.notifyListeners();
    } catch (error) {
      console.error("Failed to import settings:", error);
      throw new Error("Invalid settings format");
    }
  }
}

// Create and export singleton instance
export const settingsService = SettingsService.getInstance();
