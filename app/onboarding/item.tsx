import React from "react";
import { View, useWindowDimensions } from "react-native";
import Slide1 from "./slides/slide1";
import Slide2 from "./slides/slide2";
import Slide3 from "./slides/slide3";
import Slide4 from "./slides/slide4";

interface Slide {
  id: number;
  title: string;
  description: string;
  image: any;
}

// Define the type for item prop
type OnBoardingItemProps = {
  item: Slide;
  isVisible: boolean;
  onPlanSelect?: (plan: "weekly" | "yearly", freeTrial: boolean) => void;
};

export default function OnBoardingItem({
  item,
  isVisible,
  onPlanSelect,
}: OnBoardingItemProps) {
  const { width } = useWindowDimensions();

  return (
    <View style={{ width }}>
      {item.id === 1 && <Slide1 isVisible={isVisible} />}
      {item.id === 2 && <Slide2 isVisible={isVisible} />}
      {item.id === 3 && <Slide3 isVisible={isVisible} />}
      {item.id === 4 && (
        <Slide4 isVisible={isVisible} onPlanSelect={onPlanSelect} />
      )}
    </View>
  );
}
