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

type PolymarketMarket = {
  id?: string;
  question?: string;
  outcomes?: string;
  outcomePrices?: string;
};

type PolymarketEvent = {
  id?: string;
  title?: string;
  slug?: string;
  markets?: PolymarketMarket[];
};

function normalizeCountry(country?: string | null) {
  return country?.trim() || null;
}

function getCountryKeywords(country: string | null) {
  const normalized = country?.toLowerCase() ?? "";

  if (normalized.includes("united kingdom") || normalized === "uk") {
    return ["UK", "United Kingdom", "Bank of England", "inflation", "GBP"];
  }

  if (normalized.includes("united states") || normalized === "us") {
    return ["US", "United States", "Fed", "inflation", "recession"];
  }

  return ["inflation", "recession", "oil", "economy", "rates"];
}

function buildCountryMockSignals(country: string | null): ProbabilityMarketSignal[] {
  const updatedAt = new Date().toISOString();

  return [
    {
      id: "global-economic-pressure",
      title: country
        ? `${country} external pressure context`
        : "Global economic pressure context",
      probability: 0.42,
      category: "economy",
      country,
      source: "mock",
      updatedAt,
    },
  ];
}

function parseArray(value?: string): string[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function getYesProbability(market: PolymarketMarket) {
  const outcomes = parseArray(market.outcomes);
  const prices = parseArray(market.outcomePrices).map(Number);

  const yesIndex = outcomes.findIndex(
    (outcome) => outcome.toLowerCase() === "yes"
  );

  if (yesIndex === -1 || Number.isNaN(prices[yesIndex])) {
    return null;
  }

  return prices[yesIndex];
}

function inferCategory(text: string): ProbabilityMarketSignal["category"] {
  const lower = text.toLowerCase();

  if (
    lower.includes("inflation") ||
    lower.includes("recession") ||
    lower.includes("rates") ||
    lower.includes("economy") ||
    lower.includes("oil") ||
    lower.includes("gdp")
  ) {
    return "economy";
  }

  if (
    lower.includes("election") ||
    lower.includes("president") ||
    lower.includes("government") ||
    lower.includes("minister")
  ) {
    return "politics";
  }

  if (
    lower.includes("weather") ||
    lower.includes("storm") ||
    lower.includes("temperature")
  ) {
    return "weather";
  }

  if (
    lower.includes("ai") ||
    lower.includes("technology") ||
    lower.includes("crypto")
  ) {
    return "technology";
  }

  return "general";
}

export async function loadProbabilityProviderData({
  country = null,
}: ProbabilityProviderInput = {}): Promise<ProbabilityProviderData> {
  const normalizedCountry = normalizeCountry(country);
  const keywords = getCountryKeywords(normalizedCountry);

  try {
    const url =
      "https://gamma-api.polymarket.com/events" +
      "?active=true&closed=false&order=volume_24hr&ascending=false&limit=100";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Polymarket API failed with status ${response.status}`);
    }

    const events = (await response.json()) as PolymarketEvent[];
    const updatedAt = new Date().toISOString();

    const signals = events
      .flatMap((event) =>
        (event.markets ?? []).map((market) => {
          const title = market.question || event.title || "Polymarket signal";
          const text = `${title} ${event.title ?? ""}`;
          const probability = getYesProbability(market);

          return {
            market,
            title,
            text,
            probability,
          };
        })
      )
      .filter((item) => item.probability !== null)
      .filter((item) =>
        keywords.some((keyword) =>
          item.text.toLowerCase().includes(keyword.toLowerCase())
        )
      )
      .slice(0, 3)
      .map((item, index) => ({
        id: item.market.id ?? `polymarket-${index}`,
        title: item.title,
        probability: item.probability ?? 0,
        category: inferCategory(item.text),
        country: normalizedCountry,
        source: "polymarket" as const,
        updatedAt,
      }));

    if (signals.length === 0) {
      throw new Error("No country-relevant Polymarket signals found");
    }

    return {
      signals,
      source: "polymarket",
      country: normalizedCountry,
      updatedAt,
    };
  } catch {
    return {
      signals: buildCountryMockSignals(normalizedCountry),
      source: "mock",
      country: normalizedCountry,
      updatedAt: new Date().toISOString(),
    };
  }
}
