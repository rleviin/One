import type {
  DailyCheckInData,
  DailyContextEvent,
  ExternalContextData,
  StoredHealthSummary,
} from "../storage";
import type { DaraPatternInsight } from "./pattern-engine";
import type { ExternalProviderBundle } from "./providers/external-providers";

export type ForecastRiskLevel = "low" | "medium" | "high";

export type DaraForecast = {
  title: string;
  summary: string;
  risk: ForecastRiskLevel;
  likelihood: "low likelihood" | "elevated likelihood" | "high likelihood";
  badge: string;
  accent: string;
  icon: "warning-outline" | "pulse-outline" | "checkmark-circle-outline";
  confidence: number;
  reasons: string[];
  changePoints: string[];
  timeline: {
    day: string;
    title: string;
    text: string;
  }[];
};

type BuildForecastInput = {
  latestCheckIn: DailyCheckInData | null;
  checkInHistory: DailyCheckInData[];
  contextEvents: DailyContextEvent[];
  externalContext?: ExternalContextData | null;
  externalProviders?: ExternalProviderBundle | null;
  healthSummary?: StoredHealthSummary | null;
  bloodTestSummary?: string | null;
  bloodTestFocusAreas?: string[];
  bloodTestBiomarkers?: {
    name: string;
    status?: string;
    value?: string;
    unit?: string;
  }[];
  patterns?: DaraPatternInsight[];
};

export function buildForecast({
  latestCheckIn,
  checkInHistory,
  contextEvents,
  externalContext,
  externalProviders,
  healthSummary,
  bloodTestSummary,
  bloodTestFocusAreas = [],
  bloodTestBiomarkers = [],
  patterns = [],
}: BuildForecastInput): DaraForecast {
  if (!latestCheckIn) {
    return {
      title: "Not enough data",
      summary:
        "Dara needs more recent check-ins to build a forecast.",
      risk: "low",
      likelihood: "low likelihood",
      badge: "Baseline",
      accent: "#FF8A4C",
      icon: "pulse-outline",
      confidence: 12,
      reasons: [
        "No recent check-in is available.",
        "Forecast confidence increases after daily check-ins.",
        "Context, meals and history will make future forecasts stronger.",
      ],
      changePoints: [
        "Complete a daily check-in.",
        "Add meals, notes or events during the day.",
        "Connect health and external context later.",
      ],
      timeline: [
        {
          day: "Today",
          title: "Baseline forecast",
          text: "Add a check-in to personalize the forecast.",
        },
        {
          day: "2–3 days",
          title: "Forecast confidence is low",
          text: "Dara needs more recent signals before projecting short-term patterns.",
        },
        {
          day: "5–7 days",
          title: "Outcome depends on new data",
          text: "Check-ins, context and connected sources will improve this view.",
        },
      ],
    };
  }

  const pressureScore =
    latestCheckIn.stress * 0.45 +
    latestCheckIn.workload * 0.35 +
    latestCheckIn.spendingPressure * 0.2;

  const recoveryScore =
    latestCheckIn.energy * 0.7 +
    (10 - latestCheckIn.stress) * 0.3;

  const contextDepth = contextEvents.length;

  const mealEvents = contextEvents.filter((event) => event.type === "meal");

  const heavyMealCount = mealEvents.filter(
    (event) =>
      event.mealEnergyImpact?.toLowerCase().includes("heavy") ||
      event.aiSummary?.toLowerCase().includes("fried") ||
      event.aiSummary?.toLowerCase().includes("high calorie")
  ).length;

  const balancedMealCount = mealEvents.filter(
    (event) =>
      event.mealEnergyImpact?.toLowerCase().includes("stable") ||
      event.aiSummary?.toLowerCase().includes("protein") ||
      event.aiSummary?.toLowerCase().includes("balanced")
  ).length;

  const historyDepth = checkInHistory.length;

  const confidence = Math.min(
    100,
    20 +
      historyDepth * 6 +
      contextDepth * 4
  );

  const highPatternCount = patterns.filter(
    (pattern) => pattern.severity === "high"
  ).length;

  const patternRiskBoost = highPatternCount > 0;

  const realSleepHours = healthSummary?.sleepHoursLastNight ?? null;
  const realStepsToday = healthSummary?.stepsToday ?? null;
  const realActiveEnergyToday = healthSummary?.activeEnergyToday ?? null;

  const sleepRiskBoost =
    realSleepHours !== null
      ? realSleepHours < 6.5
      : externalProviders?.health.sleepHours !== null &&
        externalProviders?.health.sleepHours !== undefined &&
        externalProviders.health.sleepHours < 6.5;

  const hrvRiskBoost =
    externalProviders?.health.hrv !== null &&
    externalProviders?.health.hrv !== undefined &&
    externalProviders.health.hrv < 35;

  const weatherRecoveryDrag =
    externalProviders?.weather.condition === "storm" ||
    externalProviders?.weather.daylightHours !== null &&
      externalProviders?.weather.daylightHours !== undefined &&
      externalProviders.weather.daylightHours < 7;

  const elevatedProbabilitySignals =
    externalProviders?.probability.signals.filter(
      (signal) => signal.probability >= 0.6
    ) ?? [];

  const baseReasons = [
    `Energy ${latestCheckIn.energy}/10 and stress ${latestCheckIn.stress}/10 are driving the short-term forecast.`,
    `${historyDepth} historical check-in${historyDepth === 1 ? "" : "s"} available for trend confidence.`,
    `${contextDepth} context signal${contextDepth === 1 ? "" : "s"} included in today’s model.`,
    patternRiskBoost
      ? `${highPatternCount} high-priority pattern${highPatternCount === 1 ? "" : "s"} are increasing short-term forecast risk.`
      : "No high-priority pattern is currently increasing the forecast.",
    healthSummary
      ? `Apple Health: sleep ${realSleepHours ? realSleepHours.toFixed(1) : "unknown"}h, steps ${realStepsToday ?? "unknown"}, active energy ${realActiveEnergyToday ? Math.round(realActiveEnergyToday) : "unknown"} kcal.`
      : externalProviders?.health
        ? `Health provider: sleep ${externalProviders.health.sleepHours ?? "unknown"}h, HRV ${externalProviders.health.hrv ?? "unknown"}.`
        : "Health provider is not connected yet.",
    externalProviders?.weather
      ? `Weather context: ${externalProviders.weather.condition}, daylight ${externalProviders.weather.daylightHours ?? "unknown"}h.`
      : "Weather provider is not connected yet.",
    elevatedProbabilitySignals.length > 0
      ? `Probability context: ${elevatedProbabilitySignals.length} external market signal${elevatedProbabilitySignals.length === 1 ? "" : "s"} are elevated.`
      : "No elevated probability-market context is affecting this forecast.",
    heavyMealCount > 0
      ? `${heavyMealCount} meal signal${heavyMealCount === 1 ? "" : "s"} may add recovery load.`
      : balancedMealCount > 0
        ? `${balancedMealCount} meal signal${balancedMealCount === 1 ? "" : "s"} look recovery-supportive.`
        : "No strong meal impact is affecting this forecast yet.",
    bloodTestSummary
      ? `Blood test context: ${
          bloodTestBiomarkers.length > 0
            ? bloodTestBiomarkers
                .slice(0, 3)
                .map((item) => `${item.name}${item.status ? ` (${item.status})` : ""}`)
                .join(", ")
            : bloodTestFocusAreas.length > 0
              ? bloodTestFocusAreas.slice(0, 3).join(", ")
              : "available for recovery interpretation"
        }.`
      : "No analyzed blood test is affecting this forecast yet.",
  ];

  const externalReason =
    externalContext?.economicPressure === "high"
      ? "External economic pressure is elevated and may increase background load."
      : externalContext
      ? "External country context is available but not currently elevated."
      : "External country context is not connected yet.";

  if (
    pressureScore >= 7 ||
    recoveryScore <= 4 ||
    patternRiskBoost ||
    sleepRiskBoost ||
    hrvRiskBoost ||
    heavyMealCount >= 2
  ) {
    return {
      title: "Pressure accumulation detected",
      summary:
        externalContext?.economicPressure === "high"
          ? "Internal and external pressure signals are combining into elevated overload risk."
          : "Recent signals suggest increasing overload probability in the next 48 hours.",
      risk: "high",
      likelihood: "high likelihood",
      badge: "Rising risk",
      accent: "#FF647C",
      icon: "warning-outline",
      confidence,
      reasons: [
        ...baseReasons,
        externalReason,
        "Pressure is high enough that recovery may weaken over the next 48 hours.",
      ],
      changePoints: [
        "Reduce non-critical workload for the next 24 hours.",
        heavyMealCount > 0
          ? "Keep the next meal lighter and protect hydration to reduce recovery load."
          : realSleepHours !== null && realSleepHours < 6.5
            ? "Prioritize an earlier sleep window tonight to protect recovery."
            : "Protect sleep and avoid late high-intensity activity.",
        "Avoid major financial or schedule commitments today.",
      ],
      timeline: [
        {
          day: "Today",
          title: "Pressure pattern detected",
          text: "Dara sees high pressure or low recovery in the latest check-in.",
        },
        {
          day: "2–3 days",
          title: "Recovery may start lagging",
          text: "If stress and load remain high, overload probability can increase.",
        },
        {
          day: "5–7 days",
          title: "Fatigue risk may become visible",
          text: "Sustained pressure can reduce focus, energy and decision quality.",
        },
      ],
    };
  }

  if (
    pressureScore >= 5 ||
    recoveryScore <= 6
  ) {
    return {
      title: "Recovery stability should be monitored",
      summary:
        "Current patterns remain manageable, but recovery consistency may weaken if pressure increases.",
      risk: "medium",
      likelihood: "elevated likelihood",
      badge: "Watch zone",
      accent: "#FF8A4C",
      icon: "pulse-outline",
      confidence,
      reasons: [
        ...baseReasons,
        externalReason,
        "The current pattern is manageable, but recovery should be monitored.",
      ],
      changePoints: [
        realSleepHours !== null && realSleepHours < 7
          ? "Add one recovery action today and protect your sleep window."
          : "Add one recovery action today.",
        "Keep workload from increasing further.",
        "Add meal or context signals to improve tomorrow’s forecast.",
      ],
      timeline: [
        {
          day: "Today",
          title: "Watch zone",
          text: "Signals are manageable, but Dara sees enough pressure to monitor recovery.",
        },
        {
          day: "2–3 days",
          title: "Balance may shift",
          text: "If load increases or sleep weakens, recovery may become less stable.",
        },
        {
          day: "5–7 days",
          title: "Outcome depends on recovery",
          text: "Small actions today can keep the pattern from worsening.",
        },
      ],
    };
  }

  return {
    title: "Recovery trajectory looks stable",
    summary:
      "Recent signals suggest balanced recovery and manageable pressure levels.",
    risk: "low",
    likelihood: "low likelihood",
    badge: "Stable",
    accent: "#4ADE80",
    icon: "checkmark-circle-outline",
    confidence,
    reasons: [
      ...baseReasons,
      externalReason,
      "Current pressure and recovery signals are balanced.",
    ],
    changePoints: [
      "Keep sleep and workload rhythm consistent.",
      "Maintain meal consistency.",
      "Add context if something unusual happens today.",
    ],
    timeline: [
      {
        day: "Today",
        title: "Stable pattern",
        text: "Current signals suggest balanced recovery and manageable pressure.",
      },
      {
        day: "2–3 days",
        title: "Stable if rhythm holds",
        text: "Recovery should remain sufficient if sleep, meals and load stay consistent.",
      },
      {
        day: "5–7 days",
        title: "Maintain baseline",
        text: "Consistency is the main factor that keeps this forecast stable.",
      },
    ],
  };
}
