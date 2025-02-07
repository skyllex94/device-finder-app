import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDeviceStore } from "../../store/deviceStore";
import { useSettingsStore } from "../../store/settingsStore";
import { Platform, Switch, Text, TouchableOpacity, View } from "react-native";

import { Ionicons } from "@expo/vector-icons";
import * as TaskManager from "expo-task-manager";
import { formatDistance } from "../vibration"; // Import the shared function

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

    if (newState) {
      const permissionGranted = await this.requestPermissions();
      if (!permissionGranted) {
        return false;
      }
      // Start background location when enabling notifications
      await this.startBackgroundLocation();
    } else {
      // Stop background location when disabling notifications
      await this.stopBackgroundLocation();
    }

    await AsyncStorage.setItem(NOTIFICATION_STORAGE_KEY, newState.toString());
    return newState;
  },

  async updateNotification(title: string, body: string) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: null,
        identifier: NOTIFICATION_ID,
      });
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  },

  async removeNotification() {
    await Notifications.dismissNotificationAsync(NOTIFICATION_ID);
  },

  async startBackgroundLocation() {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Background location permission denied");
      return false;
    }

    await Location.startLocationUpdatesAsync("background-location-task", {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 1000,
      distanceInterval: 0,
      foregroundService: {
        notificationTitle: "Location Tracking Active",
        notificationBody: "Monitoring device proximity",
        notificationColor: "#2563eb",
      },
    });

    return true;
  },

  async stopBackgroundLocation() {
    if (
      await Location.hasStartedLocationUpdatesAsync("background-location-task")
    ) {
      await Location.stopLocationUpdatesAsync("background-location-task");
    }
  },
};

// Define the background task
TaskManager.defineTask("background-location-task", async ({ data, error }) => {
  if (error) {
    console.error(error);
    return;
  }

  try {
    const notificationsEnabled =
      await NotificationManager.isNotificationsEnabled();
    if (!notificationsEnabled) return;

    const deviceId = await AsyncStorage.getItem("tracked_device_id");
    if (!deviceId) return;

    const devices = useDeviceStore.getState().devices;
    const targetDevice = devices.find((d) => d.id === deviceId);
    const distanceUnit = useSettingsStore.getState().distanceUnit;

    if (
      targetDevice?.distance &&
      targetDevice.distance <= NOTIFICATION_DISTANCE
    ) {
      const distanceDisplay =
        distanceUnit === "feet" || "automatic"
          ? `${(targetDevice.distance * 3.28084).toFixed(1)} ft`
          : `${targetDevice.distance.toFixed(1)} meters`;

      await NotificationManager.updateNotification(
        "Device Nearby",
        `${targetDevice.name} is ${distanceDisplay} away`
      );
    }
  } catch (error) {
    console.error("Background task error:", error);
  }
});

export function useProximityNotifications(deviceId: string | null) {
  const devices = useDeviceStore((state) => state.devices);
  const { distanceUnit } = useSettingsStore();

  // useEffect(() => {
  //   const checkProximity = async () => {
  //     try {
  //       const notificationsEnabled =
  //         await NotificationManager.isNotificationsEnabled();
  //       if (!notificationsEnabled || !deviceId) return;

  //       const targetDevice = devices.find((d) => d.id === deviceId);
  //       if (!targetDevice?.distance) return;

  //       const isInRange = targetDevice.distance <= NOTIFICATION_DISTANCE;

  //       if (isInRange) {
  //         await Notifications.scheduleNotificationAsync({
  //           content: {
  //             title: "Device Nearby FORE",
  //             body: `${targetDevice.name} is ${formatDistance(
  //               targetDevice.distance,
  //               distanceUnit
  //             )} away`,
  //           },
  //           trigger: null,
  //           identifier: NOTIFICATION_ID,
  //         });
  //       }
  //     } catch (error) {
  //       console.error("Notification check error:", error);
  //     }
  //   };

  //   const interval = setInterval(checkProximity, 3000);

  //   return () => {
  //     clearInterval(interval);
  //   };
  // }, [deviceId, devices, distanceUnit]);
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
      className={`py-1.5 px-3 rounded-lg mb-2 flex-row items-center justify-between ${
        isDarkMode ? "bg-gray-700" : "bg-gray-100"
      }`}
    >
      <View className="flex-row items-center">
        <Ionicons
          name="notifications-outline"
          size={20}
          color={isDarkMode ? "white" : "black"}
        />

        <Text className={`ml-2 ${isDarkMode ? "text-white" : "text-black"}`}>
          Notifications
        </Text>
      </View>

      <Switch
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={isEnabled ? "#2563eb" : "#f4f3f4"}
        onValueChange={toggleNotifications}
        value={isEnabled}
      />
    </TouchableOpacity>
  );
}
