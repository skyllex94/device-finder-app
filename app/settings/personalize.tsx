import { View, Text, Switch, TouchableOpacity, Modal } from "react-native";
import React, { useState } from "react";
import { useThemeStore } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSettingsStore } from "@/store/settingsStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDeviceStore } from "@/store/deviceStore";

export default function PersonalizeSettings() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const router = useRouter();
  const { distanceUnit, setDistanceUnit } = useSettingsStore();
  const [showClearModal, setShowClearModal] = useState(false);

  const handleClearData = async () => {
    try {
      // Get all keys from AsyncStorage
      const keys = await AsyncStorage.getAllKeys();

      // Filter out 'isFirstOpen' from the keys to be removed
      const keysToRemove = keys.filter((key) => key !== "isFirstOpen");

      // Remove all keys except 'isFirstOpen'
      await AsyncStorage.multiRemove(keysToRemove);

      // Reset all stores to their initial state
      useDeviceStore.getState().reset();
      useSettingsStore.getState().reset();

      setShowClearModal(false);
      router.replace("/");
    } catch (error) {
      console.error("Error clearing data:", error);
    }
  };

  const ClearDataModal = () => (
    <Modal
      visible={showClearModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowClearModal(false)}
    >
      <TouchableOpacity
        className="flex-1 bg-black/50"
        activeOpacity={1}
        onPress={() => setShowClearModal(false)}
      >
        <View className="flex-1 items-center justify-center px-4">
          <View
            className={`w-[85%] rounded-2xl p-6 ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <View className="items-center mb-4">
              <View
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
              >
                <Ionicons name="trash-outline" size={30} color="#ef4444" />
              </View>
              <Text
                className={`text-xl font-bold mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Clear All Data
              </Text>
              <Text
                className={`text-center ${
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Are you sure you want to clear all app data? This action cannot
                be undone.
              </Text>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={handleClearData}
                className={`flex-1 py-3 rounded-lg  mr-2 ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <Text className="text-center font-semibold text-red-500">
                  Clear
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowClearModal(false)}
                className={`flex-1 py-3 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-100"
                }`}
              >
                <Text
                  className={`text-center font-semibold ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

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

          <TouchableOpacity
            onPress={() => setShowClearModal(true)}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="trash-outline"
                size={20}
                color={isDarkMode ? "white" : "black"}
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

      <ClearDataModal />
    </View>
  );
}
