import type { ExternalContextData, PersonalSetupData } from "../storage";

export function buildMockExternalContext(
  personalSetup: PersonalSetupData | null
): ExternalContextData | null {
  if (!personalSetup?.country) {
    return null;
  }

  return {
    country: personalSetup.country,
    economicPressure: "medium",
    inflationTrend: "stable",
    costOfLivingPressure: "medium",
    politicalStability: "stable",
    updatedAt: new Date().toISOString(),
  };
}
