export type ProbabilityMarketSignal = {
  id: string;
  title: string;
  probability: number;
  category: "economy" | "politics" | "weather" | "technology" | "general";
  source: "mock" | "polymarket";
  updatedAt: string;
};

export type ProbabilityProviderData = {
  signals: ProbabilityMarketSignal[];
  source: "mock" | "polymarket";
  updatedAt: string;
};

export async function loadProbabilityProviderData(): Promise<ProbabilityProviderData> {
  return {
    signals: [
      {
        id: "economic-pressure",
        title: "Economic pressure context",
        probability: 0.42,
        category: "economy",
        source: "mock",
        updatedAt: new Date().toISOString(),
      },
    ],
    source: "mock",
    updatedAt: new Date().toISOString(),
  };
}
