import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import useRevenueCat from "@/hooks/useRevenueCat";

import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");

type Slide4Props = {
  isVisible?: boolean;
  onPlanSelect?: (plan: "weekly" | "yearly", freeTrial: boolean) => void;
};

export default function Slide4({
  isVisible = false,
  onPlanSelect,
}: Slide4Props) {
  const router = useRouter();
  const { currentOffering } = useRevenueCat();
  const [hasAnimated, setHasAnimated] = useState(false);

  const [purchaseSpinner, setPurchaseSpinner] = useState(false);
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "yearly">(
    "weekly"
  );
  const [closeButtonOpacity] = useState(new Animated.Value(0));
  const [contentAnim] = useState(new Animated.Value(0));

  const weeklyPrice = currentOffering?.weekly?.product?.price || 0;
  const yearlyPrice = currentOffering?.annual?.product?.price || 0;
  const weeklyPriceFromYearly = (yearlyPrice / 52).toFixed(2);

  const benefits = [
    {
      icon: <Ionicons name="radio-outline" size={28} color="black" />,
      title: "Signal Heatmap",
      description:
        "Visualize signal strength patterns to optimize device tracking",
    },
    {
      icon: <Ionicons name="map-outline" size={28} color="black" />,
      title: "Map View",
      description: "Track device locations with precise mapping integration",
    },
    {
      icon: <Ionicons name="bluetooth-outline" size={28} color="black" />,
      title: "Unlimited Accurate Tracker",
      description:
        "Get the main feature of the app with unlimited destination tracking",
    },
    {
      icon: <Ionicons name="bonfire-outline" size={28} color="black" />,
      title: "Proximity Vibrations",
      description: "Get haptic feedback as you get closer to your device",
    },
    {
      icon: <Ionicons name="notifications-outline" size={28} color="black" />,
      title: "Smart Notifications",
      description: "Receive alerts when devices enter or leave your range",
    },
    {
      icon: <Ionicons name="location-outline" size={28} color="black" />,
      title: "Accuracy Refinement",
      description:
        "Continuously improving the accuracy with predictive geolocation",
    },
  ];

  useEffect(() => {
    if (isVisible && !hasAnimated) {
      // Start content animation
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();

      // Delay close button appearance
      setTimeout(() => {
        Animated.timing(closeButtonOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }).start();
      }, 5000);

      setHasAnimated(true);
    }
  }, [isVisible]);

  useEffect(() => {
    if (onPlanSelect) {
      onPlanSelect(selectedPlan, isFreeTrial);
    }
  }, [selectedPlan, isFreeTrial, onPlanSelect]);

  const calculateSavings = () => {
    if (!weeklyPrice || !yearlyPrice) return 0;
    const weeklyAnnualCost = weeklyPrice * 52;
    const annualCost = yearlyPrice;
    const savingsPercentage =
      ((weeklyAnnualCost - annualCost) / weeklyAnnualCost) * 100;
    return Math.round(savingsPercentage);
  };

  // Function to handle navigation to the main screen
  async function sendToMainScreen(): Promise<void> {
    await AsyncStorage.setItem("isFirstOpen", "false");
    router.replace("/main");
  }

  if (!currentOffering) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <ActivityIndicator className="pt-12" size="large" color="#FFD700" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ width }} className="flex-1">
      <Spinner visible={purchaseSpinner} />

      <View className="flex-1 px-6">
        {/* Close Button */}
        <Animated.View
          style={{ opacity: closeButtonOpacity }}
          className="absolute right-4 top-8 z-50"
        >
          <TouchableOpacity
            onPress={sendToMainScreen}
            activeOpacity={0.7}
            style={{ opacity: 0.15 }}
          >
            <Ionicons name="close-circle" size={34} color="black" />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View style={{ opacity: contentAnim, flex: 1 }}>
          {/* Header */}
          <Text className="text-center font-bold text-[28px] mb-10 mt-8 text-gray-800">
            Review our Benefits
          </Text>

          {/* Benefits List */}
          <View className="mb-6">
            {benefits.map((benefit, index) => (
              <View key={index} className="flex-row mb-2">
                <View className="w-[20%] items-center pt-1">
                  {benefit.icon}
                </View>
                <View className="w-[80%]">
                  <Text className="text-gray-800 font-semibold text-[16px] mb-1">
                    {benefit.title}
                  </Text>
                  <Text className="text-gray-600">{benefit.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Free Trial Toggle */}
          <View className="px-5 py-3 rounded-3xl border bg-white border-gray-200 ">
            <View className="flex-row items-center justify-between">
              <Text className="text-gray-800">Enable Free Trial</Text>
              <Switch
                value={isFreeTrial}
                onValueChange={(value) => {
                  setIsFreeTrial(value);
                  if (value) setSelectedPlan("weekly");
                }}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isFreeTrial ? "#2563eb" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Subscription Options */}
          <View className="mt-4">
            {/* Yearly Option */}
            <TouchableOpacity
              className={`p-5 mb-2 rounded-3xl border ${
                selectedPlan === "yearly"
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-gray-200"
              }`}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedPlan("yearly");
                setIsFreeTrial(false);
              }}
            >
              <View className="absolute -top-2 right-4 bg-[#FFD700] px-2 py-1 rounded-full">
                <Text className="text-[#021d32] text-[10px] font-bold">
                  SAVE {calculateSavings()}%
                </Text>
              </View>
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-800 font-semibold text-[16px]">
                    Yearly Access
                  </Text>
                  <Text className="text-gray-600 text-[10px] mt-1">
                    Only ${yearlyPrice} per year
                  </Text>
                </View>
                <View className="flex-row items-center justify-center">
                  <View>
                    <Text className="text-gray-800 text-right text-[16px]">
                      ${weeklyPriceFromYearly}
                    </Text>
                    <Text className="text-gray-600 text-[12px]">per week</Text>
                  </View>
                  <View className="ml-3">
                    <View className="h-6 w-6 border-2 border-gray-600 rounded-full items-center justify-center">
                      {selectedPlan === "yearly" && (
                        <View className="h-4 w-4 rounded-full bg-[#FFD700]" />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Weekly Option */}
            <TouchableOpacity
              className={`p-5 rounded-3xl border ${
                selectedPlan === "weekly"
                  ? "bg-blue-50 border-blue-500"
                  : "bg-white border-gray-200"
              }`}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedPlan("weekly");
              }}
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="text-gray-800 font-semibold text-[16px]">
                    Weekly Access
                  </Text>
                </View>
                <View className="flex-row items-center justify-center">
                  <View>
                    <Text className="text-gray-800 text-right text-[16px]">
                      ${weeklyPrice}
                    </Text>
                    <Text className="text-gray-600 text-[12px]">per week</Text>
                  </View>
                  <View className="ml-3">
                    <View className="h-6 w-6 border-2 border-gray-600 rounded-full items-center justify-center">
                      {selectedPlan === "weekly" && (
                        <View className="h-4 w-4 rounded-full bg-[#1E90FF]" />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
