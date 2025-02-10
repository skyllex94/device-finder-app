import React, { useEffect, useState } from "react";
import { View, Text, Animated, SafeAreaView, Dimensions } from "react-native";
import {
  MaterialCommunityIcons,
  Ionicons,
  FontAwesome5,
} from "@expo/vector-icons";

const { width } = Dimensions.get("window");
const BUBBLE_SIZE = 100;

type Slide3Props = {
  isVisible?: boolean;
};

interface TrackingMethod {
  icon: JSX.Element;
  title: string;
  description: string;
  isReversed: boolean;
}

export default function Slide3({ isVisible = false }: Slide3Props) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [bubbleAnims] = useState(() =>
    Array(4)
      .fill(0)
      .map(() => new Animated.Value(0))
  );
  const [textAnims] = useState(() =>
    Array(4)
      .fill(0)
      .map(() => new Animated.Value(0))
  );

  const trackingMethods: TrackingMethod[] = [
    {
      icon: (
        <MaterialCommunityIcons
          name="bluetooth-connect"
          size={36}
          color="#2563EB"
        />
      ),
      title: "Bluetooth Tracker",
      description:
        "Precise updating distance measurements to guide you to your device",
      isReversed: false,
    },
    {
      icon: <FontAwesome5 name="map-marked-alt" size={36} color="#2563EB" />,
      title: "Map View",
      description:
        "Track your devices on an interactive map with real-time location updates",
      isReversed: true,
    },
    {
      icon: (
        <MaterialCommunityIcons
          name="signal-distance-variant"
          size={36}
          color="#2563EB"
        />
      ),
      title: "Signal Heatmap",
      description:
        "Visualize Bluetooth signal strength to pinpoint device location",
      isReversed: false,
    },
    {
      icon: <Ionicons name="notifications" size={36} color="#2563EB" />,
      title: "Proximity Alerts",
      description:
        "Setup notifications and vibration when devices enter or leave your range",
      isReversed: true,
    },
  ];

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      // Reset animations
      bubbleAnims.forEach((anim) => anim.setValue(0));
      textAnims.forEach((anim) => anim.setValue(0));

      // Animate bubbles first, one after another
      const bubbleAnimations = bubbleAnims.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          delay: index * 300,
          useNativeDriver: true,
        })
      );

      // Then animate descriptions
      const textAnimations = textAnims.map((anim, index) =>
        Animated.timing(anim, {
          toValue: 1,
          duration: 600,
          delay: index * 300, // Start after all bubbles
          useNativeDriver: true,
        })
      );

      Animated.sequence([
        Animated.stagger(200, bubbleAnimations),
        Animated.stagger(200, textAnimations),
      ]).start(() => {
        setHasAnimated(true);
      });
    }
  }, [isVisible]);

  const FeatureRow = ({
    method,
    index,
  }: {
    method: TrackingMethod;
    index: number;
  }) => {
    const bubbleContent = (
      <Animated.View
        style={{
          opacity: bubbleAnims[index],
          transform: [{ scale: bubbleAnims[index] }],
        }}
      >
        <View
          style={{ width: BUBBLE_SIZE, height: BUBBLE_SIZE }}
          className="rounded-full items-center justify-center border-2 border-dashed border-blue-300 bg-white shadow-sm"
        >
          {method.icon}
        </View>
        <Text className="text-gray-700 font-medium text-sm mt-2 text-center w-32">
          {method.title}
        </Text>
      </Animated.View>
    );

    const descriptionContent = (
      <Animated.View
        style={{
          opacity: textAnims[index],
          transform: [
            {
              translateX: textAnims[index].interpolate({
                inputRange: [0, 1],
                outputRange: [method.isReversed ? -20 : 20, 0],
              }),
            },
          ],
        }}
        className="flex-1 justify-center px-6"
      >
        <Text className="text-gray-600 text-base leading-5">
          {method.description}
        </Text>
      </Animated.View>
    );

    return (
      <View className="flex-row items-center mb-8">
        {method.isReversed ? (
          <>
            {descriptionContent}
            {bubbleContent}
          </>
        ) : (
          <>
            {bubbleContent}
            {descriptionContent}
          </>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={{ width }} className="flex-1 bg-white">
      <View className="flex-1 px-6">
        <Text className="text-3xl font-bold text-center mt-8 mb-10 text-gray-800">
          Many ways to track:
        </Text>

        <View className="flex-1 pt-4">
          {trackingMethods.map((method, index) => (
            <FeatureRow key={index} method={method} index={index} />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}
