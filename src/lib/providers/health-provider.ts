export type HealthProviderData = {
  sleepHours: number | null;
  steps: number | null;
  activeMinutes: number | null;
  restingHeartRate: number | null;
  hrv: number | null;
  source: "mock" | "apple-health";
  updatedAt: string;
};

export async function loadHealthProviderData(): Promise<HealthProviderData> {
  return {
    sleepHours: 7.2,
    steps: 6200,
    activeMinutes: 34,
    restingHeartRate: 62,
    hrv: 48,
    source: "mock",
    updatedAt: new Date().toISOString(),
  };
}
