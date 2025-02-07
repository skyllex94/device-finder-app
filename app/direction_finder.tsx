import { View, TouchableOpacity, Text } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Magnetometer } from "expo-sensors";
import * as Location from "expo-location";
import { useDeviceStore } from "../store/deviceStore";

export default function DirectionFinder() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [heading, setHeading] = useState(0);
  const [deviceBearing, setDeviceBearing] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const devices = useDeviceStore((state) => state.devices);
  const targetDevice = devices.find((d) => d.id === id);
  const [bearingHistory, setBearingHistory] = useState<number[]>([]);
  const HISTORY_SIZE = 5; // Number of readings to keep
  const CONFIDENCE_THRESHOLD = 20; // Degrees of acceptable variation

  const calculateBearing = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    // Convert to radians
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    // Calculate bearing
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    bearing = (bearing + 360) % 360; // Normalize to 0-360

    return bearing;
  };

  const getStableBearing = (newBearing: number): number => {
    // Add new bearing to history
    const newHistory = [...bearingHistory, newBearing].slice(-HISTORY_SIZE);
    setBearingHistory(newHistory);

    // Calculate average bearing
    const sum = newHistory.reduce((acc, val) => acc + val, 0);
    const avgBearing = sum / newHistory.length;

    // Check if readings are stable
    const isStable = newHistory.every(
      (bearing) => Math.abs(bearing - avgBearing) < CONFIDENCE_THRESHOLD
    );

    // Return average if stable, otherwise keep previous bearing
    return isStable || newHistory.length < HISTORY_SIZE
      ? avgBearing
      : deviceBearing;
  };

  useEffect(() => {
    let magnetometerSubscription;
    let locationSubscription: Location.LocationSubscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      // Magnetometer with smoothing
      await Magnetometer.setUpdateInterval(100);
      magnetometerSubscription = Magnetometer.addListener((data) => {
        const angle = Math.atan2(data.y, data.x);
        let degrees = angle * (180 / Math.PI);
        degrees = (degrees + 360) % 360;

        // Enhanced smoothing for heading
        setHeading((prevHeading) => {
          const alpha = 0.1; // Reduced smoothing factor for more stability
          return prevHeading * (1 - alpha) + degrees * alpha;
        });
      });

      // Location updates with stability checks
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Increased interval for stability
          distanceInterval: 1, // Increased threshold
        },
        (newLocation) => {
          setLocation(newLocation);

          if (targetDevice?.location) {
            const rawBearing = calculateBearing(
              newLocation.coords.latitude,
              newLocation.coords.longitude,
              targetDevice.location.latitude,
              targetDevice.location.longitude
            );

            // Apply stability filtering
            const stableBearing = getStableBearing(rawBearing);
            setDeviceBearing((prevBearing) => {
              const alpha = 0.2; // Smooth transition between bearings
              return prevBearing * (1 - alpha) + stableBearing * alpha;
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
  }, [targetDevice?.location]);

  // Smoother arrow rotation calculation
  const arrowRotation = (deviceBearing - heading + 360) % 360;

  return (
    <View className="flex-1 items-center justify-center bg-black">
      {/* Close button */}
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 right-4 bg-white/20 p-3 rounded-full"
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>

      {/* Direction arrow */}
      <View style={{ transform: [{ rotate: `${arrowRotation}deg` }] }}>
        <Ionicons name="arrow-up" size={100} color="white" />
      </View>

      <Text className="text-white mt-4">
        {Math.round(deviceBearing)}° bearing
      </Text>

      {location && (
        <View className="mt-4">
          <Text className="text-white text-lg font-bold">Your Location:</Text>
          <Text className="text-white text-center">
            Lat: {location.coords.latitude.toFixed(6)}
          </Text>
          <Text className="text-white text-center">
            Lng: {location.coords.longitude.toFixed(6)}
          </Text>
          <Text className="text-white text-center mb-4">
            Accuracy: ±{Math.round(location.coords.accuracy || 0)}m
          </Text>
        </View>
      )}

      {targetDevice && (
        <View className="mt-4 bg-white/10 p-4 rounded-lg w-[80%]">
          <Text className="text-white text-lg font-bold">
            {targetDevice.name}
          </Text>
          {targetDevice.location ? (
            <>
              <Text className="text-white/80">
                Lat: {targetDevice.location.latitude.toFixed(6)}
              </Text>
              <Text className="text-white/80">
                Lng: {targetDevice.location.longitude.toFixed(6)}
              </Text>
              {targetDevice.distance && (
                <Text className="text-white/80">
                  Distance: {Math.round(targetDevice.distance)}m
                </Text>
              )}
            </>
          ) : (
            <Text className="text-white/50 italic">Location not available</Text>
          )}
        </View>
      )}
    </View>
  );
}
