import { useSettingsStore } from "@/store/settingsStore";
import { Platform } from "react-native";

const { distanceUnit } = useSettingsStore();

export const formatDistance = (meters: number): string => {
  if (distanceUnit === "feet") {
    const feet = meters * 3.28084;
    return feet < 1000
      ? `${feet.toFixed(1)}ft`
      : `${(feet / 5280).toFixed(2)}mi`;
  }
  if (distanceUnit === "meters") {
    return meters < 1000
      ? `${meters.toFixed(1)}m`
      : `${(meters / 1000).toFixed(2)}km`;
  }
  // automatic - use system locale
  if (Platform.OS === "ios") {
    const feet = meters * 3.28084;
    return feet < 1000
      ? `${feet.toFixed(1)}ft`
      : `${(feet / 5280).toFixed(2)}mi`;
  }
  return meters < 1000
    ? `${meters.toFixed(1)}m`
    : `${(meters / 1000).toFixed(2)}km`;
};
