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
    read: [
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
    ],
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
    AppleHealthKit.getStepCount(todayOptions, (error: any, result: any) => {
      resolve(error ? null : result?.value ?? null);
    });
  });

  const activeEnergyToday = await new Promise<number | null>((resolve) => {
    AppleHealthKit.getActiveEnergyBurned(todayOptions, (error: any, results: any) => {
      if (error || !Array.isArray(results)) {
        resolve(null);
        return;
      }

      resolve(
        results.reduce((sum, item) => sum + Number(item.value ?? 0), 0)
      );
    });
  });

  const sleepHoursLastNight = await new Promise<number | null>((resolve) => {
    AppleHealthKit.getSleepSamples(sleepOptions, (error: any, results: any) => {
      if (error || !Array.isArray(results)) {
        resolve(null);
        return;
      }

      const asleepMs = results.reduce((sum, item) => {
        if (!String(item.value).toLowerCase().includes("asleep")) {
          return sum;
        }

        return (
          sum +
          (new Date(item.endDate).getTime() -
            new Date(item.startDate).getTime())
        );
      }, 0);

      resolve(asleepMs > 0 ? asleepMs / 1000 / 60 / 60 : null);
    });
  });

  const heartRateSamples = await new Promise<number>((resolve) => {
    AppleHealthKit.getHeartRateSamples(todayOptions, (error: any, results: any) => {
      resolve(error || !Array.isArray(results) ? 0 : results.length);
    });
  });

  const hrvSamples = await new Promise<number>((resolve) => {
    AppleHealthKit.getHeartRateVariabilitySamples(
      todayOptions,
      (error: any, results: any) => {
        resolve(error || !Array.isArray(results) ? 0 : results.length);
      }
    );
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
