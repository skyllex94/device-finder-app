import { View, Text, TouchableOpacity, Modal } from "react-native";
import React, { useState } from "react";
import { useThemeStore } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type TipOption = {
  amount: number;
  description: string;
};

const tipOptions: TipOption[] = [
  { amount: 0.99, description: "Small Tip" },
  { amount: 1.99, description: "Nice Tip" },
  { amount: 2.99, description: "Amazing Tip" },
  { amount: 4.99, description: "Incredible Support" },
];

type TipModalProps = {
  isVisible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
};

export default function TipModal({
  isVisible,
  onClose,
  isDarkMode,
}: TipModalProps) {
  const [selectedTip, setSelectedTip] = useState<number | null>(null);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose}>
        <View className="flex-1 justify-end">
          <View
            className={`mx-4 mb-6 rounded-2xl border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-gray-200 border-gray-300"
            }`}
          >
            <View className="p-4">
              {/* Header with close button */}
              <View className="flex-row justify-between items-center mb-3">
                <Text
                  className={`text-lg font-semibold ${
                    isDarkMode ? "text-white" : "text-black"
                  }`}
                >
                  Leave a Tip
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <Ionicons
                    name="close"
                    size={24}
                    color={isDarkMode ? "#9CA3AF" : "#4B5563"}
                  />
                </TouchableOpacity>
              </View>

              {/* Message */}
              <View className="mb-2">
                <Text
                  className={`text-base ${
                    isDarkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  If the app was helpful to you consider supporting me with a
                  small donation. It goes a long way.
                </Text>
              </View>

              {/* Tip Options */}
              <View>
                {tipOptions.map((option, index) => (
                  <TouchableOpacity
                    key={option.amount}
                    onPress={() => setSelectedTip(option.amount)}
                    className={`p-3 rounded-xl border ${
                      index !== tipOptions.length - 1 ? "mb-1.5" : ""
                    } ${
                      selectedTip === option.amount
                        ? isDarkMode
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-blue-500 bg-blue-50"
                        : isDarkMode
                        ? "border-gray-700 bg-gray-800/50"
                        : "border-gray-200 bg-gray-100"
                    }`}
                  >
                    <View className="flex-row justify-between items-center">
                      <View>
                        <Text
                          className={`text-lg font-medium ${
                            isDarkMode ? "text-white" : "text-black"
                          }`}
                        >
                          ${option.amount}
                        </Text>
                        <Text
                          className={
                            isDarkMode ? "text-gray-400" : "text-gray-600"
                          }
                        >
                          {option.description}
                        </Text>
                      </View>
                      {selectedTip === option.amount && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#3B82F6"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
