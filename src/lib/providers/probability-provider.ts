import { getDaraAuthToken } from "../auth-client";
import { DARA_API_URL } from "../config";

export type ProbabilityMarketSignal = {
  id: string;
  title: string;
  probability: number;
  category: "economy" | "politics" | "weather" | "technology" | "general";
  country: string | null;
  source: "mock" | "polymarket" | "server-cache" | "fallback";
  updatedAt: string;
};

export type ProbabilityProviderInput = {
  country?: string | null;
};

export type ProbabilityProviderData = {
  signals: ProbabilityMarketSignal[];
  source: "mock" | "polymarket" | "server-cache" | "fallback";
  country: string | null;
  updatedAt: string;
};

function buildFallbackSignals(country: string | null): ProbabilityMarketSignal[] {
  const updatedAt = new Date().toISOString();

  return [
    {
      id: "external-pressure-fallback",
      title: country
        ? `${country} external pressure context`
        : "Global external pressure context",
      probability: 0.42,
      category: "economy",
      country,
      source: "fallback",
      updatedAt,
    },
  ];
}

export async function loadProbabilityProviderData({
  country = null,
}: ProbabilityProviderInput = {}): Promise<ProbabilityProviderData> {
  try {
    const token = await getDaraAuthToken();

    if (!token) {
      throw new Error("Missing auth");
    }

    const response = await fetch(
      `${DARA_API_URL}/api/context/probability?country=${encodeURIComponent(country ?? "")}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Probability endpoint failed with ${response.status}`);
    }

    const json = await response.json();

    return json.probability as ProbabilityProviderData;
  } catch {
    return {
      signals: buildFallbackSignals(country),
      source: "fallback",
      country,
      updatedAt: new Date().toISOString(),
    };
  }
}
