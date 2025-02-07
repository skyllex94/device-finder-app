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
  withTiming,
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
        const strength = Math.max(
          0,
          Math.min(1, 1 - targetDevice.distance / 20)
        );
        setSignalStrength(strength);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [targetDevice]);

  const outerPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withSpring(1 + signalStrength * 0.3),
              withSpring(1 + signalStrength * 0.5),
              withSpring(1 + signalStrength * 0.4)
            ),
            -1,
            true
          ),
        },
      ],
      opacity: withTiming(0.6 + signalStrength * 0.4),
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

  const middlePulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withSpring(1 + signalStrength * 0.2),
              withSpring(1 + signalStrength * 0.4),
              withSpring(1 + signalStrength * 0.3)
            ),
            -1,
            true
          ),
        },
      ],
      opacity: withTiming(0.7 + signalStrength * 0.3),
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

  const innerPulseStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withSpring(1 + signalStrength * 0.1),
              withSpring(1 + signalStrength * 0.3),
              withSpring(1 + signalStrength * 0.2)
            ),
            -1,
            true
          ),
        },
      ],
      opacity: withTiming(0.8 + signalStrength * 0.2),
      backgroundColor: interpolateColor(
        signalStrength,
        [0, 0.3, 0.6, 1],
        [
          "rgba(59, 130, 246, 0.3)",
          "rgba(147, 51, 234, 0.4)",
          "rgba(239, 68, 68, 0.5)",
          "rgba(239, 68, 68, 0.6)",
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
    const rssi = -100 + signalStrength * 60;
    return `${Math.round(rssi)} dBm`;
  };

  return (
    <View
      className={`flex-1 items-center justify-center ${
        isDarkMode ? "bg-black" : "bg-white"
      }`}
    >
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 right-4 z-10 bg-white/20 p-3 rounded-full"
      >
        <Ionicons
          name="close"
          size={24}
          color={isDarkMode ? "white" : "black"}
        />
      </TouchableOpacity>

      <Text
        className={`absolute top-8 text-xl font-bold ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        {getSignalText()}
      </Text>

      <View className="flex-1 items-center justify-center">
        <Animated.View
          style={[
            {
              width: width * 0.6,
              height: width * 0.6,
              borderRadius: width * 0.3,
              position: "absolute",
            },
            outerPulseStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: width * 0.4,
              height: width * 0.4,
              borderRadius: width * 0.2,
              position: "absolute",
            },
            middlePulseStyle,
          ]}
        />
        <Animated.View
          style={[
            {
              width: width * 0.2,
              height: width * 0.2,
              borderRadius: width * 0.1,
              position: "absolute",
            },
            innerPulseStyle,
          ]}
        />

        {/* <Text
          className={`text-3xl font-bold mb-1 ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          {Math.round(signalStrength * 100)}%
        </Text> */}

        {/* Device Information Card */}
        <View
          className={`absolute bottom-8 w-[85%] p-4 rounded-2xl ${
            isDarkMode
              ? "bg-white/10 border border-white/20"
              : "bg-black/5 border border-black/10"
          }`}
        >
          <Text
            className={`text-lg font-semibold mb-2 ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            Device Details
          </Text>

          <View className="space-y-2">
            {targetDevice && (
              <>
                <View className="flex-row justify-between">
                  <Text
                    className={`${
                      isDarkMode ? "text-white/70" : "text-black/70"
                    }`}
                  >
                    Name
                  </Text>
                  <Text
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}
                  >
                    {targetDevice.name}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text
                    className={`${
                      isDarkMode ? "text-white/70" : "text-black/70"
                    }`}
                  >
                    Signal Strength
                  </Text>
                  <Text
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}
                  >
                    {getSignalLabel()}
                  </Text>
                </View>

                <View className="flex-row justify-between">
                  <Text
                    className={`${
                      isDarkMode ? "text-white/70" : "text-black/70"
                    }`}
                  >
                    Last Updated
                  </Text>
                  <Text
                    className={`font-medium ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}
                  >
                    {new Date(targetDevice.lastSeen).toLocaleTimeString()}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    </View>
  );
}
