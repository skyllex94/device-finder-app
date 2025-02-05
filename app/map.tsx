import { View } from "react-native";
import { useRouter } from "expo-router";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { useEffect } from "react";

export default function MapScreen() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission:", status);
    })();
  }, []);

  return (
    <View className="flex-1">
      <MapView className="w-full h-full" showsUserLocation showsCompass />
    </View>
  );
}
