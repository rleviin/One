import {
  loadHealthProviderData,
  type HealthProviderData,
} from "./health-provider";
import {
  loadWeatherProviderData,
  type WeatherProviderData,
} from "./weather-provider";

export type ExternalProviderBundle = {
  health: HealthProviderData;
  weather: WeatherProviderData;
  updatedAt: string;
};

export async function loadExternalProviderBundle(): Promise<ExternalProviderBundle> {
  const [health, weather] = await Promise.all([
    loadHealthProviderData(),
    loadWeatherProviderData(),
  ]);

  return {
    health,
    weather,
    updatedAt: new Date().toISOString(),
  };
}
