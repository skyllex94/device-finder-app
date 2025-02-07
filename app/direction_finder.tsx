import { View, TouchableOpacity, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Magnetometer } from "expo-sensors";
import * as Location from "expo-location";
import { useDeviceStore } from "../store/deviceStore";

type SignalReading = {
  latitude: number;
  longitude: number;
  rssi: number;
  timestamp: number;
};

export default function DirectionFinder() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [heading, setHeading] = useState(0);
  const [deviceBearing, setDeviceBearing] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [signalReadings, setSignalReadings] = useState<SignalReading[]>([]);
  const devices = useDeviceStore((state) => state.devices);
  const targetDevice = devices.find((d) => d.id === id);
  const READINGS_TO_KEEP = 5;
  const MAX_READING_AGE = 10000; // 10 seconds
  const PROXIMITY_THRESHOLD = 10; // 10 meters for "close range" mode
  const MIN_RSSI_THRESHOLD = -75; // Minimum RSSI for reliable close-range tracking
  const [bearingConfidence, setBearingConfidence] = useState(0);
  const [lastStableBearing, setLastStableBearing] = useState<number | null>(
    null
  );
  const CONFIDENCE_THRESHOLD = 0.7; // 70% confidence required for updates
  const CONFIDENCE_DECAY = 0.1; // How quickly confidence decays
  const CONFIDENCE_BUILD = 0.2; // How quickly confidence builds
  const ANGLE_THRESHOLD = 30; // Maximum angle change for confidence building

  const calculateBearing = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  const getSignalDirection = (readings: SignalReading[]) => {
    // Remove old readings
    const currentTime = Date.now();
    const recentReadings = readings.filter(
      (r) => currentTime - r.timestamp < MAX_READING_AGE
    );

    if (recentReadings.length < 3) return null;

    // Check if we're in close range mode
    const averageRSSI =
      recentReadings.reduce((sum, r) => sum + r.rssi, 0) /
      recentReadings.length;
    const isCloseRange = averageRSSI > MIN_RSSI_THRESHOLD;

    if (!isCloseRange) {
      setBearingConfidence((prev) => Math.max(0, prev - CONFIDENCE_DECAY));
      return null;
    }

    // Sort by most recent for close range tracking
    const sortedByTime = [...recentReadings].sort(
      (a, b) => b.timestamp - a.timestamp
    );
    const recentStrongReadings = sortedByTime.filter(
      (r) => r.rssi > MIN_RSSI_THRESHOLD
    );

    if (recentStrongReadings.length < 2) return null;

    // Use exponential moving average for signal weights
    const weightedCenter = recentStrongReadings.reduce(
      (center, reading, index) => {
        // Exponential decay weight based on recency and strength
        const timeWeight = Math.exp(-index * 0.5); // More weight to recent readings
        const signalWeight = Math.exp((reading.rssi + 100) * 0.05); // More weight to stronger signals
        const weight = timeWeight * signalWeight;

        return {
          latitude: center.latitude + reading.latitude * weight,
          longitude: center.longitude + reading.longitude * weight,
          totalWeight: center.totalWeight + weight,
        };
      },
      { latitude: 0, longitude: 0, totalWeight: 0 }
    );

    // Normalize weighted center
    const center = {
      latitude: weightedCenter.latitude / weightedCenter.totalWeight,
      longitude: weightedCenter.longitude / weightedCenter.totalWeight,
    };

    if (!location) return null;

    // Calculate new bearing
    const bearing = calculateBearing(
      location.coords.latitude,
      location.coords.longitude,
      center.latitude,
      center.longitude
    );

    // Update confidence based on bearing stability
    if (lastStableBearing !== null) {
      const angleDiff = Math.abs(
        ((bearing - lastStableBearing + 540) % 360) - 180
      );
      if (angleDiff < ANGLE_THRESHOLD) {
        setBearingConfidence((prev) => Math.min(1, prev + CONFIDENCE_BUILD));
      } else {
        setBearingConfidence((prev) => Math.max(0, prev - CONFIDENCE_DECAY));
      }
    } else {
      setLastStableBearing(bearing);
    }

    // Only update bearing if confidence is high enough
    if (bearingConfidence >= CONFIDENCE_THRESHOLD) {
      setLastStableBearing(bearing);
      return (prevBearing) => {
        const angleDiff = ((bearing - prevBearing + 540) % 360) - 180;
        const smoothingFactor = isCloseRange ? 0.3 : 0.1;
        return (prevBearing + angleDiff * smoothingFactor + 360) % 360;
      };
    }

    return null;
  };

  useEffect(() => {
    let magnetometerSubscription;
    let locationSubscription: Location.LocationSubscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // Start compass
      magnetometerSubscription = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        angle = (angle + 360) % 360;
        setHeading((prevHeading) => {
          const alpha = 0.3;
          return prevHeading * (1 - alpha) + angle * alpha;
        });
      });

      // Start location tracking
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 500,
          distanceInterval: 0.5,
        },
        (newLocation) => {
          setLocation(newLocation);

          if (targetDevice?.rssi) {
            const newReading: SignalReading = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
              rssi: targetDevice.rssi,
              timestamp: Date.now(),
            };

            setSignalReadings((prev) => {
              const updated = [...prev, newReading].slice(-READINGS_TO_KEEP);
              const directionUpdate = getSignalDirection(updated);

              if (directionUpdate) {
                setDeviceBearing((prev) => directionUpdate(prev));
              }
              return updated;
            });
          }
        }
      );
    };

    startTracking();

    return () => {
      magnetometerSubscription?.remove();
      locationSubscription?.remove();
    };
  }, [targetDevice]);

  const arrowRotation = (deviceBearing - heading + 360) % 360;

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 right-4 bg-white/20 p-3 rounded-full"
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>

      <View
        style={{
          transform: [{ rotate: `${arrowRotation}deg` }],
          opacity: bearingConfidence >= CONFIDENCE_THRESHOLD ? 1 : 0.5,
        }}
      >
        <Ionicons name="arrow-up" size={100} color="white" />
      </View>

      <Text className="text-white mt-4">
        {Math.round(deviceBearing)}° bearing
      </Text>

      <View className="absolute bottom-8 w-[85%] p-4 rounded-2xl bg-white/10 border border-white/20">
        <Text className="text-white text-lg mb-2">Signal Tracking</Text>
        <Text className="text-white/70">
          Readings: {signalReadings.length}/{READINGS_TO_KEEP}
        </Text>
        {targetDevice?.rssi && (
          <>
            <Text className="text-white/70">
              Current RSSI: {targetDevice.rssi} dBm
            </Text>
            <Text className="text-white/70">
              Mode:{" "}
              {targetDevice.rssi > MIN_RSSI_THRESHOLD
                ? "Close Range"
                : "Searching..."}
            </Text>
            <Text className="text-white/70">
              Confidence: {Math.round(bearingConfidence * 100)}%
            </Text>
          </>
        )}
      </View>
    </View>
  );
}
