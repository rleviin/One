import type { HealthRecordFile } from "../../storage";

import {
  loadHealthProviderData,
  type HealthProviderData,
} from "./health-provider";
import {
  loadWeatherProviderData,
  type WeatherProviderData,
} from "./weather-provider";
import {
  loadLocationProviderData,
  type LocationProviderData,
} from "./location-provider";
import {
  loadProbabilityProviderData,
  type ProbabilityProviderData,
} from "./probability-provider";

export type ExternalProviderBundleInput = {
  country?: string | null;
  healthRecord?: HealthRecordFile | null;
};

export type ExternalProviderBundle = {
  health: HealthProviderData;
  location: LocationProviderData;
  weather: WeatherProviderData;
  probability: ProbabilityProviderData;
  updatedAt: string;
};

export async function loadExternalProviderBundle({
  country = null,
  healthRecord = null,
}: ExternalProviderBundleInput = {}): Promise<ExternalProviderBundle> {
  const location = await loadLocationProviderData();

  const [health, weather, probability] = await Promise.all([
    loadHealthProviderData(healthRecord),
    loadWeatherProviderData({
      latitude: location.latitude,
      longitude: location.longitude,
    }),
    loadProbabilityProviderData({ country }),
  ]);

  return {
    health,
    location,
    weather,
    probability,
    updatedAt: new Date().toISOString(),
  };
}
