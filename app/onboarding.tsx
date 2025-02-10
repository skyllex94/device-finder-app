import React, { useRef, useState } from "react";
import { FlatList, Animated, View, ListRenderItemInfo } from "react-native";

import slides from "../app/onboarding/slides";
import OnBoardingItem from "./onboarding/item";
import Indicator from "./onboarding/indicator";
import NextButton from "./onboarding/next_button";

import Purchases from "react-native-purchases";
import useRevenueCat from "@/hooks/useRevenueCat";
import Spinner from "react-native-loading-spinner-overlay";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

// Define the shape of the slides
interface Slide {
  id: number;
  title: string;
  description: string;
  image: any;
}

export default function OnBoarding() {
  const router = useRouter();

  const [currSlide, setCurrSlide] = useState<number>(0);
  const [selectedPlan, setSelectedPlan] = useState<"weekly" | "yearly">(
    "weekly"
  );
  const [isFreeTrial, setIsFreeTrial] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList<Slide> | null>(null);

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems[0]?.index !== null) {
        setCurrSlide(viewableItems[0].index);
      }
    }
  ).current;

  const { currentOffering } = useRevenueCat();
  const [purchaseSpinner, setPurchaseSpinner] = useState<boolean>(false);

  async function purchaseSubscription() {
    setPurchaseSpinner(true);

    let packageToBuy;

    if (selectedPlan === "weekly") {
      // Use no-trial package when free trial is off
      packageToBuy = isFreeTrial
        ? currentOffering?.weekly
        : (currentOffering?.availablePackages as unknown as any[])?.find(
            (pkg) => pkg.identifier === "accufind_weekly_no_trial"
          );
    } else {
      packageToBuy = currentOffering?.annual;
    }

    if (!packageToBuy) {
      setPurchaseSpinner(false);
      return;
    }

    try {
      const purchaserInfo = await Purchases.purchasePackage(packageToBuy);
      if (
        purchaserInfo?.customerInfo?.entitlements?.active
          ?.werewolf_subscriptions
      ) {
        await AsyncStorage.setItem("isFirstOpen", "false");
      }
    } catch (e: any) {
      if (!e.userCancelled) setPurchaseSpinner(false);
    }
    setPurchaseSpinner(false);
  }

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const slideForward = async () => {
    if (currSlide < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currSlide + 1 });
    } else {
      try {
        await purchaseSubscription();
        const value = await AsyncStorage.getItem("isFirstOpen");
        if (value === "false") router.replace("/main");
      } catch (err) {
        console.log("Error @setItem on isFirstOpen:", err);
      }
    }
  };

  const handlePlanSelect = (plan: "weekly" | "yearly", freeTrial: boolean) => {
    setSelectedPlan(plan);
    setIsFreeTrial(freeTrial);
  };

  return (
    <View className="flex-1 bg-gray-100">
      <Spinner visible={purchaseSpinner} />
      <StatusBar style="dark" />

      <FlatList
        data={slides}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        renderItem={({ item, index }: ListRenderItemInfo<Slide>) => (
          <OnBoardingItem
            item={item}
            isVisible={index === currSlide}
            onPlanSelect={index === 3 ? handlePlanSelect : undefined}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        scrollEventThrottle={32}
        ref={slidesRef}
      />

      <View className="items-center pb-10">
        <Indicator data={slides} scrollX={scrollX} />

        <NextButton
          slideForward={slideForward}
          percentage={(currSlide + 1) * (100 / slides.length)}
          currSlide={currSlide}
          currentOffering={currentOffering}
          selectedPlan={selectedPlan}
        />
      </View>
    </View>
  );
}
