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
