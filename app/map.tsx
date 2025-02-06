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
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [region, setRegion] = useState<Region | null>(null);
  const devices = useDeviceStore((state) => state.devices);
  const { distanceUnit } = useSettingsStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      try {
        const currentLocation = await Location.getCurrentPositionAsync({});
        console.log("Location obtained:", currentLocation);
        setLocation(currentLocation);

        // Set initial region
        setRegion({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      } catch (error) {
        console.error("Location error:", error);
      }
    })();
  }, []);

  // Debug logging for devices
  useEffect(() => {
    console.log(
      "Devices with locations:",
      devices
        .filter((d) => d.location)
        .map((d) => ({
          name: d.name,
          location: d.location,
        }))
    );
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

  return (
    <View className="flex-1">
      <MapView
        style={styles.map}
        className="w-full h-full"
        showsUserLocation
        showsCompass
        region={region || undefined}
      >
        {location && (
          <Marker
            coordinate={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            }}
            title="You are here"
            description="Your current location"
            pinColor="blue"
          />
        )}

        {devices.map((device) => {
          if (!device.location) {
            console.log(`Device ${device.name} has no location`);
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
      <View className="absolute top-14 left-4 bg-black/50 p-2 rounded">
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
        className="absolute top-14 right-4 bg-black/50 p-3 rounded-full"
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
