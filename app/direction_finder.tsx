import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Magnetometer } from "expo-sensors";
import * as Location from "expo-location";
import { useDeviceStore } from "../store/deviceStore";

export default function DirectionFinder() {
  const router = useRouter();
  const [heading, setHeading] = useState(0);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const devices = useDeviceStore((state) => state.devices);

  useEffect(() => {
    let magnetometerSubscription;
    let locationSubscription: Location.LocationSubscription;

    const startTracking = async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      // Start magnetometer
      magnetometerSubscription = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        angle = (angle + 360) % 360; // Normalize to 0-360
        setHeading(angle);
      });

      // Start location updates
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (newLocation) => {
          setLocation(newLocation);
          console.log("Your location:", {
            lat: newLocation.coords.latitude,
            lng: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
          });
        }
      );
    };

    startTracking();

    return () => {
      magnetometerSubscription?.remove();
      locationSubscription?.remove();
    };
  }, []);

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
      <View style={{ transform: [{ rotate: `${heading}deg` }] }}>
        <Ionicons name="arrow-up" size={100} color="white" />
      </View>

      <Text className="text-white mt-4">{Math.round(heading)}°</Text>

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

      <View className="mt-4">
        <Text className="text-white text-lg font-bold mb-2">
          Device Locations:
        </Text>
        {devices.map((device) => (
          <View key={device.id} className="mb-3 bg-white/10 p-3 rounded-lg">
            <Text className="text-white font-semibold">{device.name}</Text>
            {device.location ? (
              <>
                <Text className="text-white/80">
                  Lat: {device.location.latitude.toFixed(6)}
                </Text>
                <Text className="text-white/80">
                  Lng: {device.location.longitude.toFixed(6)}
                </Text>
                {device.distance && (
                  <Text className="text-white/80">
                    Distance: {Math.round(device.distance)}m
                  </Text>
                )}
              </>
            ) : (
              <Text className="text-white/50 italic">
                Location not available
              </Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}
