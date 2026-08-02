export type VehicleStatus = "idle" | "charging" | "driving";
export type SiteType = "depot" | "home" | "public";

export interface VehicleLocation {
  lat: number;
  lng: number;
  label: string;
  postcode: string;
  gridRegion: string;
}

export interface Vehicle {
  id: string;
  name: string;
  batteryPercent: number;
  chargeRateKw: number;
  status: VehicleStatus;
  temperatureC: number;
  siteType: SiteType;
  batteryCapacityKwh: number;
  location: VehicleLocation;
  updatedAt: string;
}

export interface Telemetry {
  vehicleId: string;
  batteryPercent: number;
  chargeRateKw: number;
  status: VehicleStatus;
  temperatureC: number;
  siteType: SiteType;
  location: VehicleLocation;
  updatedAt: string;
}
