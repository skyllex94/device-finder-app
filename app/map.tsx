import { View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useThemeStore } from "../components/Themed";
import { useDeviceStore } from "../store/deviceStore";
import MapView, { Marker } from "react-native-maps";
import { useState, useEffect } from "react";
import * as Location from "expo-location";

export default function MapScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const devices = useDeviceStore((state) => state.devices);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  return (
    <View className="flex-1">
      {/* Header */}
      <View
        className={`absolute top-0 left-0 right-0 z-10 flex-row items-center px-4 ${
          isDarkMode ? "bg-black" : "bg-white"
        }`}
        style={{ paddingTop: 60, paddingBottom: 10 }}
      >
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDarkMode ? "#fff" : "#000"}
          />
        </TouchableOpacity>
      </View>

      {/* Map */}
      {userLocation && (
        <MapView
          className="flex-1"
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation
        >
          {devices.map(
            (device) =>
              device.location && (
                <Marker
                  key={device.id}
                  coordinate={{
                    latitude: device.location.latitude,
                    longitude: device.location.longitude,
                  }}
                  title={device.name}
                  description={`Distance: ${device.roundedDistance?.toFixed(
                    2
                  )}m`}
                />
              )
          )}
        </MapView>
      )}
    </View>
  );
}
