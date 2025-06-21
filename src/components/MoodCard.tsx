import React from "react";
import { TouchableOpacity, Text, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MoodCardProps } from "../types";

const { width } = Dimensions.get("window");
const cardWidth = (width - 60) / 2; // Two cards per row with margins

const MoodCard: React.FC<MoodCardProps> = ({
  mood,
  onPress,
  isSelected = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.cardContainer, isSelected && styles.selectedCard]}
      onPress={() => onPress(mood)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={mood.gradientColors}
        style={styles.gradientCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.emoji}>{mood.icon}</Text>
        <Text style={styles.moodName}>{mood.name}</Text>
        <Text style={styles.moodDescription}>{mood.description}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    height: 160,
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  selectedCard: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  gradientCard: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  moodDescription: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default MoodCard;
