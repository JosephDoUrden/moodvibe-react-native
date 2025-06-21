import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MoodCardProps } from "../types";

const { width } = Dimensions.get("window");
const cardWidth = (width - 52) / 2; // Two cards per row with proper margins

const MoodCard: React.FC<MoodCardProps> = ({
  mood,
  onPress,
  isSelected = false,
  animationDelay = 0,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial entrance animation
    const startAnimation = () => {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    };

    // Delay the animation based on the index
    const timer = setTimeout(startAnimation, animationDelay);
    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, animationDelay]);

  // Selection animation
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.02 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [isSelected, scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.cardContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={() => onPress(mood)}
        activeOpacity={0.9}
        delayPressIn={0}
      >
        <LinearGradient
          colors={mood.gradientColors}
          style={[styles.gradientCard, isSelected && styles.selectedGradient]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.emoji}>{mood.icon}</Text>
          <Text style={styles.moodName}>{mood.name}</Text>
          <Text style={styles.moodDescription}>{mood.description}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: cardWidth,
    height: 180,
    marginBottom: 20,
    marginHorizontal: 6,
  },
  touchable: {
    flex: 1,
    borderRadius: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8,
  },
  gradientCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  selectedGradient: {
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 12,
  },
  emoji: {
    fontSize: 40,
    marginBottom: 12,
    textAlign: "center",
  },
  moodName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 6,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: -0.4,
  },
  moodDescription: {
    fontSize: 13,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 18,
    textShadowColor: "rgba(0, 0, 0, 0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: -0.2,
  },
});

export default MoodCard;
