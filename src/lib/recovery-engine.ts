import type { StoredHealthSummary } from "../storage";

export type RecoverySignal = {
  score: number;
  label: "low" | "moderate" | "good";
  title: string;
  summary: string;
  points: string[];
};

export function buildRecoverySignal(
  healthSummary?: StoredHealthSummary | null
): RecoverySignal | null {
  if (!healthSummary) {
    return null;
  }

  let score = 55;
  const points: string[] = [];

  const sleep = healthSummary.sleepHoursLastNight;
  const steps = healthSummary.stepsToday;
  const activeEnergy = healthSummary.activeEnergyToday;
  const hrvSamples = healthSummary.hrvSamples;

  if (sleep !== null && sleep !== undefined) {
    if (sleep >= 7) {
      score += 18;
      points.push(`Sleep looks supportive at ${sleep.toFixed(1)}h.`);
    } else if (sleep < 6) {
      score -= 20;
      points.push(`Sleep is short at ${sleep.toFixed(1)}h.`);
    } else {
      points.push(`Sleep is moderate at ${sleep.toFixed(1)}h.`);
    }
  } else {
    points.push("Sleep signal is not available yet.");
  }

  if (steps !== null && steps !== undefined) {
    if (steps >= 8000 && steps <= 13000) {
      score += 10;
      points.push(`Movement looks balanced at ${steps} steps.`);
    } else if (steps > 16000) {
      score -= 8;
      points.push(`High movement load today: ${steps} steps.`);
    } else {
      points.push(`Steps today: ${steps}.`);
    }
  }

  if (activeEnergy !== null && activeEnergy !== undefined) {
    if (activeEnergy > 750) {
      score -= 6;
      points.push(`Active energy is high: ${Math.round(activeEnergy)}.`);
    } else {
      points.push(`Active energy: ${Math.round(activeEnergy)}.`);
    }
  }

  if (hrvSamples > 0) {
    score += 7;
    points.push(`HRV signal available: ${hrvSamples} samples.`);
  }

  const boundedScore = Math.max(5, Math.min(95, Math.round(score)));

  const label =
    boundedScore >= 72 ? "good" : boundedScore >= 48 ? "moderate" : "low";

  return {
    score: boundedScore,
    label,
    title:
      label === "good"
        ? "Recovery looks supportive"
        : label === "moderate"
          ? "Recovery looks mixed"
          : "Recovery may need attention",
    summary:
      label === "good"
        ? "Sleep and activity signals are supporting your current trajectory."
        : label === "moderate"
          ? "Your recovery signal is usable but not fully strong today."
          : "Your current signals suggest lower recovery capacity.",
    points: points.slice(0, 4),
  };
}
