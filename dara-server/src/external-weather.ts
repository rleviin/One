type WeatherCondition = "clear" | "cloudy" | "rain" | "storm" | "snow" | "unknown";

type CachedWeather = {
  temperatureC: number | null;
  condition: WeatherCondition;
  daylightHours: number | null;
  humidity: number | null;
  source: "server-cache" | "fallback";
  updatedAt: string;
};

let cachedWeather: CachedWeather | null = null;
let cachedAt = 0;

const CACHE_TTL_MS = 1000 * 60 * 60 * 3;

function mapWeatherCodeToCondition(code: number | undefined): WeatherCondition {
  if (code === undefined) return "unknown";
  if (code === 0 || code === 1) return "clear";
  if (code === 2 || code === 3 || code === 45 || code === 48) return "cloudy";
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return "rain";
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return "snow";
  if (code >= 95) return "storm";
  return "unknown";
}

export async function getCachedWeatherContext({
  latitude = 53.4808,
  longitude = -2.2426,
}: {
  latitude?: number;
  longitude?: number;
} = {}): Promise<CachedWeather> {
  const now = Date.now();

  if (cachedWeather && now - cachedAt < CACHE_TTL_MS) {
    return cachedWeather;
  }

  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      "&current=temperature_2m,relative_humidity_2m,weather_code" +
      "&daily=daylight_duration" +
      "&timezone=auto";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Open-Meteo failed with ${response.status}`);
    }

    const json = await response.json();
    const daylightSeconds = json.daily?.daylight_duration?.[0] ?? null;

    cachedWeather = {
      temperatureC: json.current?.temperature_2m ?? null,
      condition: mapWeatherCodeToCondition(json.current?.weather_code),
      daylightHours:
        daylightSeconds === null
          ? null
          : Math.round((daylightSeconds / 3600) * 10) / 10,
      humidity: json.current?.relative_humidity_2m ?? null,
      source: "server-cache",
      updatedAt: new Date().toISOString(),
    };

    cachedAt = now;
    return cachedWeather;
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
