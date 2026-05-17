import type {
  DailyCheckInData,
  DailyContextEvent,
  StoredHealthSummary,
} from "../storage";

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
    | "leaf-outline"
    | "card-outline"
    | "bulb-outline"
    | "pulse-outline"
    | "moon-outline"
    | "walk-outline"
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
  healthSummary,
  bloodTestSummary,
  bloodTestFocusAreas = [],
  bloodTestBiomarkers = [],
}: {
  checkInHistory: DailyCheckInData[];
  contextEvents: DailyContextEvent[];
  healthSummary?: StoredHealthSummary | null;
  bloodTestSummary?: string | null;
  bloodTestFocusAreas?: string[];
  bloodTestBiomarkers?: {
    name: string;
    status?: string;
    value?: string;
    unit?: string;
  }[];
}): DaraPatternInsight[] {
  const recentCheckIns = checkInHistory.slice(0, 7);

  if (recentCheckIns.length < 2) {
    const earlyInsights: DaraPatternInsight[] = [
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

    if (healthSummary?.sleepHoursLastNight !== null && healthSummary?.sleepHoursLastNight !== undefined) {
      earlyInsights.push({
        id: "apple-health-baseline-started",
        title: "Apple Health baseline started",
        summary:
          "Dara can now use sleep, activity and recovery signals while it learns your personal pattern.",
        severity: "low",
        label: "HEALTH CONNECTED",
        accent: "#58E7FF",
        icon: "moon-outline",
        points: [
          `Last sleep signal: ${healthSummary.sleepHoursLastNight.toFixed(1)}h.`,
          `Steps today: ${healthSummary.stepsToday ?? "not available yet"}.`,
          "More days will help Dara separate normal variation from meaningful changes.",
        ],
      });
    }

    return earlyInsights;
  }

  const avgStress = average(recentCheckIns.map((item) => item.stress));
  const avgEnergy = average(recentCheckIns.map((item) => item.energy));
  const avgWorkload = average(recentCheckIns.map((item) => item.workload));
  const mealSignals = contextEvents.filter((event) => event.type === "meal").length;
  const mealEvents = contextEvents.filter(
    (event) => event.type === "meal"
  );

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


  const avgMoneyPressure = average(
    recentCheckIns.map((item) => item.spendingPressure)
  );

  const lowEnergyStreak = recentCheckIns
    .slice(0, 3)
    .every((item) => item.energy <= 5);

  const overloadStreak = recentCheckIns
    .slice(0, 3)
    .every((item) => item.workload >= 7 || item.stress >= 7);

  const latest = recentCheckIns[0];
  const previous = recentCheckIns[1];

  const recoveryRebound =
    latest &&
    previous &&
    latest.energy >= previous.energy + 2 &&
    latest.stress <= previous.stress - 2;

  const insights: DaraPatternInsight[] = [
    {
      id: "recovery-pattern",
      title: "Recovery pattern",
      summary:
        "Dara checks how energy, stress and workload are interacting today.",
      severity: "low",
      label: "RECOVERY PATTERN",
      accent: "#4ADE80",
      icon: "leaf-outline",
      points: [
        "Energy, stress and workload are checked together.",
        "This helps Dara understand whether recovery is keeping up.",
        "More history will make this pattern more personal.",
      ],
    },
    {
      id: "money-stress-pattern",
      title: "Money and stress pattern",
      summary:
        "Dara watches whether financial pressure is adding background load.",
      severity: "low",
      label: "PRESSURE PATTERN",
      accent: "#58E7FF",
      icon: "card-outline",
      points: [
        "Financial pressure can affect focus and stress.",
        "Dara compares money pressure with energy and workload.",
        "External economic context will improve this later.",
      ],
    },
    {
      id: "focus-stability-pattern",
      title: "Focus stability pattern",
      summary:
        "Dara checks whether workload and energy support deep work today.",
      severity: "low",
      label: "FOCUS PATTERN",
      accent: "#C96BFF",
      icon: "bulb-outline",
      points: [
        "Focus depends on energy, recovery and current load.",
        "High workload with low energy can reduce deep work quality.",
        "Calendar and sleep data will improve this signal later.",
      ],
    },
  ];

  if (recoveryRebound) {
    insights.push({
      id: "recovery-rebound",
      title: "Recovery rebound detected",
      summary:
        "Energy improved while stress dropped compared with the previous check-in. Dara sees early recovery momentum.",
      severity: "low",
      label: "REBOUND",
      accent: "#4ADE80",
      icon: "leaf-outline",
      points: [
        "Energy improved compared with the previous check-in.",
        "Stress also moved down, which supports recovery momentum.",
        "Maintaining the same rhythm can help stabilise this rebound.",
      ],
    });
  }

  if (lowEnergyStreak && recentCheckIns.length >= 3) {
    insights.push({
      id: "sleep-debt-proxy",
      title: "Possible sleep debt pattern",
      summary:
        "Energy has stayed low across recent check-ins. Dara will treat this as possible sleep debt until sleep data is connected.",
      severity: "medium",
      label: "SLEEP DEBT",
      accent: "#C96BFF",
      icon: "battery-dead-outline",
      points: [
        "Energy stayed low for several recent check-ins.",
        "Without sleep data, Dara treats this as a possible sleep debt signal.",
        "Apple Health sleep connection will make this pattern more accurate.",
      ],
    });
  }

  if (overloadStreak && recentCheckIns.length >= 3) {
    insights.push({
      id: "overload-streak",
      title: "Overload streak detected",
      summary:
        "Stress or workload has stayed elevated for several check-ins, which can increase fatigue risk.",
      severity: "high",
      label: "OVERLOAD",
      accent: "#FF647C",
      icon: "pulse-outline",
      points: [
        "Stress or workload stayed high across recent check-ins.",
        "This can become more important than a single bad day.",
        "Reducing non-critical load may lower short-term fatigue risk.",
      ],
    });
  }

  if (avgStress >= 6 && avgMoneyPressure >= 6) {
    insights.push({
      id: "money-stress-correlation",
      title: "Money pressure may be affecting stress",
      summary:
        "Recent check-ins suggest financial pressure and stress are moving together.",
      severity: "medium",
      label: "MONEY + STRESS",
      accent: "#58E7FF",
      icon: "card-outline",
      points: [
        "Money pressure and stress are both elevated.",
        "This can increase background cognitive load.",
        "External economy and cost-of-living data will improve this pattern later.",
      ],
    });
  }

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

  if (
    healthSummary?.sleepHoursLastNight !== null &&
    healthSummary?.sleepHoursLastNight !== undefined &&
    healthSummary.sleepHoursLastNight < 6.5
  ) {
    insights.push({
      id: "apple-health-sleep-low",
      title: "Sleep may be limiting recovery",
      summary:
        "Apple Health sleep data suggests recovery may need extra protection today.",
      severity: "medium",
      label: "SLEEP",
      accent: "#C96BFF",
      icon: "moon-outline",
      points: [
        `Last sleep signal is ${healthSummary.sleepHoursLastNight.toFixed(1)}h.`,
        "Shorter sleep can make stress and workload feel heavier.",
        "Protecting tonight’s sleep window may improve tomorrow’s forecast.",
      ],
    });
  }

  if (
    healthSummary?.stepsToday !== null &&
    healthSummary?.stepsToday !== undefined &&
    healthSummary.stepsToday > 9000
  ) {
    insights.push({
      id: "apple-health-activity-load",
      title: "Activity load is elevated",
      summary:
        "Movement today is already high, so Dara will watch whether recovery keeps up.",
      severity: "low",
      label: "ACTIVITY",
      accent: "#58E7FF",
      icon: "walk-outline",
      points: [
        `Steps today: ${healthSummary.stepsToday}.`,
        "Higher movement can be positive, but it still adds physical load.",
        "If energy drops later, Dara may treat this as recovery pressure.",
      ],
    });
  }

  if (heavyMealCount >= 2) {
    insights.push({
      id: "heavy-meal-pattern",
      title: "Heavy meal recovery pattern",
      summary:
        "Recent meals may be increasing recovery load and affecting energy stability.",
      severity: "medium",
      label: "MEAL LOAD",
      accent: "#FF8A4C",
      icon: "restaurant-outline",
      points: [
        "Several recent meals look calorie-dense or recovery-heavy.",
        "Large evening meals can affect sleep and next-day energy.",
        "Balanced meals may improve recovery stability.",
      ],
    });
  }

  if (balancedMealCount >= 2) {
    insights.push({
      id: "balanced-meal-pattern",
      title: "Recovery-supportive nutrition pattern",
      summary:
        "Recent meals appear more balanced and supportive for stable energy.",
      severity: "low",
      label: "NUTRITION",
      accent: "#4ADE80",
      icon: "leaf-outline",
      points: [
        "Meals appear more balanced and protein-supportive.",
        "Stable nutrition can improve recovery consistency.",
        "Dara will compare this against future energy patterns.",
      ],
    });
  }

  if (bloodTestSummary) {
    insights.push({
      id: "blood-test-context",
      title: "Blood test context added",
      summary:
        bloodTestBiomarkers.length > 0
          ? `Dara found ${bloodTestBiomarkers.slice(0, 3).map((item) => item.name).join(", ")} in your report.`
          : bloodTestFocusAreas.length > 0
            ? `Dara is using ${bloodTestFocusAreas.slice(0, 2).join(", ")} as biomarker context.`
            : "Dara is using your analyzed blood test as recovery context.",
      severity: "medium",
      label: "BIOMARKERS",
      accent: "#FF647C",
      icon: "pulse-outline",
      points: [
        bloodTestBiomarkers.length > 0
          ? `Markers: ${bloodTestBiomarkers
              .slice(0, 3)
              .map((item) => `${item.name}${item.status ? ` (${item.status})` : ""}`)
              .join(", ")}.`
          : bloodTestFocusAreas.length > 0
            ? `Focus areas: ${bloodTestFocusAreas.slice(0, 3).join(", ")}.`
            : (bloodTestSummary ?? "Blood test context is available.").slice(0, 160),
        "Blood markers can add deeper context for recovery and fatigue.",
        "General wellness context only. Review abnormal results with a clinician.",
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

  if (insights.length === 3) {
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

  const severityRank = {
    high: 0,
    medium: 1,
    low: 2,
  };

  return insights.sort(
    (a, b) => severityRank[a.severity] - severityRank[b.severity]
  );
}
