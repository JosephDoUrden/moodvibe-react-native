import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { audioService } from "../services/AudioService";
import { getSoundsByMood } from "../data/sounds";
import { MOODS } from "../data/moods";
import { RootStackParamList, PlaybackState, Sound } from "../types";

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

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const mood = MOODS.find((m) => m.id === moodId);

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

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
  }, [moodId, fadeAnim, scaleAnim]);

  const handlePlayPause = async () => {
    try {
      // Add haptic feedback on iOS
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      await audioService.togglePlayback();
    } catch (error) {
      console.error("Playback error:", error);
      Alert.alert("Playback Error", "Failed to control audio playback");
    }
  };

  const handleStop = async () => {
    try {
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
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
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
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
      if (Platform.OS === "ios") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
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
        <LinearGradient
          colors={["#F2F2F7", "#E5E5EA"]}
          style={styles.loadingContainer}
        >
          <Text style={styles.loadingText}>Loading sounds...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={mood.gradientColors}
        style={styles.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.moodName}>{mood.name}</Text>
              <Text style={styles.moodSubtitle}>
                {availableSounds.length} sounds available
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity
                onPress={() => navigation.navigate("MixCreator", { moodId })}
                style={styles.headerButton}
              >
                <Ionicons name="layers-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSetTimer}
                style={styles.headerButton}
              >
                <Ionicons name="timer-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Current Sound Display */}
          <View style={styles.soundInfo}>
            <View style={styles.emojiContainer}>
              <Text style={styles.soundEmoji}>{mood.icon}</Text>
            </View>
            <Text style={styles.soundName}>
              {currentSound?.name || "No Sound"}
            </Text>
            <Text style={styles.soundDescription}>
              {currentSound?.description || mood.description}
            </Text>
          </View>

          {/* Timer Display */}
          {playbackState.timerEndTime && (
            <View style={styles.timerContainer}>
              <Ionicons
                name="timer-outline"
                size={16}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.timerText}>
                {formatTime(playbackState.timerEndTime.getTime() - Date.now())}
              </Text>
            </View>
          )}

          {/* Controls */}
          <View style={styles.controlsContainer}>
            <View style={styles.transportControls}>
              <TouchableOpacity
                onPress={handlePreviousSound}
                style={[
                  styles.transportButton,
                  { opacity: availableSounds.length > 1 ? 1 : 0.4 },
                ]}
                disabled={availableSounds.length <= 1}
              >
                <Ionicons name="play-skip-back" size={32} color="#FFFFFF" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playButton}
              >
                <Ionicons
                  name={playbackState.isPlaying ? "pause" : "play"}
                  size={56}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleNextSound}
                style={[
                  styles.transportButton,
                  { opacity: availableSounds.length > 1 ? 1 : 0.4 },
                ]}
                disabled={availableSounds.length <= 1}
              >
                <Ionicons name="play-skip-forward" size={32} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Volume Control */}
            <View style={styles.volumeContainer}>
              <Ionicons
                name="volume-low"
                size={18}
                color="rgba(255,255,255,0.8)"
              />
              <Slider
                style={styles.volumeSlider}
                minimumValue={0}
                maximumValue={1}
                value={playbackState.volume}
                onValueChange={handleVolumeChange}
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="rgba(255,255,255,0.3)"
                thumbTintColor="#FFFFFF"
              />
              <Ionicons
                name="volume-high"
                size={18}
                color="rgba(255,255,255,0.8)"
              />
              <Text style={styles.volumeText}>
                {Math.round(playbackState.volume * 100)}%
              </Text>
            </View>

            {/* Stop Button */}
            <TouchableOpacity onPress={handleStop} style={styles.stopButton}>
              <Ionicons name="stop" size={20} color="#FFFFFF" />
              <Text style={styles.stopButtonText}>Stop Session</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 17,
    color: "#8E8E93",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 30,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 16,
  },
  moodName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 2,
  },
  moodSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  soundInfo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  soundEmoji: {
    fontSize: 64,
  },
  soundName: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: -0.5,
  },
  soundDescription: {
    fontSize: 17,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    paddingHorizontal: 20,
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 40,
    marginBottom: 20,
  },
  timerText: {
    fontSize: 15,
    color: "#FFFFFF",
    marginLeft: 6,
    fontWeight: "500",
  },
  controlsContainer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  transportControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  transportButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 40,
    shadowColor: "rgba(0,0,0,0.3)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 12,
  },
  volumeText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    minWidth: 36,
    textAlign: "right",
    fontWeight: "500",
  },
  stopButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    shadowColor: "rgba(0,0,0,0.2)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  stopButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default SoundPlayerScreen;
