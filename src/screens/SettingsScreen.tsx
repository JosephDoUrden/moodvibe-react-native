import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Switch,
  Alert,
  ActionSheetIOS,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { settingsService } from "../services/SettingsService";
import { favoritesService } from "../services/FavoritesService";
import { UserPreferences, DEFAULT_TIMER_OPTIONS } from "../types";

const SettingsScreen: React.FC = () => {
  const [settings, setSettings] = useState<UserPreferences>(
    settingsService.getSettings()
  );
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    // Subscribe to settings changes
    const handleSettingsChange = (newSettings: UserPreferences) => {
      setSettings(newSettings);
    };

    settingsService.addListener(handleSettingsChange);

    return () => {
      settingsService.removeListener(handleSettingsChange);
    };
  }, []);

  useEffect(() => {
    // Subscribe to favorites changes
    const handleFavoritesChange = (favorites: Set<string>) => {
      setFavoritesCount(favorites.size);
    };

    favoritesService.addListener(handleFavoritesChange);

    return () => {
      favoritesService.removeListener(handleFavoritesChange);
    };
  }, []);

  const handleThemePress = () => {
    const options = ["Light", "Dark", "Auto", "Cancel"];
    const currentIndex = ["light", "dark", "auto"].indexOf(settings.theme);

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: 3,
          title: "Choose Theme",
        },
        (buttonIndex) => {
          if (buttonIndex < 3) {
            const themes: ("light" | "dark" | "auto")[] = [
              "light",
              "dark",
              "auto",
            ];
            settingsService.setTheme(themes[buttonIndex]);
          }
        }
      );
    } else {
      Alert.alert("Choose Theme", "", [
        { text: "Light", onPress: () => settingsService.setTheme("light") },
        { text: "Dark", onPress: () => settingsService.setTheme("dark") },
        { text: "Auto", onPress: () => settingsService.setTheme("auto") },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const handleTimerPress = () => {
    const options = [
      ...DEFAULT_TIMER_OPTIONS.map((opt) => opt.label),
      "Cancel",
    ];
    const currentDuration = settings.defaultTimerDuration;
    const currentIndex = DEFAULT_TIMER_OPTIONS.findIndex(
      (opt) => opt.value === currentDuration
    );

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          title: "Default Timer Duration",
        },
        (buttonIndex) => {
          if (buttonIndex < DEFAULT_TIMER_OPTIONS.length) {
            settingsService.setDefaultTimerDuration(
              DEFAULT_TIMER_OPTIONS[buttonIndex].value
            );
          }
        }
      );
    } else {
      Alert.alert("Default Timer Duration", "", [
        ...DEFAULT_TIMER_OPTIONS.map((opt) => ({
          text: opt.label,
          onPress: () => settingsService.setDefaultTimerDuration(opt.value),
        })),
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const handleVolumeChange = (volume: number) => {
    settingsService.setMasterVolume(volume);
  };

  const handleNotificationsToggle = (value: boolean) => {
    settingsService.setNotifications(value);
  };

  const handleAutoPlayToggle = (value: boolean) => {
    settingsService.setAutoPlay(value);
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset Settings",
      "This will reset all settings to their default values. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            settingsService.resetSettings();
            Alert.alert(
              "Success",
              "Settings have been reset to default values"
            );
          },
        },
      ]
    );
  };

  const handleClearFavorites = () => {
    Alert.alert(
      "Clear Favorites",
      `This will remove all ${favoritesCount} favorite sounds. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            favoritesService.clearFavorites();
            Alert.alert("Success", "All favorites have been cleared");
          },
        },
      ]
    );
  };

  const handleExportSettings = () => {
    try {
      const settingsJson = settingsService.exportSettings();
      // In a real app, you might use share functionality or copy to clipboard
      Alert.alert(
        "Export Settings",
        "Settings exported successfully. You can save this data for backup.",
        [{ text: "OK" }]
      );
      console.log("Exported settings:", settingsJson);
    } catch (error) {
      Alert.alert("Error", "Failed to export settings");
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle: string,
    value: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode
  ) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress && !rightComponent}
    >
      <View style={styles.settingLeft}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={24}
          color="#6B73FF"
          style={styles.settingIcon}
        />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>{title}</Text>
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        </View>
      </View>
      <View style={styles.settingRight}>
        {rightComponent || (
          <>
            <Text style={styles.settingValue}>{value}</Text>
            {onPress && (
              <Ionicons name="chevron-forward" size={20} color="#BDC3C7" />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderVolumeSlider = () => (
    <View style={styles.settingItem}>
      <View style={styles.settingLeft}>
        <Ionicons
          name="volume-high-outline"
          size={24}
          color="#6B73FF"
          style={styles.settingIcon}
        />
        <View style={styles.settingText}>
          <Text style={styles.settingTitle}>Master Volume</Text>
          <Text style={styles.settingSubtitle}>Default volume level</Text>
        </View>
      </View>
      <View style={styles.volumeContainer}>
        <Text style={styles.volumeText}>
          {Math.round(settings.masterVolume * 100)}%
        </Text>
        <Slider
          style={styles.volumeSlider}
          minimumValue={0}
          maximumValue={1}
          value={settings.masterVolume}
          onValueChange={handleVolumeChange}
          minimumTrackTintColor="#6B73FF"
          maximumTrackTintColor="#E8E8E8"
        />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>
            Customize your MoodVibe experience
          </Text>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>

          {renderSettingItem(
            "color-palette-outline",
            "Theme",
            "App appearance",
            settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1),
            handleThemePress
          )}

          {renderSettingItem(
            "timer-outline",
            "Default Timer",
            "Default session duration",
            settingsService.getFormattedTimerDuration(),
            handleTimerPress
          )}

          {renderSettingItem(
            "play-outline",
            "Auto-play",
            "Start playing when mood is selected",
            "",
            undefined,
            <Switch
              value={settings.autoPlay}
              onValueChange={handleAutoPlayToggle}
              trackColor={{ false: "#E8E8E8", true: "#6B73FF" }}
              thumbColor="#FFFFFF"
            />
          )}

          {renderSettingItem(
            "notifications-outline",
            "Notifications",
            "App notifications",
            "",
            undefined,
            <Switch
              value={settings.notifications}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: "#E8E8E8", true: "#6B73FF" }}
              thumbColor="#FFFFFF"
            />
          )}

          {renderVolumeSlider()}
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data</Text>

          {renderSettingItem(
            "heart",
            "Favorites",
            `${favoritesCount} sounds favorited`,
            "",
            favoritesCount > 0 ? handleClearFavorites : undefined,
            favoritesCount > 0 ? (
              <TouchableOpacity onPress={handleClearFavorites}>
                <Text style={styles.clearButton}>Clear</Text>
              </TouchableOpacity>
            ) : undefined
          )}

          {renderSettingItem(
            "download-outline",
            "Export Settings",
            "Backup your preferences",
            "",
            handleExportSettings
          )}

          {renderSettingItem(
            "refresh-outline",
            "Reset Settings",
            "Restore default values",
            "",
            handleResetSettings
          )}
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          {renderSettingItem(
            "information-circle-outline",
            "Version",
            "App version",
            "1.0.0"
          )}

          {renderSettingItem("code-outline", "Build", "Build number", "2024.1")}

          {renderSettingItem(
            "star-outline",
            "Rate App",
            "Help us improve",
            "",
            () =>
              Alert.alert(
                "Coming Soon",
                "App Store rating will be available soon"
              )
          )}
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
  content: {
    padding: 20,
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
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 16,
    paddingLeft: 4,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 2,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2C3E50",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 14,
    color: "#7F8C8D",
    marginRight: 8,
  },
  volumeContainer: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 120,
  },
  volumeText: {
    fontSize: 14,
    color: "#7F8C8D",
    minWidth: 35,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
    marginLeft: 10,
  },
  clearButton: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "500",
  },
});

export default SettingsScreen;
