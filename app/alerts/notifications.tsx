import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDeviceStore } from "../../store/deviceStore";
import { useSettingsStore } from "../../store/settingsStore";
import { Platform, Switch, Text, TouchableOpacity } from "react-native";
import { View } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";

const NOTIFICATION_STORAGE_KEY = "notifications_enabled";
const NOTIFICATION_DISTANCE = 1; // 1 meter trigger distance
const NOTIFICATION_ID = "proximity-notification";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const NotificationManager = {
  async requestPermissions() {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  },

  async enableNotifications() {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, "true");
  },

  async disableNotifications() {
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, "false");
  },

  async isNotificationsEnabled() {
    return (await AsyncStorage.getItem(NOTIFICATION_STORAGE_KEY)) === "true";
  },

  async toggleNotifications() {
    const currentState = await this.isNotificationsEnabled();
    const newState = !currentState;
    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, newState.toString());

    if (newState) {
      const permissionGranted = await this.requestPermissions();
      if (!permissionGranted) {
        await this.disableNotifications();
        return false;
      }
    }

    return newState;
  },

  async updateNotification(title: string, body: string) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null,
      identifier: NOTIFICATION_ID,
    });
  },

  async removeNotification() {
    await Notifications.dismissNotificationAsync(NOTIFICATION_ID);
  },
};

export function useProximityNotifications(deviceId: string | null) {
  const devices = useDeviceStore((state) => state.devices);
  const { distanceUnit } = useSettingsStore();

  useEffect(() => {
    const checkProximity = async () => {
      try {
        const notificationsEnabled =
          await NotificationManager.isNotificationsEnabled();
        if (!notificationsEnabled || !deviceId) return;

        const targetDevice = devices.find((d) => d.id === deviceId);
        if (!targetDevice?.distance) return;

        const isInRange = targetDevice.distance <= NOTIFICATION_DISTANCE;

        if (isInRange) {
          const distanceDisplay =
            distanceUnit === "imperial"
              ? `${(targetDevice.distance * 3.28084).toFixed(1)} feet`
              : `${targetDevice.distance.toFixed(1)} meters`;

          await NotificationManager.updateNotification(
            "Device Nearby",
            `${targetDevice.name} is ${distanceDisplay} away`
          );
        }
      } catch (error) {
        console.error("Notification check error:", error);
      }
    };

    const interval = setInterval(checkProximity, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [deviceId, devices, distanceUnit]);
}

export function NotificationOption({ isDarkMode }: { isDarkMode: boolean }) {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    NotificationManager.isNotificationsEnabled().then(setIsEnabled);
  }, []);

  const toggleNotifications = async () => {
    const newState = await NotificationManager.toggleNotifications();
    setIsEnabled(newState);
  };

  return (
    <TouchableOpacity
      onPress={toggleNotifications}
      className={`p-4 rounded-lg mb-2 flex-row items-center justify-between ${
        isDarkMode ? "bg-gray-700" : "bg-gray-100"
      }`}
    >
      <View className="flex-row items-center">
        <Ionicons
          name="notifications-outline"
          size={24}
          color={isDarkMode ? "white" : "black"}
        />
        <Text className={`ml-3 ${isDarkMode ? "text-white" : "text-black"}`}>
          Proximity Notifications
        </Text>
      </View>
      <Switch
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#2563eb" : "#f4f3f4"}
        onValueChange={toggleNotifications}
        value={isEnabled}
      />
    </TouchableOpacity>
  );
}
