export type RiskLevel = "low" | "medium" | "high";

export type Screen = "onboarding" | "auth" | "app";

export type Tab = "home" | "forecast" | "insights" | "profile";

export type UserSignals = {
  sleepHours: number;
  workload: number;
  recovery: number;
  spendingPressure: number;
};

export type HomeData = {
  hero: string;
  sub: string;
  why: string[];
  context: string;
  actions: string[];
  consequence: string[];
};

export type MetricCardProps = {
  label: string;
  value: string;
  hint: string;
  tone: "blue" | "green" | "amber" | "red" | "purple";
};
