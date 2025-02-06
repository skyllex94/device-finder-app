import { StyleSheet, View, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";

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
      <MapView
        style={styles.map}
        className="w-full h-full"
        showsUserLocation
        showsCompass
      />
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
