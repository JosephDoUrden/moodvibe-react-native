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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  SOUNDS,
  getSoundsByCategory,
  getFreeSound,
  getPremiumSounds,
} from "../data/sounds";
import { audioService } from "../services/AudioService";
import { favoritesService } from "../services/FavoritesService";
import { Sound, SoundCategory, PlaybackState } from "../types";

const SoundLibraryScreen: React.FC = () => {
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
        sounds = getFreeSound();
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
          <Ionicons
            name={category.icon as keyof typeof Ionicons.glyphMap}
            size={16}
            color={selectedCategory === category.id ? "#FFFFFF" : "#6B73FF"}
            style={styles.categoryIcon}
          />
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
                size={20}
                color={isFavorite ? "#FF6B6B" : "#BDC3C7"}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playingButton]}
              onPress={() => handleSoundPress(sound)}
            >
              <Ionicons
                name={isPlaying ? "pause" : "play"}
                size={20}
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sound Library</Text>
        <Text style={styles.subtitle}>
          Discover and explore {SOUNDS.length} ambient sounds
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#BDC3C7"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search sounds, moods, or tags..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#BDC3C7"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchQuery("")}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#BDC3C7" />
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
            <Ionicons name="musical-notes-outline" size={64} color="#BDC3C7" />
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
    backgroundColor: "#F8F9FA",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#2C3E50",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 22,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#2C3E50",
  },
  clearButton: {
    padding: 4,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#6B73FF",
  },
  selectedCategoryChip: {
    backgroundColor: "#6B73FF",
    borderColor: "#6B73FF",
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6B73FF",
  },
  selectedCategoryText: {
    color: "#FFFFFF",
  },
  resultsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsText: {
    fontSize: 14,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  soundList: {
    flex: 1,
  },
  soundListContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  soundCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  soundDescription: {
    fontSize: 14,
    color: "#7F8C8D",
    lineHeight: 20,
    marginBottom: 8,
  },
  soundTags: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "#F1F2F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#6B73FF",
    fontWeight: "500",
  },
  soundActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  favoriteButton: {
    padding: 8,
    marginRight: 8,
  },
  playButton: {
    backgroundColor: "#6B73FF",
    borderRadius: 20,
    padding: 8,
    minWidth: 36,
    alignItems: "center",
  },
  playingButton: {
    backgroundColor: "#FF6B6B",
  },
  soundCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  categoryBadge: {
    backgroundColor: "#E8F4FD",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    color: "#6B73FF",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumText: {
    fontSize: 12,
    color: "#F39C12",
    fontWeight: "500",
    marginLeft: 4,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2C3E50",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#7F8C8D",
    textAlign: "center",
    lineHeight: 22,
  },
});

export default SoundLibraryScreen;
