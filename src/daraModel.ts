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
