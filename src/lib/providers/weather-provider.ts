export type WeatherProviderData = {
  temperatureC: number | null;
  condition: "clear" | "cloudy" | "rain" | "storm" | "snow" | "unknown";
  daylightHours: number | null;
  humidity: number | null;
  source: "mock" | "weather-api";
  updatedAt: string;
};

export async function loadWeatherProviderData(): Promise<WeatherProviderData> {
  return {
    temperatureC: 12,
    condition: "cloudy",
    daylightHours: 8.4,
    humidity: 78,
    source: "mock",
    updatedAt: new Date().toISOString(),
  };
}
