import type {
  DailyCheckInData,
  DailyContextEvent,
  ExternalContextData,
} from "../storage";

export type ForecastRiskLevel = "low" | "medium" | "high";

export type DaraForecast = {
  title: string;
  summary: string;
  risk: ForecastRiskLevel;
  confidence: number;
};

type BuildForecastInput = {
  latestCheckIn: DailyCheckInData | null;
  checkInHistory: DailyCheckInData[];
  contextEvents: DailyContextEvent[];
  externalContext?: ExternalContextData | null;
};

export function buildForecast({
  latestCheckIn,
  checkInHistory,
  contextEvents,
  externalContext,
}: BuildForecastInput): DaraForecast {
  if (!latestCheckIn) {
    return {
      title: "Not enough data",
      summary:
        "Dara needs more recent check-ins to build a forecast.",
      risk: "low",
      confidence: 12,
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

  const historyDepth = checkInHistory.length;

  const confidence = Math.min(
    100,
    20 +
      historyDepth * 6 +
      contextDepth * 4
  );

  if (
    pressureScore >= 7 ||
    recoveryScore <= 4
  ) {
    return {
      title: "Pressure accumulation detected",
      summary:
        externalContext?.economicPressure === "high"
          ? "Internal and external pressure signals are combining into elevated overload risk."
          : "Recent signals suggest increasing overload probability in the next 48 hours.",
      risk: "high",
      confidence,
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
      confidence,
    };
  }

  return {
    title: "Recovery trajectory looks stable",
    summary:
      "Recent signals suggest balanced recovery and manageable pressure levels.",
    risk: "low",
    confidence,
  };
}
