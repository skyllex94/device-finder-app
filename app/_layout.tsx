import { Stack } from "expo-router";

import { useEffect, useState } from "react";
import "react-native-reanimated";

import "../global.css";
import SplashScreen from "./splash";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import Purchases from "react-native-purchases";
import { useThemeStore } from "@/components/Themed";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  // This is the set initialRoute
  initialRouteName: "/index",
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);
  const [appFirstOpened, setAppFirstOpened] = useState<boolean | null>(null);
  const { isDarkMode } = useThemeStore();

  useEffect(() => {
    async function prepare() {
      try {
        // Check if first time opened to display OnBoarding
        const storageValue = await AsyncStorage.getItem("isFirstOpen");
        const isFirstOpen = storageValue === "false" ? false : true;

        if (isFirstOpen) {
          await AsyncStorage.setItem("isFirstOpen", "true");
        }
        setAppFirstOpened(isFirstOpen);
        console.log("isFirstOpen:", isFirstOpen);

        // Delay for 2 secs for Splash Screen
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
        setAppFirstOpened(false);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  // RC Configuration
  Purchases.configure({
    apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? "",
  });

  if (!isReady) {
    return <SplashScreen isDarkMode={isDarkMode} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="index"
            options={{ gestureEnabled: false }}
            initialParams={{ appFirstOpened }}
          />
          <Stack.Screen name="main" options={{ headerShown: false }} />
          <Stack.Screen name="settings" options={{ presentation: "modal" }} />
          <Stack.Screen name="map" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="direction_finder"
            options={{ presentation: "modal" }}
          />

          <Stack.Screen name="heatmap" options={{ presentation: "modal" }} />
          <Stack.Screen name="paywall" options={{ presentation: "modal" }} />

          <Stack.Screen
            name="onboarding"
            options={{
              headerShown: false,
              gestureEnabled: false,
              animation: "fade",
            }}
          />
        </Stack>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
