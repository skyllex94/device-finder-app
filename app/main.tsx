import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Modal,
} from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useThemeStore } from "../components/Themed";
import { LinearGradient } from "expo-linear-gradient";

interface Device {
  id: string;
  name: string;
  rssi: number;
  lastSeen: Date;
}

export default function TabOneScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [myDevices, setMyDevices] = useState<Device[]>([]);
  const [otherDevices, setOtherDevices] = useState<Device[]>([]);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const [isSearching, setIsSearching] = useState(false);

  const handleStartSearch = useCallback(() => {
    setIsSearching(true);
  }, []);

  const handleReset = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/onboarding");
    } catch (error) {
      console.error("Error clearing storage:", error);
    }
  };

  const renderDeviceItem = (device: Device) => (
    <TouchableOpacity
      key={device.id}
      className={`flex-row items-center p-4 rounded-lg mb-2 mx-4 ${
        isDarkMode ? "bg-gray-800" : "bg-gray-100"
      }`}
    >
      <View className="flex-1">
        <Text
          className={`font-semibold text-lg ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          {device.name}
        </Text>
        <Text className="text-gray-400 text-sm">Signal: {device.rssi} dBm</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={24}
        color={isDarkMode ? "#9CA3AF" : "#4B5563"}
      />
    </TouchableOpacity>
  );

  return (
    <View className={`flex-1 pt-12 ${isDarkMode ? "bg-black" : "bg-white"}`}>
      {/* Settings */}
      <TouchableOpacity
        onPress={() => router.push("/settings")}
        className="absolute top-14 right-4 z-10 flex-row items-center"
      >
        <Ionicons
          name={"settings"}
          size={24}
          color={isDarkMode ? "#fff" : "#000"}
          className="mt-6"
        />
      </TouchableOpacity>

      <View className="px-4 my-14">
        <Text
          className={`text-2xl font-bold mb-2 ${
            isDarkMode ? "text-white" : "text-black"
          }`}
        >
          Device Finder
        </Text>
        <Text className="text-gray-400">Discover and track nearby devices</Text>
      </View>

      <ScrollView className="flex-1 mb-24">
        {/* My Devices Section */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-4 mb-2">
            <Text
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-black"
              }`}
            >
              My Devices
            </Text>
            <TouchableOpacity>
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={isDarkMode ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>
          {myDevices.length > 0 ? (
            myDevices.map(renderDeviceItem)
          ) : (
            <View className="p-4 items-center">
              <Text className="text-gray-500">No saved devices</Text>
            </View>
          )}
        </View>

        {/* Other Devices Section */}
        <View>
          <View className="flex-row items-center justify-between px-4 mb-2">
            <Text
              className={`text-lg font-semibold ${
                isDarkMode ? "text-white" : "text-black"
              }`}
            >
              Other Devices
            </Text>
            <TouchableOpacity>
              <Ionicons
                name="refresh-outline"
                size={24}
                color={isDarkMode ? "#fff" : "#000"}
              />
            </TouchableOpacity>
          </View>
          {otherDevices.length > 0 ? (
            otherDevices.map(renderDeviceItem)
          ) : (
            <View className="p-4 items-center">
              <Text className="text-gray-500">No devices found</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bluetooth Search Modal */}
      <Modal
        visible={isSearching}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsSearching(false)}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={() => setIsSearching(false)}
        >
          <View className="flex-1 justify-end">
            <View
              className={`mx-4 mb-8 rounded-3xl ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              }`}
              style={{ height: height * 0.3 }}
            >
              <View className="flex-1 p-4">
                <View className="items-center mb-6">
                  <View className="w-12 h-1 rounded-full bg-gray-300 mb-4" />
                  <View className="flex-row items-center justify-center space-x-3">
                    <View className="w-4 h-4 mr-2">
                      <View className="w-full h-full border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </View>
                    <Text
                      className={`text-lg font-semibold ${
                        isDarkMode ? "text-white" : "text-black"
                      }`}
                    >
                      Scanning...
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-center mt-4">
                    Looking for nearby Bluetooth devices
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* New Search Button */}
      <View className="items-center">
        <View className="absolute bottom-10 w-[90%] overflow-hidden rounded-full">
          <LinearGradient
            colors={
              isDarkMode ? ["#DBEAFE", "#3B82F6"] : ["#2563EB", "#1D4ED8"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View className="items-center justify-center">
              <TouchableOpacity onPress={handleStartSearch} className="w-full">
                <View className="flex-row items-center space-x-2 p-4">
                  <Ionicons
                    name="search"
                    className="mr-2"
                    size={20}
                    color="#fff"
                  />
                  <Text className="text-white font-semibold text-lg">
                    New Search
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </View>

      {/* Reset Button */}
      <TouchableOpacity
        onPress={handleReset}
        className={`absolute bottom-28 right-4 w-10 h-10 rounded-full items-center justify-center active:opacity-70 ${
          isDarkMode ? "bg-gray-800" : "bg-gray-200"
        }`}
      >
        <Ionicons
          name="refresh-outline"
          size={20}
          color={isDarkMode ? "#fff" : "#000"}
        />
      </TouchableOpacity>
    </View>
  );
}
