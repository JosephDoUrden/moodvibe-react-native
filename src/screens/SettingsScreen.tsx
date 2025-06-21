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
import { audioService } from "../services/AudioService";
import { UserPreferences, DEFAULT_TIMER_OPTIONS } from "../types";
import { useTheme } from "../contexts/ThemeContext";

const SettingsScreen: React.FC = () => {
  const { theme } = useTheme();
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

    // Load initial favorites count
    const loadFavoritesCount = async () => {
      const favorites = await favoritesService.getFavorites();
      setFavoritesCount(favorites.size);
    };
    loadFavoritesCount();

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
    const themes = ["Auto", "Light", "Dark"];
    const currentTheme = settings.theme;
    const currentIndex = themes.findIndex(
      (theme) => theme.toLowerCase() === currentTheme
    );

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [...themes, "Cancel"],
          cancelButtonIndex: themes.length,
          title: "Choose Theme",
          message: "Select your preferred app theme",
        },
        (buttonIndex) => {
          if (buttonIndex < themes.length) {
            settingsService.setTheme(themes[buttonIndex].toLowerCase() as any);
          }
        }
      );
    } else {
      Alert.alert("Choose Theme", "", [
        ...themes.map((theme) => ({
          text: theme,
          onPress: () => settingsService.setTheme(theme.toLowerCase() as any),
        })),
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const handleTimerPress = () => {
    const options = [
      ...DEFAULT_TIMER_OPTIONS.map((opt) => opt.label),
      "Cancel",
    ];

    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: options.length - 1,
          title: "Default Timer Duration",
          message: "Choose how long sessions should last by default",
        },
        (buttonIndex) => {
          if (buttonIndex < DEFAULT_TIMER_OPTIONS.length) {
            settingsService.setDefaultTimerDuration(
              DEFAULT_TIMER_OPTIONS[buttonIndex].value
            );
          }
        }
      );
    }
  };

  const handleVolumeChange = async (volume: number) => {
    try {
      await settingsService.setMasterVolume(volume);
      // Update audio service immediately
      await audioService.setVolume(volume);
    } catch (error) {
      console.error("Failed to update volume:", error);
    }
  };

  const handleNotificationsToggle = async (value: boolean) => {
    try {
      await settingsService.setNotifications(value);
    } catch (error) {
      console.error("Failed to update notifications:", error);
    }
  };

  const handleAutoPlayToggle = async (value: boolean) => {
    try {
      await settingsService.setAutoPlay(value);
    } catch (error) {
      console.error("Failed to update auto-play:", error);
    }
  };

  const handleResetSettings = () => {
    Alert.alert(
      "Reset All Settings",
      "This will reset all your preferences to default values. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await settingsService.resetSettings();
              Alert.alert(
                "Success",
                "All settings have been reset to default values"
              );
            } catch (error) {
              Alert.alert("Error", "Failed to reset settings");
            }
          },
        },
      ]
    );
  };

  const handleClearFavorites = () => {
    Alert.alert(
      "Clear All Favorites",
      `This will remove all ${favoritesCount} favorite sounds. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await favoritesService.clearFavorites();
              Alert.alert("Success", "All favorites have been cleared");
            } catch (error) {
              Alert.alert("Error", "Failed to clear favorites");
            }
          },
        },
      ]
    );
  };

  const handleExportSettings = async () => {
    try {
      const settingsData = await settingsService.exportSettings();
      // In a real app, you'd share this via the Share API
      Alert.alert(
        "Settings Exported",
        "Settings have been exported successfully",
        [{ text: "OK" }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to export settings");
    }
  };

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
        {title}
      </Text>
      <View style={[styles.sectionContent, { backgroundColor: theme.surface }]}>
        {children}
      </View>
    </View>
  );

  const renderSettingRow = (
    icon: string,
    title: string,
    subtitle: string,
    value?: string,
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    isLast?: boolean
  ) => (
    <TouchableOpacity
      style={[
        styles.settingRow,
        isLast && styles.settingRowLast,
        { borderBottomColor: theme.border },
      ]}
      onPress={onPress}
      disabled={!onPress && !rightComponent}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: theme.background }]}>
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={22}
          color={theme.primary}
        />
      </View>
      <View style={styles.settingContent}>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>
            {title}
          </Text>
          <Text
            style={[styles.settingSubtitle, { color: theme.textSecondary }]}
          >
            {subtitle}
          </Text>
        </View>
        <View style={styles.settingAction}>
          {rightComponent || (
            <>
              {value && (
                <Text
                  style={[styles.settingValue, { color: theme.textSecondary }]}
                >
                  {value}
                </Text>
              )}
              {onPress && (
                <Ionicons
                  name="chevron-forward-outline"
                  size={18}
                  color={theme.iconSecondary}
                />
              )}
            </>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderVolumeRow = () => (
    <View style={[styles.settingRow, styles.settingRowLast]}>
      <View style={[styles.settingIcon, { backgroundColor: theme.background }]}>
        <Ionicons name="volume-high-outline" size={22} color={theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>
            Master Volume
          </Text>
          <Text
            style={[styles.settingSubtitle, { color: theme.textSecondary }]}
          >
            Default volume level
          </Text>
        </View>
        <View style={styles.volumeControl}>
          <Text
            style={[styles.volumePercentage, { color: theme.textSecondary }]}
          >
            {Math.round(settings.masterVolume * 100)}%
          </Text>
          <Slider
            style={styles.volumeSlider}
            minimumValue={0}
            maximumValue={1}
            value={settings.masterVolume}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.border}
            thumbTintColor={theme.primary}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.background }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Settings
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Customize your MoodVibe experience
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Preferences Section */}
        {renderSection(
          "Preferences",
          <>
            {renderSettingRow(
              "moon-outline",
              "Appearance",
              "Choose your preferred theme",
              settings.theme.charAt(0).toUpperCase() + settings.theme.slice(1),
              handleThemePress
            )}
            {renderSettingRow(
              "timer-outline",
              "Default Timer",
              "Default session duration",
              settingsService.getFormattedTimerDuration(),
              handleTimerPress
            )}
            {renderSettingRow(
              "play-outline",
              "Auto-play",
              "Automatically start playing when mood is selected",
              undefined,
              undefined,
              <Switch
                value={settings.autoPlay}
                onValueChange={handleAutoPlayToggle}
                trackColor={{ false: "#E5E5EA", true: "#34C759" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E5EA"
              />
            )}
            {renderSettingRow(
              "notifications-outline",
              "Notifications",
              "Receive app notifications and reminders",
              undefined,
              undefined,
              <Switch
                value={settings.notifications}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: "#E5E5EA", true: "#34C759" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E5E5EA"
              />,
              true
            )}
          </>
        )}

        {/* Audio Section */}
        {renderSection("Audio", <>{renderVolumeRow()}</>)}

        {/* Data Section */}
        {renderSection(
          "Data & Storage",
          <>
            {renderSettingRow(
              "heart-outline",
              "Favorites",
              `${favoritesCount} sounds marked as favorite`,
              undefined,
              favoritesCount > 0 ? handleClearFavorites : undefined
            )}
            {renderSettingRow(
              "download-outline",
              "Export Settings",
              "Create a backup of your preferences",
              undefined,
              handleExportSettings,
              undefined,
              true
            )}
          </>
        )}

        {/* Danger Zone */}
        {renderSection(
          "Reset",
          <>
            {renderSettingRow(
              "refresh-outline",
              "Reset All Settings",
              "Restore all preferences to default values",
              undefined,
              handleResetSettings,
              undefined,
              true
            )}
          </>
        )}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: theme.textSecondary }]}>
            MoodVibe v1.0.0
          </Text>
          <Text style={[styles.appInfoSubtext, { color: theme.textTertiary }]}>
            Built with ♥ for mindful moments
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 10 : 40,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 17,
    lineHeight: 22,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 35,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "400",
    textTransform: "uppercase",
    letterSpacing: -0.08,
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingText: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: "400",
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  settingAction: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    fontSize: 17,
    marginRight: 8,
  },
  volumeControl: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 140,
  },
  volumePercentage: {
    fontSize: 17,
    minWidth: 40,
    textAlign: "right",
    marginRight: 12,
  },
  volumeSlider: {
    flex: 1,
    height: 40,
  },
  appInfo: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 10,
  },
  appInfoText: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  appInfoSubtext: {
    fontSize: 13,
  },
});

export default SettingsScreen;
