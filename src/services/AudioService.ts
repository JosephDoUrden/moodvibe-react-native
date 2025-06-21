import { Audio } from "expo-av";
import { Sound, SoundMix, PlaybackState, ActiveSound } from "../types";
import { getSoundById, SOUNDS } from "../data/sounds";

interface TimerConfig {
  duration: number;
  fadeDuration: number;
  autoStop: boolean;
}

export class AudioService {
  private static instance: AudioService;

  private isInitialized: boolean = false;
  private playbackState: PlaybackState = {
    isPlaying: false,
    volume: 0.8,
    position: 0,
    duration: 0,
    isMixMode: false,
    activeSounds: [],
    mixVolume: 0.8,
    mode: "single",
  };
  private statusUpdateInterval: NodeJS.Timeout | null = null;
  private stateListeners: ((state: PlaybackState) => void)[] = [];
  private currentSoundObject: Audio.Sound | null = null;
  private positionTimer: NodeJS.Timeout | null = null;
  private timerTimeout: NodeJS.Timeout | null = null;
  private isSimulationMode = false;

  // Audio asset mapping for Metro bundler compatibility
  private audioAssets: { [key: string]: any } = {
    "ocean_waves.mp3": require("../../assets/sounds/ocean_waves.mp3"),
    "rain_light.mp3": require("../../assets/sounds/rain_light.mp3"),
    "forest_birds.mp3": require("../../assets/sounds/forest_birds.mp3"),
    "rain_thunder.mp3": require("../../assets/sounds/rain_thunder.mp3"),
    "night_crickets.mp3": require("../../assets/sounds/night_crickets.mp3"),
    "flowing_water.mp3": require("../../assets/sounds/flowing_water.mp3"),
    "wind_chimes.mp3": require("../../assets/sounds/wind_chimes.mp3"),
    "coffee_shop.mp3": require("../../assets/sounds/coffee_shop.mp3"),
    "fireplace.mp3": require("../../assets/sounds/fireplace.mp3"),
    "city_rain.mp3": require("../../assets/sounds/city_rain.mp3"),
    "white_noise.mp3": require("../../assets/sounds/white_noise.mp3"),
    "brown_noise.mp3": require("../../assets/sounds/brown_noise.mp3"),
    "tibetan_bowls.mp3": require("../../assets/sounds/tibetan_bowls.mp3"),
    "ambient_drone.mp3": require("../../assets/sounds/ambient_drone.mp3"),
    "om_chanting.mp3": require("../../assets/sounds/om_chanting.mp3"),
    "gentle_piano.mp3": require("../../assets/sounds/gentle_piano.mp3"),
    "deep_breathing.mp3": require("../../assets/sounds/deep_breathing.mp3"),
    "alpha_waves.mp3": require("../../assets/sounds/alpha_waves.mp3"),
  };

  private constructor() {
    this.initialize();
  }

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
      console.warn(
        "Failed to initialize audio, falling back to simulation mode:",
        error
      );
      this.isSimulationMode = true;
      this.isInitialized = true;
    }
  }

  /**
   * Load and play a sound
   */
  public async playSound(soundId: string): Promise<void> {
    try {
      await this.initialize();

      // Stop current sound if in single mode
      if (!this.playbackState.isMixMode) {
        await this.stopAllSounds();
      }

      const soundData = getSoundById(soundId);
      if (!soundData) {
        throw new Error(`Sound not found: ${soundId}`);
      }

      if (this.isSimulationMode) {
        await this.simulatePlaySound(soundData);
        return;
      }

      const audioAsset = this.audioAssets[soundData.fileName];
      if (!audioAsset) {
        console.warn(`Audio asset not found for ${soundId}, using simulation`);
        await this.simulatePlaySound(soundData);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(audioAsset, {
        shouldPlay: true,
        isLooping: soundData.isLooped,
        volume: this.playbackState.volume,
      });

      if (this.playbackState.isMixMode) {
        // Add to active sounds for mixing
        const activeSound: ActiveSound = {
          id: soundId,
          sound: sound,
          volume: this.playbackState.volume,
          soundData: soundData,
          isPlaying: true,
          position: 0,
          startTime: new Date(),
        };

        this.playbackState.activeSounds.push(activeSound);
      } else {
        // Single sound mode
        this.currentSoundObject = sound;
        this.playbackState.currentSound = soundData;
      }

      this.playbackState.isPlaying = true;
      this.playbackState.mode = this.playbackState.isMixMode ? "mix" : "single";

      this.notifyStateChange();
      this.startPositionUpdates();
    } catch (error) {
      console.error("Error playing sound:", error);
      // Fallback to simulation
      const soundData = getSoundById(soundId);
      if (soundData) {
        await this.simulatePlaySound(soundData);
      }
    }
  }

  /**
   * Play/pause toggle
   */
  public async togglePlayback(): Promise<void> {
    if (this.playbackState.isMixMode) {
      await this.toggleMixPlayback();
    } else {
      await this.toggleSinglePlayback();
    }
  }

  private async toggleMixPlayback(): Promise<void> {
    const isPlaying = !this.playbackState.isPlaying;
    this.playbackState.isPlaying = isPlaying;

    for (const activeSound of this.playbackState.activeSounds) {
      activeSound.isPlaying = isPlaying;

      if (activeSound.sound && !this.isSimulationMode) {
        try {
          if (isPlaying) {
            await activeSound.sound.playAsync();
          } else {
            await activeSound.sound.pauseAsync();
          }
        } catch (error) {
          console.warn("Error toggling sound playback:", error);
        }
      }
    }

    if (isPlaying) {
      this.startPositionUpdates();
    } else {
      this.stopPositionUpdates();
    }

    this.notifyStateChange();
  }

  private async toggleSinglePlayback(): Promise<void> {
    if (this.isSimulationMode || !this.currentSoundObject) {
      this.playbackState.isPlaying = !this.playbackState.isPlaying;
      this.notifyStateChange();
      return;
    }

    try {
      if (this.playbackState.isPlaying) {
        await this.currentSoundObject.pauseAsync();
        this.playbackState.isPlaying = false;
        this.stopPositionUpdates();
      } else {
        await this.currentSoundObject.playAsync();
        this.playbackState.isPlaying = true;
        this.startPositionUpdates();
      }
      this.notifyStateChange();
    } catch (error) {
      console.error("Error toggling playback:", error);
    }
  }

  /**
   * Stop current sound
   */
  public async stopSound(): Promise<void> {
    await this.stopAllSounds();
  }

  async stopAllSounds(): Promise<void> {
    try {
      // Stop single sound
      if (this.currentSoundObject && !this.isSimulationMode) {
        await this.currentSoundObject.stopAsync();
        await this.currentSoundObject.unloadAsync();
      }
      this.currentSoundObject = null;

      // Stop all mix sounds
      for (const activeSound of this.playbackState.activeSounds) {
        if (activeSound.sound && !this.isSimulationMode) {
          try {
            await activeSound.sound.stopAsync();
            await activeSound.sound.unloadAsync();
          } catch (error) {
            console.warn("Error stopping active sound:", error);
          }
        }
      }

      // Reset state
      this.playbackState.isPlaying = false;
      this.playbackState.currentSound = undefined;
      this.playbackState.currentMix = undefined;
      this.playbackState.activeSounds = [];
      this.playbackState.isMixMode = false;
      this.playbackState.position = 0;
      this.playbackState.mode = "single";

      this.stopPositionUpdates();
      this.notifyStateChange();
    } catch (error) {
      console.error("Error stopping sounds:", error);
    }
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  public async setVolume(volume: number): Promise<void> {
    this.playbackState.volume = volume;

    if (this.playbackState.isMixMode) {
      await this.setMixVolume(volume);
    } else {
      if (this.currentSoundObject && !this.isSimulationMode) {
        try {
          await this.currentSoundObject.setVolumeAsync(volume);
        } catch (error) {
          console.warn("Error setting volume:", error);
        }
      }
    }

    this.notifyStateChange();
  }

  /**
   * Set a timer for automatic stop
   */
  public async setTimer(config: TimerConfig): Promise<void> {
    if (this.timerTimeout) {
      clearTimeout(this.timerTimeout);
    }

    this.playbackState.timerEndTime = new Date(Date.now() + config.duration);
    this.playbackState.fadeDuration = config.fadeDuration;

    this.timerTimeout = setTimeout(async () => {
      if (config.autoStop) {
        await this.stopAllSounds();
      }
    }, config.duration);

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
      if (this.currentSoundObject) {
        try {
          const status = await this.currentSoundObject.getStatusAsync();
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

  private startPositionUpdates(): void {
    this.stopPositionUpdates();
    this.positionTimer = setInterval(() => {
      this.updatePosition();
    }, 1000);
  }

  private stopPositionUpdates(): void {
    if (this.positionTimer) {
      clearInterval(this.positionTimer);
      this.positionTimer = null;
    }
  }

  private async updatePosition(): Promise<void> {
    if (this.isSimulationMode) {
      if (this.playbackState.isPlaying) {
        this.playbackState.position += 1000;
        this.notifyStateChange();
      }
      return;
    }

    if (this.playbackState.isMixMode) {
      // For mix mode, use the first active sound for position reference
      const firstActiveSound = this.playbackState.activeSounds[0];
      if (firstActiveSound?.sound) {
        try {
          const status = await firstActiveSound.sound.getStatusAsync();
          if (status.isLoaded) {
            this.playbackState.position = status.positionMillis || 0;
            this.playbackState.duration = status.durationMillis || 0;
          }
        } catch (error) {
          console.warn("Error getting mix position:", error);
        }
      }
    } else if (this.currentSoundObject) {
      try {
        const status = await this.currentSoundObject.getStatusAsync();
        if (status.isLoaded) {
          this.playbackState.position = status.positionMillis || 0;
          this.playbackState.duration = status.durationMillis || 0;
        }
      } catch (error) {
        console.warn("Error getting position:", error);
      }
    }

    this.notifyStateChange();
  }

  // Simulation methods
  private async simulatePlaySound(soundData: Sound): Promise<void> {
    this.playbackState.currentSound = soundData;
    this.playbackState.isPlaying = true;
    this.playbackState.duration = soundData.duration * 1000;
    this.playbackState.mode = "single";
    this.startPositionUpdates();
    this.notifyStateChange();
  }

  private async simulateMixPlayback(mix: SoundMix): Promise<void> {
    this.playbackState.currentMix = mix;
    this.playbackState.isMixMode = true;
    this.playbackState.isPlaying = true;
    this.playbackState.mode = "mix";
    this.playbackState.activeSounds = [];

    for (const mixSound of mix.sounds) {
      const soundData = getSoundById(mixSound.soundId);
      if (soundData) {
        const activeSound: ActiveSound = {
          id: mixSound.soundId,
          sound: null,
          volume: mixSound.volume,
          soundData: soundData,
          isPlaying: true,
          position: 0,
          startTime: new Date(),
        };
        this.playbackState.activeSounds.push(activeSound);
      }
    }

    this.startPositionUpdates();
    this.notifyStateChange();
  }

  async setMixVolume(volume: number): Promise<void> {
    this.playbackState.mixVolume = volume;

    // Update all active sounds
    for (const activeSound of this.playbackState.activeSounds) {
      if (activeSound.sound && !this.isSimulationMode) {
        try {
          await activeSound.sound.setVolumeAsync(activeSound.volume * volume);
        } catch (error) {
          console.warn("Error updating mix volume:", error);
        }
      }
    }

    this.notifyStateChange();
  }

  async playMix(mix: SoundMix): Promise<void> {
    try {
      await this.initialize();
      await this.stopAllSounds();

      this.playbackState.isMixMode = true;
      this.playbackState.currentMix = mix;
      this.playbackState.activeSounds = [];

      // Play each sound in the mix
      for (const mixSound of mix.sounds) {
        await this.addSoundToMix(mixSound.soundId, mixSound.volume);
      }

      this.playbackState.isPlaying = true;
      this.playbackState.mode = "mix";
      this.notifyStateChange();
    } catch (error) {
      console.error("Error playing mix:", error);
      // Fallback to simulation
      await this.simulateMixPlayback(mix);
    }
  }

  async addSoundToMix(soundId: string, volume: number = 0.8): Promise<void> {
    if (!this.playbackState.isMixMode) {
      this.playbackState.isMixMode = true;
      this.playbackState.mode = "mix";
    }

    const soundData = getSoundById(soundId);
    if (!soundData) {
      throw new Error(`Sound not found: ${soundId}`);
    }

    // Check if sound is already in mix
    const existingSound = this.playbackState.activeSounds.find(
      (as) => as.id === soundId
    );
    if (existingSound) {
      // Update volume
      existingSound.volume = volume;
      if (existingSound.sound && !this.isSimulationMode) {
        await existingSound.sound.setVolumeAsync(volume);
      }
      return;
    }

    if (this.isSimulationMode) {
      // Simulation mode
      const activeSound: ActiveSound = {
        id: soundId,
        sound: null,
        volume: volume,
        soundData: soundData,
        isPlaying: true,
        position: 0,
        startTime: new Date(),
      };
      this.playbackState.activeSounds.push(activeSound);
    } else {
      // Real audio mode
      const audioAsset = this.audioAssets[soundData.fileName];
      if (!audioAsset) {
        console.warn(`Audio asset not found for ${soundId}`);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(audioAsset, {
        shouldPlay: this.playbackState.isPlaying,
        isLooping: soundData.isLooped,
        volume: volume * this.playbackState.mixVolume,
      });

      const activeSound: ActiveSound = {
        id: soundId,
        sound: sound,
        volume: volume,
        soundData: soundData,
        isPlaying: this.playbackState.isPlaying,
        position: 0,
        startTime: new Date(),
      };

      this.playbackState.activeSounds.push(activeSound);
    }

    this.notifyStateChange();
  }

  async removeSoundFromMix(soundId: string): Promise<void> {
    const soundIndex = this.playbackState.activeSounds.findIndex(
      (as) => as.id === soundId
    );
    if (soundIndex === -1) return;

    const activeSound = this.playbackState.activeSounds[soundIndex];

    if (activeSound.sound && !this.isSimulationMode) {
      try {
        await activeSound.sound.stopAsync();
        await activeSound.sound.unloadAsync();
      } catch (error) {
        console.warn("Error stopping sound:", error);
      }
    }

    this.playbackState.activeSounds.splice(soundIndex, 1);

    // If no sounds left, stop mix mode
    if (this.playbackState.activeSounds.length === 0) {
      this.playbackState.isMixMode = false;
      this.playbackState.isPlaying = false;
      this.playbackState.currentMix = undefined;
      this.playbackState.mode = "single";
    }

    this.notifyStateChange();
  }

  async setSoundVolumeInMix(soundId: string, volume: number): Promise<void> {
    const activeSound = this.playbackState.activeSounds.find(
      (as) => as.id === soundId
    );
    if (!activeSound) return;

    activeSound.volume = volume;

    if (activeSound.sound && !this.isSimulationMode) {
      try {
        await activeSound.sound.setVolumeAsync(
          volume * this.playbackState.mixVolume
        );
      } catch (error) {
        console.warn("Error setting sound volume:", error);
      }
    }

    this.notifyStateChange();
  }
}

// Create and export singleton instance
export const audioService = AudioService.getInstance();
