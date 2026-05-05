import { useCallback, useEffect, useState } from "react";

import type {
  DailyCheckInData,
  DailyContextEvent,
  HealthRecordFile,
  PersonalSetupData,
} from "./storage";

import {
  loadDailyCheckIn,
  loadDailyCheckInHistory,
  loadDailyContextEvents,
  loadHealthRecord,
  loadPersonalSetup,
} from "./storage";

export type DaraUserData = {
  personalSetup: PersonalSetupData | null;
  dailyCheckIn: DailyCheckInData | null;
  dailyCheckInHistory: DailyCheckInData[];
  dailyContextEvents: DailyContextEvent[];
  healthRecord: HealthRecordFile | null;
};

const EMPTY_DARA_DATA: DaraUserData = {
  personalSetup: null,
  dailyContextEvents: [],
  dailyCheckIn: null,
  dailyCheckInHistory: [],
  healthRecord: null,
};

export function useDaraData(dataVersion = 0) {
  const [data, setData] = useState<DaraUserData>(EMPTY_DARA_DATA);
  const [isLoading, setIsLoading] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);

    try {
      const [
  personalSetup,
  dailyCheckIn,
  dailyCheckInHistory,
  dailyContextEvents,
  healthRecord,
] = await Promise.all([
  loadPersonalSetup(),
  loadDailyCheckIn(),
  loadDailyCheckInHistory(),
  loadDailyContextEvents(),
  loadHealthRecord(),
]);
 
      setData({
        personalSetup,
        dailyContextEvents,
        dailyCheckIn,
        dailyCheckInHistory,
        healthRecord,
      });
    } finally {
      setIsLoading(false);
    }
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
