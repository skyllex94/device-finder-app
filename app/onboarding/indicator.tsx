import { View, Animated, useWindowDimensions } from "react-native";
import React from "react";

type IndicatorTypes = {
  data: any[];
  scrollX: Animated.Value;
};

export default function Indicator({ data, scrollX }: IndicatorTypes) {
  const { width } = useWindowDimensions();

  return (
    <View className="flex-row h-12 pt-2">
      {data.map((_, i) => {
        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 35, 10],
          extrapolate: "clamp",
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: "clamp",
        });

        return (
          <Animated.View
            className={`bg-blue-400 h-[10px] rounded-xl mx-[8px]`}
            style={[{ width: dotWidth, opacity }]}
            key={i.toString()}
          />
        );
      })}
    </View>
  );
}
