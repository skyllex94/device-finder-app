import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Linking,
  Switch,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useRouter } from "expo-router";
import useRevenueCat from "@/hooks/useRevenueCat";
import Purchases from "react-native-purchases";
import React, { useState } from "react";
import Spinner from "react-native-loading-spinner-overlay/lib";

export default function Paywall() {
  const router = useRouter();

  const { currentOffering } = useRevenueCat();
  const [purchaseSpinner, setPurchaseSpinner] = useState(false);
  const [isFreeTrial, setIsFreeTrial] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "yearly">(
    "yearly"
  );

  const weeklyPrice = currentOffering?.weekly?.product?.price || 0;
  const yearlyPrice = currentOffering?.annual?.product?.price || 0;
  const weeklyPriceFromYearly = (yearlyPrice / 52).toFixed(2);

  async function buySubscription(subscription: string) {
    setPurchaseSpinner(true);

    let packageToBuy;

    // Handle subscription types
    if (subscription === "weekly") {
      // Use the no trial package from availablePackages when free trial is off
      packageToBuy = isFreeTrial
        ? currentOffering?.weekly
        : (currentOffering?.availablePackages as unknown as any[])?.find(
            (pkg) => pkg.identifier === "accufind_weekly_no_trial"
          );
    } else {
      // For yearly subscription
      packageToBuy = currentOffering?.annual;
    }

    if (!packageToBuy) {
      setPurchaseSpinner(false);
      return;
    }

    try {
      const purchaserInfo = await Purchases.purchasePackage(packageToBuy);

      // Check if purchase completed
      if (
        purchaserInfo.customerInfo.entitlements.active.gamma_noise_subscriptions
      ) {
        router.back();
      }
    } catch (err: any) {
      if (!err.userCancelled) {
        setPurchaseSpinner(false);
      }
    }
    setPurchaseSpinner(false);
  }

  async function restorePurchase() {
    setPurchaseSpinner(true);
    const purchaserInfo = await Purchases.restorePurchases();
    console.log("purchaserInfo:", purchaserInfo);

    if (purchaserInfo?.activeSubscriptions.length > 0) {
      Alert.alert("Success", "Your purchase has been restored");

      router.back();
    } else Alert.alert("Failure", "There are no purchases to restore");
    setPurchaseSpinner(false);
  }

  const calculateSavings = () => {
    if (!weeklyPrice || !yearlyPrice) {
      return 0;
    }

    const weeklyAnnualCost = weeklyPrice * 52;
    const annualCost = yearlyPrice;
    const savingsPercentage =
      ((weeklyAnnualCost - annualCost) / weeklyAnnualCost) * 100;

    return Math.round(savingsPercentage);
  };

  return (
    <React.Fragment>
      {!currentOffering ? (
        <SafeAreaView className="flex-1 bg-[#021d32]">
          <ActivityIndicator className="pt-12" size="large" color="#FFD700" />
        </SafeAreaView>
      ) : (
        <SafeAreaView className="flex-1 bg-[#021d32]">
          <Spinner visible={purchaseSpinner} />

          {/* Image Container with Gradient */}
          <View className="h-[45%] w-full absolute top-0">
            <View className="h-full w-full overflow-hidden">
              <Image
                source={require("../assets/images/new_paywall_image.jpg")}
                className="w-full h-full"
                resizeMode="cover"
              />
            </View>
            <LinearGradient
              colors={["transparent", "#021d32"]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                height: "100%",
              }}
            />
            <LinearGradient
              colors={["#021d32", "transparent"]}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 0,
                height: "100%",
              }}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
            />
          </View>

          <View className="flex-1 px-6">
            {/* Header */}

            <Text className="text-white text-center font-bold text-[28px] mb-10 mt-8">
              Review our Benefits
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              className="absolute right-4 top-8 z-50"
              onPress={() => router.back()}
              activeOpacity={0.7}
              style={{ opacity: 0.2 }}
            >
              <Ionicons name="close-circle" size={34} color="#1E90FF" />
            </TouchableOpacity>

            {/* Content Container - pushes content to bottom */}
            <View className="justify-end mb-6">
              {/* Benefits */}
              <View className="space-y-12 mb-6 gap-y-3">
                {/* Signal Heatmap */}
                <View className="flex-row">
                  <View className="w-[20%] items-center pt-1">
                    <Ionicons name="radio-outline" size={28} color="#FFD700" />
                  </View>
                  <View className="w-[80%]">
                    <Text className="text-white font-semibold text-[16px] mb-1">
                      Signal Heatmap
                    </Text>
                    <Text className="text-gray-300 text-[14px]">
                      Visualize signal strength patterns to optimize device
                      tracking
                    </Text>
                  </View>
                </View>

                {/* Map View */}
                <View className="flex-row">
                  <View className="w-[20%] items-center pt-1">
                    <Ionicons name="map-outline" size={28} color="#FFD700" />
                  </View>
                  <View className="w-[80%]">
                    <Text className="text-white font-semibold text-[16px] mb-1">
                      Map View
                    </Text>
                    <Text className="text-gray-300 text-[14px]">
                      Track device locations with precise mapping integration
                    </Text>
                  </View>
                </View>

                {/* Unlimited Radar Proximity Tracker */}
                <View className="flex-row">
                  <View className="w-[20%] items-center pt-1">
                    <Ionicons name="bluetooth" size={28} color="#FFD700" />
                  </View>
                  <View className="w-[80%]">
                    <Text className="text-white font-semibold text-[16px] mb-1">
                      Unlimited Accurate Tracker
                    </Text>
                    <Text className="text-gray-300 text-[14px]">
                      Get the main feature of the app with unlimited destination
                      tracking.
                    </Text>
                  </View>
                </View>

                {/* Proximity Vibrations */}
                <View className="flex-row">
                  <View className="w-[20%] items-center pt-1">
                    <MaterialCommunityIcons
                      name="vibrate"
                      size={28}
                      color="#FFD700"
                    />
                  </View>
                  <View className="w-[80%]">
                    <Text className="text-white font-semibold text-[16px] mb-1">
                      Proximity Vibrations
                    </Text>
                    <Text className="text-gray-300 text-[14px]">
                      Get haptic feedback as you get closer to your device
                    </Text>
                  </View>
                </View>

                {/* Notifications */}
                <View className="flex-row">
                  <View className="w-[20%] items-center pt-1">
                    <Ionicons
                      name="notifications-outline"
                      size={28}
                      color="#FFD700"
                    />
                  </View>
                  <View className="w-[80%]">
                    <Text className="text-white font-semibold text-[16px] mb-1">
                      Smart Notifications
                    </Text>
                    <Text className="text-gray-300 text-[14px]">
                      Receive alerts when devices enter or leave your range
                    </Text>
                  </View>
                </View>

                {/* Continuous Accuracy Refinement */}
                <View className="flex-row">
                  <View className="w-[20%] items-center pt-1">
                    <Ionicons name="location-sharp" size={28} color="#FFD700" />
                  </View>
                  <View className="w-[80%]">
                    <Text className="text-white font-semibold text-[16px] mb-1">
                      Accuracy Refinement
                    </Text>
                    <Text className="text-gray-300 text-[14px]">
                      Continuosly improving the accuracy with predictive
                      geolocation.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Free Trial Toggle */}
              <View
                className={`px-5 py-3 rounded-3xl border bg-[#062844] border-gray-600 mb-2`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-white text-[14px]">
                    Enable Free Trial
                  </Text>
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
              <View>
                {/* Yearly Option */}
                <TouchableOpacity
                  className={`p-5 mb-2 rounded-3xl border ${
                    selectedPlan === "yearly"
                      ? "bg-[#0A3A5A] border-[#FFD700]"
                      : "bg-[#062844] border-gray-600"
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
                      <Text className="text-white font-semibold text-[16px]">
                        Yearly Access
                      </Text>
                      <Text className="text-gray-300 text-[10px] mt-1">
                        Only ${yearlyPrice} per year
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-center">
                      <View>
                        <Text className="text-white text-right text-[16px]">
                          ${weeklyPriceFromYearly}
                        </Text>
                        <Text className="text-gray-300 text-[12px]">
                          per week
                        </Text>
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
                      ? "bg-[#0A3A5A] border-[#1E90FF]"
                      : "bg-[#062844] border-gray-600"
                  }`}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedPlan("weekly");
                  }}
                >
                  <View className="flex-row justify-between items-center">
                    <View>
                      <Text className="text-white font-semibold text-[16px]">
                        Weekly Access
                      </Text>
                    </View>
                    <View className="flex-row items-center justify-center">
                      <View>
                        <Text className="text-white text-right text-[16px]">
                          ${weeklyPrice}
                        </Text>
                        <Text className="text-gray-300 text-[12px]">
                          per week
                        </Text>
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

                {/* Continue Button */}
                <TouchableOpacity
                  className="bg-[#1E90FF] p-4 rounded-3xl mt-2"
                  activeOpacity={0.7}
                  onPress={() =>
                    buySubscription(
                      selectedPlan === "weekly" ? "weekly" : "annual"
                    )
                  }
                >
                  <Text className="text-white text-center font-semibold text-[16px]">
                    Continue
                  </Text>
                </TouchableOpacity>

                {/* Footer Links with dividers */}
                <View className="flex-row justify-center items-center mt-2">
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      Linking.openURL(
                        "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/"
                      )
                    }
                  >
                    <Text className="text-gray-400 text-[12px]">
                      Privacy Policy
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-gray-400 text-[12px] mx-3">|</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={restorePurchase}
                  >
                    <Text className="text-gray-400 text-[12px]">
                      Restore Purchase
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-gray-400 text-[12px] mx-3">|</Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      Linking.openURL(
                        "https://sites.google.com/view/accufind/terms-conditions"
                      )
                    }
                  >
                    <Text className="text-gray-400 text-[12px]">
                      Terms of Use
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      )}
    </React.Fragment>
  );
}
