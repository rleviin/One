import type { DaraUserData } from "../useDaraData";
import { buildDaraBrain } from "./dara-brain";
import { requestDaraAIResponse } from "./dara-ai-client";

export type DaraAIResponse = {
  headline: string;
  summary: string;
  reasoning: string[];
  recommendations: string[];
  confidence: number;
  mode: "fallback" | "ai";
};

export function buildDaraAIContext(data: DaraUserData) {
  return buildDaraBrain(data).aiContext;
}

function buildFallbackResponse(data: DaraUserData): DaraAIResponse {
  const brain = buildDaraBrain(data);
  const context = brain.aiContext;

  return {
    headline: context.forecast.title,
    summary: context.forecast.summary,
    reasoning: [
      ...context.patterns.slice(0, 3).map((pattern) => pattern.summary),
      `Context signals available: ${context.contextCount}.`,
    ],
    recommendations: brain.forecastView.actions.slice(0, 3),
    confidence: context.forecast.confidence,
    mode: "fallback",
  };
}

export async function generateDaraAIResponse(
  data: DaraUserData
): Promise<DaraAIResponse> {
  const aiContext = buildDaraAIContext(data);

  try {
    const response = await requestDaraAIResponse({
      aiContext,
    });

    if (response) {
      return {
        ...response,
        mode: "ai",
      };
    }
  } catch {
    // fallback below
  }

  return buildFallbackResponse(data);
}
