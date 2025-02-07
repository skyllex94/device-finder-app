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
  const [locationHistory, setLocationHistory] = useState<
    Array<{ lat: number; lng: number }>
  >([]);
  const [centerPoint, setCenterPoint] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const devices = useDeviceStore((state) => state.devices);
  const targetDevice = devices.find((d) => d.id === id);
  const [bearingHistory, setBearingHistory] = useState<number[]>([]);
  const HISTORY_SIZE = 5;
  const CONFIDENCE_THRESHOLD = 45;
  const PROXIMITY_THRESHOLD = 1;

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

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

  const calculateCircleCenter = (
    points: Array<{ lat: number; lng: number }>
  ) => {
    if (points.length < HISTORY_SIZE) return null;

    // Calculate centroid
    const centroid = points.reduce(
      (acc, point) => ({
        lat: acc.lat + point.lat / points.length,
        lng: acc.lng + point.lng / points.length,
      }),
      { lat: 0, lng: 0 }
    );

    return centroid;
  };

  const getStableBearing = (newBearing: number): number => {
    const newHistory = [...bearingHistory, newBearing].slice(-HISTORY_SIZE);
    setBearingHistory(newHistory);

    // Calculate average bearing with special handling for angle wrapping
    let sumSin = 0;
    let sumCos = 0;
    newHistory.forEach((bearing) => {
      const rad = (bearing * Math.PI) / 180;
      sumSin += Math.sin(rad);
      sumCos += Math.cos(rad);
    });
    const avgBearing =
      ((Math.atan2(sumSin, sumCos) * 180) / Math.PI + 360) % 360;

    // Check if readings are within confidence threshold
    const isConfident = newHistory.every(
      (bearing) =>
        Math.abs(((bearing - avgBearing + 540) % 360) - 180) <
        CONFIDENCE_THRESHOLD
    );

    return isConfident ? avgBearing : deviceBearing;
  };

  useEffect(() => {
    let magnetometerSubscription;
    let locationSubscription: Location.LocationSubscription;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      await Magnetometer.setUpdateInterval(100);
      magnetometerSubscription = Magnetometer.addListener((data) => {
        const angle = Math.atan2(data.y, data.x);
        let degrees = angle * (180 / Math.PI);
        degrees = (degrees + 360) % 360;
        setHeading((prevHeading) => {
          const alpha = 0.3;
          return prevHeading * (1 - alpha) + degrees * alpha;
        });
      });

      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 500,
          distanceInterval: 0.5,
        },
        (newLocation) => {
          setLocation(newLocation);

          if (targetDevice?.location) {
            const newPoint = {
              lat: targetDevice.location.latitude,
              lng: targetDevice.location.longitude,
            };

            setLocationHistory((prev) => {
              const newHistory = [...prev, newPoint].slice(-HISTORY_SIZE);

              if (newHistory.length === HISTORY_SIZE) {
                const center = calculateCircleCenter(newHistory);
                if (center) {
                  setCenterPoint(center);
                  const rawBearing = calculateBearing(
                    newLocation.coords.latitude,
                    newLocation.coords.longitude,
                    center.lat,
                    center.lng
                  );
                  const stableBearing = getStableBearing(rawBearing);
                  setDeviceBearing(stableBearing);
                }
              }

              return newHistory;
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

  // Calculate final rotation
  const arrowRotation = (deviceBearing - heading + 360) % 360;

  // Determine if we're close to the center point
  const isNearby =
    centerPoint &&
    location &&
    calculateDistance(
      location.coords.latitude,
      location.coords.longitude,
      centerPoint.lat,
      centerPoint.lng
    ) < PROXIMITY_THRESHOLD;

  return (
    <View className="flex-1 items-center justify-center bg-black">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-12 right-4 bg-white/20 p-3 rounded-full"
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>

      {locationHistory.length === HISTORY_SIZE ? (
        <>
          <View style={{ transform: [{ rotate: `${arrowRotation}deg` }] }}>
            {isNearby ? (
              <View className="bg-blue-500 w-8 h-8 rounded-full" />
            ) : (
              <Ionicons name="arrow-up" size={100} color="white" />
            )}
          </View>

          <Text className="text-white mt-4">
            {Math.round(deviceBearing)}° bearing
          </Text>

          {centerPoint && (
            <Text className="text-white/70 mt-2">
              Center: {centerPoint.lat.toFixed(6)}, {centerPoint.lng.toFixed(6)}
            </Text>
          )}
        </>
      ) : (
        <Text className="text-white text-lg">
          Collecting locations ({locationHistory.length}/{HISTORY_SIZE})...
        </Text>
      )}
    </View>
  );
}
