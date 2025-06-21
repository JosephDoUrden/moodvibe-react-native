import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import MoodCard from "../components/MoodCard";
import { MOODS } from "../data/moods";
import { Mood, RootStackParamList } from "../types";

type MoodSelectionNavigationProp = StackNavigationProp<
  RootStackParamList,
  "MoodSelection"
>;

const MoodSelectionScreen: React.FC = () => {
  const navigation = useNavigation<MoodSelectionNavigationProp>();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const handleMoodPress = (mood: Mood) => {
    setSelectedMood(mood);
    // Navigate to sound player after a short delay for visual feedback
    setTimeout(() => {
      navigation.navigate("SoundPlayer", { moodId: mood.id });
    }, 300);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>How are you feeling?</Text>
          <Text style={styles.subtitle}>
            Choose your current mood to discover the perfect sounds for you
          </Text>
        </View>

        <View style={styles.moodGrid}>
          {MOODS.map((mood, index) => (
            <MoodCard
              key={mood.id}
              mood={mood}
              onPress={handleMoodPress}
              isSelected={selectedMood?.id === mood.id}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 32,
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
    paddingHorizontal: 20,
  },
  moodGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});

export default MoodSelectionScreen;
