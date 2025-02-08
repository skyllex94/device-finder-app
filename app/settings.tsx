import { StatusBar } from "expo-status-bar";
import { Platform, ScrollView, Switch, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import { useThemeStore } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import GeneralSettings from "./settings/general";
import PersonalizeSettings from "./settings/personalize";
import OurApps from "./settings/our_apps";

export default function Settings() {
  const { isDarkMode } = useThemeStore();
  const router = useRouter();

  return (
    <ScrollView
      className={`flex-1 ${isDarkMode ? "bg-black" : "bg-slate-200/90"}`}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <View
        className={`flex-row items-center px-4 pt-6 pb-4 border-b ${
          isDarkMode ? "border-gray-700" : "border-gray-300"
        }`}
      >
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons
            name="close"
            size={24}
            color={isDarkMode ? "#fff" : "#000"}
          />
        </TouchableOpacity>
        <Text
          className={`text-xl font-semibold ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          Settings
        </Text>
      </View>

      <GeneralSettings />
      <PersonalizeSettings />
      <OurApps />
    </ScrollView>
  );
}
