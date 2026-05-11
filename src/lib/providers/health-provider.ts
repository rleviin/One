import type { HealthRecordFile } from "../../storage";

export type HealthRecordProviderStatus =
  | "not_uploaded"
  | "uploaded_not_analyzed"
  | "ready";

export type HealthProviderData = {
  sleepHours: number | null;
  steps: number | null;
  activeMinutes: number | null;
  restingHeartRate: number | null;
  hrv: number | null;
  healthRecord: {
    hasRecord: boolean;
    name: string | null;
    status: HealthRecordProviderStatus;
  };
  source: "mock" | "apple-health";
  updatedAt: string;
};

export async function loadHealthProviderData(
  healthRecord?: HealthRecordFile | null
): Promise<HealthProviderData> {
  return {
    sleepHours: 7.2,
    steps: 6200,
    activeMinutes: 34,
    restingHeartRate: 62,
    hrv: 48,
    healthRecord: {
      hasRecord: Boolean(healthRecord),
      name: healthRecord?.name ?? null,
      status: healthRecord ? "uploaded_not_analyzed" : "not_uploaded",
    },
    source: "mock",
    updatedAt: new Date().toISOString(),
  };
}
