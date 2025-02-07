import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import MapView, { Marker, Region } from "react-native-maps";
import * as Location from "expo-location";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useDeviceStore } from "../store/deviceStore";
import { useSettingsStore } from "../store/settingsStore";
import { Platform } from "react-native";

export default function MapScreen() {
  const router = useRouter();
  const [region, setRegion] = useState<Region | null>(null);
  const devices = useDeviceStore((state) => state.devices);
  const { distanceUnit } = useSettingsStore();

  // Single useEffect to log device locations
  useEffect(() => {
    // Log all device locations from store
    console.log("Current device locations:");
    devices.forEach((device) => {
      console.log(`${device.name}:`, {
        location: device.location,
        distance: device.distance ? formatDistance(device.distance) : "unknown",
        lastSeen: device.lastSeen,
      });
    });

    // Set initial region to first device with location
    const firstDeviceWithLocation = devices.find((d) => d.location);
    if (firstDeviceWithLocation?.location && !region) {
      setRegion({
        latitude: firstDeviceWithLocation.location.latitude,
        longitude: firstDeviceWithLocation.location.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
  }, [devices]);

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

  const calculateDeviceLocation = (
    currentLocation: Location.LocationObject,
    distance: number
  ) => {
    const angle = Math.random() * 2 * Math.PI;
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

  return (
    <View className="flex-1">
      <MapView
        style={styles.map}
        className="w-full h-full"
        showsUserLocation
        showsCompass
        region={region || undefined}
      >
        {devices.map((device) => {
          if (!device.location) {
            return null;
          }

          console.log(`Rendering marker for ${device.name}:`, device.location);

          return (
            <Marker
              key={device.id}
              coordinate={{
                latitude: device.location.latitude,
                longitude: device.location.longitude,
              }}
              title={device.name}
              description={
                device.distance
                  ? `Distance: ${formatDistance(device.distance)}`
                  : undefined
              }
              pinColor="red"
            />
          );
        })}
      </MapView>

      {/* Debug info panel */}
      <View className="absolute top-4 left-4 bg-black/50 p-2 rounded">
        <Text className="text-white">Devices: {devices.length}</Text>
        <Text className="text-white">
          With Location: {devices.filter((d) => d.location).length}
        </Text>
        {devices.map((d) => (
          <Text key={d.id} className="text-white text-xs">
            {d.name}: {d.location ? "📍" : "❌"}
          </Text>
        ))}
      </View>

      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-4 right-4 bg-black/50 p-3 rounded-full"
      >
        <Ionicons name="close" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
