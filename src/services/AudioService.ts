import { Audio } from "expo-av";
import { Sound, SoundMix, PlaybackState, TimerConfig } from "../types";
import { getSoundById } from "../data/sounds";

export class AudioService {
  private static instance: AudioService;
  private currentSound: Audio.Sound | null = null;
  private isInitialized: boolean = false;
  private playbackState: PlaybackState = {
    isPlaying: false,
    volume: 0.8,
    position: 0,
    duration: 0,
  };
  private timerInterval: NodeJS.Timeout | null = null;
  private statusUpdateInterval: NodeJS.Timeout | null = null;
  private stateListeners: ((state: PlaybackState) => void)[] = [];

  private constructor() {}

  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Initialize the audio service
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Set audio mode for background playback
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      this.isInitialized = true;
      console.log("AudioService initialized successfully");
    } catch (error) {
      console.error("Failed to initialize AudioService:", error);
      throw error;
    }
  }

  /**
   * Static mapping of audio files (for Metro bundler compatibility)
   */
  private getAudioAsset(fileName: string) {
    // Static mapping required for Metro bundler
    const audioAssets: { [key: string]: any } = {
      "ocean_waves.mp3": null, // Will be: require('../../assets/sounds/ocean_waves.mp3')
      "rain_light.mp3": null,
      "forest_birds.mp3": null,
      "white_noise.mp3": null,
      "coffee_shop.mp3": null,
      "brown_noise.mp3": null,
      "rain_thunder.mp3": null,
      "night_crickets.mp3": null,
      "fireplace.mp3": null,
      "flowing_water.mp3": null,
      "city_rain.mp3": null,
      "wind_chimes.mp3": null,
      "tibetan_bowls.mp3": null,
      "ambient_drone.mp3": null,
      "om_chanting.mp3": null,
      "gentle_piano.mp3": null,
      "deep_breathing.mp3": null,
      "alpha_waves.mp3": null,
    };

    return audioAssets[fileName] || null;
  }

  /**
   * Load and play a sound
   */
  public async playSound(soundId: string): Promise<void> {
    try {
      const soundData = getSoundById(soundId);
      if (!soundData) {
        throw new Error(`Sound with id ${soundId} not found`);
      }

      // Stop current sound if playing
      await this.stopSound();

      // Try to load real audio file first
      const audioAsset = this.getAudioAsset(soundData.fileName);

      if (audioAsset) {
        try {
          const { sound } = await Audio.Sound.createAsync(audioAsset, {
            shouldPlay: true,
            isLooping: soundData.isLooped,
            volume: this.playbackState.volume,
          });

          this.currentSound = sound;
          this.playbackState = {
            ...this.playbackState,
            currentSound: soundData,
            isPlaying: true,
          };

          // Set up status updates
          this.setupStatusUpdates();
          this.notifyStateChange();

          console.log(`Playing sound: ${soundData.name}`);
          return;
        } catch (audioError) {
          console.warn(
            `Audio file failed to load for ${soundData.name}, trying mock audio...`
          );
        }
      } else {
        console.warn(
          `Audio asset not mapped for ${soundData.name}, trying mock audio...`
        );
      }

      // Fallback to mock audio
      try {
        const mockAudioUri = this.getMockAudioUri();
        const { sound } = await Audio.Sound.createAsync(
          { uri: mockAudioUri },
          {
            shouldPlay: true,
            isLooping: soundData.isLooped,
            volume: this.playbackState.volume,
          }
        );

        this.currentSound = sound;
        this.playbackState = {
          ...this.playbackState,
          currentSound: soundData,
          isPlaying: true,
        };

        this.setupStatusUpdates();
        this.notifyStateChange();

        console.log(`Playing sound: ${soundData.name} (mock audio)`);
      } catch (mockError) {
        // Final fallback: simulate playback
        console.log(
          `Simulating playback for: ${soundData.name} (no audio available)`
        );
        this.simulatePlayback(soundData);
      }
    } catch (error) {
      console.error("Error playing sound:", error);
      throw error;
    }
  }

  /**
   * Get a mock audio URI for development
   */
  private getMockAudioUri(): string {
    // This is a short, silent audio file for testing
    // In production, replace with actual sound files
    return "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmUaAzuMzfDY";
  }

  /**
   * Simulate playback without actual audio
   */
  private simulatePlayback(soundData: Sound): void {
    this.playbackState = {
      ...this.playbackState,
      currentSound: soundData,
      isPlaying: true,
      duration: 60000, // Mock duration of 1 minute
    };

    // Mock status updates
    this.setupMockStatusUpdates();
    this.notifyStateChange();
  }

  /**
   * Set up mock status updates for development
   */
  private setupMockStatusUpdates(): void {
    this.clearStatusUpdates();

    this.statusUpdateInterval = setInterval(() => {
      if (this.playbackState.isPlaying && !this.currentSound) {
        // Simulate playback progress
        this.playbackState.position = Math.min(
          this.playbackState.position + 1000,
          this.playbackState.duration
        );

        // Loop if needed
        if (this.playbackState.position >= this.playbackState.duration) {
          const currentSound = this.playbackState.currentSound;
          if (currentSound?.isLooped) {
            this.playbackState.position = 0;
          } else {
            this.playbackState.isPlaying = false;
          }
        }

        this.notifyStateChange();
      }
    }, 1000);
  }

  /**
   * Play/pause toggle
   */
  public async togglePlayback(): Promise<void> {
    try {
      if (this.currentSound) {
        // Real audio playback
        if (this.playbackState.isPlaying) {
          await this.currentSound.pauseAsync();
          this.playbackState.isPlaying = false;
        } else {
          await this.currentSound.playAsync();
          this.playbackState.isPlaying = true;
        }
      } else {
        // Simulated playback
        this.playbackState.isPlaying = !this.playbackState.isPlaying;
        if (this.playbackState.isPlaying) {
          this.setupMockStatusUpdates();
        } else {
          this.clearStatusUpdates();
        }
      }
      this.notifyStateChange();
    } catch (error) {
      console.error("Error toggling playback:", error);
      throw error;
    }
  }

  /**
   * Stop current sound
   */
  public async stopSound(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }

      this.clearTimer();
      this.clearStatusUpdates();

      this.playbackState = {
        ...this.playbackState,
        isPlaying: false,
        currentSound: undefined,
        position: 0,
        duration: 0,
        timerEndTime: undefined,
      };

      this.notifyStateChange();
    } catch (error) {
      console.error("Error stopping sound:", error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  public async setVolume(volume: number): Promise<void> {
    try {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.playbackState.volume = clampedVolume;

      if (this.currentSound) {
        await this.currentSound.setVolumeAsync(clampedVolume);
      }

      this.notifyStateChange();
    } catch (error) {
      console.error("Error setting volume:", error);
      throw error;
    }
  }

  /**
   * Set a timer for automatic stop
   */
  public setTimer(config: TimerConfig): void {
    this.clearTimer();

    const endTime = new Date(Date.now() + config.duration);
    this.playbackState.timerEndTime = endTime;
    this.playbackState.fadeDuration = config.fadeDuration;

    this.timerInterval = setInterval(() => {
      const now = Date.now();
      const timeLeft = endTime.getTime() - now;

      if (timeLeft <= 0) {
        this.stopSound();
        return;
      }

      // Start fading if within fade duration
      if (timeLeft <= config.fadeDuration) {
        const fadeProgress = timeLeft / config.fadeDuration;
        const targetVolume = this.playbackState.volume * fadeProgress;
        this.setVolume(targetVolume);
      }
    }, 1000);

    this.notifyStateChange();
  }

  /**
   * Clear active timer
   */
  public clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    this.playbackState.timerEndTime = undefined;
    this.playbackState.fadeDuration = undefined;
    this.notifyStateChange();
  }

  /**
   * Get current playback state
   */
  public getPlaybackState(): PlaybackState {
    return { ...this.playbackState };
  }

  /**
   * Subscribe to playback state changes
   */
  public addStateListener(listener: (state: PlaybackState) => void): void {
    this.stateListeners.push(listener);
  }

  /**
   * Unsubscribe from playback state changes
   */
  public removeStateListener(listener: (state: PlaybackState) => void): void {
    const index = this.stateListeners.indexOf(listener);
    if (index > -1) {
      this.stateListeners.splice(index, 1);
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    await this.stopSound();
    this.stateListeners = [];
    this.isInitialized = false;
  }

  // Private methods

  private setupStatusUpdates(): void {
    this.clearStatusUpdates();

    this.statusUpdateInterval = setInterval(async () => {
      if (this.currentSound) {
        try {
          const status = await this.currentSound.getStatusAsync();
          if (status.isLoaded) {
            this.playbackState.position = status.positionMillis || 0;
            this.playbackState.duration = status.durationMillis || 0;
            this.playbackState.isPlaying = status.isPlaying || false;

            // Handle playback completion for non-looping sounds
            if (status.didJustFinish && !status.isLooping) {
              await this.stopSound();
            }
          }
        } catch (error) {
          console.error("Error getting playback status:", error);
        }
      }
    }, 1000);
  }

  private clearStatusUpdates(): void {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
      this.statusUpdateInterval = null;
    }
  }

  private notifyStateChange(): void {
    const state = this.getPlaybackState();
    this.stateListeners.forEach((listener) => listener(state));
  }
}

// Create and export singleton instance
export const audioService = AudioService.getInstance();
