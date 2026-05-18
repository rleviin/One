import type {
  HealthInputOptions,
  HealthKitPermissions,
} from "react-native-health";

const AppleHealthKitModule = require("react-native-health");

const AppleHealthKit =
  AppleHealthKitModule?.default ??
  AppleHealthKitModule?.AppleHealthKit ??
  AppleHealthKitModule;

const permissions: HealthKitPermissions = {
  permissions: {
    read: [AppleHealthKit.Constants.Permissions.StepCount],
    write: [],
  },
};

export type DaraHealthSummary = {
  stepsToday: number | null;
  activeEnergyToday: number | null;
  sleepHoursLastNight: number | null;
  heartRateSamples: number;
  hrvSamples: number;
  updatedAt: string;
};

export function requestAppleHealthAccess(): Promise<boolean> {
  if (typeof AppleHealthKit?.initHealthKit !== "function") {
    throw new Error("Apple Health native module is not available in this build.");
  }

  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(permissions, (error: any) => {
      resolve(!error);
    });
  });
}

export async function loadAppleHealthSummary(): Promise<DaraHealthSummary> {
  await requestAppleHealthAccess();

  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const todayOptions: HealthInputOptions = {
    startDate: startOfToday.toISOString(),
    endDate: now.toISOString(),
  };

  const stepsToday = await new Promise<number | null>((resolve) => {
    if (typeof AppleHealthKit.getStepCount !== "function") {
      resolve(null);
      return;
    }

    AppleHealthKit.getStepCount(todayOptions, (error: any, result: any) => {
      resolve(error ? null : result?.value ?? null);
    });
  });

  return {
    stepsToday,
    activeEnergyToday: null,
    sleepHoursLastNight: null,
    heartRateSamples: 0,
    hrvSamples: 0,
    updatedAt: new Date().toISOString(),
  };
}
