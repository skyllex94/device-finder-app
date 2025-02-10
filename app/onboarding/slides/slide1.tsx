import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  SafeAreaView,
  Dimensions,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

type Slide1Props = {
  isVisible?: boolean;
};

export default function Slide1({ isVisible = false }: Slide1Props) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [fadeAnim] = useState(() => new Animated.Value(0));
  const [slideAnim] = useState(() => new Animated.Value(50));
  const [imageAnim] = useState(() => new Animated.Value(0));
  const [radarAnim] = useState(() => new Animated.Value(0));
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      // Reset animations
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      imageAnim.setValue(0);
      radarAnim.setValue(0);
      pulseAnim.setValue(1);

      // Start main content animations
      Animated.sequence([
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(radarAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setHasAnimated(true);
        // Start continuous pulse animation
        startPulseAnimation();
      });
    }
  }, [isVisible]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const spin = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={{ width }} className="flex-1">
      <View className="flex-1 items-center justify-between py-8">
        <View className="flex-1 items-center justify-center relative">
          <Animated.View
            style={{ opacity: imageAnim }}
            className="w-full items-center"
          >
            {/* <Image
              source={require("../../../assets/images/onboarding/slide1.png")}
              style={{ width: width * 0.8, height: width * 0.8 }}
              resizeMode="contain"
            /> */}
          </Animated.View>

          {/* Background Radar Animation */}
          <Animated.View
            style={{
              opacity: radarAnim,
              transform: [{ scale: pulseAnim }],
              position: "absolute",
              zIndex: -1,
            }}
            className="items-center justify-center"
          >
            <View className="w-[300px] h-[300px] rounded-full border-2 border-blue-100 opacity-20" />
            <View className="w-[200px] h-[200px] rounded-full border-2 border-blue-200 opacity-30 absolute" />
            <View className="w-[100px] h-[100px] rounded-full border-2 border-blue-300 opacity-40 absolute" />
            <Animated.View
              style={{
                transform: [{ rotate: spin }],
              }}
              className="absolute"
            >
              <MaterialCommunityIcons
                name="radar"
                size={320}
                color="rgba(37, 99, 235, 0.1)"
              />
            </Animated.View>
          </Animated.View>
        </View>

        <View className="px-6 items-center z-10">
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <Text className="font-bold text-center text-4xl mb-3 text-gray-800">
              Welcome to AccuFind
            </Text>
            <Text className="font-medium text-center text-gray-600 text-lg mb-8 px-4">
              The smart way to track and locate your Bluetooth devices with
              accuracy.
            </Text>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}
