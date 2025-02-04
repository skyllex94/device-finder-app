import { StatusBar } from "expo-status-bar";
import { Platform, Switch, TouchableOpacity } from "react-native";
import { View, Text } from "react-native";
import { useThemeStore } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function Settings() {
  const { isDarkMode, toggleTheme } = useThemeStore();
  const router = useRouter();

  return (
    <View className={`flex-1 ${isDarkMode ? "bg-black" : "bg-white"}`}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <View className="flex-row items-center px-4 pt-14 pb-4 border-b border-gray-800">
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

      {/* Settings List */}
      <View className="px-4 pt-4">
        {/* Appearance Section */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm mb-2">Appearance</Text>
          <View
            className={`rounded-lg ${
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <View className="flex-row items-center justify-between p-4">
              <View className="flex-row items-center">
                <Ionicons
                  name={isDarkMode ? "moon" : "sunny"}
                  size={20}
                  color={isDarkMode ? "#fff" : "#000"}
                  className="mr-3"
                />
                <Text className={`${isDarkMode ? "text-white" : "text-black"}`}>
                  Dark Mode
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isDarkMode ? "#f5dd4b" : "#f4f3f4"}
              />
            </View>
          </View>
        </View>

        {/* About Section */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm mb-2">About</Text>
          <View
            className={`rounded-lg overflow-hidden ${
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <TouchableOpacity className="flex-row items-center justify-between p-4 border-b border-gray-700">
              <Text className={isDarkMode ? "text-white" : "text-black"}>
                Version
              </Text>
              <Text className="text-gray-500">1.0.0</Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center justify-between p-4">
              <Text className={isDarkMode ? "text-white" : "text-black"}>
                Privacy Policy
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDarkMode ? "#9CA3AF" : "#4B5563"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Danger Zone */}
        <View className="mb-6">
          <Text className="text-gray-500 text-sm mb-2">Danger Zone</Text>
          <View
            className={`rounded-lg overflow-hidden ${
              isDarkMode ? "bg-gray-800" : "bg-gray-100"
            }`}
          >
            <TouchableOpacity className="flex-row items-center p-4">
              <Ionicons
                name="trash-outline"
                size={20}
                color="#EF4444"
                className="mr-3"
              />
              <Text className="text-red-500">Clear All Data</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}
