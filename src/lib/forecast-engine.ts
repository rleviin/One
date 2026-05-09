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

  const historyDepth = checkInHistory.length;

  const confidence = Math.min(
    100,
    20 +
      historyDepth * 6 +
      contextDepth * 4
  );

  const baseReasons = [
    `Energy ${latestCheckIn.energy}/10 and stress ${latestCheckIn.stress}/10 are driving the short-term forecast.`,
    `${historyDepth} historical check-in${historyDepth === 1 ? "" : "s"} available for trend confidence.`,
    `${contextDepth} context signal${contextDepth === 1 ? "" : "s"} included in today’s model.`,
  ];

  const externalReason =
    externalContext?.economicPressure === "high"
      ? "External economic pressure is elevated and may increase background load."
      : externalContext
      ? "External country context is available but not currently elevated."
      : "External country context is not connected yet.";

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
      reasons: [
        ...baseReasons,
        externalReason,
        "Pressure is high enough that recovery may weaken over the next 48 hours.",
      ],
      changePoints: [
        "Reduce non-critical workload for the next 24 hours.",
        "Protect sleep and avoid late high-intensity activity.",
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
      confidence,
      reasons: [
        ...baseReasons,
        externalReason,
        "The current pattern is manageable, but recovery should be monitored.",
      ],
      changePoints: [
        "Add one recovery action today.",
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
