import { NativeModules, Platform } from "react-native";
import type {
  HealthInputOptions,
  HealthKitPermissions,
} from "react-native-health";

const AppleHealthKit = NativeModules.AppleHealthKit;

const permissions = {
  permissions: {
    read: [
      "StepCount",
      "SleepAnalysis",
      "ActiveEnergyBurned",
      "RestingHeartRate",
      "HeartRate",
      "HeartRateVariability",
      "Workout",
      "AppleExerciseTime",
    ],
    write: [],
  },
} as unknown as HealthKitPermissions;

export type DaraHealthSummary = {
  stepsToday: number | null;
  activeEnergyToday: number | null;
  sleepHoursLastNight: number | null;
  heartRateSamples: number;
  hrvSamples: number;
  updatedAt: string;
};

export function requestAppleHealthAccess(): Promise<boolean> {
  if (Platform.OS !== "ios") {
    throw new Error("Apple Health is available only on iOS.");
  }

  if (!AppleHealthKit || typeof AppleHealthKit.initHealthKit !== "function") {
    throw new Error("Apple Health native module is not linked in this build.");
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

  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const todayOptions: HealthInputOptions = {
    startDate: startOfToday.toISOString(),
    endDate: now.toISOString(),
  };

  const sleepOptions: HealthInputOptions = {
    startDate: startOfYesterday.toISOString(),
    endDate: now.toISOString(),
  };

  const stepsToday = await new Promise<number | null>((resolve) => {
    if (typeof AppleHealthKit.getStepCount !== "function") return resolve(null);

    AppleHealthKit.getStepCount(todayOptions, (error: any, result: any) => {
      resolve(error ? null : result?.value ?? null);
    });
  });

  const activeEnergyToday = await new Promise<number | null>((resolve) => {
    if (typeof AppleHealthKit.getActiveEnergyBurned !== "function") return resolve(null);

    AppleHealthKit.getActiveEnergyBurned(todayOptions, (error: any, results: any) => {
      if (error || !Array.isArray(results)) return resolve(null);
      resolve(results.reduce((sum, item) => sum + Number(item.value ?? 0), 0));
    });
  });

  const sleepHoursLastNight = await new Promise<number | null>((resolve) => {
    if (typeof AppleHealthKit.getSleepSamples !== "function") return resolve(null);

    AppleHealthKit.getSleepSamples(sleepOptions, (error: any, results: any) => {
      if (error || !Array.isArray(results)) return resolve(null);

      const asleepMs = results.reduce((sum, item) => {
        if (!String(item.value).toLowerCase().includes("asleep")) return sum;
        return sum + (new Date(item.endDate).getTime() - new Date(item.startDate).getTime());
      }, 0);

      resolve(asleepMs > 0 ? Math.round((asleepMs / 1000 / 60 / 60) * 10) / 10 : null);
    });
  });

  const heartRateSamples = await new Promise<number>((resolve) => {
    if (typeof AppleHealthKit.getHeartRateSamples !== "function") return resolve(0);

    AppleHealthKit.getHeartRateSamples(todayOptions, (error: any, results: any) => {
      resolve(error || !Array.isArray(results) ? 0 : results.length);
    });
  });

  const hrvSamples = await new Promise<number>((resolve) => {
    if (typeof AppleHealthKit.getHeartRateVariabilitySamples !== "function") return resolve(0);

    AppleHealthKit.getHeartRateVariabilitySamples(todayOptions, (error: any, results: any) => {
      resolve(error || !Array.isArray(results) ? 0 : results.length);
    });
  });

  return {
    stepsToday,
    activeEnergyToday,
    sleepHoursLastNight,
    heartRateSamples,
    hrvSamples,
    updatedAt: new Date().toISOString(),
  };
}
