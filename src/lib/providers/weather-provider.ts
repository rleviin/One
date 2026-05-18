import { getDaraAuthToken } from "../auth-client";
import { DARA_API_URL } from "../config";

export type WeatherProviderData = {
  temperatureC: number | null;
  condition: "clear" | "cloudy" | "rain" | "storm" | "snow" | "unknown";
  daylightHours: number | null;
  humidity: number | null;
  source: "mock" | "weather-api" | "server-cache" | "fallback";
  updatedAt: string;
};

export type WeatherProviderInput = {
  latitude?: number | null;
  longitude?: number | null;
};

export async function loadWeatherProviderData({
  latitude = 53.4808,
  longitude = -2.2426,
}: WeatherProviderInput = {}): Promise<WeatherProviderData> {
  try {
    const token = await getDaraAuthToken();

    if (!token) {
      throw new Error("Missing auth");
    }

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const response = await fetch(
      `${DARA_API_URL}/api/context/weather?latitude=${latitude}&longitude=${longitude}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Weather endpoint failed with ${response.status}`);
    }

    const json = await response.json();

    return json.weather as WeatherProviderData;
  } catch {
    return {
      temperatureC: null,
      condition: "unknown",
      daylightHours: null,
      humidity: null,
      source: "fallback",
      updatedAt: new Date().toISOString(),
    };
  }
}
