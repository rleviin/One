export type ProbabilityMarketSignal = {
  id: string;
  title: string;
  probability: number;
  category: "economy" | "politics" | "weather" | "technology" | "general";
  country: string | null;
  source: "mock" | "polymarket";
  updatedAt: string;
};

export type ProbabilityProviderInput = {
  country?: string | null;
};

export type ProbabilityProviderData = {
  signals: ProbabilityMarketSignal[];
  source: "mock" | "polymarket";
  country: string | null;
  updatedAt: string;
};

function normalizeCountry(country?: string | null) {
  return country?.trim() || null;
}

function buildCountryMockSignals(country: string | null): ProbabilityMarketSignal[] {
  const updatedAt = new Date().toISOString();

  if (country?.toLowerCase().includes("united kingdom") || country?.toLowerCase() === "uk") {
    return [
      {
        id: "uk-cost-pressure",
        title: "UK cost-of-living pressure context",
        probability: 0.48,
        category: "economy",
        country,
        source: "mock",
        updatedAt,
      },
    ];
  }

  if (country?.toLowerCase().includes("united states") || country?.toLowerCase() === "us") {
    return [
      {
        id: "us-rate-pressure",
        title: "US rate and inflation pressure context",
        probability: 0.44,
        category: "economy",
        country,
        source: "mock",
        updatedAt,
      },
    ];
  }

  return [
    {
      id: "global-economic-pressure",
      title: "Global economic pressure context",
      probability: 0.42,
      category: "economy",
      country,
      source: "mock",
      updatedAt,
    },
  ];
}

export async function loadProbabilityProviderData({
  country = null,
}: ProbabilityProviderInput = {}): Promise<ProbabilityProviderData> {
  const normalizedCountry = normalizeCountry(country);

  return {
    signals: buildCountryMockSignals(normalizedCountry),
    source: "mock",
    country: normalizedCountry,
    updatedAt: new Date().toISOString(),
  };
}
