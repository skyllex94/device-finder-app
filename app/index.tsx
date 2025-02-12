import { useLocalSearchParams } from "expo-router";
import OnBoarding from "./onboarding";
import MainScreen from "./main";

// Dividing the screens to go to Main or OnBoarding
export default function Index() {
  let isFirstOpen = null;

  const params = useLocalSearchParams();
  const { appFirstOpened } = params;
  console.log("appFirstOpened:", appFirstOpened);

  // Read the param and translate it to Boolean
  if (appFirstOpened === "true") isFirstOpen = true;
  else isFirstOpen = false;

  return isFirstOpen ? <OnBoarding /> : <MainScreen />;
}
