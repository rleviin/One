import type { DaraAIResponse } from "./dara-ai-engine";

export type DaraAIClientRequest = {
  aiContext: unknown;
};

export async function requestDaraAIResponse(
  _request: DaraAIClientRequest
): Promise<DaraAIResponse | null> {
  // Later this will call our secure backend:
  // POST /api/dara/think
  // The mobile app must not contain OpenAI API keys.
  return null;
}
