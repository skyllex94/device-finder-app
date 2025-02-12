import { View as RNView, Text } from "react-native";
import LottieView from "lottie-react-native";
import { useRef } from "react";
import { useThemeStore } from "@/components/Themed";

export default function SplashScreen() {
  // Animation ref
  const animation = useRef<LottieView>(null);
  const { isDarkMode } = useThemeStore();
  console.log("isDarkMode:", isDarkMode);

  return (
    <RNView
      className={`flex-1 items-center justify-center ${
        isDarkMode ? "bg-black" : "bg-gray-200/90"
      }`}
    >
      <RNView className="flex-1 items-center justify-center">
        <LottieView
          autoPlay
          ref={animation}
          loop={true}
          style={{
            width: 100,
            height: 80,
          }}
          colorFilters={
            isDarkMode
              ? [
                  {
                    keypath: "**",
                    color: "#E5E7EB",
                  },
                ]
              : undefined
          }
          source={require("../assets/lottie/loader_navigation.json")}
        />
        {/* <Text
          className={`text-xl font-bold ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          AccuFind
        </Text> */}
      </RNView>
    </RNView>
  );
}
