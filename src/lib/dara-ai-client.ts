import { DARA_API_URL } from "./config";
import type { DaraAIResponse } from "./dara-ai-engine";

export type DaraAIClientRequest = {
  aiContext: unknown;
};

export async function requestDaraAIResponse(
  request: DaraAIClientRequest
): Promise<DaraAIResponse | null> {
  const response = await fetch(`${DARA_API_URL}/api/dara/think`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as DaraAIResponse;
}
