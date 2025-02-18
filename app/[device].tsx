import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Modal,
  Linking,
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
  withSequence,
  runOnJS,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { useDeviceStore } from "../store/deviceStore";
import { useSettingsStore } from "../store/settingsStore";
import { useProximityVibration, VibrationModal } from "./alerts/vibration";
import { SettingsVibrationOption } from "./alerts/vibration";
import {
  NotificationOption,
  useProximityNotifications,
} from "./alerts/notifications";
import useRevenueCat from "@/hooks/useRevenueCat";
import * as StoreReview from "expo-store-review";

function SettingsModal({
  isVisible,
  onClose,
  isDarkMode,
  onVibrationPress,
  activeDevice,
}: {
  isVisible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  onVibrationPress: () => void;
  activeDevice: any;
}) {
  const router = useRouter();
  const { isProMember } = useRevenueCat();

  const handleNavigation = (path: `/${string}`) => {
    if (!isProMember) {
      onClose();
      setTimeout(() => {
        router.push("/paywall");
      }, 100);
      return;
    }

    onClose();
    setTimeout(() => {
      router.push(path);
    }, 100);
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
            className={`mx-4 mb-6 rounded-2xl border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-300 border-gray-400"
            }`}
          >
            <View className="p-3">
              {/* Navigation Group */}
              <View className="mb-2">
                <Text
                  className={`text-xs font-medium mb-1.5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Navigation
                </Text>
                <TouchableOpacity
                  onPress={() => handleNavigation(`/map?id=${activeDevice.id}`)}
                  className={`p-3.5 rounded-lg mb-1.5 flex-row items-center justify-between ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="map-outline"
                      size={20}
                      color={isDarkMode ? "white" : "black"}
                    />
                    <Text
                      className={`ml-2.5 ${
                        isDarkMode ? "text-white" : "text-black"
                      }`}
                    >
                      Map View
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {!isProMember && (
                      <Ionicons
                        name="lock-closed"
                        size={16}
                        color={isDarkMode ? "#9CA3AF" : "#4B5563"}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={isDarkMode ? "white" : "black"}
                    />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    handleNavigation(`/heatmap?id=${activeDevice.id}`)
                  }
                  className={`p-3.5 rounded-lg mb-1.5 flex-row items-center justify-between ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-200"
                  }`}
                >
                  <View className="flex-row items-center">
                    <Ionicons
                      name="radio-outline"
                      size={20}
                      color={isDarkMode ? "white" : "black"}
                    />
                    <Text
                      className={`ml-2.5 ${
                        isDarkMode ? "text-white" : "text-black"
                      }`}
                    >
                      Signal Heatmap
                    </Text>
                  </View>
                  <View className="flex-row items-center">
                    {!isProMember && (
                      <Ionicons
                        name="lock-closed"
                        size={16}
                        color={isDarkMode ? "#9CA3AF" : "#4B5563"}
                        style={{ marginRight: 4 }}
                      />
                    )}
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color={isDarkMode ? "white" : "black"}
                    />
                  </View>
                </TouchableOpacity>
              </View>

              {/* Background Alerts Group */}
              <View>
                <Text
                  className={`text-xs font-medium mb-1.5 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Background Alerts
                </Text>
                <SettingsVibrationOption
                  isDarkMode={isDarkMode}
                  onPress={onVibrationPress}
                  onClose={onClose}
                />
                <NotificationOption isDarkMode={isDarkMode} onClose={onClose} />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

export default function DeviceTracker() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const { width } = useWindowDimensions();
  const { device: deviceId } = useLocalSearchParams();
  const { distanceUnit } = useSettingsStore();

  const setActiveDevice = useDeviceStore((state) => state.setActiveDevice);
  const activeDevice = useDeviceStore((state) => state.getActiveDevice());

  const [isFound, setIsFound] = useState(false);
  const checkScale = useSharedValue(0);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showVibrationModal, setShowVibrationModal] = useState(false);

  useEffect(() => {
    if (deviceId) {
      setActiveDevice(deviceId as string);
    }
    return () => setActiveDevice("");
  }, [deviceId]);

  // Initialize vibration monitoring
  useProximityVibration(deviceId as string);

  // Add notification monitoring
  useProximityNotifications(deviceId as string);

  // Calculate percentage based on distance
  const calculatePercentage = (dist: number) => {
    if (dist <= 0) return 100;
    if (dist >= 20) return 0;
    return Math.round((1 - dist / 20) * 100);
  };

  const percentage = calculatePercentage(activeDevice?.roundedDistance || 0);
  const ringSize = width * 0.7;
  const outerRingSize = width * 0.9;
  const centerCircleSize = ringSize * 0.4;
  const ripples = [0, 1, 2, 3, 4, 5, 6];

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

  // Slower radar line rotation
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 6000, // Increased from 4000 to 6000 ms
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const radarLineStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  // Slower ripple animations
  const createRipple = (index: number) => {
    const rippleScale = useSharedValue(1);
    const rippleOpacity = useSharedValue(0.6);

    useEffect(() => {
      const delay = index * 800; // Increased from 600 to 800 ms
      setTimeout(() => {
        rippleScale.value = withRepeat(
          withTiming(outerRingSize / centerCircleSize, {
            duration: 5600, // Increased from 4200 to 5600 ms
            easing: Easing.linear,
          }),
          -1,
          false
        );
        rippleOpacity.value = withRepeat(
          withTiming(0, {
            duration: 5600, // Matched with scale duration
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

  // Calculate dynamic center circle size
  const getCircleSize = (percent: number) => {
    const minSize = centerCircleSize; // Original size at 100%
    const maxSize = outerRingSize * 0.95; // Almost full size of outer ring
    const scale = 1 + ((100 - percent) / 100) * (maxSize / minSize - 1);
    return centerCircleSize * scale;
  };

  const dynamicCircleSize = getCircleSize(percentage);
  const circleScale = useSharedValue(1);

  // Animate circle size changes
  useEffect(() => {
    circleScale.value = withSpring(dynamicCircleSize / centerCircleSize, {
      damping: 15,
      stiffness: 90,
    });
  }, [percentage]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleScale.value }],
  }));

  const handleDeviceFound = () => {
    setIsFound(true);
    // Smoother circle expansion
    circleScale.value = withSpring(outerRingSize / centerCircleSize, {
      damping: 12,
      stiffness: 80,
      mass: 1,
    });

    // Enhanced check mark animation
    checkScale.value = withSequence(
      withSpring(1.2, {
        damping: 12,
        stiffness: 100,
      }),
      withSpring(1, {
        damping: 10,
        stiffness: 100,
      }),
      withDelay(
        1000,
        withTiming(
          0,
          {
            duration: 400,
            easing: Easing.inOut(Easing.ease),
          },
          () => {
            runOnJS(router.back)();
          }
        )
      )
    );

    setTimeout(() => {
      rateApp();
    }, 3000);
  };

  const rateApp = async () => {
    try {
      if (await StoreReview.hasAction()) {
        StoreReview.requestReview();
      } else {
        const url = `https://apps.apple.com/app/id6741714865`;

        Linking.openURL(url);
      }
    } catch (error) {
      console.error("Error requesting app review:", error);
    }
  };

  const checkStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: checkScale.value },
      { translateY: 1 * checkScale.value },
    ],
    opacity: checkScale.value,
  }));

  const formatDistance = (meters: number): string => {
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

  if (!activeDevice) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Device not found</Text>
      </View>
    );
  }

  return (
    <View
      className={`flex-1 ${isDarkMode ? "bg-black" : "bg-gray-200"}`}
      style={{ paddingTop: 60 }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 mb-6">
        <View className="flex-row items-center flex-1">
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

        <TouchableOpacity
          className="p-2"
          onPress={() => setShowSettingsModal(true)}
        >
          <Ionicons
            name="menu-outline"
            size={24}
            color={isDarkMode ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>

      <View className="flex-1 mb-24 items-center justify-center">
        <View
          style={{
            width: outerRingSize,
            height: outerRingSize,
            position: "relative",
          }}
        >
          {/* Center Circle - moved to back */}
          <Animated.View
            className="absolute bg-blue-500 rounded-full"
            style={[
              {
                width: centerCircleSize,
                height: centerCircleSize,
                top: (outerRingSize - centerCircleSize) / 2,
                left: (outerRingSize - centerCircleSize) / 2,
                zIndex: 1,
              },
              circleStyle,
            ]}
          />

          {/* Ripple Effects */}
          {ripples.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                {
                  position: "absolute",
                  width: centerCircleSize,
                  height: centerCircleSize,
                  borderRadius: centerCircleSize / 2,
                  borderWidth: 1,
                  borderColor: "#60A5FA",
                  top: (outerRingSize - centerCircleSize) / 2,
                  left: (outerRingSize - centerCircleSize) / 2,
                  zIndex: 2, // Above center circle, below rings
                },
                rippleStyles[index],
              ]}
            />
          ))}

          {/* Outer Ring */}
          <View
            className={`absolute w-full h-full rounded-full border-8 ${
              isDarkMode ? "border-gray-800/50" : "border-gray-400/50"
            }`}
            style={{ zIndex: 3 }} // Above ripples
          />

          {/* Inner Ring */}
          <View
            style={{
              position: "absolute",
              width: ringSize,
              height: ringSize,
              top: (outerRingSize - ringSize) / 2,
              left: (outerRingSize - ringSize) / 2,
              zIndex: 3, // Same as outer ring
            }}
          >
            <View
              className={`absolute w-full h-full rounded-full border-8 ${
                isDarkMode ? "border-gray-800" : "border-gray-500/80"
              }`}
            />
          </View>

          {/* Text Layer - stays on top */}
          {!isFound && (
            <View
              className="absolute items-center justify-center"
              style={{
                width: centerCircleSize,
                height: centerCircleSize,
                top: (outerRingSize - centerCircleSize) / 2,
                left: (outerRingSize - centerCircleSize) / 2,
                zIndex: 4,
              }}
            >
              <Text className="text-4xl font-bold text-white">
                {percentage}%
              </Text>
              <Text className="text-white mt-1">
                {formatDistance(activeDevice?.distance || 0)}
              </Text>
            </View>
          )}

          {/* Radar Line */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: outerRingSize / 2,
                height: 2,
                backgroundColor: isDarkMode ? "#4B5563" : "#9CA3AF",
                top: "50%",
                left: "50%",
                transformOrigin: "left",
              },
              radarLineStyle,
            ]}
          />

          {/* Progress Ring */}
          <Animated.View
            style={[
              {
                position: "absolute",
                width: ringSize,
                height: ringSize,
                top: (outerRingSize - ringSize) / 2,
                left: (outerRingSize - ringSize) / 2,
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
          {percentage >= 95
            ? "You're right next to the device!"
            : percentage >= 80
            ? "Device is in close proximity"
            : percentage >= 20
            ? "Searched device is is range"
            : "Device barely in range"}
        </Text>
      </View>

      {/* Success Check Mark - centered in circle */}
      <Animated.View
        style={[checkStyle]}
        className="absolute top-6 z-20 w-full h-full items-center justify-center"
      >
        <Ionicons name="checkmark-circle" size={110} color="white" />
      </Animated.View>

      {/* Found Device Button */}
      <View className="absolute bottom-10 w-full items-center">
        <TouchableOpacity
          onPress={handleDeviceFound}
          className="bg-blue-500 w-[85%] py-4 rounded-full items-center"
        >
          <Text className="text-white text-lg font-semibold">Found Device</Text>
        </TouchableOpacity>
      </View>

      <SettingsModal
        isVisible={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        isDarkMode={isDarkMode}
        onVibrationPress={() => {
          setShowSettingsModal(false);
          setShowVibrationModal(true);
        }}
        activeDevice={activeDevice}
      />

      <VibrationModal
        isVisible={showVibrationModal}
        onClose={() => setShowVibrationModal(false)}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}
