import React, { useEffect, useState } from "react";
import { View, Text, Animated, SafeAreaView, Dimensions } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface Step {
  icon: JSX.Element;
  title: string;
  description: string;
}

type Slide2Props = {
  isVisible?: boolean;
};

export default function Slide2({ isVisible = false }: Slide2Props) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [fadeAnims] = useState(() => [
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);
  const [slideAnims] = useState(() => [
    new Animated.Value(50),
    new Animated.Value(50),
    new Animated.Value(50),
  ]);

  const steps: Step[] = [
    {
      icon: (
        <MaterialCommunityIcons name="bluetooth" size={32} color="#2563EB" />
      ),
      title: "Connect Your Device",
      description: "Enable Bluetooth and select the device you want to track",
    },
    {
      icon: <Ionicons name="radio" size={32} color="#2563EB" />,
      title: "Follow the Signal",
      description:
        "Use the radar to see the distance and direction to your device",
    },
    {
      icon: <Ionicons name="location" size={32} color="#2563EB" />,
      title: "Find with Precision",
      description: "Get closer to your device with real-time distance updates",
    },
  ];

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      // Reset animations to initial state
      fadeAnims.forEach((anim) => anim.setValue(0));
      slideAnims.forEach((anim) => anim.setValue(50));

      // Create an array to store all animation promises
      const animationPromises = steps.map((_, index) => {
        return new Promise((resolve) => {
          Animated.parallel([
            Animated.timing(fadeAnims[index], {
              toValue: 1,
              duration: 1000,
              delay: index * 600,
              useNativeDriver: true,
            }),
            Animated.timing(slideAnims[index], {
              toValue: 0,
              duration: 1000,
              delay: index * 600,
              useNativeDriver: true,
            }),
          ]).start(resolve);
        });
      });

      // Wait for all animations to complete
      Promise.all(animationPromises).then(() => {
        setHasAnimated(true);
      });
    }
  }, [isVisible]);

  return (
    <SafeAreaView style={{ width }} className="flex-1 bg-white">
      <View className="flex-1 px-6 pt-8">
        <Text className="text-3xl font-bold text-center mb-12 text-gray-800">
          How does it work?
        </Text>

        <View className="items-center justify-center flex-1">
          {steps.map((step, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: fadeAnims[index],
                transform: [
                  {
                    translateY: slideAnims[index],
                  },
                ],
                marginBottom: 24,
                width: "100%",
                maxWidth: 380,
              }}
              className="flex-row items-start bg-white p-5 rounded-2xl shadow-lg border border-gray-100"
            >
              <View className="bg-blue-50 p-4 rounded-xl">{step.icon}</View>

              <View className="flex-1 ml-4">
                <View className="flex-row items-center mb-2">
                  <Text className="text-blue-600 font-semibold text-sm">
                    STEP {index + 1}
                  </Text>
                  <View className="h-[1px] flex-1 bg-gray-100 ml-2" />
                </View>

                <Text className="text-gray-800 font-semibold text-lg mb-1">
                  {step.title}
                </Text>

                <Text className="text-gray-600 leading-5">
                  {step.description}
                </Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
