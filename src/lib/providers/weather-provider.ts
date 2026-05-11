export type WeatherProviderData = {
  temperatureC: number | null;
  condition: "clear" | "cloudy" | "rain" | "storm" | "snow" | "unknown";
  daylightHours: number | null;
  humidity: number | null;
  source: "mock" | "weather-api";
  updatedAt: string;
};

type OpenMeteoResponse = {
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    weather_code?: number;
  };
  daily?: {
    daylight_duration?: number[];
  };
};

function mapWeatherCodeToCondition(
  code: number | undefined
): WeatherProviderData["condition"] {
  if (code === undefined) return "unknown";

  if (code === 0 || code === 1) return "clear";
  if (code === 2 || code === 3 || code === 45 || code === 48) return "cloudy";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snow";
  if (code >= 95) return "storm";

  return "unknown";
}

export async function loadWeatherProviderData(): Promise<WeatherProviderData> {
  try {
    const latitude = 53.4808;
    const longitude = -2.2426;

    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      "&current=temperature_2m,relative_humidity_2m,weather_code" +
      "&daily=daylight_duration" +
      "&timezone=auto";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API failed with status ${response.status}`);
    }

    const json = (await response.json()) as OpenMeteoResponse;

    const daylightSeconds = json.daily?.daylight_duration?.[0] ?? null;

    return {
      temperatureC: json.current?.temperature_2m ?? null,
      condition: mapWeatherCodeToCondition(json.current?.weather_code),
      daylightHours:
        daylightSeconds === null ? null : Math.round((daylightSeconds / 3600) * 10) / 10,
      humidity: json.current?.relative_humidity_2m ?? null,
      source: "weather-api",
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return {
      temperatureC: null,
      condition: "unknown",
      daylightHours: null,
      humidity: null,
      source: "mock",
      updatedAt: new Date().toISOString(),
    };
  }
}
