import { View, TouchableOpacity, Text, Dimensions } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { useDeviceStore } from "../store/deviceStore";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  interpolateColor,
} from "react-native-reanimated";
import { useThemeStore } from "../components/Themed";

export default function HeatmapScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { isDarkMode } = useThemeStore();
  const [signalStrength, setSignalStrength] = useState(0);
  const devices = useDeviceStore((state) => state.devices);
  const targetDevice = devices.find((d) => d.id === id);
  const { width } = Dimensions.get("window");

  useEffect(() => {
    const interval = setInterval(() => {
      if (targetDevice?.distance) {
        // Convert distance to signal strength (0-1)
        const strength = Math.max(
          0,
          Math.min(1, 1 - targetDevice.distance / 20)
        );
        setSignalStrength(strength);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [targetDevice]);

  const pulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withSpring(1 + signalStrength * 0.3),
              withSpring(1 + signalStrength * 0.5)
            ),
            -1,
            true
          ),
        },
      ],
      backgroundColor: interpolateColor(
        signalStrength,
        [0, 0.3, 0.6, 1],
        [
          "rgba(59, 130, 246, 0.1)",
          "rgba(147, 51, 234, 0.2)",
          "rgba(239, 68, 68, 0.3)",
          "rgba(239, 68, 68, 0.4)",
        ]
      ),
    };
  });

  const innerPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withSpring(1 + signalStrength * 0.2),
              withSpring(1 + signalStrength * 0.4)
            ),
            -1,
            true
          ),
        },
      ],
      backgroundColor: interpolateColor(
        signalStrength,
        [0, 0.3, 0.6, 1],
        [
          "rgba(59, 130, 246, 0.2)",
          "rgba(147, 51, 234, 0.3)",
          "rgba(239, 68, 68, 0.4)",
          "rgba(239, 68, 68, 0.5)",
        ]
      ),
    };
  });

  const getSignalText = () => {
    if (signalStrength > 0.8) return "Very Strong Signal";
    if (signalStrength > 0.6) return "Strong Signal";
    if (signalStrength > 0.4) return "Moderate Signal";
    if (signalStrength > 0.2) return "Weak Signal";
    return "Very Weak Signal";
  };

  const getSignalLabel = () => {
    const rssi = -100 + signalStrength * 60; // Convert to approximate RSSI (-100 to -40)
    return `${Math.round(rssi)} dBm`;
  };

  return (
    <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 right-4 z-10 bg-white/20 p-3 rounded-full"
      >
        <Ionicons
          name="close"
          size={24}
          color={isDarkMode ? "white" : "black"}
        />
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center">
        <Animated.View
          style={[
            {
              width: width * 0.7,
              height: width * 0.7,
              borderRadius: width * 0.35,
              position: "absolute",
            },
            pulseStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: width * 0.5,
              height: width * 0.5,
              borderRadius: width * 0.25,
              position: "absolute",
            },
            innerPulseStyle,
          ]}
        />

        <Text
          className={`text-2xl font-bold mb-4 ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          {getSignalText()}
        </Text>

        <Text
          className={`text-4xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          {Math.round(signalStrength * 100)}%
        </Text>

        <Text
          className={`text-xl ${
            isDarkMode ? "text-white/70" : "text-black/70"
          }`}
        >
          {getSignalLabel()}
        </Text>

        {targetDevice?.distance && (
          <Text
            className={`mt-4 ${isDarkMode ? "text-white/70" : "text-black/70"}`}
          >
            Distance: {targetDevice.distance.toFixed(1)}m
          </Text>
        )}
      </View>
    </View>
  );
}
