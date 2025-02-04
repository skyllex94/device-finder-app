import { Stack } from "expo-router";

import { useEffect, useState } from "react";
import "react-native-reanimated";

import "../global.css";
import SplashScreen from "./splash";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Delay for 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Add any initialization logic here
        // For example:
        // await loadInitialData();
        // await setupBluetooth();
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return <SplashScreen />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
