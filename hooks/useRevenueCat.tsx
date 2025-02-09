import { useEffect, useState } from "react";
import Purchases, {
  CustomerInfo,
  PurchasesPackage,
} from "react-native-purchases";
import Offering from "react-native-purchases";

// Entitlements identifier in RevenueCat
const entitlementsIdentifier = {
  identifier: "accufind_payments",
};

// In-App Purchase identifiers for tips
const iapIdentifiers = {
  small_tip: "accufind_small_tip",
  nice_tip: "accufind_nice_tip",
  amazing_tip: "accufind_amazing_tip",
  incredible_tip: "accufind_incredible_tip",
};

// Subscription identifiers for reference
const subIdentifiers = {
  weekly: "accufind_weekly",
  yearly: "accufind_yearly",
};

// TypeScript types for the data structures
interface CustomOffering extends Offering {
  [key: string]: PurchasesPackage | undefined;
}

// *Make sure to input the RevenueCat API key in the RootLayout component
// Purchases.configure({
//   apiKey: process.env.EXPO_PUBLIC_REVENUECAT_API_KEY ?? "",
// });

export default function useRevenueCat() {
  const [currentOffering, setCurrentOffering] = useState<CustomOffering | null>(
    null
  );
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const isProMember =
    customerInfo?.entitlements?.active?.[entitlementsIdentifier.identifier];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get all offerings setup from RevenueCat
        const offerings = await Purchases.getOfferings();
        const customerInfo = await Purchases.getCustomerInfo();

        setCurrentOffering(offerings.current as any);
        setCustomerInfo(customerInfo);
      } catch (error) {
        console.error("Error retrieving data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const customerInfoUpdated = async (purchaserInfo: CustomerInfo) => {
      setCustomerInfo(purchaserInfo);
    };

    Purchases.addCustomerInfoUpdateListener(customerInfoUpdated);
  }, []);

  return { currentOffering, customerInfo, isProMember };
}
