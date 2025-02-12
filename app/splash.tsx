import { View } from "../components/Themed";
import LottieView from "lottie-react-native";
import { useRef } from "react";

export default function SplashScreen({ isDarkMode }: any) {
  // Animation ref
  const animation = useRef<LottieView>(null);

  return (
    <View
      className={`flex-1 items-center justify-center ${
        isDarkMode ? "bg-gray-700" : "bg-gray-200"
      }`}
    >
      <View className="lottie-animation">
        <LottieView
          autoPlay
          ref={animation}
          loop={true}
          style={{
            width: 100,
            height: 100,
          }}
          source={require("../assets/lottie/loader_navigation.json")}
        />
      </View>
    </View>
  );
}
