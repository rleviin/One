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
  loadProbabilityProviderData,
  type ProbabilityProviderData,
} from "./probability-provider";

export type ExternalProviderBundleInput = {
  country?: string | null;
  healthRecord?: HealthRecordFile | null;
};

export type ExternalProviderBundle = {
  health: HealthProviderData;
  weather: WeatherProviderData;
  probability: ProbabilityProviderData;
  updatedAt: string;
};

export async function loadExternalProviderBundle({
  country = null,
  healthRecord = null,
}: ExternalProviderBundleInput = {}): Promise<ExternalProviderBundle> {
  const [health, weather, probability] = await Promise.all([
    loadHealthProviderData(healthRecord),
    loadWeatherProviderData(),
    loadProbabilityProviderData({ country }),
  ]);

  return {
    health,
    weather,
    probability,
    updatedAt: new Date().toISOString(),
  };
}
