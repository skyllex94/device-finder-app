import { View, Text, TouchableOpacity, Linking, Share } from "react-native";
import React, { useState } from "react";
import { useThemeStore } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import TipModal from "./tip";
import useRevenueCat from "@/hooks/useRevenueCat";

export default function GeneralSettings() {
  const { isDarkMode } = useThemeStore();
  const router = useRouter();
  const { isProMember } = useRevenueCat();

  const [showTipModal, setShowTipModal] = useState(false);

  const handlePrivacyPolicy = async () => {
    const url =
      "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/";
    await Linking.openURL(url);
  };

  const handleTerms = async () => {
    const url = "https://sites.google.com/view/accufind/terms-conditions";
    await Linking.openURL(url);
  };

  const handleShare = async () => {
    try {
      const appLink = "https://apps.apple.com/your-app-link";
      await Share.share({
        message: `Hey check out this free app for finding your devices, you might like it: ${appLink}`,
        title: "Share Device Finder",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleContact = async () => {
    const email = "zionstudiosapps@gmail.com";
    const subject = "Device Finder App Support";
    const body = "Hello,\n\nI have a question about the Device Finder app:\n\n";

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      }
    } catch (error) {
      console.error("Error opening email:", error);
    }
  };

  return (
    <View className={`${isDarkMode ? "bg-black" : "bg-gray-200/90"}`}>
      <View className="px-4 pt-4">
        <Text className={`text-sm font-medium mb-2 text-gray-500`}>
          General
        </Text>
        <View
          className={`rounded-lg overflow-hidden ${
            isDarkMode ? "bg-gray-800" : "bg-slate-100"
          }`}
        >
          {!isProMember && (
            <TouchableOpacity
              onPress={() => router.push("/paywall")}
              className={`flex-row items-center justify-between p-4 border-b ${
                isDarkMode ? "border-gray-700" : "border-gray-300"
              }`}
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
          )}

          <TouchableOpacity
            onPress={() => setShowTipModal(true)}
            className={`flex-row items-center justify-between p-4 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-300"
            }`}
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
            onPress={handlePrivacyPolicy}
            className={`flex-row items-center justify-between p-4 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-300"
            }`}
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
            onPress={handleTerms}
            className={`flex-row items-center justify-between p-4 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-300"
            }`}
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
            onPress={handleShare}
            className={`flex-row items-center justify-between p-4 border-b ${
              isDarkMode ? "border-gray-700" : "border-gray-300"
            }`}
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
            onPress={handleContact}
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

      <TipModal
        isVisible={showTipModal}
        onClose={() => setShowTipModal(false)}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}
