import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "moodvibe_favorites";

export class FavoritesService {
  private static instance: FavoritesService;
  private favorites: Set<string> = new Set();
  private listeners: ((favorites: Set<string>) => void)[] = [];

  private constructor() {
    this.loadFavorites();
  }

  public static getInstance(): FavoritesService {
    if (!FavoritesService.instance) {
      FavoritesService.instance = new FavoritesService();
    }
    return FavoritesService.instance;
  }

  /**
   * Load favorites from AsyncStorage
   */
  private async loadFavorites(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const favoritesArray = JSON.parse(stored);
        this.favorites = new Set(favoritesArray);
        this.notifyListeners();
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
    }
  }

  /**
   * Save favorites to AsyncStorage
   */
  private async saveFavorites(): Promise<void> {
    try {
      const favoritesArray = Array.from(this.favorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray));
    } catch (error) {
      console.error("Failed to save favorites:", error);
      throw error;
    }
  }

  /**
   * Add a sound to favorites
   */
  public async addFavorite(soundId: string): Promise<void> {
    this.favorites.add(soundId);
    await this.saveFavorites();
    this.notifyListeners();
  }

  /**
   * Remove a sound from favorites
   */
  public async removeFavorite(soundId: string): Promise<void> {
    this.favorites.delete(soundId);
    await this.saveFavorites();
    this.notifyListeners();
  }

  /**
   * Toggle favorite status of a sound
   */
  public async toggleFavorite(soundId: string): Promise<boolean> {
    const isFavorite = this.favorites.has(soundId);

    if (isFavorite) {
      await this.removeFavorite(soundId);
      return false;
    } else {
      await this.addFavorite(soundId);
      return true;
    }
  }

  /**
   * Check if a sound is favorited
   */
  public isFavorite(soundId: string): boolean {
    return this.favorites.has(soundId);
  }

  /**
   * Get all favorites
   */
  public getFavorites(): Set<string> {
    return new Set(this.favorites);
  }

  /**
   * Get favorites as array
   */
  public getFavoritesArray(): string[] {
    return Array.from(this.favorites);
  }

  /**
   * Get number of favorites
   */
  public getFavoritesCount(): number {
    return this.favorites.size;
  }

  /**
   * Clear all favorites
   */
  public async clearFavorites(): Promise<void> {
    this.favorites.clear();
    await this.saveFavorites();
    this.notifyListeners();
  }

  /**
   * Subscribe to favorites changes
   */
  public addListener(listener: (favorites: Set<string>) => void): void {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.getFavorites());
  }

  /**
   * Unsubscribe from favorites changes
   */
  public removeListener(listener: (favorites: Set<string>) => void): void {
    const index = this.listeners.indexOf(listener);
    if (index > -1) {
      this.listeners.splice(index, 1);
    }
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    const currentFavorites = this.getFavorites();
    this.listeners.forEach((listener) => listener(currentFavorites));
  }
}

// Create and export singleton instance
export const favoritesService = FavoritesService.getInstance();
