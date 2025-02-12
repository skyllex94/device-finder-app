import { useLocalSearchParams } from "expo-router";
import OnBoarding from "./onboarding";
import MainScreen from "./main";
import { useEffect, useState } from "react";

// Dividing the screens to go to Main or OnBoarding
export default function Index() {
  let isFirstOpen = null;
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  const params = useLocalSearchParams();
  const { appFirstOpened } = params;

  // Read the param and translate it to Boolean
  if (appFirstOpened === "true") isFirstOpen = true;
  else isFirstOpen = false;

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
  };

  if (isFirstOpen && !hasCompletedOnboarding) {
    return <OnBoarding onComplete={handleOnboardingComplete} />;
  }

  return <MainScreen />;
}
