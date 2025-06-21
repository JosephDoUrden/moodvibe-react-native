import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

// Screens
import MoodSelectionScreen from "./src/screens/MoodSelectionScreen";
import SoundPlayerScreen from "./src/screens/SoundPlayerScreen";
import SoundLibraryScreen from "./src/screens/SoundLibraryScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import MixCreatorScreen from "./src/screens/MixCreatorScreen";

// Contexts
import { ThemeProvider, useTheme } from "./src/contexts/ThemeContext";

// Types
import { RootStackParamList } from "./src/types";

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "SoundLibrary") {
            iconName = focused ? "library" : "library-outline";
          } else if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          } else {
            iconName = "help-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.icon,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          paddingBottom: 25,
          paddingTop: 8,
          height: 85,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={MoodSelectionScreen}
        options={{ tabBarLabel: "Moods" }}
      />
      <Tab.Screen
        name="SoundLibrary"
        component={SoundLibraryScreen}
        options={{ tabBarLabel: "Library" }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarLabel: "Settings" }}
      />
    </Tab.Navigator>
  );
};

const AppContent = () => {
  const { isDark } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        <Stack.Screen name="MoodSelection" component={MainTabNavigator} />
        <Stack.Screen
          name="SoundPlayer"
          component={SoundPlayerScreen}
          options={{
            gestureDirection: "vertical",
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateY: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.height, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        />
        <Stack.Screen
          name="MixCreator"
          component={MixCreatorScreen}
          options={{
            gestureDirection: "vertical",
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateY: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.height, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
