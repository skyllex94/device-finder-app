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
  const [isEnabled, setIsEnabled] = useState(false);
  const [distance, setDistance] = useState("0.5");
  const { distanceUnit } = useSettingsStore();

  useEffect(() => {
    VibrationManager.isVibrationEnabled().then(setIsEnabled);
    VibrationManager.getVibrationDistance().then((d) =>
      setDistance(d.toString())
    );
  }, []);

  const toggleSwitch = async () => {
    const newState = await VibrationManager.toggleVibration();
    setIsEnabled(newState);
  };

  const handleDistanceChange = async (value: string) => {
    const numValue = parseFloat(value) || DEFAULT_DISTANCE;
    setDistance(value);
    await VibrationManager.setVibrationDistance(numValue);
  };

  const getUnitLabel = () => {
    return distanceUnit === "imperial" ? "ft" : "m";
  };

  const getConvertedDistance = () => {
    const meters = parseFloat(distance);
    return distanceUnit === "imperial"
      ? (meters * 3.28084).toFixed(1)
      : meters.toFixed(1);
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View
          className={`w-[80%] p-6 rounded-2xl ${
            isDarkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <View className="flex-row justify-between items-center mb-4">
            <Text
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-black"
              }`}
            >
              Proximity Alert
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons
                name="close"
                size={24}
                color={isDarkMode ? "white" : "black"}
              />
            </TouchableOpacity>
          </View>

          <Text
            className={`mb-4 ${isDarkMode ? "text-white/70" : "text-black/70"}`}
          >
            Vibrate when device is within {getConvertedDistance()}{" "}
            {getUnitLabel()}
          </Text>

          <View className="mb-4">
            <Text
              className={`mb-2 ${
                isDarkMode ? "text-white/70" : "text-black/70"
              }`}
            >
              Alert Distance ({getUnitLabel()})
            </Text>
            <TextInput
              className={`p-2 rounded-lg border ${
                isDarkMode
                  ? "border-white/20 text-white bg-gray-700"
                  : "border-gray-300 text-black bg-gray-100"
              }`}
              value={getConvertedDistance()}
              onChangeText={(value) => {
                const meters =
                  distanceUnit === "imperial"
                    ? parseFloat(value) / 3.28084
                    : parseFloat(value);
                handleDistanceChange(meters.toString());
              }}
              keyboardType="numeric"
              placeholder="Enter distance"
              placeholderTextColor={isDarkMode ? "#9ca3af" : "#6b7280"}
            />
          </View>

          <View className="flex-row justify-between items-center">
            <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>
              {isEnabled ? "On" : "Off"}
            </Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#2563eb" : "#f4f3f4"}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
