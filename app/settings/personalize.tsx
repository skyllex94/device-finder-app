import { View, Text, Switch, TouchableOpacity } from "react-native";
import React from "react";
import { useThemeStore } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettingsStore } from "@/store/settingsStore";

export default function PersonalizeSettings() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const router = useRouter();
  const { distanceUnit, setDistanceUnit } = useSettingsStore();

  return (
    <View className="px-4 pt-4">
      {/* Personalize Section */}
      <View className="mb-4">
        <Text className="text-gray-500 text-sm mb-2">Personalize</Text>
        <View
          className={`rounded-lg overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <View
            className={`flex-row items-center justify-between px-4 py-3 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-300"
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons
                name={isDarkMode ? "moon-outline" : "sunny-outline"}
                size={20}
                color={isDarkMode ? "#fff" : "#000"}
              />
              <Text
                className={`ml-3 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Dark Mode
              </Text>
            </View>
            <Switch
              style={{ transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }] }}
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: "#767577" }}
              thumbColor={isDarkMode ? "#ffffff" : "#f4f3f4"}
            />
          </View>

          <View
            className={`flex-row items-center justify-between p-4 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-300"
            }`}
          >
            <View className="flex-row items-center">
              <Ionicons
                name="crop-outline"
                size={20}
                color={isDarkMode ? "#fff" : "#000"}
              />
              <Text
                className={`ml-3 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Distance Unit
              </Text>
            </View>
            <View className="flex-row space-x-2">
              {(["automatic", "meters", "feet"] as const).map((unit) => (
                <TouchableOpacity
                  key={unit}
                  onPress={() => setDistanceUnit(unit)}
                  className={`px-3 mx-0.5 py-1.5 rounded-full ${
                    distanceUnit === unit
                      ? isDarkMode
                        ? "bg-blue-500"
                        : "bg-blue-600"
                      : isDarkMode
                      ? "bg-gray-700"
                      : "bg-gray-200"
                  }`}
                >
                  <Text
                    className={`capitalize ${
                      distanceUnit === unit ? "text-white" : "text-gray-400"
                    }`}
                  >
                    {unit}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center">
              <Ionicons
                name="trash-outline"
                size={20}
                color={isDarkMode ? "#fff" : "#000"}
              />
              <Text
                className={`ml-3 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Clear All Data
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#9CA3AF" : "#4B5563"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
