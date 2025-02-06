import { create } from "zustand";

type DistanceUnit = "automatic" | "feet" | "meters";

interface SettingsStore {
  distanceUnit: DistanceUnit;
  setDistanceUnit: (unit: DistanceUnit) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  distanceUnit: "automatic",
  setDistanceUnit: (unit) => set({ distanceUnit: unit }),
}));
