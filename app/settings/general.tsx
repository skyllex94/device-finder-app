import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useThemeStore } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function GeneralSettings() {
  const { isDarkMode } = useThemeStore();
  const router = useRouter();

  return (
    <View className={`${isDarkMode ? "bg-black" : "bg-white"}`}>
      <View className="px-4 pt-4">
        <Text className={`text-sm font-medium mb-2 text-gray-500`}>
          General
        </Text>
        <View
          className={`rounded-lg overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          }`}
        >
          <TouchableOpacity
            onPress={() => router.push("/privacy")}
            className="flex-row items-center justify-between p-4 border-b border-gray-700"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="trophy-outline"
                size={20}
                color={isDarkMode ? "white" : "black"}
              />
              <Text
                className={`ml-3 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Try Premium
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#9CA3AF" : "#4B5563"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/privacy")}
            className="flex-row items-center justify-between p-4 border-b border-gray-700"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="accessibility-outline"
                size={20}
                color={isDarkMode ? "white" : "black"}
              />
              <Text
                className={`ml-3 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Tip
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#9CA3AF" : "#4B5563"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/privacy")}
            className="flex-row items-center justify-between p-4 border-b border-gray-700"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="shield-outline"
                size={20}
                color={isDarkMode ? "white" : "black"}
              />
              <Text
                className={`ml-3 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Privacy Policy
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#9CA3AF" : "#4B5563"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/terms")}
            className="flex-row items-center justify-between p-4 border-b border-gray-700"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="document-text-outline"
                size={20}
                color={isDarkMode ? "white" : "black"}
              />
              <Text
                className={`ml-3 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Terms of Service
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#9CA3AF" : "#4B5563"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              /* Add share functionality */
            }}
            className="flex-row items-center justify-between p-4 border-b border-gray-700"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="share-outline"
                size={20}
                color={isDarkMode ? "white" : "black"}
              />
              <Text
                className={`ml-3 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Share App
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/contact")}
            className="flex-row items-center justify-between p-4"
          >
            <View className="flex-row items-center">
              <Ionicons
                name="mail-outline"
                size={20}
                color={isDarkMode ? "white" : "black"}
              />
              <Text
                className={`ml-3 ${isDarkMode ? "text-white" : "text-black"}`}
              >
                Contact Us
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDarkMode ? "#9CA3AF" : "#4B5563"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
