import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MoodCard from "../components/MoodCard";
import { MOODS } from "../data/moods";
import { Mood, RootStackParamList } from "../types";
import { useTheme } from "../contexts/ThemeContext";

type MoodSelectionNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MoodSelection"
>;

const MoodSelectionScreen: React.FC = () => {
  const navigation = useNavigation<MoodSelectionNavigationProp>();
  const { theme } = useTheme();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const handleMoodPress = (mood: Mood) => {
    setSelectedMood(mood);
    // Navigate to sound player with a subtle delay for visual feedback
    setTimeout(() => {
      navigation.navigate("SoundPlayer", { moodId: mood.id });
    }, 150);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            Welcome back
          </Text>
          <Text style={[styles.title, { color: theme.text }]}>
            How are you feeling?
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Choose your current mood to discover the perfect soundscape for your
            moment
          </Text>
        </View>

        {/* Mood Grid */}
        <View style={styles.moodGrid}>
          {MOODS.map((mood, index) => (
            <MoodCard
              key={mood.id}
              mood={mood}
              onPress={handleMoodPress}
              isSelected={selectedMood?.id === mood.id}
              animationDelay={index * 100} // Add staggered animation
            />
          ))}
        </View>

        {/* Bottom spacing for better scroll experience */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 20 : 60,
  },
  headerSection: {
    marginBottom: 40,
  },
  greeting: {
    fontSize: 17,
    fontWeight: "400",
    marginBottom: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 12,
    lineHeight: 41,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    paddingRight: 20,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: -6, // Negative margin to compensate for card margins
  },
  bottomSpacer: {
    height: 40,
  },
});

export default MoodSelectionScreen;
