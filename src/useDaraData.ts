import { useCallback, useEffect, useState } from "react";

import type {
  DailyCheckInData,
  HealthRecordFile,
  PersonalSetupData,
} from "./storage";

import {
  loadDailyCheckIn,
  loadHealthRecord,
  loadPersonalSetup,
} from "./storage";

export type DaraUserData = {
  personalSetup: PersonalSetupData | null;
  dailyCheckIn: DailyCheckInData | null;
  healthRecord: HealthRecordFile | null;
};

export function useDaraData(dataVersion = 0) {
  const [data, setData] = useState<DaraUserData>({
    personalSetup: null,
    dailyCheckIn: null,
    healthRecord: null,
  });

  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);

    const [personalSetup, dailyCheckIn, healthRecord] = await Promise.all([
      loadPersonalSetup(),
      loadDailyCheckIn(),
      loadHealthRecord(),
    ]);

    setData({
      personalSetup,
      dailyCheckIn,
      healthRecord,
    });

    setIsLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload, dataVersion]);

  return {
    data,
    isLoading,
    reload,
  };
}
