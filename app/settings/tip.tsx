import { View, Text, TouchableOpacity, Modal, Alert } from "react-native";
import React, { useState } from "react";

import { Ionicons } from "@expo/vector-icons";
import useRevenueCat from "@/hooks/useRevenueCat";
import Purchases from "react-native-purchases";
import Spinner from "react-native-loading-spinner-overlay/lib";

const tipOptions = [
  { amount: 0.99, description: "Small Tip", identifier: "accufind_small_tip" },
  { amount: 1.99, description: "Nice Tip", identifier: "accufind_nice_tip" },
  {
    amount: 2.99,
    description: "Amazing Tip",
    identifier: "accufind_amazing_tip",
  },
  {
    amount: 4.99,
    description: "Incredible Support",
    identifier: "accufind_incredible_tip",
  },
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
  const [purchaseSpinner, setPurchaseSpinner] = useState(false);
  const { currentOffering } = useRevenueCat();

  const handleTipPurchase = async (amount: number, identifier: string) => {
    setPurchaseSpinner(true);

    try {
      const tipPackage = (
        currentOffering?.availablePackages as unknown as any[]
      )?.find((pkg) => pkg.identifier === identifier);

      if (!tipPackage) {
        Alert.alert("Error", "Tip package not found");
        setPurchaseSpinner(false);
        return;
      }

      await Purchases.purchasePackage(tipPackage);
      Alert.alert("Thank You!", "Your support is greatly appreciated!");
      onClose();
    } catch (err: any) {
      if (!err.userCancelled) {
        Alert.alert("Error", "Failed to process tip");
      }
    } finally {
      setPurchaseSpinner(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <TouchableOpacity className="flex-1" activeOpacity={1} onPress={onClose}>
        <View className="flex-1 justify-end">
          <Spinner visible={purchaseSpinner} />
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
                    onPress={() => {
                      setSelectedTip(option.amount);
                      handleTipPurchase(option.amount, option.identifier);
                    }}
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
