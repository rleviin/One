import type { DaraUserData } from "../useDaraData";
import { buildDaraBrain } from "./dara-brain";

export type DaraReport = {
  title: string;
  periodLabel: string;
  summaryBullets: string[];
  scores: {
    recovery: number;
    stress: number;
    nutrition: number;
    context: number;
  };
  recommendations: string[];
};

export function buildDaraReport(data: DaraUserData): DaraReport {
  const brain = buildDaraBrain(data);
  const summary = brain.summary;

  return {
    title: "Dara Summary Report",
    periodLabel: "Latest available period",
    summaryBullets: [
      ...summary.summaries,
      brain.forecastView.hero.summary,
      ...brain.insightsView.patterns.slice(0, 3).map((item) => item.summary),
    ],
    scores: {
      recovery: summary.scores.recovery,
      stress: summary.scores.stress,
      nutrition: summary.scores.nutrition,
      context: summary.scores.contextDensity,
    },
    recommendations: [
      ...brain.forecastView.actions.slice(0, 3),
      "Keep adding daily check-ins to improve report accuracy.",
    ],
  };
}
