export interface Device {
  id: string;
  name: string;
  rssi: number;
  lastSeen: Date;
  distance?: number;
  roundedDistance?: number;
  previousDistance?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  rssiHistory: number[];
  kalmanState?: {
    estimate: number;
    errorEstimate: number;
  };
  isFiltered?: boolean;
}
