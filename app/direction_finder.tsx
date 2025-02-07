import { View, TouchableOpacity, Text } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { Magnetometer } from "expo-sensors";

export default function DirectionFinder() {
  const router = useRouter();
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    let subscription: any;

    const startMagnetometer = async () => {
      subscription = Magnetometer.addListener((data) => {
        let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
        angle = (angle + 360) % 360; // Normalize to 0-360
        setHeading(angle);
      });
    };

    startMagnetometer();

    return () => {
      subscription?.remove();
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
    </View>
  );
}
