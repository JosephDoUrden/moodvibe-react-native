import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  SOUNDS,
  getSoundsByCategory,
  getFreeSounds,
  getPremiumSounds,
} from "../data/sounds";
import { audioService } from "../services/AudioService";
import { favoritesService } from "../services/FavoritesService";
import {
  Sound,
  SoundCategory,
  PlaybackState,
  RootStackParamList,
} from "../types";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useTheme } from "../contexts/ThemeContext";

type SoundLibraryNavigationProp = StackNavigationProp<
  RootStackParamList,
  "SoundLibrary"
>;

const SoundLibraryScreen: React.FC = () => {
  const navigation = useNavigation<SoundLibraryNavigationProp>();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [playbackState, setPlaybackState] = useState<PlaybackState>(
    audioService.getPlaybackState()
  );
  const [filteredSounds, setFilteredSounds] = useState<Sound[]>(SOUNDS);

  const categories = [
    { id: "all", name: "All Sounds", icon: "library-outline" },
    { id: "nature", name: "Nature", icon: "leaf-outline" },
    { id: "urban", name: "Urban", icon: "business-outline" },
    { id: "white_noise", name: "White Noise", icon: "radio-outline" },
    { id: "instrumental", name: "Instrumental", icon: "musical-notes-outline" },
    { id: "binaural", name: "Binaural", icon: "headset-outline" },
    { id: "free", name: "Free", icon: "heart-outline" },
    { id: "premium", name: "Premium", icon: "star-outline" },
    { id: "favorites", name: "Favorites", icon: "heart" },
  ];

  useEffect(() => {
    // Subscribe to playback state changes
    const handleStateChange = (state: PlaybackState) => {
      setPlaybackState(state);
    };

    audioService.addStateListener(handleStateChange);

    return () => {
      audioService.removeStateListener(handleStateChange);
    };
  }, []);

  useEffect(() => {
    // Subscribe to favorites changes
    const handleFavoritesChange = (newFavorites: Set<string>) => {
      setFavorites(newFavorites);
    };

    favoritesService.addListener(handleFavoritesChange);

    return () => {
      favoritesService.removeListener(handleFavoritesChange);
    };
  }, []);

  useEffect(() => {
    // Filter sounds based on search query and selected category
    let sounds = SOUNDS;

    // Filter by category
    if (selectedCategory !== "all") {
      if (selectedCategory === "free") {
        sounds = getFreeSounds();
      } else if (selectedCategory === "premium") {
        sounds = getPremiumSounds();
      } else if (selectedCategory === "favorites") {
        const favoriteIds = favoritesService.getFavoritesArray();
        sounds = SOUNDS.filter((sound) => favoriteIds.includes(sound.id));
      } else {
        sounds = getSoundsByCategory(selectedCategory as SoundCategory);
      }
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sounds = sounds.filter(
        (sound) =>
          sound.name.toLowerCase().includes(query) ||
          sound.description?.toLowerCase().includes(query) ||
          sound.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredSounds(sounds);
  }, [searchQuery, selectedCategory]);

  const handleSoundPress = async (sound: Sound) => {
    try {
      if (
        playbackState.currentSound?.id === sound.id &&
        playbackState.isPlaying
      ) {
        await audioService.togglePlayback();
      } else {
        await audioService.playSound(sound.id);
      }
    } catch (error) {
      console.error("Error playing sound:", error);
      Alert.alert("Playback Error", "Failed to play this sound");
    }
  };

  const handleFavoritePress = async (sound: Sound) => {
    try {
      await favoritesService.toggleFavorite(sound.id);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Alert.alert("Error", "Failed to update favorites");
    }
  };

  const renderCategoryFilter = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoryContainer}
      contentContainerStyle={styles.categoryContent}
    >
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryChip,
            selectedCategory === category.id && styles.selectedCategoryChip,
          ]}
          onPress={() => setSelectedCategory(category.id)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.selectedCategoryText,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  const renderSoundCard = ({ item: sound }: { item: Sound }) => {
    const isPlaying =
      playbackState.currentSound?.id === sound.id && playbackState.isPlaying;
    const isFavorite = favorites.has(sound.id);

    return (
      <TouchableOpacity
        style={styles.soundCard}
        onPress={() => handleSoundPress(sound)}
      >
        <View style={styles.soundCardHeader}>
          <View style={styles.soundInfo}>
            <Text style={styles.soundName}>{sound.name}</Text>
            <Text style={styles.soundDescription}>{sound.description}</Text>
            <View style={styles.soundTags}>
              {sound.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.soundActions}>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => handleFavoritePress(sound)}
            >
              <Ionicons
                name={isFavorite ? "heart" : "heart-outline"}
                size={16}
                color={isFavorite ? "#FF6B6B" : "#BDC3C7"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playingButton]}
              onPress={() => handleSoundPress(sound)}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={16}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.soundCardFooter}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{sound.category}</Text>
          </View>

          {sound.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={12} color="#FFD93D" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={theme.surface} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.title, { color: theme.text }]}>
              Sound Library
            </Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              Discover and explore {SOUNDS.length} ambient sounds
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.createMixButton, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate("MixCreator", {})}
          >
            <Ionicons name="layers" size={16} color="#FFFFFF" />
            <Text style={styles.createMixText}>Mix</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View
        style={[styles.searchContainer, { backgroundColor: theme.surface }]}
      >
        <Ionicons
          name="search"
          size={16}
          color={theme.iconSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search sounds, moods, or tags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={theme.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <Ionicons
              name="close-circle"
              size={16}
              color={theme.iconSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Results Count */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {filteredSounds.length} sound{filteredSounds.length !== 1 ? "s" : ""}{" "}
          found
        </Text>
      </View>

      {/* Sound List */}
      <FlatList
        data={filteredSounds}
        keyExtractor={(item) => item.id}
        renderItem={renderSoundCard}
        style={styles.soundList}
        contentContainerStyle={styles.soundListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={48} color="#BDC3C7" />
            <Text style={styles.emptyTitle}>No sounds found</Text>
            <Text style={styles.emptyDescription}>
              Try adjusting your search or category filter
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 30,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  createMixButton: {
    backgroundColor: "#007AFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  createMixText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#000000",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 15,
    color: "#8E8E93",
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
    color: "#8E8E93",
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    color: "#000000",
  },
  clearButton: {
    padding: 4,
  },
  categoryContainer: {
    maxHeight: 40,
    marginBottom: 4,
  },
  categoryContent: {
    paddingHorizontal: 20,
    paddingVertical: 6,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginRight: 6,
    backgroundColor: "#E8E8E8",
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedCategoryChip: {
    backgroundColor: "#007AFF",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#666666",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 4,
    marginTop: 4,
  },
  resultsText: {
    fontSize: 13,
    color: "#8E8E93",
    fontWeight: "400",
  },
  soundList: {
    flex: 1,
  },
  soundListContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  soundCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  soundCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  soundInfo: {
    flex: 1,
    marginRight: 16,
  },
  soundName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  soundDescription: {
    fontSize: 14,
    color: "#8E8E93",
    lineHeight: 18,
    marginBottom: 8,
  },
  soundTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
  },
  soundActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  playButton: {
    backgroundColor: "#007AFF",
    borderRadius: 18,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  playingButton: {
    backgroundColor: "#FF3B30",
    shadowColor: "#FF3B30",
  },
  soundCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  categoryBadge: {
    backgroundColor: "#E5F3FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  categoryBadgeText: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF5E6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  premiumText: {
    fontSize: 13,
    color: "#FF9500",
    fontWeight: "600",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginTop: 16,
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});

export default SoundLibraryScreen;
