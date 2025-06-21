import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { audioService } from "../services/AudioService";
import { getSoundsByMood } from "../data/sounds";
import { MOODS, RootStackParamList, PlaybackState, Sound } from "../types";

type SoundPlayerRouteProp = RouteProp<RootStackParamList, "SoundPlayer">;
type SoundPlayerNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SoundPlayer"
>;

const SoundPlayerScreen: React.FC = () => {
  const route = useRoute<SoundPlayerRouteProp>();
  const navigation = useNavigation<SoundPlayerNavigationProp>();
  const { moodId } = route.params;

  const [playbackState, setPlaybackState] = useState<PlaybackState>(
    audioService.getPlaybackState()
  );
  const [availableSounds, setAvailableSounds] = useState<Sound[]>([]);
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0);

  const mood = MOODS.find((m) => m.id === moodId);

  useEffect(() => {
    // Initialize audio service
    const initAudio = async () => {
      try {
        await audioService.initialize();
        const sounds = getSoundsByMood(moodId);
        setAvailableSounds(sounds);

        // Auto-play first sound
        if (sounds.length > 0) {
          await audioService.playSound(sounds[0].id);
        }
      } catch (error) {
        console.error("Failed to initialize audio:", error);
        Alert.alert("Audio Error", "Failed to initialize audio playback");
      }
    };

    initAudio();

    // Subscribe to playback state changes
    const handleStateChange = (state: PlaybackState) => {
      setPlaybackState(state);
    };

    audioService.addStateListener(handleStateChange);

    return () => {
      audioService.removeStateListener(handleStateChange);
    };
  }, [moodId]);

  const handlePlayPause = async () => {
    try {
      await audioService.togglePlayback();
    } catch (error) {
      console.error("Playback error:", error);
      Alert.alert("Playback Error", "Failed to control audio playback");
    }
  };

  const handleStop = async () => {
    try {
      await audioService.stopSound();
    } catch (error) {
      console.error("Stop error:", error);
    }
  };

  const handleVolumeChange = async (volume: number) => {
    try {
      await audioService.setVolume(volume);
    } catch (error) {
      console.error("Volume error:", error);
    }
  };

  const handleNextSound = async () => {
    if (availableSounds.length > 1) {
      const nextIndex = (currentSoundIndex + 1) % availableSounds.length;
      setCurrentSoundIndex(nextIndex);
      try {
        await audioService.playSound(availableSounds[nextIndex].id);
      } catch (error) {
        console.error("Next sound error:", error);
      }
    }
  };

  const handlePreviousSound = async () => {
    if (availableSounds.length > 1) {
      const prevIndex =
        currentSoundIndex === 0
          ? availableSounds.length - 1
          : currentSoundIndex - 1;
      setCurrentSoundIndex(prevIndex);
      try {
        await audioService.playSound(availableSounds[prevIndex].id);
      } catch (error) {
        console.error("Previous sound error:", error);
      }
    }
  };

  const handleSetTimer = () => {
    Alert.alert("Set Timer", "Choose timer duration", [
      { text: "15 min", onPress: () => setTimer(15) },
      { text: "30 min", onPress: () => setTimer(30) },
      { text: "1 hour", onPress: () => setTimer(60) },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const setTimer = (minutes: number) => {
    audioService.setTimer({
      duration: minutes * 60 * 1000,
      fadeDuration: 5 * 60 * 1000, // 5 minutes fade
      autoStop: true,
    });
    Alert.alert("Timer Set", `Audio will stop in ${minutes} minutes`);
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const currentSound =
    playbackState.currentSound || availableSounds[currentSoundIndex];

  if (!mood || availableSounds.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading sounds...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={mood.gradient as string[]}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.moodName}>{mood.name}</Text>
          <TouchableOpacity onPress={handleSetTimer} style={styles.timerButton}>
            <Ionicons name="timer-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Current Sound Display */}
        <View style={styles.soundInfo}>
          <Text style={styles.soundEmoji}>{mood.emoji}</Text>
          <Text style={styles.soundName}>
            {currentSound?.name || "No Sound"}
          </Text>
          <Text style={styles.soundDescription}>
            {currentSound?.description || mood.description}
          </Text>
        </View>

        {/* Progress and Timer Info */}
        <View style={styles.progressContainer}>
          {playbackState.timerEndTime && (
            <Text style={styles.timerText}>
              Timer:{" "}
              {formatTime(playbackState.timerEndTime.getTime() - Date.now())}
            </Text>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handlePreviousSound}
            style={[
              styles.controlButton,
              { opacity: availableSounds.length > 1 ? 1 : 0.3 },
            ]}
            disabled={availableSounds.length <= 1}
          >
            <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
            <Ionicons
              name={playbackState.isPlaying ? "pause" : "play"}
              size={48}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNextSound}
            style={[
              styles.controlButton,
              { opacity: availableSounds.length > 1 ? 1 : 0.3 },
            ]}
            disabled={availableSounds.length <= 1}
          >
            <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Volume Control */}
        <View style={styles.volumeContainer}>
          <Ionicons name="volume-low" size={20} color="#FFFFFF" />
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={playbackState.volume}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="rgba(255,255,255,0.3)"
            thumbStyle={{ backgroundColor: "#FFFFFF" }}
          />
          <Ionicons name="volume-high" size={20} color="#FFFFFF" />
        </View>

        {/* Stop Button */}
        <TouchableOpacity onPress={handleStop} style={styles.stopButton}>
          <Ionicons name="stop" size={24} color="#FFFFFF" />
          <Text style={styles.stopButtonText}>Stop</Text>
        </TouchableOpacity>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    fontSize: 18,
    color: "#7F8C8D",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  moodName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  timerButton: {
    padding: 8,
  },
  soundInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  soundEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  soundName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  soundDescription: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 22,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  progressContainer: {
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 16,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  controlButton: {
    padding: 20,
  },
  playButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 40,
    padding: 20,
    marginHorizontal: 30,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 15,
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    marginHorizontal: 40,
    marginBottom: 40,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  stopButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default SoundPlayerScreen;
