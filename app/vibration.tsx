import { useEffect } from "react";
import {
  Vibration,
  Modal,
  View,
  TouchableOpacity,
  Text,
  Switch,
  TextInput,
} from "react-native";
import { useDeviceStore } from "../store/deviceStore";
import { useSettingsStore } from "../store/settingsStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

const VIBRATION_PATTERN = [500, 200, 500]; // vibrate, pause, vibrate (in ms)
const STORAGE_KEY = "vibration_enabled";
const DISTANCE_STORAGE_KEY = "vibration_distance";
const DEFAULT_DISTANCE = 0.5;

const DISTANCE_PRESETS = {
  close: 0.3, // in meters
  medium: 1,
  far: 3,
};

export function useProximityVibration(deviceId: string | null) {
  const devices = useDeviceStore((state) => state.devices);

  useEffect(() => {
    let lastVibrationTime = 0;
    const VIBRATION_COOLDOWN = 3000; // 3 seconds

    const checkProximity = async () => {
      try {
        const vibrationEnabled = await AsyncStorage.getItem(STORAGE_KEY);
        const storedDistance = await AsyncStorage.getItem(DISTANCE_STORAGE_KEY);
        const threshold = storedDistance
          ? parseFloat(storedDistance)
          : DEFAULT_DISTANCE;

        if (vibrationEnabled !== "true" || !deviceId) return;

        const targetDevice = devices.find((d) => d.id === deviceId);
        if (!targetDevice?.distance) return;

        console.log("Current distance:", targetDevice.distance); // Debug log

        const currentTime = Date.now();
        const shouldVibrate =
          targetDevice.distance <= threshold &&
          currentTime - lastVibrationTime > VIBRATION_COOLDOWN;

        console.log("Should vibrate:", shouldVibrate); // Debug log

        if (shouldVibrate) {
          console.log("Triggering vibration"); // Debug log
          Vibration.vibrate(VIBRATION_PATTERN);
          lastVibrationTime = currentTime;
        }
      } catch (error) {
        console.error("Proximity check error:", error);
      }
    };

    const interval = setInterval(checkProximity, 1000);

    return () => {
      clearInterval(interval);
      Vibration.cancel(); // Stop any ongoing vibration
    };
  }, [deviceId, devices]);
}

// Helper functions to manage vibration state
export const VibrationManager = {
  async enableVibration() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "true");
      console.log("Vibration enabled"); // Debug log
    } catch (error) {
      console.error("Error enabling vibration:", error);
    }
  },

  async disableVibration() {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "false");
      console.log("Vibration disabled"); // Debug log
    } catch (error) {
      console.error("Error disabling vibration:", error);
    }
  },

  async isVibrationEnabled() {
    try {
      const enabled = (await AsyncStorage.getItem(STORAGE_KEY)) === "true";
      console.log("Vibration status:", enabled); // Debug log
      return enabled;
    } catch (error) {
      console.error("Error checking vibration status:", error);
      return false;
    }
  },

  async toggleVibration() {
    try {
      const currentState = await this.isVibrationEnabled();
      const newState = !currentState;
      await AsyncStorage.setItem(STORAGE_KEY, newState.toString());
      console.log("Vibration toggled to:", newState); // Debug log
      return newState;
    } catch (error) {
      console.error("Error toggling vibration:", error);
      return false;
    }
  },

  async setVibrationDistance(distance: number) {
    try {
      await AsyncStorage.setItem(DISTANCE_STORAGE_KEY, distance.toString());
      console.log("Vibration distance set to:", distance);
    } catch (error) {
      console.error("Error setting vibration distance:", error);
    }
  },

  async getVibrationDistance() {
    try {
      const distance = await AsyncStorage.getItem(DISTANCE_STORAGE_KEY);
      return distance ? parseFloat(distance) : DEFAULT_DISTANCE;
    } catch (error) {
      console.error("Error getting vibration distance:", error);
      return DEFAULT_DISTANCE;
    }
  },
};

export function VibrationModal({
  isVisible,
  onClose,
  isDarkMode,
}: {
  isVisible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}) {
  const [selectedDistance, setSelectedDistance] =
    useState<keyof typeof DISTANCE_PRESETS>("medium");
  const { distanceUnit } = useSettingsStore();

  useEffect(() => {
    VibrationManager.getVibrationDistance().then((distance) => {
      // Find closest preset
      const closest = Object.entries(DISTANCE_PRESETS).reduce(
        (prev, [key, value]) => {
          return Math.abs(value - distance) <
            Math.abs(
              DISTANCE_PRESETS[prev as keyof typeof DISTANCE_PRESETS] - distance
            )
            ? (key as keyof typeof DISTANCE_PRESETS)
            : prev;
        },
        "medium" as keyof typeof DISTANCE_PRESETS
      );
      setSelectedDistance(closest);
    });
  }, []);

  const handleDistanceSelect = async (
    preset: keyof typeof DISTANCE_PRESETS
  ) => {
    setSelectedDistance(preset);
    await VibrationManager.setVibrationDistance(DISTANCE_PRESETS[preset]);
  };

  const formatDistance = (meters: number) => {
    if (distanceUnit === "imperial") {
      return `${(meters * 3.28084).toFixed(1)} ft`;
    }
    return `${meters.toFixed(1)} m`;
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose}>
        <View className="flex-1 justify-end">
          <View
            className={`mx-4 mb-4 rounded-2xl border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <View className="p-4">
              <View className="items-center mb-6">
                <View className="w-12 h-1 rounded-full bg-gray-300 mb-4" />
                <Text
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  Alert Distance
                </Text>
              </View>

              {Object.entries(DISTANCE_PRESETS).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() =>
                    handleDistanceSelect(key as keyof typeof DISTANCE_PRESETS)
                  }
                  className={`p-4 rounded-lg mb-2 flex-row items-center justify-between ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-100"
                  } ${
                    selectedDistance === key ? "border-2 border-blue-500" : ""
                  }`}
                >
                  <View>
                    <Text
                      className={`font-semibold ${
                        isDarkMode ? "text-white" : "text-black"
                      }`}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)} Range
                    </Text>
                    <Text
                      className={`${
                        isDarkMode ? "text-white/70" : "text-black/70"
                      }`}
                    >
                      Under {formatDistance(value)}
                    </Text>
                  </View>
                  {selectedDistance === key && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#3b82f6"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// Update SettingsModal component to include switch
export function SettingsVibrationOption({
  isDarkMode,
  onPress,
}: {
  isDarkMode: boolean;
  onPress: () => void;
}) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    VibrationManager.isVibrationEnabled().then(setIsEnabled);
  }, []);

  const toggleVibration = async () => {
    const newState = await VibrationManager.toggleVibration();
    setIsEnabled(newState);
    if (newState) {
      onPress(); // Open distance settings when enabling
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleVibration}
      className={`p-4 rounded-lg mb-2 flex-row items-center justify-between ${
        isDarkMode ? "bg-gray-700" : "bg-gray-100"
      }`}
    >
      <View className="flex-row items-center">
        <Ionicons
          name="radio-outline"
          size={24}
          color={isDarkMode ? "white" : "black"}
        />
        <Text className={`ml-3 ${isDarkMode ? "text-white" : "text-black"}`}>
          Vibration Alerts
        </Text>
      </View>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#2563eb" : "#f4f3f4"}
        onValueChange={toggleVibration}
        value={isEnabled}
      />
    </TouchableOpacity>
  );
}
