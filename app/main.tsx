import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
  Platform,
  Linking,
  Alert,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { Feather, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useThemeStore } from "../components/Themed";
import { LinearGradient } from "expo-linear-gradient";

import * as Location from "expo-location";
import { BleManager } from "react-native-ble-plx";
import Animated, {
  withRepeat,
  withTiming,
  useAnimatedStyle,
  useSharedValue,
  Easing,
} from "react-native-reanimated";
import { useDeviceStore } from "../store/deviceStore";
import { useSettingsStore } from "../store/settingsStore";

interface Device {
  id: string;
  name: string;
  rssi: number;
  lastSeen: Date;
  distance?: number;
  roundedDistance?: number;
  previousDistance?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  rssiHistory: number[];
  kalmanState?: {
    estimate: number;
    errorEstimate: number;
  };
  isFiltered?: boolean;
  lastUIUpdate?: number;
}

interface SavedDevice {
  id: string;
  name: string;
  originalName: string; // Store original device name
}

const PulsingRing = React.memo(({ delay }: { delay: number }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  scale.value = withRepeat(
    withTiming(3, {
      duration: 2000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
    -1,
    false
  );

  opacity.value = withRepeat(
    withTiming(0, {
      duration: 2000,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }),
    -1,
    false
  );

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[ringStyle]} className="absolute">
      <LinearGradient
        colors={["rgba(96, 165, 250, 0.5)", "rgba(96, 165, 250, 0)"]}
        style={{
          width: 100,
          height: 100,
          borderRadius: 50,
          padding: 2,
        }}
      >
        <View className="w-full h-full rounded-full bg-transparent" />
      </LinearGradient>
    </Animated.View>
  );
});

const RadarSweep = React.memo(() => {
  const rotation = useSharedValue(0);

  rotation.value = withRepeat(
    withTiming(360, {
      duration: 3000,
      easing: Easing.linear,
    }),
    -1,
    false
  );

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={[sweepStyle]} className="absolute w-72 h-72">
      <LinearGradient
        colors={["rgba(59, 130, 246, 0.3)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: "50%",
          height: "50%",
          borderTopLeftRadius: 144,
        }}
      />
    </Animated.View>
  );
});

const PulsingRings = React.memo(() => {
  const rings = [1, 2, 3, 4];
  return (
    <View className="items-center justify-center">
      {rings.map((ring) => (
        <PulsingRing key={ring} delay={ring * 500} />
      ))}
      <View className="absolute z-10">
        <LinearGradient
          colors={["#60A5FA", "#3B82F6"]}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
          }}
        >
          <Feather
            className="absolute top-[25%] left-[25%] z-12 opacity-55"
            name="bluetooth"
            size={38}
            color="black"
          />
        </LinearGradient>
      </View>
      <RadarSweep />
    </View>
  );
});

const ModalContent = React.memo(() => {
  const { isDarkMode } = useThemeStore();

  return (
    <View className="flex-1 items-center justify-center">
      <View className="absolute w-full h-full items-center justify-center">
        <PulsingRings />
      </View>
      <Text
        className={`absolute bottom-4 text-lg font-semibold ${
          isDarkMode ? "text-white" : "text-black"
        }`}
      >
        Searching...
      </Text>
    </View>
  );
});

const SearchModal = React.memo(
  ({
    isVisible,
    onClose,
    isDarkMode,
    height,
  }: {
    isVisible: boolean;
    onClose: () => void;
    isDarkMode: boolean;
    height: number;
  }) => (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
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
            style={{ height: height * 0.4 }}
          >
            <ModalContent />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
);

const HelpModal = React.memo(
  ({
    visible,
    onClose,
    isDarkMode,
  }: {
    visible: boolean;
    onClose: () => void;
    isDarkMode: boolean;
  }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose}>
        <View className="flex-1 justify-end">
          <View
            className={`mx-4 mb-6 rounded-2xl border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-100 border-gray-400"
            }`}
          >
            <View className="p-6">
              <View className="items-center mb-4">
                <Text
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  Troubleshooting Tips
                </Text>
              </View>

              <ScrollView className="max-h-96">
                <Text
                  className={`mb-4 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  If you're having trouble finding your device, here are some
                  things to check:
                </Text>

                <View className="space-y-3">
                  <Text
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    • Make sure Bluetooth is enabled on your device
                  </Text>
                  <Text
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    • Check that both Bluetooth and Location permissions are
                    enabled in{" "}
                    <Text
                      onPress={() => Linking.openSettings()}
                      className="text-blue-500 underline"
                    >
                      app settings
                    </Text>
                  </Text>
                  <Text
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    • Ensure the device is within range (usually 30-60 feet)
                  </Text>
                  <Text
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    • Check if the device's battery is not depleted
                  </Text>
                  <Text
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    • Some devices may need to be in pairing mode to be
                    discovered
                  </Text>
                  <Text
                    className={`${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    • Try moving to a different location as walls and
                    interference can affect signal strength
                  </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  )
);

export default function MainScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [otherDevices, setOtherDevices] = useState<Device[]>([]);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [isSearching, setIsSearching] = useState(false);

  const [currentLocation, setCurrentLocation] =
    useState<Location.LocationObject | null>(null);
  const [savedDevices, setSavedDevices] = useState<SavedDevice[]>([]);
  const [isAddingDevice, setIsAddingDevice] = useState(false);

  const [isFilteringDevices, setIsFilteringDevices] = useState(false);
  const { distanceUnit } = useSettingsStore();

  const [bluetoothReady, setBluetoothReady] = useState(false);
  const bleManager = React.useMemo(() => new BleManager(), []);

  const [locationPermissionGranted, setLocationPermissionGranted] =
    useState(false);

  // Refined Kalman Filter parameters for better accuracy
  const KF = {
    R: 0.08, // Reduced measurement noise
    Q: 0.12, // Slightly increased process noise for better adaptability
    A: 1, // State transition
    H: 1, // Observation
    P: 1, // Initial estimate error
  };

  // Enhanced RSSI to distance conversion
  const calculateRawDistance = (rssi: number) => {
    // Improved environmental factors
    const n = 2.2; // Path loss exponent (2.0-2.5 for free space)
    const rssi1Meter = -59; // Calibrated RSSI at 1 meter (device specific)

    // Apply environmental correction
    const environmentalFactor = 0.8; // Adjust based on environment (0.8-1.2)

    // Calculate base distance
    const distance = Math.pow(10, (rssi1Meter - rssi) / (10 * n));

    // Apply correction
    return distance * environmentalFactor;
  };

  // Advanced moving average with weighted recent values
  const smoothRSSI = (history: number[], newRSSI: number) => {
    const windowSize = 8; // Increased window size
    const weights = [0.4, 0.25, 0.15, 0.08, 0.05, 0.03, 0.02, 0.02]; // Weights sum to 1

    const newHistory = [...history, newRSSI].slice(-windowSize);
    const weightedSum = newHistory.reduce((sum, value, index) => {
      const weight = weights[newHistory.length - 1 - index] || 0;
      return sum + value * weight;
    }, 0);

    return {
      average: weightedSum,
      history: newHistory,
    };
  };

  // Kalman filter for distance
  const kalmanFilter = (
    measurement: number,
    previousState?: Device["kalmanState"]
  ) => {
    if (!previousState) {
      return {
        estimate: measurement,
        errorEstimate: KF.P,
      };
    }

    // Predict
    const predictedEstimate = KF.A * previousState.estimate;
    const predictedErrorEstimate =
      KF.A * previousState.errorEstimate * KF.A + KF.Q;

    // Update
    const kalmanGain =
      (predictedErrorEstimate * KF.H) /
      (KF.H * predictedErrorEstimate * KF.H + KF.R);

    const estimate =
      predictedEstimate + kalmanGain * (measurement - KF.H * predictedEstimate);

    const errorEstimate = (1 - kalmanGain * KF.H) * predictedErrorEstimate;

    return { estimate, errorEstimate };
  };

  // Enhanced distance calculation with multi-stage filtering
  const calculateStableDistance = (rssi: number, device: Device) => {
    // Stage 1: Smooth RSSI with weighted moving average
    const { average: smoothedRSSI, history: newHistory } = smoothRSSI(
      device.rssiHistory || [],
      rssi
    );

    // Stage 2: Calculate raw distance with environmental factors
    const rawDistance = calculateRawDistance(smoothedRSSI);

    // Stage 3: Apply Kalman filter for final smoothing
    const kalmanState = kalmanFilter(rawDistance, device.kalmanState);

    // Stage 4: Apply confidence-based adjustment
    const confidence = calculateConfidence(device.rssiHistory || []);
    const adjustedDistance = adjustDistanceWithConfidence(
      kalmanState.estimate,
      confidence
    );

    return {
      distance: adjustedDistance,
      rssiHistory: newHistory,
      kalmanState,
    };
  };

  // Calculate confidence based on signal stability
  const calculateConfidence = (rssiHistory: number[]) => {
    if (rssiHistory.length < 2) return 0.5;

    // Calculate variance in RSSI readings
    const mean = rssiHistory.reduce((a, b) => a + b, 0) / rssiHistory.length;
    const variance =
      rssiHistory.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      rssiHistory.length;

    // Convert variance to confidence (0-1)
    const confidence = Math.max(0, Math.min(1, 1 - variance / 100));
    return confidence;
  };

  // Adjust distance based on confidence
  const adjustDistanceWithConfidence = (
    distance: number,
    confidence: number
  ) => {
    // Apply less aggressive adjustments when confidence is high
    const adjustment = 1 + (1 - confidence) * 0.2;
    return distance * adjustment;
  };

  // Add this function near your other calculation functions
  const calculateDeviceLocation = (
    currentLocation: Location.LocationObject | null,
    distance: number
  ) => {
    if (!currentLocation) return undefined;

    // Calculate a position based on distance and a random angle
    const angle = Math.random() * 2 * Math.PI; // Random angle in radians
    const R = 6371000; // Earth's radius in meters

    const lat1 = currentLocation.coords.latitude * (Math.PI / 180);
    const lon1 = currentLocation.coords.longitude * (Math.PI / 180);

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distance / R) +
        Math.cos(lat1) * Math.sin(distance / R) * Math.cos(angle)
    );

    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(angle) * Math.sin(distance / R) * Math.cos(lat1),
        Math.cos(distance / R) - Math.sin(lat1) * Math.sin(lat2)
      );

    return {
      latitude: lat2 * (180 / Math.PI),
      longitude: lon2 * (180 / Math.PI),
    };
  };

  // Add this useEffect for initial permission requests
  useEffect(() => {
    const requestInitialPermissions = async () => {
      const permissionsGranted = await requestPermissions();
      if (!permissionsGranted) {
        // Optionally show an alert or handle permission denial
        Alert.alert(
          "Permissions Required",
          "AccuFind needs Bluetooth and Location permissions to find nearby devices.",
          [
            {
              text: "Open Settings",
              onPress: () => Linking.openSettings(),
            },
            { text: "Cancel", style: "cancel" },
          ]
        );
      }
    };

    requestInitialPermissions();
  }, []);

  // Add this useEffect for Bluetooth state monitoring
  useEffect(() => {
    const subscription = bleManager.onStateChange((state) => {
      if (state === "PoweredOn") {
        setBluetoothReady(true);
      } else {
        setBluetoothReady(false);
      }
    }, true); // true = emitCurrentState

    return () => subscription.remove();
  }, [bleManager]);

  // Add this utility function near your other utility functions
  const shouldUpdateUI = (device: Device): boolean => {
    const now = Date.now();
    const lastUpdate = device.lastUIUpdate || 0;
    return now - lastUpdate >= 2000; // 2000ms = 2 seconds
  };

  // Modify the scanning useEffect to include UI update throttling
  useEffect(() => {
    let scanningInterval: NodeJS.Timeout;

    const startScanning = async () => {
      if (!bluetoothReady) {
        console.log("Bluetooth not ready yet");
        return;
      }

      try {
        bleManager.startDeviceScan(
          null,
          { allowDuplicates: true },
          async (error, device) => {
            if (error) {
              console.error("Scan error:", error);
              return;
            }

            if (device && device.name) {
              try {
                setOtherDevices((prevDevices) => {
                  const existingDeviceIndex = prevDevices.findIndex(
                    (d) => d.id === device.id
                  );

                  const now = Date.now();

                  if (existingDeviceIndex !== -1) {
                    // Update existing device
                    const existingDevice = prevDevices[existingDeviceIndex];

                    // Calculate new values but only update UI if enough time has passed
                    const { distance, rssiHistory, kalmanState } =
                      calculateStableDistance(
                        device.rssi || -100,
                        existingDevice
                      );
                    const roundedDistance = roundToQuarter(distance);

                    const shouldUpdate = shouldUpdateUI(existingDevice);

                    const updatedDevices = [...prevDevices];
                    updatedDevices[existingDeviceIndex] = {
                      ...existingDevice,
                      rssi: shouldUpdate
                        ? device.rssi || 0
                        : existingDevice.rssi,
                      previousDistance: shouldUpdate
                        ? existingDevice.distance
                        : existingDevice.previousDistance,
                      distance: shouldUpdate
                        ? distance
                        : existingDevice.distance,
                      roundedDistance: shouldUpdate
                        ? roundedDistance
                        : existingDevice.roundedDistance,
                      rssiHistory,
                      kalmanState,
                      lastSeen: new Date(),
                      lastUIUpdate: shouldUpdate
                        ? now
                        : existingDevice.lastUIUpdate,
                    };

                    setTimeout(() => {
                      useDeviceStore.getState().updateDevices(updatedDevices);
                    }, 0);

                    return updatedDevices;
                  }

                  // Add new device
                  const { distance, rssiHistory, kalmanState } =
                    calculateStableDistance(device.rssi || -100, {
                      rssiHistory: [],
                    } as any);

                  const newDevice: Device = {
                    id: device.id,
                    name: device.name || "Unknown Device",
                    rssi: device.rssi || 0,
                    lastSeen: new Date(),
                    distance,
                    rssiHistory,
                    kalmanState,
                    lastUIUpdate: now,
                  };

                  return [...prevDevices, newDevice];
                });
              } catch (error) {
                console.error("Error processing device:", error);
              }
            }
          }
        );

        // Clean up old devices periodically
        scanningInterval = setInterval(async () => {
          if (locationPermissionGranted) {
            try {
              await getCurrentLocation();
            } catch (error) {
              console.log("Location update failed during cleanup");
            }
          }

          setOtherDevices((prevDevices) =>
            prevDevices.filter(
              (device) => Date.now() - device.lastSeen.getTime() < 30000
            )
          );
        }, 10000);
      } catch (error) {
        console.error("Error starting scan:", error);
      }
    };

    if (bluetoothReady) {
      startScanning();
    }

    return () => {
      clearInterval(scanningInterval);
      bleManager.stopDeviceScan();
    };
  }, [bluetoothReady, locationPermissionGranted]);

  // Remove the old scanning logic from handleStartSearch
  const handleStartSearch = useCallback(() => {
    setIsSearching(true);
    setOtherDevices([]); // Clear the list

    // Auto-close after 5 seconds
    setTimeout(() => {
      setIsSearching(false);
    }, 5000);
  }, []);

  const handleReset = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/onboarding");
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };

  // Modify the permission request to update state
  const requestPermissions = async () => {
    try {
      // Location permission is required for Bluetooth scanning on Android
      if (Platform.OS === "android") {
        const locationStatus =
          await Location.requestForegroundPermissionsAsync();
        setLocationPermissionGranted(locationStatus.status === "granted");
        if (locationStatus.status !== "granted") {
          return false;
        }
      } else {
        setLocationPermissionGranted(true); // On iOS, we don't need location for basic scanning
      }

      // Request Bluetooth permissions
      if (Platform.OS === "ios") {
        const state = await bleManager.state();
        if (state === "PoweredOff") {
          Alert.alert(
            "Bluetooth Required",
            "Please enable Bluetooth to find nearby devices.",
            [
              {
                text: "Open Settings",
                onPress: () => Linking.openSettings(),
              },
              { text: "Cancel", style: "cancel" },
            ]
          );
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation(location);
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const getDistanceIndicator = (device: Device) => {
    if (!device.distance || !device.previousDistance) return null;

    const difference = device.distance - device.previousDistance;
    if (Math.abs(difference) < 0.3) return "●"; // Stable
    return difference > 0 ? "↑" : "↓"; // Moving away or getting closer
  };

  const getDistanceColor = (device: Device) => {
    if (!device.distance || !device.previousDistance) return "text-gray-400";

    const difference = device.distance - device.previousDistance;
    if (Math.abs(difference) < 0.3) return "text-gray-400"; // Stable
    return difference > 0 ? "text-red-500" : "text-green-500"; // Red for away, green for closer
  };

  const roundToQuarter = (value: number): number => {
    return Number((Math.round(value * 4) / 4).toFixed(2));
  };

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

  const renderDeviceItem = (device: Device) => (
    <TouchableOpacity
      key={device.id}
      onPress={() =>
        router.push({
          pathname: "/[device]",
          params: {
            device: device.id,
          },
        })
      }
      className={`flex-row items-center p-4 rounded-lg mb-2 mx-4 ${
        isDarkMode ? "bg-gray-800" : "bg-gray-100"
      }`}
    >
      <View className="flex-1">
        <Text
          className={`font-semibold text-lg ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          {device.name}
        </Text>
        <Text
          className={`text-sm ${
            isDarkMode ? "text-gray-400" : "text-gray-700"
          }`}
        >
          Signal: {device.rssi} dBm
        </Text>
        {device.distance && (
          <View className="flex-row items-center space-x-2">
            <Text
              className={`text-sm ${
                isDarkMode ? "text-gray-400" : "text-gray-700"
              } ${getDistanceColor(device)}`}
            >
              Distance: {formatDistance(device.distance)}{" "}
              {getDistanceIndicator(device)}
            </Text>
            {/* <Text className="text-xs text-gray-400">
              {" "}
              {device.lastSeen && `Updating Now`}
            </Text> */}
          </View>
        )}
      </View>
      <View className="items-end w-12">
        <Ionicons
          name="chevron-forward"
          size={24}
          color={isDarkMode ? "#9CA3AF" : "#4B5563"}
        />
        {device.distance && device.distance < 2 && (
          <Text
            className={`absolute top-6 w-full text-xs ${
              isDarkMode ? "text-green-500" : "text-green-900"
            } mt-1`}
          >
            Nearby
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  // Load saved devices on mount
  useEffect(() => {
    loadSavedDevices();
  }, []);

  const loadSavedDevices = async () => {
    try {
      const saved = await AsyncStorage.getItem("savedDevices");
      if (saved) {
        setSavedDevices(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading saved devices:", error);
    }
  };

  const handleAddDevice = async (device: Device) => {
    try {
      const newSavedDevice: SavedDevice = {
        id: device.id,
        name: device.name,
        originalName: device.name,
      };

      const updatedSavedDevices = [...savedDevices, newSavedDevice];
      await AsyncStorage.setItem(
        "savedDevices",
        JSON.stringify(updatedSavedDevices)
      );
      setSavedDevices(updatedSavedDevices);
    } catch (error) {
      console.error("Error saving device:", error);
    }
  };

  const handleRemoveDevice = async (deviceId: string) => {
    try {
      const updatedSavedDevices = savedDevices.filter(
        (device) => device.id !== deviceId
      );
      await AsyncStorage.setItem(
        "savedDevices",
        JSON.stringify(updatedSavedDevices)
      );
      setSavedDevices(updatedSavedDevices);
    } catch (error) {
      console.error("Error removing device:", error);
    }
  };

  const handleToggleFilter = (deviceId: string) => {
    setOtherDevices((prevDevices) =>
      prevDevices.map((device) =>
        device.id === deviceId
          ? { ...device, isFiltered: !device.isFiltered }
          : device
      )
    );
  };

  // Add this modal component
  const renderAddDeviceModal = () => (
    <Modal
      visible={isAddingDevice}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsAddingDevice(false)}
    >
      <TouchableOpacity
        className="flex-1"
        activeOpacity={1}
        onPress={() => setIsAddingDevice(false)}
      >
        <View className="flex-1 justify-end">
          <View
            className={`mx-4 mb-6 rounded-2xl border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-300 border-gray-400"
            }`}
            style={{ maxHeight: height * 0.7 }}
          >
            <View className="p-4">
              <View className="items-center mb-4">
                <Text
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  Manage Devices
                </Text>
              </View>

              <ScrollView className="max-h-96">
                {otherDevices.map((device) => {
                  const isSaved = savedDevices.some(
                    (saved) => saved.id === device.id
                  );
                  return (
                    <TouchableOpacity
                      key={device.id}
                      onPress={() =>
                        isSaved
                          ? handleRemoveDevice(device.id)
                          : handleAddDevice(device)
                      }
                      activeOpacity={0.7}
                      className={`p-4 rounded-lg mb-2 flex-row items-center justify-between ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      } ${isSaved ? "opacity-80" : ""}`}
                    >
                      <View className="flex-1">
                        <Text
                          className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-black"
                          }`}
                        >
                          {device.name}
                        </Text>
                        {device.roundedDistance && (
                          <Text
                            className={`${
                              isDarkMode ? "text-gray-400" : "text-gray-700"
                            }`}
                          >
                            Distance: {formatDistance(device.roundedDistance)}
                          </Text>
                        )}
                      </View>
                      {isSaved ? (
                        <View className="ml-4 bg-red-500/90 w-8 h-8 rounded-full items-center justify-center">
                          <Ionicons name="remove" size={20} color="#fff" />
                        </View>
                      ) : (
                        <View className="ml-4 bg-blue-500/90 w-8 h-8 rounded-full items-center justify-center">
                          <Ionicons name="add" size={20} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  // Update the My Devices section
  const renderMyDevicesSection = () => (
    <View className="mb-6">
      <View className="flex-row items-center justify-between px-4 mb-2">
        <Text
          className={`text-lg font-semibold ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          My Devices
        </Text>
        <TouchableOpacity onPress={() => setIsAddingDevice(true)}>
          <Ionicons
            name="add-circle-outline"
            size={24}
            color={isDarkMode ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>
      {savedDevices.length > 0 ? (
        savedDevices
          .filter((savedDevice) =>
            otherDevices.some((d) => d.id === savedDevice.id)
          )
          .map((savedDevice) => {
            const activeDevice = otherDevices.find(
              (d) => d.id === savedDevice.id
            );
            return activeDevice && renderDeviceItem(activeDevice);
          })
      ) : (
        <View className="p-4 items-center">
          <Text className="text-gray-500">No saved devices</Text>
        </View>
      )}
    </View>
  );

  // Other Devices Section - Updated render code
  const renderOtherDevicesSection = () => (
    <View>
      <View className="flex-row items-center justify-between px-4 mb-2">
        <Text
          className={`text-lg font-semibold ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          Other Devices
        </Text>
        <TouchableOpacity onPress={() => setIsFilteringDevices(true)}>
          <Ionicons
            className="mr-0.5"
            name="filter"
            size={22}
            color={isDarkMode ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>
      {otherDevices
        .filter(
          (device) =>
            !savedDevices.some((saved) => saved.id === device.id) &&
            !device.isFiltered
        )
        .map(renderDeviceItem)}
    </View>
  );

  // Add this modal component
  const renderFilterModal = () => (
    <Modal
      visible={isFilteringDevices}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setIsFilteringDevices(false)}
    >
      <TouchableOpacity
        className="flex-1"
        activeOpacity={1}
        onPress={() => setIsFilteringDevices(false)}
      >
        <View className="flex-1 justify-end">
          <View
            className={`mx-4 mb-6 rounded-2xl border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-300 border-gray-400"
            }`}
            style={{ maxHeight: height * 0.7 }}
          >
            <View className="p-4">
              <View className="items-center mb-4">
                <Text
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  Filter Devices
                </Text>
              </View>

              <ScrollView className="max-h-96">
                {otherDevices
                  .filter(
                    (device) =>
                      !savedDevices.some((saved) => saved.id === device.id)
                  )
                  .map((device) => (
                    <TouchableOpacity
                      key={device.id}
                      activeOpacity={0.7}
                      onPress={() => handleToggleFilter(device.id)}
                      className={`p-4 rounded-lg mb-2 flex-row items-center justify-between ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-200"
                      } ${device.isFiltered ? "opacity-50" : ""}`}
                    >
                      <View className="flex-1">
                        <Text
                          className={`font-semibold ${
                            isDarkMode ? "text-white" : "text-black"
                          }`}
                        >
                          {device.name}
                        </Text>
                        {device.roundedDistance && (
                          <Text
                            className={`${
                              isDarkMode ? "text-gray-400" : "text-gray-700"
                            }`}
                          >
                            Distance: {formatDistance(device.roundedDistance)}
                          </Text>
                        )}
                      </View>
                      <View
                        className={`ml-4 w-8 h-8 rounded-full items-center justify-center ${
                          device.isFiltered ? "bg-red-500/90" : "bg-blue-500/90"
                        }`}
                      >
                        <Ionicons
                          name={device.isFiltered ? "remove" : "add"}
                          size={20}
                          color="#fff"
                        />
                      </View>
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View
      className={`flex-1 pt-12 ${isDarkMode ? "bg-black" : "bg-gray-200/90"}`}
    >
      {/* Settings */}
      <TouchableOpacity
        onPress={() => router.push("/settings")}
        className="absolute top-14 right-4 z-10 flex-row items-center"
      >
        <Ionicons
          name={"settings"}
          size={24}
          color={isDarkMode ? "#fff" : "#000"}
          className="mt-6"
        />
      </TouchableOpacity>

      <View className="px-4 my-14">
        <Text
          className={`text-2xl font-bold mb-1 ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          AccuFind
        </Text>
        <Text className={`${isDarkMode ? "text-gray-400" : "text-gray-800"}`}>
          Discover and track nearby devices
        </Text>
      </View>

      <ScrollView className="flex-1 mb-24">
        {renderMyDevicesSection()}
        {renderOtherDevicesSection()}
      </ScrollView>

      <SearchModal
        isVisible={isSearching}
        onClose={() => setIsSearching(false)}
        isDarkMode={isDarkMode}
        height={height}
      />

      <View className="absolute bottom-10 w-full items-center">
        <TouchableOpacity
          onPress={() => setShowHelpModal(true)}
          className="mb-4"
        >
          <Text
            className={`text-sm ${
              isDarkMode ? "text-gray-400" : "text-gray-600"
            }`}
          >
            Can't find your device?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleStartSearch}
          className="bg-blue-500 w-[90%] py-4 rounded-full items-center"
        >
          <Text className="text-white text-lg font-semibold">New Search</Text>
        </TouchableOpacity>
      </View>

      {/* Reset Button */}
      {/* <TouchableOpacity
        onPress={handleReset}
        className={`absolute bottom-28 right-4 w-10 h-10 rounded-full items-center justify-center active:opacity-70 ${
          isDarkMode ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        <Ionicons
          name="refresh-outline"
          size={20}
          color={isDarkMode ? "#fff" : "#000"}
        />
      </TouchableOpacity> */}

      {renderAddDeviceModal()}
      {renderFilterModal()}
      <HelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}
