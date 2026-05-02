import type { DailyCheckInData } from "./storage";
import type { UserSignals } from "./types";

export function clampSignal(value: number) {
  return Math.max(0, Math.min(10, Math.round(value)));
}

export function mapCheckInToSignals(
  current: UserSignals,
  checkIn: DailyCheckInData
): UserSignals {
  const recoveryFromEnergy = checkIn.energy;
  const recoveryFromStress = 10 - checkIn.stress;

  return {
    ...current,
    workload: clampSignal(checkIn.workload),
    spendingPressure: clampSignal(checkIn.spendingPressure),
    recovery: clampSignal((recoveryFromEnergy + recoveryFromStress) / 2),
  };
}

export function buildSummaryPoints(
  signals: UserSignals,
  checkIn: DailyCheckInData | null
) {
  const checkInPoints = checkIn
    ? [
        `Energy check-in: ${checkIn.energy}/10.`,
        `Stress check-in: ${checkIn.stress}/10.`,
        checkIn.note
          ? `Today context: ${checkIn.note}`
          : "No daily note added today.",
      ]
    : ["No daily check-in saved yet."];

  return [
    `Sleep is at ${signals.sleepHours.toFixed(1)}h.`,
    `Workload is ${signals.workload}/10.`,
    `Recovery is ${signals.recovery}/10.`,
    `Financial pressure is ${signals.spendingPressure}/10.`,
    ...checkInPoints,
    "Dara combines body signals, money pressure and daily context to estimate where your balance is moving.",
  ];
}
export type ForecastLevel = "stable" | "watch" | "risk";

export function getForecastLevel(checkIn: DailyCheckInData | null): ForecastLevel {
  if (!checkIn) return "watch";

  const pressureScore =
    checkIn.stress * 1.2 +
    checkIn.workload * 1.1 +
    checkIn.spendingPressure * 0.8 -
    checkIn.energy * 0.9;

  if (pressureScore >= 14) return "risk";
  if (pressureScore >= 8) return "watch";
  return "stable";
}

export function getForecastCopy(level: ForecastLevel) {
  if (level === "risk") {
    return {
      badge: "Rising risk",
      title: "If nothing changes, fatigue risk may rise in 3–5 days.",
      text: "Your current pressure pattern suggests that recovery may not fully compensate for load.",
      accent: "#FF647C",
      icon: "warning-outline" as const,
    };
  }

  if (level === "watch") {
    return {
      badge: "Watch zone",
      title: "Your balance may become unstable if pressure keeps building.",
      text: "Dara sees a pattern that is not urgent yet, but worth adjusting today.",
      accent: "#FF8A4C",
      icon: "pulse-outline" as const,
    };
  }

  return {
    badge: "Stable",
    title: "Your current pattern looks stable for the next few days.",
    text: "Keep protecting sleep, recovery and daily rhythm to maintain this trend.",
    accent: "#4ADE80",
    icon: "checkmark-circle-outline" as const,
  };
}

export function buildForecastWhyPoints(checkIn: DailyCheckInData | null) {
  if (!checkIn) {
    return [
      "No daily check-in saved yet.",
      "Dara is using a default baseline until you add today’s context.",
      "Check in from Home to make this forecast more personal.",
    ];
  }

  return [
    `Energy is ${checkIn.energy}/10.`,
    `Stress is ${checkIn.stress}/10.`,
    `Workload is ${checkIn.workload}/10.`,
    `Money pressure is ${checkIn.spendingPressure}/10.`,
    checkIn.note
      ? `Today context: ${checkIn.note}`
      : "No additional note added today.",
  ];
}

export function buildForecastChangePoints(level: ForecastLevel) {
  if (level === "risk") {
    return [
      "Reduce one non-critical task today.",
      "Protect sleep tonight as the highest-leverage action.",
      "Avoid major spending or commitment decisions today.",
    ];
  }

  if (level === "watch") {
    return [
      "Keep workload contained.",
      "Add one recovery action today.",
      "Use tomorrow’s check-in to confirm whether pressure is rising.",
    ];
  }

  return [
    "Keep your current rhythm stable.",
    "Do not add unnecessary load.",
    "Maintain sleep and recovery consistency.",
  ];
}
export type DaraInsight = {
  id: string;
  title: string;
  label: string;
  text: string;
  icon:
    | "sparkles-outline"
    | "analytics-outline"
    | "leaf-outline"
    | "card-outline"
    | "bulb-outline"
    | "restaurant-outline"
    | "create-outline"
    | "checkmark-circle-outline";
  accent: string;
  points: string[];
};

export function buildInsights(checkIn: DailyCheckInData | null): DaraInsight[] {
  if (!checkIn) {
    return [
      {
        id: "baseline",
        title: "Add your first check-in",
        label: "Baseline needed",
        text: "Dara needs today’s context before it can detect personal patterns.",
        icon: "sparkles-outline",
        accent: "#B9C6FF",
        points: [
          "Check in from Home to add energy, stress, workload and money pressure.",
          "After that, Dara can connect your signals into patterns.",
          "Insights become more useful as your history grows.",
        ],
      },
      {
        id: "future-patterns",
        title: "Patterns will appear here",
        label: "Coming soon",
        text: "Sleep, workload, recovery, food and finances will become connected insights.",
        icon: "analytics-outline",
        accent: "#58E7FF",
        points: [
          "Dara will look for repeated combinations.",
          "Example: low sleep plus high workload may predict fatigue.",
          "Example: high stress plus money pressure may predict unstable focus.",
        ],
      },
    ];
  }

  const insights: DaraInsight[] = [
    {
      id: "recovery-pressure",
      title: "Recovery pattern",
      label: "Recovery pattern",
      text: "Dara checks how energy, stress and workload are interacting today.",
      icon: "leaf-outline",
      accent: "#4ADE80",
      points: [
        `Energy is ${checkIn.energy}/10.`,
        `Stress is ${checkIn.stress}/10.`,
        `Workload is ${checkIn.workload}/10.`,
        "Dara reads this as a recovery pressure pattern.",
        "Today’s best move: reduce one non-critical load and protect sleep.",
      ],
    },
    {
      id: "money-stress",
      title: "Money and stress pattern",
      label: "Pressure pattern",
      text: "Dara watches whether financial pressure is adding background load.",
      icon: "card-outline",
      accent: "#58E7FF",
      points: [
        `Stress is ${checkIn.stress}/10.`,
        `Money pressure is ${checkIn.spendingPressure}/10.`,
        "This combination may affect focus and decision quality.",
        "Today’s best move: avoid major spending or commitment decisions.",
      ],
    },
    {
      id: "focus-risk",
      title: "Focus stability pattern",
      label: "Focus pattern",
      text: "Dara checks whether workload and energy support deep work today.",
      icon: "bulb-outline",
      accent: "#C96BFF",
      points: [
        `Workload is ${checkIn.workload}/10.`,
        `Energy is ${checkIn.energy}/10.`,
        "Dara watches whether focus is likely to stay stable.",
        "Today’s best move: do the most important task first and reduce context switching.",
      ],
    },
  ];

  if (checkIn.mealPhotoUri) {
    insights.push({
      id: "nutrition-context",
      title: "Nutrition context added",
      label: "Food signal",
      text: "Your meal photo gives Dara another clue about energy stability.",
      icon: "restaurant-outline",
      accent: "#FF8A4C",
      points: [
        "Meal photo was added to today’s check-in.",
        "For now Dara stores this as context.",
        "Later, AI meal review can estimate balance, protein/fiber and energy stability.",
      ],
    });
  }

  if (checkIn.note) {
    insights.push({
      id: "daily-context",
      title: "Today’s note may matter",
      label: "Context signal",
      text: "Your written note can explain changes that numbers alone miss.",
      icon: "create-outline",
      accent: "#7DA2FF",
      points: [
        `Today context: ${checkIn.note}`,
        "Dara treats this as a life event signal.",
        "Later, notes can be classified into work, finance, health, social or opportunity context.",
      ],
    });
  }

  return insights;
}
