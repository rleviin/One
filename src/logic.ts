import type { RiskLevel, UserSignals } from "./types";

export function calculateRisk(signals: UserSignals): RiskLevel {
  const score =
    (8 - signals.sleepHours) * 1.2 +
    signals.workload * 1.1 +
    signals.recovery * 0.9 +
    signals.spendingPressure * 0.8;

  if (score >= 10) return "high";
  if (score >= 5) return "medium";
  return "low";
}

export function getSleepRecommendation(hours: number) {
  if (hours < 6.5) return "Aim for 7.5h tonight";
  if (hours < 7.2) return "Good range. Keep it stable";
  return "Sleep is supporting recovery";
}

export function getWorkloadRecommendation(workload: number) {
  if (workload >= 8) return "Reduce one task today";
  if (workload >= 6) return "Keep load under control";
  return "Workload is manageable";
}

export function getRecoveryRecommendation(recovery: number) {
  if (recovery <= 4) return "Prioritize recovery today";
  if (recovery <= 6) return "Add one recovery activity";
  return "Recovery is compensating well";
}

export function getFinanceRecommendation(pressure: number) {
  if (pressure >= 7) return "Avoid major commitments";
  if (pressure >= 5) return "Reduce unnecessary spending";
  return "Financial pressure is stable";
}
