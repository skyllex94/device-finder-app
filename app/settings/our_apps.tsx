import { View, Text, Image, TouchableOpacity, Linking } from "react-native";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { useThemeStore } from "@/components/Themed";

type AppInfo = {
  name: string;
  description: string;
  url: string;
  imageSource: any;
};

const appData: AppInfo[] = [
  {
    name: "MicronVPN",
    description: "Fast VPN & Adblocker",
    url: "https://apps.apple.com/us/app/vpn-proxy-master-secure-shield/id1459783875?platform=iphone",
    imageSource: require("../../assets/images/apps_icons/vpn_icon.png"),
  },
  {
    name: "WaterDrop",
    description: "Remove water from speakers",
    url: "https://apps.apple.com/us/app/water-eject-airpods-waterdrop/id6449911513?platform=iphone",
    imageSource: require("../../assets/images/apps_icons/waterdrop.jpg"),
  },
  {
    name: "SimpleSign",
    description: "eSign & Scan Documents",
    url: "https://apps.apple.com/us/app/sign-documents-e-signature-app/id6502412936?platform=iphone",
    imageSource: require("../../assets/images/apps_icons/esign.jpg"),
  },
  {
    name: "Gamma",
    description: "Sleep Noise Machine",
    url: "https://apps.apple.com/sa/app/brown-noise-for-sleep-gamma/id6741171503?platform=iphone",
    imageSource: require("../../assets/images/apps_icons/gamma.jpg"),
  },
  {
    name: "Werewolf",
    description: "Werewolf Board Game",
    url: "https://apps.apple.com/us/app/werewolf-mafia-offline-game/id6738326023?platform=iphone",
    imageSource: require("../../assets/images/apps_icons/werewolf.jpeg"),
  },
];

const OurApps: React.FC = () => {
  const openURL = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  const { isDarkMode } = useThemeStore();

  return (
    <View className="px-4">
      <Text className="text-gray-500 text-sm mb-2">Useful Apps</Text>

      <ScrollView
        className={`rounded-xl w-full p-4 ${
          isDarkMode ? "bg-gray-800" : "bg-gray-100"
        }`}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        alwaysBounceVertical={false}
      >
        <View className="flex-row justify-start items-center">
          {appData.map((app, index) => (
            <View key={app.name} className="flex-row items-center">
              <TouchableOpacity
                onPress={() => openURL(app.url)}
                className="justify-center items-start"
              >
                <View className="items-center">
                  <Image
                    className="h-16 w-16 rounded-xl"
                    source={app.imageSource}
                  />
                  <Text
                    className={`text-sm mt-2 ${
                      isDarkMode ? "text-white" : "text-black"
                    }`}
                  >
                    {app.name}
                  </Text>
                  <Text
                    className={`text-gray-500 text-[10px] text-center w-20 mt-[.5px] ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {app.description}
                  </Text>
                </View>
              </TouchableOpacity>

              {index < appData.length - 1 && (
                <View
                  className={`h-16 w-[0.5px] mx-3 ${
                    isDarkMode ? "bg-gray-700" : "bg-gray-300"
                  } `}
                />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

export default OurApps;
