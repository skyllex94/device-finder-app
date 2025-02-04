import { useCallback, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";

const slides = [
  {
    id: "1",
    title: "Find Devices",
    description: "Easily locate and track Bluetooth devices around you",
    icon: "bluetooth-searching",
  },
  {
    id: "2",
    title: "Real-Time Tracking",
    description: "Get accurate location and signal strength data",
    icon: "location",
  },
  {
    id: "3",
    title: "Save History",
    description: "Keep track of all your discovered devices locally",
    icon: "save",
  },
];

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const finishOnboarding = useCallback(async () => {
    try {
      await AsyncStorage.setItem("isFirstOpen", "false");
      router.replace("/main");
    } catch (error) {
      console.error("Error saving onboarding state:", error);
    }
  }, []);

  const renderItem = ({
    item,
    index,
  }: {
    item: (typeof slides)[0];
    index: number;
  }) => (
    <View className="flex-1 items-center justify-center p-5" style={{ width }}>
      <Ionicons
        name={item.icon as any}
        size={100}
        className="text-blue-500 mb-6"
      />
      <Text className="text-2xl font-bold text-white mb-3 text-center">
        {item.title}
      </Text>
      <Text className="text-base text-white text-center px-5">
        {item.description}
      </Text>

      {index === slides.length - 1 && (
        <TouchableOpacity
          className="bg-blue-500 px-10 py-4 rounded-full mt-10 active:bg-blue-600"
          onPress={finishOnboarding}
        >
          <Text className="text-white font-bold text-base">Get Started</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDot = ({ index }: { index: number }) => (
    <View
      key={index}
      className={`w-2 h-2 rounded-full bg-white mx-1 ${
        currentIndex === index ? "opacity-100" : "opacity-50"
      }`}
    />
  );

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />

      <TouchableOpacity
        className="absolute top-14 right-5 z-10"
        onPress={finishOnboarding}
      >
        <Text className="text-white text-base">Skip</Text>
      </TouchableOpacity>

      <FlatList
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        scrollEventThrottle={16}
        className="flex-1"
      />

      <View className="flex-row justify-center items-center absolute bottom-24 left-0 right-0">
        {slides.map((_, index) => renderDot({ index }))}
      </View>
    </View>
  );
}
