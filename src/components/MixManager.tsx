import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";
import { Ionicons } from "@expo/vector-icons";
import { SOUNDS } from "../data/sounds";
import { audioService } from "../services/AudioService";
import { soundMixService } from "../services/SoundMixService";
import { MixCreationState, Sound, SoundMix, ActiveSound } from "../types";

interface MixManagerProps {
  initialMix?: SoundMix;
  moodId?: string;
  onSave?: (mix: SoundMix) => void;
  onCancel?: () => void;
  isPreviewMode?: boolean;
}

const { width } = Dimensions.get("window");

const MixManager: React.FC<MixManagerProps> = ({
  initialMix,
  moodId,
  onSave,
  onCancel,
  isPreviewMode = false,
}) => {
  const [mixState, setMixState] = useState<MixCreationState>({
    name: initialMix?.name || "",
    description: initialMix?.description || "",
    selectedSounds: initialMix?.sounds || [],
    isPreviewMode: isPreviewMode,
    masterVolume: 0.8,
  });

  const [availableSounds] = useState<Sound[]>(SOUNDS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSounds, setActiveSounds] = useState<ActiveSound[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Subscribe to audio service state changes
    const handleStateChange = (state: any) => {
      setIsPlaying(state.isPlaying && state.isMixMode);
      setActiveSounds(state.activeSounds || []);
    };

    audioService.addStateListener(handleStateChange);
    return () => audioService.removeStateListener(handleStateChange);
  }, []);

  const filteredSounds = availableSounds.filter(
    (sound) =>
      sound.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sound.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sound.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleSoundToggle = (sound: Sound) => {
    const existingIndex = mixState.selectedSounds.findIndex(
      (s) => s.soundId === sound.id
    );

    if (existingIndex >= 0) {
      // Remove sound from mix
      const newSelectedSounds = mixState.selectedSounds.filter(
        (s) => s.soundId !== sound.id
      );
      setMixState((prev) => ({ ...prev, selectedSounds: newSelectedSounds }));

      // Remove from active playback if playing
      if (isPlaying) {
        audioService.removeSoundFromMix(sound.id);
      }
    } else {
      // Add sound to mix
      const newSound = { soundId: sound.id, volume: 0.6 };
      setMixState((prev) => ({
        ...prev,
        selectedSounds: [...prev.selectedSounds, newSound],
      }));

      // Add to active playback if playing
      if (isPlaying) {
        audioService.addSoundToMix(sound.id, 0.6);
      }
    }
  };

  const handleVolumeChange = (soundId: string, volume: number) => {
    const newSelectedSounds = mixState.selectedSounds.map((s) =>
      s.soundId === soundId ? { ...s, volume } : s
    );
    setMixState((prev) => ({ ...prev, selectedSounds: newSelectedSounds }));

    // Update volume in real-time if playing
    if (isPlaying) {
      audioService.setSoundVolumeInMix(soundId, volume);
    }
  };

  const handleMasterVolumeChange = (volume: number) => {
    setMixState((prev) => ({ ...prev, masterVolume: volume }));

    if (isPlaying) {
      audioService.setMixVolume(volume);
    }
  };

  const handlePreviewToggle = async () => {
    if (mixState.selectedSounds.length === 0) {
      Alert.alert(
        "No Sounds Selected",
        "Please select at least one sound to preview."
      );
      return;
    }

    try {
      if (isPlaying) {
        await audioService.stopAllSounds();
        setIsPlaying(false);
      } else {
        // Create temporary mix for preview
        const tempMix: SoundMix = {
          id: "preview_mix",
          name: "Preview Mix",
          description: "Temporary mix for preview",
          sounds: mixState.selectedSounds,
          isPlaying: false,
          isCustom: true,
          isPremium: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
          playCount: 0,
        };

        await audioService.playMix(tempMix);
        await audioService.setMixVolume(mixState.masterVolume);
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Preview error:", error);
      Alert.alert("Preview Error", "Failed to preview the mix.");
    }
  };

  const handleSaveMix = async () => {
    if (!mixState.name.trim()) {
      Alert.alert("Name Required", "Please enter a name for your mix.");
      return;
    }

    if (mixState.selectedSounds.length === 0) {
      Alert.alert(
        "No Sounds Selected",
        "Please select at least one sound for your mix."
      );
      return;
    }

    try {
      let savedMix: SoundMix;

      if (initialMix) {
        // Update existing mix
        const updates: Partial<SoundMix> = {
          name: mixState.name,
          description: mixState.description,
          sounds: mixState.selectedSounds,
        };
        savedMix = (await soundMixService.updateMix(
          initialMix.id,
          updates
        )) as SoundMix;
      } else {
        // Create new mix
        savedMix = await soundMixService.createMix(mixState, moodId);
      }

      if (savedMix && onSave) {
        onSave(savedMix);
      }

      Alert.alert(
        "Mix Saved",
        `"${mixState.name}" has been saved successfully!`,
        [{ text: "OK", onPress: () => onCancel?.() }]
      );
    } catch (error) {
      console.error("Save error:", error);
      Alert.alert("Save Error", "Failed to save the mix.");
    }
  };

  const getSelectedSound = (soundId: string) => {
    return mixState.selectedSounds.find((s) => s.soundId === soundId);
  };

  const getSoundByQuery = (soundId: string) => {
    return availableSounds.find((s) => s.id === soundId);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>
          {initialMix ? "Edit Mix" : "Create Mix"}
        </Text>
        {onCancel && (
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Mix Details */}
      <View style={styles.mixDetails}>
        <TextInput
          style={styles.nameInput}
          placeholder="Mix name"
          value={mixState.name}
          onChangeText={(name) => setMixState((prev) => ({ ...prev, name }))}
          maxLength={50}
        />
        <TextInput
          style={styles.descriptionInput}
          placeholder="Description (optional)"
          value={mixState.description}
          onChangeText={(description) =>
            setMixState((prev) => ({ ...prev, description }))
          }
          multiline
          maxLength={200}
        />
      </View>

      {/* Master Controls */}
      <View style={styles.masterControls}>
        <View style={styles.masterVolumeContainer}>
          <Text style={styles.masterVolumeLabel}>Master Volume</Text>
          <View style={styles.volumeSliderContainer}>
            <Ionicons name="volume-low" size={16} color="#666" />
            <Slider
              style={styles.masterVolumeSlider}
              minimumValue={0}
              maximumValue={1}
              value={mixState.masterVolume}
              onValueChange={handleMasterVolumeChange}
              minimumTrackTintColor="#007AFF"
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor="#007AFF"
            />
            <Ionicons name="volume-high" size={16} color="#666" />
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.previewButton,
            isPlaying && styles.previewButtonActive,
            mixState.selectedSounds.length === 0 &&
              styles.previewButtonDisabled,
          ]}
          onPress={handlePreviewToggle}
          disabled={mixState.selectedSounds.length === 0}
        >
          <Ionicons
            name={isPlaying ? "pause" : "play"}
            size={20}
            color={mixState.selectedSounds.length === 0 ? "#CCC" : "#FFF"}
          />
          <Text
            style={[
              styles.previewButtonText,
              mixState.selectedSounds.length === 0 &&
                styles.previewButtonTextDisabled,
            ]}
          >
            {isPlaying ? "Stop Preview" : "Preview Mix"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selected Sounds */}
      {mixState.selectedSounds.length > 0 && (
        <View style={styles.selectedSoundsSection}>
          <Text style={styles.sectionTitle}>
            Selected Sounds ({mixState.selectedSounds.length})
          </Text>
          {mixState.selectedSounds.map((selectedSound) => {
            const sound = getSoundByQuery(selectedSound.soundId);
            if (!sound) return null;

            return (
              <View
                key={selectedSound.soundId}
                style={styles.selectedSoundItem}
              >
                <View style={styles.selectedSoundInfo}>
                  <Text style={styles.selectedSoundName}>{sound.name}</Text>
                  <TouchableOpacity
                    onPress={() => handleSoundToggle(sound)}
                    style={styles.removeSoundButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#FF6B6B" />
                  </TouchableOpacity>
                </View>
                <View style={styles.volumeSliderContainer}>
                  <Ionicons name="volume-low" size={14} color="#999" />
                  <Slider
                    style={styles.soundVolumeSlider}
                    minimumValue={0}
                    maximumValue={1}
                    value={selectedSound.volume}
                    onValueChange={(volume) =>
                      handleVolumeChange(selectedSound.soundId, volume)
                    }
                    minimumTrackTintColor="#007AFF"
                    maximumTrackTintColor="#E0E0E0"
                    thumbTintColor="#007AFF"
                  />
                  <Text style={styles.volumeValue}>
                    {Math.round(selectedSound.volume * 100)}%
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Sound Selection */}
      <View style={styles.soundSelectionSection}>
        <Text style={styles.sectionTitle}>Available Sounds</Text>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={16}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search sounds..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Sound Grid */}
        <View style={styles.soundGrid}>
          {filteredSounds.map((sound) => {
            const isSelected = !!getSelectedSound(sound.id);
            return (
              <TouchableOpacity
                key={sound.id}
                style={[
                  styles.soundCard,
                  isSelected && styles.soundCardSelected,
                ]}
                onPress={() => handleSoundToggle(sound)}
              >
                <View style={styles.soundCardHeader}>
                  <Text
                    style={[
                      styles.soundCardName,
                      isSelected && styles.soundCardNameSelected,
                    ]}
                  >
                    {sound.name}
                  </Text>
                  <Ionicons
                    name={
                      isSelected ? "checkmark-circle" : "add-circle-outline"
                    }
                    size={20}
                    color={isSelected ? "#007AFF" : "#999"}
                  />
                </View>
                <Text
                  style={[
                    styles.soundCardDescription,
                    isSelected && styles.soundCardDescriptionSelected,
                  ]}
                >
                  {sound.description}
                </Text>
                <View style={styles.soundCardTags}>
                  {sound.tags.slice(0, 2).map((tag) => (
                    <Text key={tag} style={styles.soundCardTag}>
                      {tag}
                    </Text>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            (!mixState.name.trim() || mixState.selectedSounds.length === 0) &&
              styles.saveButtonDisabled,
          ]}
          onPress={handleSaveMix}
          disabled={
            !mixState.name.trim() || mixState.selectedSounds.length === 0
          }
        >
          <Ionicons name="save" size={20} color="#FFF" />
          <Text style={styles.saveButtonText}>
            {initialMix ? "Update Mix" : "Save Mix"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  mixDetails: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
    marginBottom: 12,
  },
  descriptionInput: {
    fontSize: 14,
    color: "#666",
    paddingVertical: 8,
    minHeight: 60,
    textAlignVertical: "top",
  },
  masterControls: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  masterVolumeContainer: {
    marginBottom: 16,
  },
  masterVolumeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  volumeSliderContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  masterVolumeSlider: {
    flex: 1,
    marginHorizontal: 12,
  },
  previewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  previewButtonActive: {
    backgroundColor: "#FF6B6B",
  },
  previewButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  previewButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
  },
  previewButtonTextDisabled: {
    color: "#CCC",
  },
  selectedSoundsSection: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  selectedSoundItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedSoundInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  selectedSoundName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  removeSoundButton: {
    padding: 4,
  },
  soundVolumeSlider: {
    flex: 1,
    marginHorizontal: 8,
  },
  volumeValue: {
    fontSize: 12,
    color: "#666",
    minWidth: 35,
    textAlign: "right",
  },
  soundSelectionSection: {
    backgroundColor: "#FFF",
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 10,
  },
  soundGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },
  soundCard: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 12,
  },
  soundCardSelected: {
    // Selected state handled by content styling
  },
  soundCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  soundCardName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  soundCardNameSelected: {
    color: "#007AFF",
  },
  soundCardDescription: {
    fontSize: 10,
    color: "#666",
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  soundCardDescriptionSelected: {
    color: "#005BBB",
  },
  soundCardTags: {
    flexDirection: "row",
    paddingHorizontal: 12,
  },
  soundCardTag: {
    fontSize: 9,
    color: "#999",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 4,
  },
  actionButtons: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#E0E0E0",
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    marginLeft: 8,
  },
});

export default MixManager;
