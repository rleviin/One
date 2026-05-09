import type { DailyCheckInData, DailyContextEvent, ExternalContextData, PersonalSetupData } from "../storage";

export type DaraSignalTone = "green" | "orange" | "red" | "blue" | "purple";

export type DaraSignal = {
  id: string;
  title: string;
  summary: string;
  score: number;
  tone: DaraSignalTone;
};

export function getScoreTone(score: number): DaraSignalTone {
  if (score >= 75) {
    return "green";
  }

  if (score >= 50) {
    return "orange";
  }

  return "red";
}

export function buildNutritionScore(contextEvents: DailyContextEvent[]) {
  const mealCount = contextEvents.filter((event) => event.type === "meal").length;

  if (mealCount >= 3) {
    return 82;
  }

  if (mealCount === 2) {
    return 68;
  }

  if (mealCount === 1) {
    return 52;
  }

  return 24;
}

export function buildContextDensityScore(contextEvents: DailyContextEvent[]) {
  return Math.min(100, contextEvents.length * 18);
}

export function buildStressScore(checkIn: DailyCheckInData | null) {
  if (!checkIn) {
    return 40;
  }

  const pressure = checkIn.stress * 0.45 + checkIn.workload * 0.35 + checkIn.spendingPressure * 0.2;

  return Math.round(Math.min(100, Math.max(0, pressure * 10)));
}

export function buildRecoveryScore(checkIn: DailyCheckInData | null) {
  if (!checkIn) {
    return 50;
  }

  const recovery = checkIn.energy * 0.7 + (10 - checkIn.stress) * 0.3;

  return Math.round(Math.min(100, Math.max(0, recovery * 10)));
}

export function buildCheckInPressureScore(checkIn: DailyCheckInData | null) {
  if (!checkIn) {
    return null;
  }

  return (
    checkIn.stress * 1.2 +
    checkIn.workload * 1.1 +
    checkIn.spendingPressure * 0.8 -
    checkIn.energy * 0.9
  );
}

export function buildActiveSignalFromCheckIn(checkIn: DailyCheckInData | null) {
  const pressureScore = buildCheckInPressureScore(checkIn);

  if (pressureScore === null) {
    return null;
  }

  if (pressureScore >= 14) {
    return {
      badge: "High risk",
      title: "Your balance is starting to slip.",
      text: "Sleep, load and recovery are moving out of sync. Small shifts now can prevent a bigger dip later.",
      accent: "red" as const,
    };
  }

  if (pressureScore >= 8) {
    return {
      badge: "Watch",
      title: "Pressure is starting to build.",
      text: "Your check-in shows some load, but there is still room to correct the pattern today.",
      accent: "orange" as const,
    };
  }

  return {
    badge: "Stable",
    title: "Your balance looks stable today.",
    text: "Your latest check-in shows enough energy and low pressure. Keep the rhythm steady.",
    accent: "green" as const,
  };
}

export function buildDailySummary({
  checkIn,
  contextEvents,
  personalSetup,
  externalContext,
}: {
  checkIn: DailyCheckInData | null;
  contextEvents: DailyContextEvent[];
  personalSetup?: PersonalSetupData | null;
  externalContext?: ExternalContextData | null;
}) {
  const summaries: string[] = [];
  const nutritionScore = buildNutritionScore(contextEvents);
  const contextDensityScore = buildContextDensityScore(contextEvents);
  const stressScore = buildStressScore(checkIn);
  const recoveryScore = buildRecoveryScore(checkIn);

  if (recoveryScore >= 75) {
    summaries.push("Recovery stability looks strong.");
  }

  if (stressScore >= 70) {
    summaries.push("Pressure signals are elevated today.");
  }

  if (nutritionScore < 50) {
    summaries.push("Nutrition context is still limited for this day.");
  }

  if (contextDensityScore >= 60) {
    summaries.push("Dara has enough context to build a richer daily picture.");
  }

  if (externalContext?.economicPressure === "high") {
    summaries.push("External economic pressure may increase background financial load.");
  }

  if (externalContext?.inflationTrend === "rising") {
    summaries.push("Inflation trend suggests cost pressure may rise over time.");
  }

  if (externalContext?.costOfLivingPressure === "high") {
    summaries.push("Cost of living pressure may reduce financial flexibility.");
  }

  if (externalContext?.politicalStability === "volatile") {
    summaries.push("Political uncertainty may increase external context risk.");
  }

  if (!externalContext && personalSetup?.country) {
    summaries.push(`External context can later be adjusted for ${personalSetup.country}.`);
  }

  if (summaries.length === 0) {
    summaries.push("Dara needs more signals to build a confident daily summary.");
  }

  return {
    summaries,
    scores: {
      nutrition: nutritionScore,
      contextDensity: contextDensityScore,
      stress: stressScore,
      recovery: recoveryScore,
    },
  };
}

export function buildHomeSignals({
  checkIn,
  contextEvents,
}: {
  checkIn: DailyCheckInData | null;
  contextEvents: DailyContextEvent[];
}): DaraSignal[] {
  const nutritionScore = buildNutritionScore(contextEvents);
  const contextDensityScore = buildContextDensityScore(contextEvents);
  const stressScore = buildStressScore(checkIn);
  const recoveryScore = buildRecoveryScore(checkIn);

  return [
    {
      id: "recovery",
      title: "Recovery signal",
      summary:
        recoveryScore >= 75
          ? "Energy and stress currently suggest stable recovery."
          : "Recovery may need more support from sleep, food or lower pressure.",
      score: recoveryScore,
      tone: getScoreTone(recoveryScore),
    },
    {
      id: "pressure",
      title: "Pressure load",
      summary:
        stressScore >= 70
          ? "Stress, workload and money pressure are combining into higher load."
          : "Current pressure looks manageable from available signals.",
      score: 100 - stressScore,
      tone: getScoreTone(100 - stressScore),
    },
    {
      id: "context",
      title: "Context depth",
      summary:
        contextDensityScore >= 60
          ? "Dara has enough context to explain the day with more confidence."
          : "Add meals, notes or events to make Dara’s guidance more personal.",
      score: contextDensityScore,
      tone: getScoreTone(contextDensityScore),
    },
    {
      id: "nutrition",
      title: "Nutrition quality",
      summary:
        nutritionScore >= 65
          ? "Meal signals are becoming useful for energy and recovery analysis."
          : "Nutrition signal is still light. Meal photos can improve future insights.",
      score: nutritionScore,
      tone: getScoreTone(nutritionScore),
    },
  ];
}
