import type { DailyCheckInData, DailyContextEvent } from "../storage";

export type DaraPatternSeverity = "low" | "medium" | "high";

export type DaraPatternInsight = {
  id: string;
  title: string;
  summary: string;
  severity: DaraPatternSeverity;
  label: string;
  accent: string;
  icon:
    | "git-branch-outline"
    | "pulse-outline"
    | "battery-dead-outline"
    | "fitness-outline"
    | "restaurant-outline"
    | "checkmark-circle-outline";
  points: string[];
};

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function buildPatternAnalysis({
  checkInHistory,
  contextEvents,
}: {
  checkInHistory: DailyCheckInData[];
  contextEvents: DailyContextEvent[];
}): DaraPatternInsight[] {
  const recentCheckIns = checkInHistory.slice(0, 7);

  if (recentCheckIns.length < 2) {
    return [
      {
        id: "insufficient-history",
        title: "Pattern learning started",
        summary:
          "Dara needs a few more check-ins before detecting reliable personal patterns.",
        severity: "low",
        label: "LEARNING",
        accent: "#B9C6FF",
        icon: "git-branch-outline",
        points: [
          "Add at least 2–3 check-ins.",
          "Daily context improves pattern quality.",
          "Dara will compare future signals against your baseline.",
        ],
      },
    ];
  }

  const avgStress = average(recentCheckIns.map((item) => item.stress));
  const avgEnergy = average(recentCheckIns.map((item) => item.energy));
  const avgWorkload = average(recentCheckIns.map((item) => item.workload));
  const mealSignals = contextEvents.filter((event) => event.type === "meal").length;

  const insights: DaraPatternInsight[] = [];

  if (avgStress >= 7) {
    insights.push({
      id: "stress-elevated",
      title: "Stress pattern is elevated",
      summary:
        "Recent check-ins suggest stress has been staying high rather than appearing as a one-day spike.",
      severity: "high",
      label: "HIGH",
      accent: "#FF647C",
      icon: "pulse-outline",
      points: [
        "Stress is repeatedly high across recent check-ins.",
        "This looks more like a pattern than a one-day spike.",
        "Recovery actions should be prioritised before adding more load.",
      ],
    });
  }

  if (avgEnergy <= 4.5) {
    insights.push({
      id: "energy-low",
      title: "Energy baseline looks reduced",
      summary:
        "Recent energy scores are below a stable range. Dara will watch whether this becomes a recovery trend.",
      severity: "medium",
      label: "MEDIUM",
      accent: "#FF8A4C",
      icon: "battery-dead-outline",
      points: [
        "Energy is trending below a stable range.",
        "Dara will watch whether this continues over several days.",
        "Sleep, meals and workload are the first places to check.",
      ],
    });
  }

  if (avgWorkload >= 7 && avgEnergy <= 5.5) {
    insights.push({
      id: "load-recovery-gap",
      title: "Load may be outpacing recovery",
      summary:
        "Workload appears high while energy is not fully compensating. This can increase fatigue risk.",
      severity: "high",
      label: "HIGH",
      accent: "#FF647C",
      icon: "fitness-outline",
      points: [
        "Workload is high while energy is not fully compensating.",
        "This gap can increase fatigue risk.",
        "Reducing non-critical load may improve tomorrow’s recovery.",
      ],
    });
  }

  if (mealSignals === 0) {
    insights.push({
      id: "nutrition-signal-light",
      title: "Nutrition signal is missing",
      summary:
        "No meal context is available yet. Meal photos or notes can improve energy and recovery analysis.",
      severity: "low",
      label: "LIGHT",
      accent: "#58E7FF",
      icon: "restaurant-outline",
      points: [
        "No meal context is available yet.",
        "Meal photos or notes can improve recovery analysis.",
        "Dara can later estimate food quality from meal images.",
      ],
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "patterns-stable",
      title: "No strong negative pattern detected",
      summary:
        "Recent check-ins look balanced enough for Dara to treat this as a stable short-term pattern.",
      severity: "low",
      label: "STABLE",
      accent: "#4ADE80",
      icon: "checkmark-circle-outline",
      points: [
        "No strong negative pattern is visible.",
        "Recent check-ins look balanced enough for now.",
        "Keep adding data so Dara can detect subtle changes earlier.",
      ],
    });
  }

  return insights;
}
