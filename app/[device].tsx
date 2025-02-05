import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "../components/Themed";
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  withTiming,
  withRepeat,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { useDeviceStore } from "../store/deviceStore";
import { interpolate, Extrapolate } from "react-native-reanimated";

export default function DeviceTracker() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { width } = useWindowDimensions();
  const { device: deviceId } = useLocalSearchParams();

  const setActiveDevice = useDeviceStore((state) => state.setActiveDevice);
  const activeDevice = useDeviceStore((state) => state.getActiveDevice());

  useEffect(() => {
    if (deviceId) {
      setActiveDevice(deviceId as string);
    }
    return () => setActiveDevice("");
  }, [deviceId]);

  // Calculate percentage based on distance
  const calculatePercentage = (dist: number) => {
    if (dist <= 0) return 100;
    if (dist >= 20) return 0;
    return Math.round((1 - dist / 20) * 100);
  };

  const percentage = calculatePercentage(activeDevice?.roundedDistance || 0);
  const ringSize = width * 0.7;
  const ringProgress = useSharedValue(0);

  useEffect(() => {
    ringProgress.value = withSpring(percentage / 100, {
      damping: 15,
      stiffness: 90,
    });
  }, [percentage]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringProgress.value }],
  }));

  // Rotating radar line animation
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 4000, // 4 seconds per rotation
        easing: Easing.linear,
      }),
      -1, // infinite repeats
      false
    );
  }, []);

  const radarLineStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Ripple animations
  const ripples = [0, 1, 2, 3];
  const createRipple = (index: number) => {
    const rippleScale = useSharedValue(0.6);
    const rippleOpacity = useSharedValue(0.6);

    useEffect(() => {
      const delay = index * 1000; // Stagger ripples
      setTimeout(() => {
        rippleScale.value = withRepeat(
          withTiming(1, {
            duration: 4000,
            easing: Easing.linear,
          }),
          -1,
          false
        );
        rippleOpacity.value = withRepeat(
          withTiming(0, {
            duration: 4000,
            easing: Easing.linear,
          }),
          -1,
          false
        );
      }, delay);
    }, []);

    return useAnimatedStyle(() => ({
      transform: [{ scale: rippleScale.value }],
      opacity: rippleOpacity.value,
    }));
  };

  const rippleStyles = ripples.map(createRipple);

  return (
    <View
      className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}
      style={{ paddingTop: 60 }}
    >
      <View className="flex-row items-center px-4 mb-6">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text
          className={`text-xl font-semibold ml-2 ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          {activeDevice?.name || "Device"}
        </Text>
      </View>

      <View className="flex-1 items-center justify-center">
        <View
          style={{
            width: ringSize,
            height: ringSize,
            position: "relative",
          }}
        >
          {/* Background Ring */}
          <View
            className={`absolute w-full h-full rounded-full border-8 ${
              isDarkMode ? "border-gray-800" : "border-gray-200"
            }`}
          />

          {/* Ripple Effects */}
          {ripples.map((_, index) => (
            <Animated.View
              key={index}
              className="absolute w-full h-full rounded-full border border-blue-400"
              style={[
                {
                  transform: [{ scale: 1 }],
                },
                rippleStyles[index],
              ]}
            />
          ))}

          {/* Radar Line */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: "50%",
                height: 2,
                backgroundColor: isDarkMode ? "#4B5563" : "#9CA3AF",
                top: "50%",
                left: "50%",
                transformOrigin: "left",
              },
              radarLineStyle,
            ]}
          />

          {/* Center Circle with Data */}
          <View className="absolute w-40 h-40 rounded-full bg-blue-500 left-1/2 top-1/2 -ml-20 -mt-20 items-center justify-center">
            <Text className="text-4xl font-bold text-white">{percentage}%</Text>
            <Text className="text-white mt-1">
              {activeDevice?.roundedDistance?.toFixed(2) || "0.00"}m
            </Text>
          </View>

          {/* Progress Ring */}
          <Animated.View
            style={[
              {
                width: "100%",
                height: "100%",
                position: "absolute",
              },
              ringStyle,
            ]}
          >
            <LinearGradient
              colors={["#3B82F6", "#2563EB"]}
              className="w-full h-full rounded-full border-8 border-transparent"
            />
          </Animated.View>
        </View>

        <Text
          className={`mt-8 text-lg ${
            isDarkMode ? "text-gray-400" : "text-gray-600"
          }`}
        >
          {percentage === 100
            ? "You're right next to the device!"
            : percentage === 0
            ? "Device is out of range"
            : "Getting closer..."}
        </Text>
      </View>
    </View>
  );
}
