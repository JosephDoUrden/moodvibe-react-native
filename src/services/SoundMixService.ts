import AsyncStorage from "@react-native-async-storage/async-storage";
import { SoundMix, MixCreationState, MixPreset } from "../types";

const MIXES_STORAGE_KEY = "@moodvibe_mixes";
const PRESETS_STORAGE_KEY = "@moodvibe_presets";

class SoundMixService {
  private static instance: SoundMixService;
  private mixes: SoundMix[] = [];
  private presets: MixPreset[] = [];
  private listeners: ((mixes: SoundMix[]) => void)[] = [];

  private constructor() {
    this.loadMixes();
    this.initializePresets();
  }

  public static getInstance(): SoundMixService {
    if (!SoundMixService.instance) {
      SoundMixService.instance = new SoundMixService();
    }
    return SoundMixService.instance;
  }

  // Mix Management
  async createMix(
    mixState: MixCreationState,
    moodId?: string
  ): Promise<SoundMix> {
    const mix: SoundMix = {
      id: `mix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: mixState.name,
      description: mixState.description,
      sounds: mixState.selectedSounds,
      isPlaying: false,
      isCustom: true,
      isPremium: false,
      moodId: moodId,
      tags: this.generateTags(mixState.selectedSounds),
      createdAt: new Date(),
      updatedAt: new Date(),
      playCount: 0,
    };

    this.mixes.push(mix);
    await this.saveMixes();
    this.notifyListeners();

    return mix;
  }

  async updateMix(
    mixId: string,
    updates: Partial<SoundMix>
  ): Promise<SoundMix | null> {
    const mixIndex = this.mixes.findIndex((m) => m.id === mixId);
    if (mixIndex === -1) return null;

    const updatedMix: SoundMix = {
      ...this.mixes[mixIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.mixes[mixIndex] = updatedMix;
    await this.saveMixes();
    this.notifyListeners();

    return updatedMix;
  }

  async deleteMix(mixId: string): Promise<boolean> {
    const mixIndex = this.mixes.findIndex((m) => m.id === mixId);
    if (mixIndex === -1) return false;

    this.mixes.splice(mixIndex, 1);
    await this.saveMixes();
    this.notifyListeners();

    return true;
  }

  async duplicateMix(
    mixId: string,
    newName?: string
  ): Promise<SoundMix | null> {
    const originalMix = this.mixes.find((m) => m.id === mixId);
    if (!originalMix) return null;

    const duplicatedMix: SoundMix = {
      ...originalMix,
      id: `mix_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newName || `${originalMix.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      playCount: 0,
    };

    this.mixes.push(duplicatedMix);
    await this.saveMixes();
    this.notifyListeners();

    return duplicatedMix;
  }

  // Mix Retrieval
  getMixes(category?: string): SoundMix[] {
    if (!category || category === "all") {
      return [...this.mixes].sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    }

    return this.mixes
      .filter((mix) => {
        switch (category) {
          case "custom":
            return mix.isCustom;
          case "favorites":
            return mix.playCount > 0; // Could be enhanced with actual favorites
          case "recent":
            const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return mix.updatedAt > oneWeekAgo;
          default:
            return true;
        }
      })
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }

  getMixById(mixId: string): SoundMix | undefined {
    return this.mixes.find((m) => m.id === mixId);
  }

  getMixesByMood(moodId: string): SoundMix[] {
    return this.mixes.filter((m) => m.moodId === moodId);
  }

  searchMixes(query: string): SoundMix[] {
    const searchTerm = query.toLowerCase();
    return this.mixes.filter(
      (mix) =>
        mix.name.toLowerCase().includes(searchTerm) ||
        mix.description?.toLowerCase().includes(searchTerm) ||
        mix.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
    );
  }

  // Mix Presets
  getPresets(): MixPreset[] {
    return [...this.presets];
  }

  getPresetsByCategory(category: string): MixPreset[] {
    return this.presets.filter((preset) => preset.category === category);
  }

  async createMixFromPreset(
    presetId: string,
    customName?: string
  ): Promise<SoundMix | null> {
    const preset = this.presets.find((p) => p.id === presetId);
    if (!preset) return null;

    const mixState: MixCreationState = {
      name: customName || preset.name,
      description: preset.description,
      selectedSounds: preset.sounds,
      isPreviewMode: false,
      masterVolume: 0.8,
    };

    return await this.createMix(mixState);
  }

  // Analytics and Statistics
  async incrementPlayCount(mixId: string): Promise<void> {
    const mix = this.mixes.find((m) => m.id === mixId);
    if (mix) {
      mix.playCount++;
      mix.updatedAt = new Date();
      await this.saveMixes();
      this.notifyListeners();
    }
  }

  getMostPlayedMixes(limit: number = 10): SoundMix[] {
    return [...this.mixes]
      .sort((a, b) => b.playCount - a.playCount)
      .slice(0, limit);
  }

  getRecentMixes(limit: number = 10): SoundMix[] {
    return [...this.mixes]
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  // Export/Import
  async exportMix(mixId: string): Promise<string | null> {
    const mix = this.mixes.find((m) => m.id === mixId);
    if (!mix) return null;

    try {
      const exportData = {
        version: "1.0",
        mix: mix,
        exportedAt: new Date().toISOString(),
      };
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Failed to export mix:", error);
      return null;
    }
  }

  async importMix(exportData: string): Promise<SoundMix | null> {
    try {
      const data = JSON.parse(exportData);
      if (!data.mix) throw new Error("Invalid mix data");

      const mixState: MixCreationState = {
        name: `${data.mix.name} (Imported)`,
        description: data.mix.description || "",
        selectedSounds: data.mix.sounds || [],
        isPreviewMode: false,
        masterVolume: 0.8,
      };

      return await this.createMix(mixState);
    } catch (error) {
      console.error("Failed to import mix:", error);
      return null;
    }
  }

  // State Management
  addListener(listener: (mixes: SoundMix[]) => void): void {
    this.listeners.push(listener);
  }

  removeListener(listener: (mixes: SoundMix[]) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.mixes]));
  }

  // Storage Operations
  private async loadMixes(): Promise<void> {
    try {
      const mixesData = await AsyncStorage.getItem(MIXES_STORAGE_KEY);
      if (mixesData) {
        const parsed = JSON.parse(mixesData);
        this.mixes = parsed.map((mix: any) => ({
          ...mix,
          createdAt: new Date(mix.createdAt),
          updatedAt: new Date(mix.updatedAt),
        }));
      }
    } catch (error) {
      console.error("Failed to load mixes:", error);
      this.mixes = [];
    }
  }

  private async saveMixes(): Promise<void> {
    try {
      await AsyncStorage.setItem(MIXES_STORAGE_KEY, JSON.stringify(this.mixes));
    } catch (error) {
      console.error("Failed to save mixes:", error);
    }
  }

  private initializePresets(): void {
    this.presets = [
      {
        id: "focus_deep",
        name: "Deep Focus",
        description: "Perfect for concentrated work sessions",
        sounds: [
          { soundId: "white_noise", volume: 0.6 },
          { soundId: "coffee_shop", volume: 0.4 },
          { soundId: "gentle_piano", volume: 0.3 },
        ],
        category: "focus",
        isPremium: false,
      },
      {
        id: "sleep_peaceful",
        name: "Peaceful Sleep",
        description: "Gentle sounds for restful sleep",
        sounds: [
          { soundId: "rain_light", volume: 0.5 },
          { soundId: "night_crickets", volume: 0.3 },
          { soundId: "deep_breathing", volume: 0.4 },
        ],
        category: "sleep",
        isPremium: false,
      },
      {
        id: "relax_nature",
        name: "Nature Escape",
        description: "Immerse yourself in natural tranquility",
        sounds: [
          { soundId: "ocean_waves", volume: 0.6 },
          { soundId: "forest_birds", volume: 0.4 },
          { soundId: "flowing_water", volume: 0.3 },
        ],
        category: "relax",
        isPremium: false,
      },
      {
        id: "energy_morning",
        name: "Morning Energy",
        description: "Energizing sounds to start your day",
        sounds: [
          { soundId: "forest_birds", volume: 0.6 },
          { soundId: "wind_chimes", volume: 0.4 },
          { soundId: "flowing_water", volume: 0.5 },
        ],
        category: "energy",
        isPremium: false,
      },
      {
        id: "meditation_zen",
        name: "Zen Meditation",
        description: "Sacred sounds for mindful practice",
        sounds: [
          { soundId: "tibetan_bowls", volume: 0.5 },
          { soundId: "om_chanting", volume: 0.4 },
          { soundId: "alpha_waves", volume: 0.3 },
        ],
        category: "focus",
        isPremium: true,
      },
    ];
  }

  private generateTags(
    sounds: Array<{ soundId: string; volume: number }>
  ): string[] {
    const tags = new Set<string>();

    // Add tags based on sound types
    sounds.forEach(({ soundId }) => {
      if (soundId.includes("rain") || soundId.includes("storm")) {
        tags.add("rain");
      }
      if (soundId.includes("ocean") || soundId.includes("water")) {
        tags.add("water");
      }
      if (soundId.includes("forest") || soundId.includes("birds")) {
        tags.add("nature");
      }
      if (soundId.includes("noise")) {
        tags.add("white noise");
      }
      if (soundId.includes("piano") || soundId.includes("music")) {
        tags.add("music");
      }
      if (
        soundId.includes("meditation") ||
        soundId.includes("zen") ||
        soundId.includes("tibetan")
      ) {
        tags.add("meditation");
      }
    });

    // Add category tags based on combination patterns
    if (sounds.length > 2) {
      tags.add("layered");
    }
    if (
      sounds.some(
        (s) => s.soundId.includes("coffee") || s.soundId.includes("city")
      )
    ) {
      tags.add("urban");
    }
    if (
      sounds.some(
        (s) => s.soundId.includes("sleep") || s.soundId.includes("night")
      )
    ) {
      tags.add("sleep");
    }

    return Array.from(tags);
  }

  // Cleanup
  async clearAllMixes(): Promise<void> {
    this.mixes = [];
    await AsyncStorage.removeItem(MIXES_STORAGE_KEY);
    this.notifyListeners();
  }
}

export const soundMixService = SoundMixService.getInstance();
