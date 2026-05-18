type ProbabilityCategory = "economy" | "politics" | "weather" | "technology" | "general";

type ProbabilitySignal = {
  id: string;
  title: string;
  probability: number;
  category: ProbabilityCategory;
  country: string | null;
  source: "server-cache" | "fallback";
  updatedAt: string;
};

type ProbabilityContext = {
  signals: ProbabilitySignal[];
  source: "server-cache" | "fallback";
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
  title?: string;
  markets?: PolymarketMarket[];
};

let cachedContext: ProbabilityContext | null = null;
let cachedAt = 0;

const CACHE_TTL_MS = 1000 * 60 * 60 * 6;

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

function inferCategory(text: string): ProbabilityCategory {
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

function fallbackContext(country: string | null): ProbabilityContext {
  return {
    signals: [
      {
        id: "external-pressure-fallback",
        title: country
          ? `${country} external pressure context`
          : "Global external pressure context",
        probability: 0.42,
        category: "economy",
        country,
        source: "fallback",
        updatedAt: new Date().toISOString(),
      },
    ],
    source: "fallback",
    country,
    updatedAt: new Date().toISOString(),
  };
}

export async function getCachedProbabilityContext({
  country = null,
}: {
  country?: string | null;
} = {}): Promise<ProbabilityContext> {
  const normalizedCountry = normalizeCountry(country);
  const now = Date.now();

  if (cachedContext && now - cachedAt < CACHE_TTL_MS) {
    return {
      ...cachedContext,
      country: normalizedCountry,
      signals: cachedContext.signals.map((signal) => ({
        ...signal,
        country: normalizedCountry,
      })),
    };
  }

  try {
    const keywords = getCountryKeywords(normalizedCountry);
    const url =
      "https://gamma-api.polymarket.com/events" +
      "?active=true&closed=false&order=volume_24hr&ascending=false&limit=100";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Polymarket failed with ${response.status}`);
    }

    const events = (await response.json()) as PolymarketEvent[];
    const updatedAt = new Date().toISOString();

    const signals = events
      .flatMap((event) =>
        (event.markets ?? []).map((market) => {
          const title = market.question || event.title || "Probability signal";
          const text = `${title} ${event.title ?? ""}`;
          const probability = getYesProbability(market);

          return { market, title, text, probability };
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
        id: item.market.id ?? `probability-${index}`,
        title: item.title,
        probability: item.probability ?? 0,
        category: inferCategory(item.text),
        country: normalizedCountry,
        source: "server-cache" as const,
        updatedAt,
      }));

    if (signals.length === 0) {
      throw new Error("No probability signals found");
    }

    cachedContext = {
      signals,
      source: "server-cache",
      country: normalizedCountry,
      updatedAt,
    };

    cachedAt = now;
    return cachedContext;
  } catch {
    return fallbackContext(normalizedCountry);
  }
}
