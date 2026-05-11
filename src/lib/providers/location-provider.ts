import * as Location from "expo-location";

export type LocationProviderData = {
  latitude: number | null;
  longitude: number | null;
  permission: "granted" | "denied" | "undetermined";
  source: "expo-location" | "fallback";
  updatedAt: string;
};

export async function loadLocationProviderData(): Promise<LocationProviderData> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== "granted") {
      return {
        latitude: null,
        longitude: null,
        permission: permission.status,
        source: "fallback",
        updatedAt: new Date().toISOString(),
      };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      permission: "granted",
      source: "expo-location",
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      latitude: null,
      longitude: null,
      permission: "undetermined",
      source: "fallback",
      updatedAt: new Date().toISOString(),
    };
  }
}
