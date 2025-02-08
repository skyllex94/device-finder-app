import { useEffect } from "react";
import {
  Vibration,
  Modal,
  View,
  TouchableOpacity,
  Text,
  Switch,
} from "react-native";
import { useDeviceStore } from "../store/deviceStore";
import { useSettingsStore } from "../store/settingsStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";

const VIBRATION_PATTERN = [500, 200, 500]; // vibrate, pause, vibrate (in ms)
const STORAGE_KEY = "vibration_enabled";
const DISTANCE_STORAGE_KEY = "vibration_distance";
const DEFAULT_DISTANCE = 0.5;
const BACKGROUND_VIBRATION_TASK = "background-vibration-task";

const DISTANCE_PRESETS = {
  close: 0.5, // in meters
  medium: 1,
  far: 3,
};

TaskManager.defineTask(BACKGROUND_VIBRATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }

  try {
    const vibrationEnabled = await VibrationManager.isVibrationEnabled();
    const deviceId = await AsyncStorage.getItem("tracked_device_id");
    const storedDistance = await AsyncStorage.getItem(DISTANCE_STORAGE_KEY);
    const threshold = storedDistance
      ? parseFloat(storedDistance)
      : DEFAULT_DISTANCE;

    if (!vibrationEnabled || !deviceId) return;

    const devices = useDeviceStore.getState().devices;
    const targetDevice = devices.find((d) => d.id === deviceId);

    if (targetDevice?.distance && targetDevice.distance <= threshold) {
      Vibration.vibrate(VIBRATION_PATTERN);
    }
  } catch (error) {
    console.error("Background vibration task error:", error);
  }
});

export function useProximityVibration(deviceId: string | null) {
  useEffect(() => {
    if (deviceId) {
      AsyncStorage.setItem("tracked_device_id", deviceId);
      VibrationManager.isVibrationEnabled().then((enabled) => {
        if (enabled) {
          VibrationManager.startBackgroundLocation();
        }
      });
    }

    return () => {
      AsyncStorage.removeItem("tracked_device_id");
      VibrationManager.stopBackgroundLocation();
    };
  }, [deviceId]);
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
    const currentState = await this.isVibrationEnabled();
    const newState = !currentState;
    await AsyncStorage.setItem(STORAGE_KEY, newState.toString());

    if (newState) {
      await this.startBackgroundLocation();
    } else {
      await this.stopBackgroundLocation();
    }

    return newState;
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

  async startBackgroundLocation() {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Background location permission denied");
      return false;
    }

    await Location.startLocationUpdatesAsync(BACKGROUND_VIBRATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 1000,
      distanceInterval: 0,
      foregroundService: {
        notificationTitle: "Proximity Alert Active",
        notificationBody: "Monitoring device distance",
        notificationColor: "#2563eb",
      },
    });

    return true;
  },

  async stopBackgroundLocation() {
    if (
      await Location.hasStartedLocationUpdatesAsync(BACKGROUND_VIBRATION_TASK)
    ) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_VIBRATION_TASK);
    }
  },
};

export const formatDistance = (meters: number, unit: string) => {
  if (unit === "automatic" || unit === "feet") {
    return `${(meters * 3.28084).toFixed(1)} ft`;
  }
  return `${meters.toFixed(1)} m`;
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
              <View className="items-start mb-2">
                <Text
                  className={`text-sm font-medium mb-1.5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Receive proximity vibration
                </Text>
              </View>

              {Object.entries(DISTANCE_PRESETS).map(([key, value]) => (
                <TouchableOpacity
                  key={key}
                  onPress={() =>
                    handleDistanceSelect(key as keyof typeof DISTANCE_PRESETS)
                  }
                  className={`px-4 py-3 rounded-lg mb-2 flex-row items-center justify-between ${
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
                      Under {formatDistance(value, distanceUnit)}
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
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={toggleVibration}
      className={`py-1.5 px-3 rounded-lg mb-1.5 flex-row items-center justify-between ${
        isDarkMode ? "bg-gray-700" : "bg-gray-100"
      }`}
    >
      <View className="flex-row items-center">
        <MaterialCommunityIcons
          name="vibrate"
          size={20}
          color={isDarkMode ? "white" : "black"}
        />

        <Text className={`ml-2 ${isDarkMode ? "text-white" : "text-black"}`}>
          Vibration
        </Text>
      </View>
      <Switch
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#2563eb" : "#f4f3f4"}
        onValueChange={toggleVibration}
        value={isEnabled}
      />
    </TouchableOpacity>
  );
}
