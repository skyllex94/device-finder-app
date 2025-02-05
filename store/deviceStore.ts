import { create } from "zustand";
import { Device } from "../types/device";

interface DeviceStore {
  devices: Device[];
  activeDeviceId: string | null;
  updateDevices: (devices: Device[]) => void;
  setActiveDevice: (deviceId: string) => void;
  getActiveDevice: () => Device | undefined;
}

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: [],
  activeDeviceId: null,
  updateDevices: (devices) => set({ devices }),
  setActiveDevice: (deviceId) => set({ activeDeviceId: deviceId }),
  getActiveDevice: () => {
    const { devices, activeDeviceId } = get();
    return devices.find((d) => d.id === activeDeviceId);
  },
}));
