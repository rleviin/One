import type { DaraUserData } from "../useDaraData";
import { buildDaraBrain } from "./dara-brain";

export type DaraAIResponse = {
  headline: string;
  summary: string;
  reasoning: string[];
  recommendations: string[];
  confidence: number;
  mode: "fallback" | "ai";
};

export function buildDaraAIContext(data: DaraUserData) {
  const brain = buildDaraBrain(data);

  return {
    latestCheckIn: data.dailyCheckIn,
    contextCount: data.dailyContextEvents.length,
    forecast: brain.forecastView.hero,
    patterns: brain.insightsView.patterns.slice(0, 5),
    externalSignals: brain.externalSignalsView,
  };
}

export async function generateDaraAIResponse(
  data: DaraUserData
): Promise<DaraAIResponse> {
  const context = buildDaraAIContext(data);

  return {
    headline: context.forecast.title,
    summary: context.forecast.summary,
    reasoning: [
      ...context.patterns.slice(0, 3).map((pattern) => pattern.summary),
      `Context signals available: ${context.contextCount}.`,
    ],
    recommendations: [
      ...buildDaraBrain(data).forecastView.actions.slice(0, 3),
    ],
    confidence: context.forecast.confidence,
    mode: "fallback",
  };
}
